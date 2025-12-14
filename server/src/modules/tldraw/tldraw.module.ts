import { Module } from '@nestjs/common';
import { TldrawService } from './tldraw.service';
import { TldrawGateway } from './tldraw.gateway';
import { TldrawController } from './tldraw.controller';

@Module({
    providers: [TldrawService, TldrawGateway],
    controllers: [TldrawController],
    exports: [TldrawService],
})
export class TldrawModule { }
