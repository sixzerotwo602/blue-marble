# Quickstart: Core Game Engine

**Branch**: `001-core-game-engine`

## 1. Prerequisites

- Node.js v20+
- npm or yarn

## 2. Server Setup (Core Engine)

```bash
# Repo root에서
cd server
npm install
npm run start:dev
```

- Server will start on `http://localhost:3000`
- WebSocket Gateway on `ws://localhost:3000` (Namespace: `/game`)

## 3. Client Setup (Test App)

```bash
# Repo root에서
cd client
npm install
npx expo start
```

- Expo Go 앱으로 QR 스캔하여 접속

## 4. Testing the Engine

### Unit Tests

```bash
cd server
npm run test
```

### End-to-End Tests

```bash
cd server
npm run test:e2e
```

## 5. Development Workflow

1. `contracts/` 수정 시: Server/Client 양쪽에 복사 또는 공통 패키지 빌드 필요
2. Game State 로직 변경 시: `game.service.spec.ts` 테스트 추가 필수
3. 새로운 이벤트 추가 시: `websocket-events.ts` 및 `game.gateway.ts` 동시 수정
