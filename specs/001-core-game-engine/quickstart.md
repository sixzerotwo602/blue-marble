# Quickstart: 부루마블 핵심 게임 엔진

**Date**: 2026-01-09  
**Feature**: 001-core-game-engine

이 문서는 개발 환경 설정 및 프로젝트 실행 방법을 설명합니다.

---

## Prerequisites

- **Node.js**: 20.x LTS
- **npm**: 10.x 이상 (Node.js와 함께 설치)
- **모던 웹 브라우저**: Chrome, Firefox, Safari, Edge

### Node.js 설치 확인

```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

## Project Setup

### 1. 저장소 클론

```bash
git clone <repository-url>
cd blue-marble
git checkout 001-core-game-engine
```

### 2. 의존성 설치

```bash
# 루트, 서버, 클라이언트 모두 설치 (모노레포 구조)
npm install

# 또는 개별 설치
cd server && npm install && cd ..
cd client && npm install && cd ..
cd shared && npm install && cd ..
```

### 3. 환경 변수 설정

```bash
# server/.env
cp server/.env.example server/.env
```

```env
# server/.env
PORT=3001
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
RECONNECT_TIMEOUT_MS=60000
```

```bash
# client/.env
cp client/.env.example client/.env
```

```env
# client/.env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

---

## Development

### 서버 실행 (개발 모드)

```bash
cd server
npm run dev
```

서버가 `http://localhost:3001`에서 실행됩니다.

### 클라이언트 실행 (개발 모드)

```bash
cd client
npm run dev
```

클라이언트가 `http://localhost:5173`에서 실행됩니다.

### 동시 실행 (루트에서)

```bash
# 루트 package.json에 스크립트 추가 필요
npm run dev
```

---

## Testing

### 단위 테스트 실행

```bash
# 서버
cd server
npm test

# 클라이언트
cd client
npm test
```

### 필수 테스트 (Constitution 준수)

```bash
# 파산 로직 테스트 (Constitution IV 필수)
cd server
npm test -- --grep "bankruptcy"

# WebSocket 통합 테스트 (Constitution VI 필수)
cd server
npm run test:integration
```

### E2E 테스트

```bash
cd client
npm run test:e2e
```

---

## Build

### 프로덕션 빌드

```bash
# 서버
cd server
npm run build
# 출력: server/dist/

# 클라이언트
cd client
npm run build
# 출력: client/dist/
```

### 프로덕션 실행

```bash
# 서버
cd server
npm start

# 클라이언트 정적 파일 서빙 (예: nginx)
```

---

## Project Structure

```text
blue-marble/
├── server/                 # 백엔드 (Fastify + Socket.io)
│   ├── src/
│   │   ├── models/         # 도메인 모델
│   │   ├── services/       # 비즈니스 로직
│   │   ├── websocket/      # WebSocket 핸들러
│   │   ├── api/            # REST API
│   │   ├── data/           # 정적 데이터 (JSON)
│   │   └── utils/          # 유틸리티
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── client/                 # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/     # UI 컴포넌트
│   │   ├── pages/          # 페이지
│   │   ├── services/       # API/WebSocket 클라이언트
│   │   ├── stores/         # Zustand 스토어
│   │   └── hooks/          # 커스텀 훅
│   ├── tests/
│   ├── package.json
│   └── vite.config.ts
│
├── shared/                 # 공유 타입 및 상수
│   ├── types/
│   └── constants/
│
└── specs/                  # 기능 명세
    └── 001-core-game-engine/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── quickstart.md    # 이 파일
        ├── contracts/
        └── checklists/
```

---

## Key Commands Reference

| 명령어                     | 위치             | 설명                         |
| -------------------------- | ---------------- | ---------------------------- |
| `npm run dev`              | server/          | 개발 서버 실행 (hot reload)  |
| `npm run dev`              | client/          | 개발 클라이언트 실행 (HMR)   |
| `npm test`                 | server/, client/ | 단위 테스트 실행             |
| `npm run test:integration` | server/          | 통합 테스트 실행             |
| `npm run test:e2e`         | client/          | E2E 테스트 실행 (Playwright) |
| `npm run build`            | server/, client/ | 프로덕션 빌드                |
| `npm run lint`             | server/, client/ | ESLint 실행                  |
| `npm run typecheck`        | server/, client/ | TypeScript 타입 체크         |

---

## TypeScript Configuration

### Strict Mode 필수 설정

`tsconfig.json` (server/ 및 client/):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## Troubleshooting

### 포트 충돌

```bash
# 사용 중인 포트 확인 (Windows)
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 프로세스 종료
taskkill /PID <PID> /F
```

### WebSocket 연결 실패

1. 서버가 실행 중인지 확인
2. CORS 설정 확인 (`server/.env`의 `CORS_ORIGIN`)
3. 클라이언트 WebSocket URL 확인 (`client/.env`의 `VITE_WS_URL`)

### TypeScript 에러

```bash
# 타입 정의 재생성
npm run typecheck

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

1. **`/speckit.tasks`** 실행하여 구현 태스크 생성
2. 태스크 순서대로 구현 진행
3. 각 태스크 완료 후 테스트 통과 확인
4. PR 생성 시 Constitution Check 통과 확인
