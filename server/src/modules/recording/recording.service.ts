import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LivekitService } from '../livekit/livekit.service';

interface RecordingState {
    roomName: string;
    egressId: string;
    startedAt: Date;
    status: 'active' | 'stopped';
}

@Injectable()
export class RecordingService {
    private readonly logger = new Logger(RecordingService.name);
    private readonly recordings = new Map<string, RecordingState>();

    constructor(private readonly livekitService: LivekitService) { }

    async startRecording(
        roomName: string,
        options?: {
            layout?: string;
            filepath?: string;
            s3Config?: {
                accessKey: string;
                secret: string;
                bucket: string;
                region?: string;
                endpoint?: string;
                forcePathStyle?: boolean;
            };
        },
    ): Promise<{ egressId: string }> {
        this.logger.log(`Starting recording for room: ${roomName}`);

        // Check if room is already being recorded
        const existingRecording = Array.from(this.recordings.values()).find(
            (r) => r.roomName === roomName && r.status === 'active',
        );

        if (existingRecording) {
            this.logger.warn(`Room ${roomName} is already being recorded`);
            return { egressId: existingRecording.egressId };
        }

        const result = await this.livekitService.startRecording(roomName, options);

        // Store recording state
        this.recordings.set(result.egressId, {
            roomName,
            egressId: result.egressId,
            startedAt: new Date(),
            status: 'active',
        });

        this.logger.log(
            `Recording started for room ${roomName} with egressId: ${result.egressId}`,
        );

        return result;
    }

    async stopRecording(egressId: string): Promise<void> {
        this.logger.log(`Stopping recording: ${egressId}`);

        const recording = this.recordings.get(egressId);
        if (!recording) {
            throw new NotFoundException(`Recording ${egressId} not found`);
        }

        await this.livekitService.stopRecording(egressId);

        // Update recording state
        recording.status = 'stopped';
        this.recordings.set(egressId, recording);

        this.logger.log(`Recording stopped: ${egressId}`);
    }

    async getRecordingStatus(roomName: string): Promise<{
        isRecording: boolean;
        egressId?: string;
        startedAt?: Date;
    }> {
        const recording = Array.from(this.recordings.values()).find(
            (r) => r.roomName === roomName && r.status === 'active',
        );

        if (recording) {
            return {
                isRecording: true,
                egressId: recording.egressId,
                startedAt: recording.startedAt,
            };
        }

        return { isRecording: false };
    }

    async listRecordings(roomName?: string): Promise<any[]> {
        return this.livekitService.listRecordings(roomName);
    }
}
