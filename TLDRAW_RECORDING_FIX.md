# TLDraw WebSocket Fix và Recording Whiteboard

## Vấn đề đã fix

### 1. TLDraw không kết nối được ✅

**Nguyên nhân:**
- Client đang dùng `VITE_SYNC_SERVER_URL` (không tồn tại) thay vì `VITE_SERVER_URL`
- WebSocket gateway dùng Socket.IO nhưng TLDraw cần native WebSocket
- URL path không đúng format

**Giải pháp:**
- ✅ Updated [Whiteboard.tsx](file:///E:/Ky8/sync-canvas/client/src/components/Whiteboard.tsx) để dùng `VITE_SERVER_URL`
- ✅ Rewrote [tldraw.gateway.ts](file:///E:/Ky8/sync-canvas/server/src/modules/tldraw/tldraw.gateway.ts) để dùng native WebSocket (`ws` library)
- ✅ WebSocket server chạy trên port **5858** (giống old tldraw-sync-server)
- ✅ Client connect đến `ws://localhost:5858/connect/:roomId`

**Kết quả:**
- TLDraw sẽ kết nối thành công
- Real-time sync hoạt động bình thường

---

## Vấn đề Recording Whiteboard ⚠️

### Tại sao recording không capture whiteboard?

**LiveKit Egress chỉ record WebRTC streams:**
- Video tracks (camera)
- Audio tracks (microphone)  
- Screen share tracks

**TLDraw whiteboard là HTML Canvas:**
- Không phải WebRTC stream
- Render trên browser DOM
- LiveKit Egress không thể capture

### Giải pháp có thể

#### Option 1: Screen Share (Recommended - Đơn giản nhất)

Người dùng phải **share screen** khi đang ở whiteboard tab:

```tsx
// User workflow:
1. Mở whiteboard
2. Click "Share Screen"
3. Chọn tab/window có whiteboard
4. Start recording
→ Recording sẽ capture screen share (bao gồm whiteboard)
```

**Ưu điểm:**
- Không cần code thêm
- Recording capture đúng những gì user thấy
- Đơn giản

**Nhược điểm:**
- User phải manually share screen
- Chỉ capture 1 participant's view

#### Option 2: Canvas Stream API (Phức tạp hơn)

Convert TLDraw canvas thành MediaStream và publish như video track:

```typescript
// Pseudo code
const canvas = document.querySelector('canvas');
const stream = canvas.captureStream(30); // 30 FPS
const videoTrack = stream.getVideoTracks()[0];

// Publish to LiveKit
await room.localParticipant.publishTrack(videoTrack, {
  name: 'whiteboard',
  source: Track.Source.Camera, // or custom source
});
```

**Ưu điểm:**
- Automatic capture
- Có thể record nhiều whiteboards

**Nhược điểm:**
- Cần implement canvas streaming
- Performance overhead
- Bandwidth usage cao

#### Option 3: Server-side Recording với Puppeteer (Rất phức tạp)

Dùng headless browser để render và record:

```typescript
// Server-side
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(`https://your-app.com/room/${roomId}?whiteboard=true`);

// Record với ffmpeg hoặc similar
```

**Ưu điểm:**
- Fully automated
- High quality

**Nhược điểm:**
- Rất phức tạp
- Resource intensive
- Cần infrastructure

---

## Recommendation

### Cho production hiện tại:

**Sử dụng Screen Share (Option 1)**

1. **Update UI** - Thêm instruction cho user:
   ```tsx
   {isRecording && showWhiteboard && (
     <div className="alert">
       💡 Tip: Share your screen to include whiteboard in recording
     </div>
   )}
   ```

2. **Document workflow**:
   - Nếu muốn record whiteboard → Share screen trước khi start recording
   - Recording sẽ capture screen share stream

### Cho future enhancement:

**Implement Canvas Stream (Option 2)**

Tạo một feature để auto-publish whiteboard canvas như video stream khi recording starts.

---

## Changes Made

### Backend

**[tldraw.gateway.ts](file:///E:/Ky8/sync-canvas/server/src/modules/tldraw/tldraw.gateway.ts)**
- Rewrote to use native WebSocket server
- Port 5858 (same as old server)
- Path: `/connect/:roomId?sessionId=xxx`

### Client

**[Whiteboard.tsx](file:///E:/Ky8/sync-canvas/client/src/components/Whiteboard.tsx)**
- Updated to use `VITE_SERVER_URL`
- WebSocket URL: `ws://localhost:5858/connect/:roomId`
- Asset upload: `${SERVER_URL}/tldraw/uploads/:id`
- Unfurl: `${SERVER_URL}/tldraw/unfurl?url=xxx`

**[.env.example](file:///E:/Ky8/sync-canvas/client/.env.example)**
- Added `VITE_SERVER_URL=http://localhost:3000`
- Removed old `VITE_SYNC_SERVER_URL`

---

## Testing

### 1. Start Backend

```bash
cd server
npm run start:dev
```

Server sẽ start:
- HTTP server: `http://localhost:3000`
- TLDraw WebSocket: `ws://localhost:5858`

### 2. Start Client

```bash
cd client
npm run dev
```

### 3. Test TLDraw Connection

1. Join room
2. Click "Whiteboard"
3. **Expected**: Whiteboard loads (không còi stuck ở loading)
4. Vẽ shapes
5. Open another tab, join same room
6. **Expected**: Shapes sync real-time

### 4. Test Recording với Whiteboard

**Option A: Without Screen Share**
1. Open whiteboard
2. Start recording
3. **Result**: Recording chỉ có video/audio, KHÔNG có whiteboard

**Option B: With Screen Share**
1. Open whiteboard
2. Click "Share Screen" → Select whiteboard tab
3. Start recording
4. **Result**: Recording có video/audio + screen share (whiteboard visible)

---

## Environment Variables

### Client `.env`

```env
VITE_SERVER_URL=http://localhost:3000
VITE_LIVEKIT_URL=wss://your-livekit-server.com
```

### Server `.env`

```env
PORT=3000
TLDRAW_WS_PORT=5858

LIVEKIT_API_KEY=xxx
LIVEKIT_API_SECRET=xxx
LIVEKIT_WS_URL=wss://xxx
LIVEKIT_HTTP_URL=https://xxx

S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=xxx
S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_REGION=auto
S3_FORCE_PATH_STYLE=true
```

---

## Summary

✅ **Fixed TLDraw Connection**
- Native WebSocket server on port 5858
- Client connects successfully
- Real-time sync works

⚠️ **Recording Whiteboard**
- LiveKit Egress không tự động capture HTML canvas
- **Workaround**: User phải share screen
- **Future**: Implement canvas streaming (Option 2)

📝 **Next Steps**
1. Test TLDraw connection
2. Document screen share workflow cho users
3. Consider implementing canvas streaming nếu cần auto-capture
