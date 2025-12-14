import { Injectable, Logger } from '@nestjs/common';
import { TldrawService } from './tldraw.service';
import { WebSocketServer, WebSocket } from 'ws';
import type { RawData } from 'ws';
import { parse } from 'url';
import type { Server } from 'http';

@Injectable()
export class TldrawGateway {
    private readonly logger = new Logger(TldrawGateway.name);
    private wss: WebSocketServer;

    constructor(private readonly tldrawService: TldrawService) { }

    /**
     * Initialize WebSocket server on the same HTTP server instance
     * This allows WebSocket to work on the same port as HTTP (required for cloud deployment)
     */
    initializeWebSocket(httpServer: Server) {
        try {
            // Create WebSocket server attached to HTTP server
            // Don't set 'path' option to allow flexible path matching
            this.wss = new WebSocketServer({
                server: httpServer,
                // Removed path restriction to allow /tldraw/connect/:roomId pattern
            });

            this.logger.log(`✅ TLDraw WebSocket server initialized`);
            this.logger.log(`   Path: /tldraw/connect/:roomId?sessionId=xxx`);
        } catch (error) {
            this.logger.error(`❌ Failed to start WebSocket server: ${error.message}`);
            throw error;
        }

        this.wss.on('connection', async (ws: WebSocket, req) => {
            this.logger.log(`📥 WebSocket connection attempt: ${req.url}`);

            // Parse URL to get roomId and sessionId
            const parsedUrl = parse(req.url || '', true);
            const pathParts = parsedUrl.pathname?.split('/').filter(Boolean) || [];

            // Validate path starts with /tldraw/connect
            if (pathParts[0] !== 'tldraw' || pathParts[1] !== 'connect') {
                this.logger.warn(`❌ Invalid path: ${req.url} - Expected /tldraw/connect/:roomId`);
                ws.close(1008, 'Invalid path');
                return;
            }

            // Expected URL: /tldraw/connect/:roomId?sessionId=xxx
            // pathParts: ['tldraw', 'connect', 'roomId']
            const roomId = pathParts[2]; // Get roomId from path
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
