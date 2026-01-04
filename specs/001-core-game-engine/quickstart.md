# Quickstart: 부루마블 핵심 게임 엔진

**Feature**: 001-core-game-engine  
**Date**: 2026-01-04

## Prerequisites

- Node.js 20 LTS
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator 또는 Android Emulator (또는 실제 기기)

---

## 1. Server Setup

```bash
# 프로젝트 루트에서 서버 초기화
mkdir server && cd server

# NestJS 프로젝트 생성
npx @nestjs/cli new . --skip-git --package-manager npm

# 필수 의존성 설치
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io uuid

# 개발 의존성
npm install -D @types/uuid

# 서버 실행
npm run start:dev
```

### 환경 변수 (.env)

```env
PORT=3000
CORS_ORIGIN=*
DISCONNECT_TIMEOUT_MS=180000
```

---

## 2. Client Setup

```bash
# 프로젝트 루트에서 클라이언트 초기화
cd .. && mkdir client && cd client

# Expo 프로젝트 생성
npx create-expo-app@latest . --template expo-template-blank-typescript

# 필수 의존성 설치
npx expo install expo-camera expo-barcode-scanner
npm install socket.io-client zustand

# 개발 서버 실행
npx expo start
```

### 환경 변수 (app.config.js)

```javascript
export default {
  expo: {
    // ...
    extra: {
      serverUrl: process.env.SERVER_URL || "http://localhost:3000",
    },
  },
};
```

---

## 3. Key Files to Create

### Server

| Path                                | Purpose           |
| ----------------------------------- | ----------------- |
| `src/game/game.module.ts`           | Game 모듈 정의    |
| `src/game/game.gateway.ts`          | WebSocket Gateway |
| `src/game/game.service.ts`          | 게임 로직         |
| `src/models/*.ts`                   | 데이터 모델       |
| `src/constants/board-data.ts`       | 32칸 보드 데이터  |
| `src/constants/golden-key-cards.ts` | 27종 카드 데이터  |

### Client

| Path                        | Purpose              |
| --------------------------- | -------------------- |
| `services/socketService.ts` | Socket.IO 클라이언트 |
| `stores/gameStore.ts`       | Zustand 스토어       |
| `components/QRScanner.tsx`  | QR 스캐너            |
| `components/BoardView.tsx`  | 보드판 뷰            |
| `app/room/create.tsx`       | 방 생성 화면         |
| `app/room/[code].tsx`       | 게임 화면            |

---

## 4. Development Workflow

```bash
# Terminal 1: 서버 실행 (핫 리로드)
cd server && npm run start:dev

# Terminal 2: 클라이언트 실행
cd client && npx expo start

# Terminal 3: 테스트 실행
cd server && npm test -- --watch
```

---

## 5. Testing

### Unit Tests

```bash
cd server

# 전체 테스트
npm test

# 파산 로직만 테스트 (Constitution Required)
npm test -- --testPathPattern=bankruptcy.spec

# 커버리지
npm test -- --coverage
```

### Integration Tests

```bash
cd server

# WebSocket 통합 테스트
npm test -- --testPathPattern=game.gateway.spec
```

### Manual Test Flow

1. **방 생성 테스트**

   - 앱 실행 → "새 게임 만들기" 클릭
   - 6자리 방 코드 확인
   - 다른 기기에서 방 코드로 입장

2. **QR 스캔 테스트**

   - 주사위 결과 입력 (예: 7)
   - 앱에서 도착지 표시 확인
   - 도착지 QR 스캔 → 위치 업데이트 확인
   - 잘못된 QR 스캔 → "잘못된 위치입니다" 에러 확인

3. **실시간 동기화 테스트**
   - 플레이어 A가 땅 구매
   - 플레이어 B, C, D 화면에서 소유권 표시 확인

---

## 6. Common Issues

### WebSocket Connection Failed

```typescript
// client/services/socketService.ts
// 로컬 개발 시 IP 주소 사용
const socket = io("http://192.168.x.x:3000", {
  transports: ["websocket"],
});
```

### Expo Camera Permission

```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "QR 코드 스캔을 위해 카메라 권한이 필요합니다."
        }
      ]
    ]
  }
}
```

### CORS Issues

```typescript
// server/src/game/game.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
```

---

## 7. Next Steps

1. `/speckit.tasks`로 태스크 목록 생성
2. Phase 1: Server Foundation 구현
3. Phase 2: Data Models & Constants 구현
4. Phase 3: Client Foundation 구현
5. Phase 4: Core Components 구현
6. Phase 5: Tests 구현
