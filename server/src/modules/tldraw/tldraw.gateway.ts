import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TldrawService } from './tldraw.service';
import { WebSocketServer, WebSocket } from 'ws';
import type { RawData } from 'ws';
import { parse } from 'url';

@Injectable()
export class TldrawGateway implements OnModuleInit {
    private readonly logger = new Logger(TldrawGateway.name);
    private wss: WebSocketServer;

    constructor(private readonly tldrawService: TldrawService) { }

    onModuleInit() {
        try {
            // Create WebSocket server on port 5858 (same as old tldraw-sync-server)
            const port = parseInt(process.env.TLDRAW_WS_PORT || '5858');
            this.wss = new WebSocketServer({ port });

            this.logger.log(`✅ TLDraw WebSocket server listening on ws://localhost:${port}`);
            this.logger.log(`   Connect at: ws://localhost:${port}/connect/:roomId?sessionId=xxx`);
        } catch (error) {
            this.logger.error(`❌ Failed to start WebSocket server: ${error.message}`);
            throw error;
        }

        this.wss.on('connection', async (ws: WebSocket, req) => {
            this.logger.log('Client attempting to connect');

            // Parse URL to get roomId and sessionId
            const parsedUrl = parse(req.url || '', true);
            const pathParts = parsedUrl.pathname?.split('/').filter(Boolean) || [];

            // Expected URL: /connect/:roomId?sessionId=xxx
            const roomId = pathParts[1]; // pathParts[0] is 'connect'
            const sessionId = parsedUrl.query.sessionId as string;

            if (!roomId || !sessionId) {
                this.logger.error(
                    `Missing roomId or sessionId. URL: ${req.url}`,
                );
                ws.close(1008, 'Missing roomId or sessionId');
                return;
            }

            this.logger.log(
                `Client connected - roomId: ${roomId}, sessionId: ${sessionId}`,
            );

            // Collect messages that came in before the room was loaded
            const caughtMessages: RawData[] = [];
            let isRoomReady = false;

            const collectMessagesListener = (message: RawData) => {
                if (!isRoomReady) {
                    caughtMessages.push(message);
                }
            };

            ws.on('message', collectMessagesListener);

            try {
                // Load or create the room
                const room = await this.tldrawService.makeOrLoadRoom(roomId);

                // Connect the socket to the room
                room.handleSocketConnect({ sessionId, socket: ws });

                isRoomReady = true;

                // Remove the collecting listener
                ws.off('message', collectMessagesListener);

                // Replay any caught messages
                for (const message of caughtMessages) {
                    ws.emit('message', message);
                }

                this.logger.log(
                    `Room connected successfully - roomId: ${roomId}, sessionId: ${sessionId}`,
                );
            } catch (error) {
                this.logger.error(
                    `Error handling connection: ${error.message}`,
                    error.stack,
                );
                ws.close(1011, 'Internal server error');
            }

            ws.on('close', () => {
                this.logger.log(
                    `Client disconnected - roomId: ${roomId}, sessionId: ${sessionId}`,
                );
            });

            ws.on('error', (error) => {
                this.logger.error(`WebSocket error: ${error.message}`);
            });
        });

        this.wss.on('error', (error) => {
            this.logger.error(`WebSocket server error: ${error.message}`);
        });
    }
}
