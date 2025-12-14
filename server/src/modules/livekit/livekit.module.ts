import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LivekitService } from './livekit.service';
import { LivekitController } from './livekit.controller';

@Module({
    imports: [ConfigModule],
    controllers: [LivekitController],
    providers: [LivekitService],
    exports: [LivekitService],
})
export class LivekitModule { }
