import { Injectable, Logger } from '@nestjs/common';
import { WebhookEvent } from 'livekit-server-sdk';

@Injectable()
export class WebhookService {
    private readonly logger = new Logger(WebhookService.name);

    async handleWebhookEvent(event: WebhookEvent): Promise<void> {
        this.logger.log(`Received webhook event: ${event.event}`);

        try {
            switch (event.event) {
                case 'room_started':
                    await this.handleRoomStarted(event);
                    break;
                case 'room_finished':
                    await this.handleRoomFinished(event);
                    break;
                case 'participant_joined':
                    await this.handleParticipantJoined(event);
                    break;
                case 'participant_left':
                    await this.handleParticipantLeft(event);
                    break;
                case 'egress_started':
                    await this.handleEgressStarted(event);
                    break;
                case 'egress_updated':
                    await this.handleEgressUpdated(event);
                    break;
                case 'egress_ended':
                    await this.handleEgressEnded(event);
                    break;
                default:
                    this.logger.warn(`Unhandled webhook event: ${event.event}`);
            }
        } catch (error) {
            this.logger.error(`Error handling webhook event ${event.event}:`, error);
            throw error;
        }
    }

    private async handleRoomStarted(event: WebhookEvent): Promise<void> {
        this.logger.log(`Room started: ${event.room?.name}`);
    }

    private async handleRoomFinished(event: WebhookEvent): Promise<void> {
        this.logger.log(`Room finished: ${event.room?.name}`);
    }

    private async handleParticipantJoined(event: WebhookEvent): Promise<void> {
        const participant = event.participant;
        const room = event.room;
        this.logger.log(
            `Participant joined: ${participant?.identity} in room ${room?.name}`,
        );
    }

    private async handleParticipantLeft(event: WebhookEvent): Promise<void> {
        const participant = event.participant;
        const room = event.room;
        this.logger.log(
            `Participant left: ${participant?.identity} from room ${room?.name}`,
        );
    }

    private async handleEgressStarted(event: WebhookEvent): Promise<void> {
        const egressInfo = event.egressInfo;
        this.logger.log(`Egress started: ${egressInfo?.egressId}`);
        this.logger.log(`Recording started for room: ${egressInfo?.roomName}`);
    }

    private async handleEgressUpdated(event: WebhookEvent): Promise<void> {
        const egressInfo = event.egressInfo;
        this.logger.log(
            `Egress updated: ${egressInfo?.egressId} - Status: ${egressInfo?.status}`,
        );
    }

    private async handleEgressEnded(event: WebhookEvent): Promise<void> {
        const egressInfo = event.egressInfo;
        this.logger.log(
            `Egress ended: ${egressInfo?.egressId} - Status: ${egressInfo?.status}`,
        );

        // Log file information if available
        if ((egressInfo as any).file) {
            this.logger.log(`Recording file: ${JSON.stringify((egressInfo as any).file)}`);
        }
    }
}
