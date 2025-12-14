# Quick Fix: TLDraw WebSocket Connection

## Vấn đề
WebSocket connection failed vì server chưa restart sau khi update code.

## Giải pháp

### 1. Restart Backend Server

```bash
# Stop server hiện tại (Ctrl+C)
# Then restart:
cd server
npm run start:dev
```

### 2. Kiểm tra logs

Khi server start, bạn sẽ thấy:

```
[TldrawGateway] ✅ TLDraw WebSocket server listening on ws://localhost:5858
[TldrawGateway]    Connect at: ws://localhost:5858/connect/:roomId?sessionId=xxx
```

Nếu thấy lỗi:
```
[TldrawGateway] ❌ Failed to start WebSocket server: ...
```

→ Port 5858 đang được sử dụng. Giải pháp:

**Option A: Kill process trên port 5858**
```bash
# Windows
netstat -ano | findstr :5858
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5858 | xargs kill -9
```

**Option B: Đổi port**
```bash
# Trong server/.env
TLDRAW_WS_PORT=5859
```

Và update client:
```tsx
// client/src/components/Whiteboard.tsx line 30
uri: `ws://localhost:5859/connect/${roomId}`,
```

### 3. Test Connection

1. Restart client (nếu cần)
2. Join room
3. Click "Whiteboard"
4. Check browser console - Không còn WebSocket error
5. Check server logs - Sẽ thấy:
   ```
   [TldrawGateway] 📥 Client attempting to connect
   [TldrawGateway]    URL: /connect/test-room?sessionId=...
   [TldrawGateway] Client connected - roomId: test-room
   ```

## Debug

Nếu vẫn lỗi, check:

1. **Server logs** - Có thấy "TLDraw WebSocket server listening" không?
2. **Port** - `netstat -ano | findstr :5858` có process nào không?
3. **Firewall** - Có block port 5858 không?
4. **Browser console** - Error message chi tiết?

## Changes Made

- ✅ Removed `path` option from WebSocketServer (was causing issues)
- ✅ Added better error handling
- ✅ Added detailed logging
- ✅ Server now accepts all connections on port 5858
