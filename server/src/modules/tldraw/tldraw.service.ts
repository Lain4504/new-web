import { Injectable, Logger } from '@nestjs/common';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

const DIR = './.tldraw-rooms';

@Injectable()
export class TldrawService {
    private readonly logger = new Logger(TldrawService.name);
    private readonly rooms = new Map<string, RoomState>();
    private mutex = Promise.resolve<null | Error>(null);

    constructor() {
        // Start persistence interval
        this.startPersistenceInterval();
    }

    private async readSnapshotIfExists(
        roomId: string,
    ): Promise<RoomSnapshot | undefined> {
        try {
            const data = await readFile(join(DIR, roomId));
            return JSON.parse(data.toString()) ?? undefined;
        } catch (e) {
            return undefined;
        }
    }

    private async saveSnapshot(
        roomId: string,
        snapshot: RoomSnapshot,
    ): Promise<void> {
        await mkdir(DIR, { recursive: true });
        await writeFile(join(DIR, roomId), JSON.stringify(snapshot));
    }

    async makeOrLoadRoom(roomId: string): Promise<TLSocketRoom<any, void>> {
        this.mutex = this.mutex
            .then(async () => {
                if (this.rooms.has(roomId)) {
                    const roomState = this.rooms.get(roomId)!;
                    if (!roomState.room.isClosed()) {
                        return null; // all good
                    }
                }
                this.logger.log(`Loading room: ${roomId}`);
                const initialSnapshot = await this.readSnapshotIfExists(roomId);

                const roomState: RoomState = {
                    needsPersist: false,
                    id: roomId,
                    room: new TLSocketRoom({
                        initialSnapshot,
                        onSessionRemoved(room, args) {
                            console.log('client disconnected', args.sessionId, roomId);
                            if (args.numSessionsRemaining === 0) {
                                console.log('closing room', roomId);
                                room.close();
                            }
                        },
                        onDataChange() {
                            roomState.needsPersist = true;
                        },
                    }),
                };
                this.rooms.set(roomId, roomState);
                return null; // all good
            })
            .catch((error) => {
                // return errors as normal values to avoid stopping the mutex chain
                return error;
            });

        const err = await this.mutex;
        if (err) throw err;
        return this.rooms.get(roomId)!.room;
    }

    private startPersistenceInterval(): void {
        setInterval(() => {
            for (const roomState of this.rooms.values()) {
                if (roomState.needsPersist) {
                    // persist room
                    roomState.needsPersist = false;
                    this.logger.log(`Saving snapshot: ${roomState.id}`);
                    this.saveSnapshot(roomState.id, roomState.room.getCurrentSnapshot());
                }
                if (roomState.room.isClosed()) {
                    this.logger.log(`Deleting room: ${roomState.id}`);
                    this.rooms.delete(roomState.id);
                }
            }
        }, 2000);
    }

    // Asset storage
    async storeAsset(id: string, stream: Readable): Promise<void> {
        const assetDir = './.tldraw-assets';
        await mkdir(assetDir, { recursive: true });
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        await writeFile(join(assetDir, id), buffer);
    }

    async loadAsset(id: string): Promise<Buffer> {
        const assetDir = './.tldraw-assets';
        return await readFile(join(assetDir, id));
    }
}

interface RoomState {
    room: TLSocketRoom<any, void>;
    id: string;
    needsPersist: boolean;
}
