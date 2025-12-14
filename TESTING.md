# Testing Guide

Hướng dẫn test các tính năng sau khi migration.

## Prerequisites

1. **LiveKit Server**: Cần có LiveKit server đang chạy
2. **Cloudflare R2**: (Optional) Cấu hình cho recording upload

## Backend Testing

### 1. Start Server

```bash
cd server
npm run start:dev
```

Server sẽ chạy tại `http://localhost:3000`

### 2. Configure Environment

Tạo file `.env` trong `server/`:

```env
PORT=3000

# LiveKit - Thay bằng credentials thực của bạn
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_WS_URL=wss://your-livekit-server.com
LIVEKIT_HTTP_URL=https://your-livekit-server.com

# Cloudflare R2 (Optional - cho recording upload)
S3_ACCESS_KEY=your-r2-access-key
S3_SECRET_KEY=your-r2-secret-key
S3_BUCKET=your-bucket-name
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
S3_REGION=auto
S3_FORCE_PATH_STYLE=true
```

### 3. Test Endpoints

#### Test Token Generation

```bash
curl "http://localhost:3000/livekit/token?room=test-room&identity=user1&name=Test%20User"
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Test Recording Start

```bash
curl -X POST http://localhost:3000/recording/start \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "test-room",
    "layout": "speaker"
  }'
```

Expected response:
```json
{
  "egressId": "EG_xxxxxxxxxxxxxxxx"
}
```

#### Test Recording Status

```bash
curl "http://localhost:3000/recording/status?roomName=test-room"
```

Expected response:
```json
{
  "isRecording": true,
  "egressId": "EG_xxxxxxxxxxxxxxxx",
  "startedAt": "2025-12-14T01:21:50.000Z"
}
```

#### Test Recording Stop

```bash
curl -X POST http://localhost:3000/recording/stop/EG_xxxxxxxxxxxxxxxx
```

---

## Client Testing

### 1. Configure Client Environment

Tạo/update file `.env` trong `client/`:

```env
VITE_SERVER_URL=http://localhost:3000
VITE_LIVEKIT_URL=wss://your-livekit-server.com
```

### 2. Start Client

```bash
cd client
npm run dev
```

### 3. Test Recording Flow

1. **Join Room**
   - Mở browser, truy cập client URL
   - Nhập room name và user name
   - Click "Join"

2. **Start Recording**
   - Click Record button (Circle icon) trong toolbar
   - **Expected**: 
     - Button chuyển sang StopCircle icon màu đỏ với pulse animation
     - Red border xuất hiện bao quanh toàn bộ viewport
     - Border có pulse animation (opacity 1 → 0.5 → 1)

3. **Verify Red Border**
   - Border phải bao quanh toàn bộ màn hình
   - Border không block user interactions (pointer-events-none)
   - Animation chạy smooth

4. **Stop Recording**
   - Click Record button lần nữa
   - **Expected**:
     - Button chuyển về Circle icon màu xám
     - Red border biến mất
     - Recording stopped

5. **Check Cloudflare R2** (nếu đã cấu hình)
   - Login vào Cloudflare dashboard
   - Vào R2 bucket
   - Verify file recording đã được upload
   - File format: `recordings/room-name-{timestamp}.mp4`

---

## TLDraw Sync Testing

### 1. Test Whiteboard

1. Mở 2 browser tabs với cùng room
2. Click "Whiteboard" button
3. Vẽ shapes trong tab 1
4. **Expected**: Shapes xuất hiện real-time trong tab 2

### 2. Test Asset Upload

1. Trong whiteboard, upload một image
2. **Expected**: Image được lưu và hiển thị
3. Refresh page
4. **Expected**: Image vẫn còn (persisted)

---

## Webhook Testing

### 1. Configure LiveKit Webhook

Trong LiveKit server config, set webhook URL:

```yaml
webhook:
  urls:
    - http://localhost:3000/webhook/livekit
  api_key: your-api-key
```

### 2. Monitor Webhook Events

Check server logs khi:
- Room started
- Participant joined/left
- Recording started/stopped

Expected logs:
```
[WebhookService] Received webhook event: room_started
[WebhookService] Room started: test-room
[WebhookService] Received webhook event: egress_started
[WebhookService] Egress started: EG_xxxxxxxxxxxxxxxx
```

---

## Common Issues

### Issue: "Cannot connect to LiveKit"

**Solution**: 
- Verify `LIVEKIT_WS_URL` và `LIVEKIT_HTTP_URL` đúng
- Check LiveKit server đang chạy
- Verify API key/secret

### Issue: "Recording failed to start"

**Solution**:
- Check LiveKit server có Egress service enabled
- Verify S3 credentials (nếu dùng Cloudflare R2)
- Check server logs cho error details

### Issue: "Red border không xuất hiện"

**Solution**:
- Check RecordingContext đã được wrap đúng
- Verify `isRecording` state trong React DevTools
- Check z-index conflicts

### Issue: "TLDraw sync không hoạt động"

**Solution**:
- Verify WebSocket connection trong browser DevTools
- Check `roomId` và `sessionId` được truyền đúng
- Check server logs cho WebSocket errors

---

## Performance Testing

### Load Test Recording

```bash
# Test multiple concurrent recordings
for i in {1..5}; do
  curl -X POST http://localhost:3000/recording/start \
    -H "Content-Type: application/json" \
    -d "{\"roomName\": \"room-$i\", \"layout\": \"speaker\"}" &
done
```

### Monitor Resource Usage

```bash
# Check server memory/CPU
top -p $(pgrep -f "nest start")
```

---

## Verification Checklist

### Backend
- [ ] Server starts without errors
- [ ] Token generation returns valid JWT
- [ ] Recording start returns egressId
- [ ] Recording stop succeeds
- [ ] Webhook events logged correctly
- [ ] Cloudflare R2 upload works (if configured)

### Client
- [ ] Client connects to server successfully
- [ ] LiveKit room connection works
- [ ] Record button toggles correctly
- [ ] Red border appears when recording
- [ ] Red border has pulse animation
- [ ] Red border disappears when stopped
- [ ] Whiteboard sync works across tabs
- [ ] Asset upload/download works

### Integration
- [ ] End-to-end recording flow works
- [ ] Recording captures video/audio/screen
- [ ] Recording file uploaded to Cloudflare R2
- [ ] Webhook events trigger correctly
- [ ] No console errors in browser
- [ ] No errors in server logs
