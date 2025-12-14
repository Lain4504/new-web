# Sync Canvas Server

NestJS backend server cho Sync Canvas application, tích hợp LiveKit WebRTC, TLDraw whiteboard sync, và recording với Cloudflare R2 upload.

## Features

- **LiveKit Integration**: Token generation và room management
- **TLDraw Sync**: Real-time whiteboard synchronization
- **Recording**: Record video/audio/screen share với upload lên Cloudflare R2
- **Webhook Handling**: Xử lý LiveKit webhook events

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình các biến môi trường:

```env
# Server Configuration
PORT=3000

# LiveKit Configuration
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_WS_URL=wss://your-livekit-server.com
LIVEKIT_HTTP_URL=https://your-livekit-server.com

# Cloudflare R2 Configuration (for recording upload)
S3_ACCESS_KEY=your-cloudflare-r2-access-key
S3_SECRET_KEY=your-cloudflare-r2-secret-key
S3_BUCKET=your-recordings-bucket
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_FORCE_PATH_STYLE=true
```

### 3. Run Development Server

```bash
npm run start:dev
```

Server sẽ chạy tại `http://localhost:3000`

## API Endpoints

### LiveKit

- `GET /livekit/token?room=<roomName>&identity=<userId>&name=<userName>` - Generate access token

### TLDraw

- `WebSocket /tldraw/connect?roomId=<roomId>&sessionId=<sessionId>` - WebSocket connection cho sync
- `PUT /tldraw/uploads/:id` - Upload asset
- `GET /tldraw/uploads/:id` - Get asset
- `GET /tldraw/unfurl?url=<url>` - Unfurl URL

### Recording

- `POST /recording/start` - Start recording
  ```json
  {
    "roomName": "room-name",
    "layout": "speaker",
    "filepath": "recordings/room-{time}.mp4"
  }
  ```
- `POST /recording/stop/:egressId` - Stop recording
- `GET /recording/status?roomName=<roomName>` - Get recording status
- `GET /recording/list?roomName=<roomName>` - List recordings

### Webhook

- `POST /webhook/livekit` - LiveKit webhook endpoint

## Cloudflare R2 Setup

1. Tạo R2 bucket trên Cloudflare dashboard
2. Tạo API token với quyền R2 Read & Write
3. Lấy Account ID từ Cloudflare dashboard
4. Cấu hình environment variables như trên

## Production Deployment

```bash
# Build
npm run build

# Run production
npm run start:prod
```

## Notes

- Recording sẽ tự động upload lên Cloudflare R2 nếu cấu hình S3 credentials
- Nếu không cấu hình S3, recordings sẽ lưu local (chỉ dùng cho testing)
- TLDraw rooms và assets được lưu trong `.tldraw-rooms` và `.tldraw-assets` directories
