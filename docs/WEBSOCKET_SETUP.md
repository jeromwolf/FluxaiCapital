# WebSocket 서버 구현 가이드

## 옵션 1: Socket.IO 사용 (추천)

### 1. 패키지 설치
```bash
npm install socket.io socket.io-client
```

### 2. 서버 생성 (`src/lib/websocket/server.ts`)
```typescript
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { marketDataProvider } from './providers/real';

const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env["NEXT_PUBLIC_APP_URL"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // 가격 구독
  socket.on('subscribe:price', async (symbols: string[]) => {
    for (const symbol of symbols) {
      const price = await marketDataProvider.getPrice(symbol);
      socket.emit('price:update', { symbol, ...price });
    }
  });
  
  // 포트폴리오 업데이트
  socket.on('subscribe:portfolio', (portfolioId: string) => {
    // 포트폴리오 실시간 업데이트 로직
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env["WS_PORT"] || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
```

### 3. 별도 프로세스로 실행
```json
// package.json
{
  "scripts": {
    "ws:dev": "tsx watch src/lib/websocket/server.ts",
    "ws:build": "tsc src/lib/websocket/server.ts --outDir dist",
    "ws:start": "node dist/lib/websocket/server.js"
  }
}
```

## 옵션 2: Next.js API Routes with Server-Sent Events (SSE)

### 1. SSE 엔드포인트 생성 (`app/api/sse/prices/route.ts`)
```typescript
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };
      
      // 5초마다 가격 업데이트
      const interval = setInterval(async () => {
        const prices = await getLatestPrices();
        sendEvent({ type: 'prices', data: prices });
      }, 5000);
      
      // 클라이언트 연결 종료 시
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 옵션 3: Pusher 또는 Ably (관리형 서비스)

### Pusher 사용 예시
```bash
npm install pusher pusher-js
```

```typescript
// 서버 측
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env["PUSHER_APP_ID"],
  key: process.env["PUSHER_KEY"],
  secret: process.env["PUSHER_SECRET"],
  cluster: process.env["PUSHER_CLUSTER"],
});

// 가격 업데이트 전송
pusher.trigger('market-data', 'price-update', {
  symbol: 'AAPL',
  price: 150.25,
  change: 2.5
});
```

## 옵션 4: Vercel 배포를 위한 추천 구조

Vercel은 WebSocket을 직접 지원하지 않으므로:

1. **개발 환경**: Socket.IO 로컬 서버
2. **프로덕션**: 
   - Railway 또는 Render에 WebSocket 서버 배포
   - 또는 Pusher/Ably 같은 관리형 서비스 사용

### Railway 배포 예시
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run ws:build"
  },
  "deploy": {
    "startCommand": "npm run ws:start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 클라이언트 연결 업데이트

```typescript
// src/lib/websocket/client.ts
import { io, Socket } from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  
  connect() {
    this.socket = io(process.env["NEXT_PUBLIC_WS_URL"], {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('price:update', (data) => {
      // 가격 업데이트 처리
    });
  }
  
  subscribeToPrice(symbols: string[]) {
    this.socket?.emit('subscribe:price', symbols);
  }
}
```

## 보안 고려사항

1. **인증**: JWT 토큰으로 WebSocket 연결 인증
2. **Rate Limiting**: 클라이언트별 요청 제한
3. **데이터 검증**: 전송 데이터 검증
4. **SSL/TLS**: 프로덕션에서 wss:// 사용

## 모니터링

- Socket.IO Admin UI 사용
- 커스텀 대시보드 구현
- 로그 수집 (Winston, Pino)