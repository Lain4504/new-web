import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookReceiver } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Controller('webhook')
export class WebhookController {
    private readonly logger = new Logger(WebhookController.name);
    private readonly webhookReceiver: WebhookReceiver;

    constructor(
        private readonly webhookService: WebhookService,
        private readonly configService: ConfigService,
    ) {
        const apiKey = this.configService.getOrThrow<string>('LIVEKIT_API_KEY');
        const apiSecret =
            this.configService.getOrThrow<string>('LIVEKIT_API_SECRET');
        this.webhookReceiver = new WebhookReceiver(apiKey, apiSecret);
    }

    @Post('livekit')
    async handleLivekitWebhook(
        @Body() body: string,
        @Headers('authorization') authHeader: string,
    ): Promise<{ ok: boolean }> {
        try {
            // Verify and parse the webhook event
            const event = await this.webhookReceiver.receive(
                JSON.stringify(body),
                authHeader,
            );

            // Handle the event
            await this.webhookService.handleWebhookEvent(event);

            return { ok: true };
        } catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`);
            throw error;
        }
    }
}
