# Research: 부루마블 핵심 게임 엔진

**Date**: 2026-01-09  
**Feature**: 001-core-game-engine  
**Status**: Complete

---

## 1. WebSocket 라이브러리 선택

### Decision: Socket.io

### Rationale

- Node.js 생태계에서 가장 널리 사용되는 실시간 통신 라이브러리
- 자동 재연결, 룸(Room) 관리, 브로드캐스팅 기능 내장
- TypeScript 타입 정의 완벽 지원
- 연결 끊김 감지 기능으로 Constitution VI (연결 복원성) 요구사항 충족

### Alternatives Considered

| 라이브러리         | 장점                 | 단점                       | 기각 사유                  |
| ------------------ | -------------------- | -------------------------- | -------------------------- |
| **ws**             | 경량, 표준 WebSocket | 룸 관리 직접 구현 필요     | 개발 시간 증가             |
| **uWebSockets.js** | 고성능               | 러닝커브 높음, 생태계 작음 | 현재 규모에 오버엔지니어링 |
| **Primus**         | 추상화 레이어        | 유지보수 활발하지 않음     | 장기 지원 우려             |

---

## 2. HTTP 서버 프레임워크 선택

### Decision: Fastify

### Rationale

- Express.js 대비 2-3배 빠른 성능
- JSON 스키마 기반 자동 검증 (Ajv 내장)
- TypeScript 1급 지원
- 플러그인 아키텍처로 확장성 우수

### Alternatives Considered

| 프레임워크     | 장점                          | 단점                                      | 기각 사유              |
| -------------- | ----------------------------- | ----------------------------------------- | ---------------------- |
| **Express.js** | 가장 널리 사용, 풍부한 생태계 | 성능 상대적 저조, 미들웨어 순서 관리 복잡 | Fastify가 성능 우위    |
| **Koa**        | 경량, async/await 네이티브    | 미들웨어 생태계 작음                      | Fastify가 기능 더 풍부 |
| **Hono**       | 초경량, 멀티런타임            | 상대적으로 새로움, 생태계 작음            | 안정성 우선            |

---

## 3. 프론트엔드 빌드 도구 선택

### Decision: Vite + React 18

### Rationale

- 빠른 HMR (Hot Module Replacement)로 개발 생산성 향상
- ESBuild 기반으로 빌드 속도 우수
- React 18의 Concurrent Features 활용 가능
- TypeScript 네이티브 지원

### Alternatives Considered

| 도구                 | 장점             | 단점                      | 기각 사유       |
| -------------------- | ---------------- | ------------------------- | --------------- |
| **Create React App** | 제로 설정        | 느린 빌드, 유지보수 중단  | 공식 지원 종료  |
| **Next.js**          | SSR, 풍부한 기능 | 게임에 필요 없는 오버헤드 | YAGNI 원칙 위반 |
| **Webpack**          | 유연한 설정      | 복잡한 설정, 느린 빌드    | Vite가 더 단순  |

---

## 4. 상태 관리 라이브러리 선택

### Decision: Zustand

### Rationale

- 경량 (< 1KB gzipped)
- 보일러플레이트 최소화
- TypeScript 완벽 지원
- React 외부에서도 상태 접근 가능 (WebSocket 이벤트 처리에 유용)

### Alternatives Considered

| 라이브러리        | 장점                | 단점                   | 기각 사유           |
| ----------------- | ------------------- | ---------------------- | ------------------- |
| **Redux Toolkit** | 표준, DevTools 우수 | 보일러플레이트 많음    | KISS 원칙 위반      |
| **MobX**          | 반응형, 직관적      | 번들 크기 큼           | Zustand가 더 경량   |
| **Jotai**         | 원자적 상태         | 러닝커브               | Zustand가 더 직관적 |
| **React Context** | 내장 기능           | 리렌더링 최적화 어려움 | 성능 우려           |

---

## 5. 런타임 타입 검증 라이브러리 선택

### Decision: Zod

### Rationale

- TypeScript 타입 추론 자동 생성
- 체이닝 API로 직관적인 스키마 정의
- Fastify JSON Schema와 통합 가능 (zod-to-json-schema)
- 번들 크기 적절 (~50KB)

### Alternatives Considered

| 라이브러리 | 장점             | 단점                 | 기각 사유          |
| ---------- | ---------------- | -------------------- | ------------------ |
| **Yup**    | 폼 검증에 최적화 | TypeScript 추론 약함 | Zod가 TS 통합 우수 |
| **io-ts**  | fp-ts 통합       | 러닝커브 높음        | 복잡성 증가        |
| **Ajv**    | JSON Schema 표준 | 스키마 작성 번거로움 | DX 저조            |

---

## 6. 테스트 프레임워크 선택

### Decision: Vitest

### Rationale

- Vite 기반으로 설정 공유
- Jest 호환 API (마이그레이션 용이)
- ESM 네이티브 지원
- 빠른 실행 속도

### Alternatives Considered

| 프레임워크              | 장점                | 단점                   | 기각 사유            |
| ----------------------- | ------------------- | ---------------------- | -------------------- |
| **Jest**                | 표준, 풍부한 생태계 | ESM 설정 복잡          | Vitest가 Vite와 통합 |
| **Mocha + Chai**        | 유연함              | 설정 필요              | Vitest가 제로 설정   |
| **Node.js Test Runner** | 내장 기능           | 생태계 작음, 기능 제한 | Vitest가 기능 풍부   |

---

## 7. 게임 세션 스토리지 전략

### Decision: In-Memory + Optional Redis

### Rationale

- MVP 단계에서는 In-Memory로 충분 (YAGNI)
- 단일 서버 인스턴스로 10개 게임룸 처리 가능
- 추후 수평 확장 시 Redis 어댑터 추가

### Storage Design

```typescript
// In-Memory 게임 세션 저장소
const gameSessions = new Map<string, GameState>();

// 인터페이스로 추상화 (DIP 원칙)
interface GameSessionStore {
  get(sessionId: string): Promise<GameState | null>;
  set(sessionId: string, state: GameState): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

// 구현체 교체 가능
class InMemoryStore implements GameSessionStore { ... }
class RedisStore implements GameSessionStore { ... }
```

### Alternatives Considered

| 전략           | 장점           | 단점                 | 기각 사유 |
| -------------- | -------------- | -------------------- | --------- |
| **Redis 필수** | 수평 확장 가능 | MVP에 오버엔지니어링 | YAGNI     |
| **SQLite**     | 영속성         | 실시간 게임에 부적합 | 성능 우려 |
| **PostgreSQL** | 관계형 데이터  | 게임 세션에 과도함   | YAGNI     |

---

## 8. 주사위 난수 생성 전략

### Decision: 서버 Crypto RNG (기본) + 사용자 입력 (옵션)

### Rationale

- Constitution III (양심 기반 신고)를 존중하되, 온라인 게임 공정성 보장
- 서버 `crypto.randomInt(1, 7)`로 암호학적 난수 생성
- 게임 설정에서 "사용자 직접 입력" 옵션 제공

### Implementation

```typescript
interface DiceRollStrategy {
  roll(): Promise<{ die1: number; die2: number }>;
}

class ServerRNG implements DiceRollStrategy {
  async roll() {
    return {
      die1: crypto.randomInt(1, 7),
      die2: crypto.randomInt(1, 7),
    };
  }
}

class UserInput implements DiceRollStrategy {
  async roll() {
    // WebSocket을 통해 사용자 입력 대기
    return await this.waitForUserInput();
  }
}
```

---

## 9. 연결 끊김 처리 전략

### Decision: 60초 재접속 대기 + AI 대체

### Rationale

- Constitution VI (연결 복원성) 준수
- 일시적 네트워크 문제에 관용적
- 무한 대기 방지로 게임 진행 보장

### Implementation

```typescript
// 연결 끊김 감지
socket.on("disconnect", () => {
  const player = getPlayerBySocketId(socket.id);
  player.disconnectedAt = Date.now();
  player.status = "DISCONNECTED";

  // 60초 타이머 시작
  setTimeout(() => {
    if (player.status === "DISCONNECTED") {
      player.status = "AI_CONTROLLED";
      notifyRoom("PLAYER_AI_TAKEOVER", { playerId: player.id });
    }
  }, 60_000);
});

// 재접속 처리
socket.on("reconnect", () => {
  const player = getPlayerByToken(socket.auth.token);
  if (player.status === "DISCONNECTED") {
    player.status = "CONNECTED";
    player.socketId = socket.id;
  }
});
```

---

## 10. 정적 데이터 관리 전략

### Decision: JSON 파일 + TypeScript 타입 생성

### Rationale

- 보드 데이터는 변경 빈도 낮음 (정적)
- JSON으로 관리하여 비개발자도 수정 가능
- 빌드 시 TypeScript 타입 자동 생성

### Data Files

```text
server/src/data/
├── board.json          # 40칸 보드 정의
├── properties.json     # 29개 증서 (가격, 통행료)
└── golden-keys.json    # 27종 황금열쇠 카드
```

### Type Generation

```typescript
// Zod 스키마에서 타입 추론
const PropertySpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  tileIndex: z.number(),
  purchasePrice: z.number(),
  // ...
});

type PropertySpec = z.infer<typeof PropertySpecSchema>;
```

---

## Summary of Decisions

| 영역        | 결정                        | 핵심 이유                 |
| ----------- | --------------------------- | ------------------------- |
| WebSocket   | Socket.io                   | 룸 관리, 재연결 기능 내장 |
| HTTP Server | Fastify                     | 성능, TypeScript 지원     |
| Frontend    | Vite + React 18             | 빠른 개발, HMR            |
| 상태 관리   | Zustand                     | 경량, 보일러플레이트 최소 |
| 타입 검증   | Zod                         | TypeScript 추론 우수      |
| 테스트      | Vitest                      | Vite 통합, 빠른 실행      |
| 스토리지    | In-Memory + Redis 옵션      | YAGNI, 확장성             |
| 주사위      | 서버 RNG + 사용자 입력 옵션 | 공정성 + 양심 존중        |
| 연결 끊김   | 60초 대기 + AI 대체         | Constitution VI 준수      |
| 정적 데이터 | JSON + 타입 생성            | 유지보수 용이             |

---

## Dependencies Summary

### Server

```json
{
  "dependencies": {
    "fastify": "^4.x",
    "socket.io": "^4.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vitest": "^1.x",
    "@types/node": "^20.x"
  }
}
```

### Client

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "socket.io-client": "^4.x",
    "zustand": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "vitest": "^1.x",
    "playwright": "^1.x"
  }
}
```
