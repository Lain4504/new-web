import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { RecordingService } from './recording.service';
import { StartRecordingDto } from './dto/start-recording.dto';

@Controller('recording')
export class RecordingController {
    constructor(private readonly recordingService: RecordingService) { }

    @Post('start')
    async startRecording(
        @Body() dto: StartRecordingDto,
    ): Promise<{ egressId: string }> {
        return this.recordingService.startRecording(dto.roomName, {
            layout: dto.layout,
            filepath: dto.filepath,
            s3Config: dto.s3Config,
        });
    }

    @Post('stop/:egressId')
    async stopRecording(@Param('egressId') egressId: string): Promise<void> {
        return this.recordingService.stopRecording(egressId);
    }

    @Get('status')
    async getRecordingStatus(@Query('roomName') roomName: string): Promise<{
        isRecording: boolean;
        egressId?: string;
        startedAt?: Date;
    }> {
        return this.recordingService.getRecordingStatus(roomName);
    }

    @Get('list')
    async listRecordings(@Query('roomName') roomName?: string): Promise<any[]> {
        return this.recordingService.listRecordings(roomName);
    }
}
