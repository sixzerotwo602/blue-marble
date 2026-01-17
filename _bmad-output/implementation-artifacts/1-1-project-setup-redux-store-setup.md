# Story 1.1: Project Setup & Redux Store Setup (Engine)

Status: review

---

## Story

**사용자(개발자)로서**,
TypeScript와 Redux로 프로젝트를 초기화하고 싶습니다.
**그래야** 타입 안전성이 보장된 상태 관리 기반을 마련할 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 새로운 Node.js 환경에서
   **When** 프로젝트를 초기화하면
   **Then** `package.json`에 TypeScript, Redux (@reduxjs/toolkit), Vitest 의존성이 포함되어야 한다.

2. **Given** 프로젝트 초기화 완료 후
   **When** `GameState` 인터페이스에 접근하면
   **Then** 게임 상태의 타입 정의가 존재해야 한다. (players, board, currentPlayerIndex, phase 등)

3. **Given** Redux Store가 생성된 상태에서
   **When** Store의 초기 상태를 조회하면
   **Then** 빈 players 배열, 40개의 tiles, currentPlayerIndex: 0 등의 초기값이 존재해야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: 프로젝트 초기화 (AC: 1)**

  - [x] 1.1. `npm init -y` 실행
  - [x] 1.2. `npm install -D typescript ts-node vitest @types/node` 설치
  - [x] 1.3. `npm install @reduxjs/toolkit` 설치
  - [x] 1.4. `tsconfig.json` 생성 (strict mode 활성화)
  - [x] 1.5. `vitest.config.ts` 생성

- [x] **Task 2: 디렉토리 구조 생성 (AC: 2)**

  - [x] 2.1. `src/core/` 디렉토리 생성 (Hexagonal Core)
  - [x] 2.2. `src/core/model/` 인터페이스 정의 디렉토리 생성
  - [x] 2.3. `src/core/state/` Redux 관련 디렉토리 생성
  - [x] 2.4. `tests/` 테스트 디렉토리 생성

- [x] **Task 3: GameState 인터페이스 정의 (AC: 2)**

  - [x] 3.1. `src/core/model/GameState.ts` 생성
  - [x] 3.2. `Player` 인터페이스 정의 (id, name, position, money, ownedTiles, isBankrupt, isSecondHalf)
  - [x] 3.3. `Tile` 인터페이스 정의 (id, type, name, price, ownerId, buildings)
  - [x] 3.4. `GameState` 인터페이스 정의 (players, tiles, currentPlayerIndex, phase, turnNumber)
  - [x] 3.5. `GamePhase` enum 정의 (EARLY, AUCTION, DEVELOPMENT)

- [x] **Task 4: Redux Store 생성 (AC: 3)**

  - [x] 4.1. `src/core/state/store.ts` 생성
  - [x] 4.2. `createSlice`로 `gameSlice` 정의 (10개 리듀서)
  - [x] 4.3. `configureStore`로 스토어 생성
  - [x] 4.4. 초기 상태(initialState) 정의

- [x] **Task 5: 테스트 작성 및 검증 (AC: 1, 2, 3)**
  - [x] 5.1. `tests/core/store.test.ts` 생성
  - [x] 5.2. "초기 상태 확인" 테스트 작성
  - [x] 5.3. `npm test` 실행 및 통과 확인 (11/11 테스트 통과)

---

## Dev Notes

### Architecture Compliance (AR1-AR6)

- **AR1 (Headless Core):** `src/core/`는 UI 코드를 절대 임포트하지 않는다.
- **AR2 (Hexagonal):** Core는 Adapter(`src/adapters/`)를 임포트하지 않는다.
- **AR3 (Redux State):** 상태는 불변이며, Action/Reducer로만 변경한다.
- **AR5 (Result Pattern):** 추후 로직에서 예외 대신 `Result<T, E>` 사용 (이 스토리에서는 설정만).
- **AR6 (Type Safety):** Action은 Discriminated Union으로 정의한다.

### FSM States (AR8)

`TurnPhase` 타입으로 다음 상태들이 정의됨:

- `TURN_START`, `MOVING`, `PURCHASE_DECISION`, `BUILD_DECISION`, `TOLL_PAYMENT`, `LIQUIDATION`, `SPECIAL_EVENT`, `TURN_END`, `GAME_OVER`

### Project Structure

```
blue-marble/
├── src/
│   └── core/
│       ├── model/
│       │   ├── Player.ts
│       │   ├── Tile.ts
│       │   ├── GameState.ts
│       │   └── index.ts
│       └── state/
│           ├── store.ts
│           ├── gameSlice.ts
│           └── index.ts
├── tests/
│   └── core/
│       └── store.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Debug Log References

- vitest.config.ts 수정: `tests/**/*.test.ts` 패턴 추가 (테스트 파일 경로 문제 해결)

### Completion Notes List

- ✅ 프로젝트 이미 초기화됨 (Task 1 기존 완료 상태 확인)
- ✅ `Player`, `Tile`, `GameState` 인터페이스 생성
- ✅ FSM States (AR8) - `TurnPhase` 타입으로 9가지 상태 정의
- ✅ Redux Store with 10 reducers (initializeGame, addPlayer, startGame, setTurnPhase, etc.)
- ✅ 11개 테스트 전체 통과

### Changed File List

- `src/core/model/Player.ts` [NEW]
- `src/core/model/Tile.ts` [NEW]
- `src/core/model/GameState.ts` [NEW]
- `src/core/model/index.ts` [NEW]
- `src/core/state/gameSlice.ts` [NEW]
- `src/core/state/store.ts` [NEW]
- `src/core/state/index.ts` [NEW]
- `tests/core/store.test.ts` [NEW]
- `vitest.config.ts` [MODIFIED] - tests 경로 추가
