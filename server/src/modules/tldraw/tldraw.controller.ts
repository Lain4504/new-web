import {
    Controller,
    Get,
    Put,
    Param,
    Query,
    Req,
    Res,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { TldrawService } from './tldraw.service';
import { unfurl } from 'unfurl.js';

@Controller('tldraw')
export class TldrawController {
    constructor(private readonly tldrawService: TldrawService) { }

    @Put('uploads/:id')
    async uploadAsset(
        @Param('id') id: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        try {
            await this.tldrawService.storeAsset(id, req);
            res.status(HttpStatus.OK).json({ ok: true });
        } catch (error) {
            res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ error: error.message });
        }
    }

    @Get('uploads/:id')
    async getAsset(
        @Param('id') id: string,
        @Res() res: Response,
    ): Promise<void> {
        try {
            const data = await this.tldrawService.loadAsset(id);
            res.send(data);
        } catch (error) {
            res.status(HttpStatus.NOT_FOUND).json({ error: 'Asset not found' });
        }
    }

    @Get('unfurl')
    async unfurlUrl(@Query('url') url: string): Promise<any> {
        if (!url) {
            throw new Error('URL is required');
        }
        return await unfurl(url);
    }
}
