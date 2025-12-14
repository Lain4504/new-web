# WebSocket Configuration Fix for Production Deployment

## Problem
The TLDraw WebSocket connection was hardcoded to `ws://localhost:5858`, causing connection failures when deployed to production (Render/Vercel).

## Solution

### Client Changes (`client/src/components/Whiteboard.tsx`)
- **Removed hardcoded WebSocket URL**
- **Added dynamic URL generation** from `VITE_SERVER_URL` environment variable
- **Automatic protocol conversion**: `http` → `ws`, `https` → `wss`

```typescript
const getWebSocketUrl = (serverUrl: string) => {
  const url = new URL(serverUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString().replace(/\/$/, "");
};

const WS_BASE_URL = getWebSocketUrl(SERVER_URL);
// Usage: `${WS_BASE_URL}/tldraw/connect/${roomId}`
```

### Server Changes

#### 1. `server/src/modules/tldraw/tldraw.gateway.ts`
- **Changed from standalone WebSocket server** (port 5858) to **HTTP server integration**
- **New method**: `initializeWebSocket(httpServer: Server)`
- **WebSocket path**: `/tldraw/connect/:roomId`
- **Benefit**: WebSocket runs on same port as HTTP server (required for cloud platforms)

#### 2. `server/src/main.ts`
- **Added TldrawGateway initialization** after HTTP server starts
- **Passes HTTP server instance** to gateway for WebSocket attachment

```typescript
const httpServer = app.getHttpServer();
const tldrawGateway = app.get(TldrawGateway);
tldrawGateway.initializeWebSocket(httpServer);
```

## Environment Configuration

### Local Development
```bash
# client/.env
VITE_SERVER_URL=http://localhost:3000
```
**WebSocket URL**: `ws://localhost:3000/tldraw/connect/:roomId`

### Production (Render + Vercel)
```bash
# Vercel Environment Variables
VITE_SERVER_URL=https://new-web-t2a1.onrender.com
```
**WebSocket URL**: `wss://new-web-t2a1.onrender.com/tldraw/connect/:roomId`

## Testing
1. **Local**: Start server, verify WebSocket connects to `ws://localhost:3000/tldraw/connect/...`
2. **Production**: Deploy and verify WebSocket connects to `wss://your-backend.com/tldraw/connect/...`

## Benefits
✅ Single port for HTTP + WebSocket (cloud-friendly)
✅ No hardcoded URLs
✅ Automatic protocol detection
✅ Works on Render, Vercel, and other cloud platforms
