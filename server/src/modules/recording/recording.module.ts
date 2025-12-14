import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LivekitModule } from '../livekit/livekit.module';
import { RecordingService } from './recording.service';
import { RecordingController } from './recording.controller';

@Module({
    imports: [ConfigModule, LivekitModule],
    controllers: [RecordingController],
    providers: [RecordingService],
    exports: [RecordingService],
})
export class RecordingModule { }
