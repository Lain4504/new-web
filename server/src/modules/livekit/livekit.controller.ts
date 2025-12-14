import { Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';

@Controller('livekit')
export class LivekitController {
    constructor(private readonly livekitService: LivekitService) { }

    @Get('token')
    async getToken(
        @Query('room') room: string,
        @Query('identity') identity: string,
        @Query('name') name: string,
    ): Promise<{ token: string }> {
        if (!room || !identity || !name) {
            throw new Error('room, identity, and name are required');
        }

        const token = await this.livekitService.createToken({
            roomName: room,
            identity,
            name,
        });

        return { token };
    }
}
