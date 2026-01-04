# Implementation Plan: 부루마블 핵심 게임 엔진

**Branch**: `001-core-game-engine` | **Date**: 2026-01-04 | **Spec**: [spec.md](file:///E:/github_coop/blue-marble/specs/001-core-game-engine/spec.md)  
**Input**: Feature specification from `/specs/001-core-game-engine/spec.md`

## Summary

부루마블(블루마블) 보드게임의 핵심 게임 엔진을 구현한다. **NestJS 10 서버**와 **React Native (Expo SDK 50) 클라이언트**를 사용하여 실시간 멀티플레이어 게임을 구현한다. 핵심 가치인 **Bankless(현금 없음)**, **Math-free(계산 없음)**, **Sync(실시간 동기화)**를 만족하며, 서버가 유일한 게임 상태 관리 주체(SSOT)로 동작한다.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20 LTS)  
**Primary Dependencies**: NestJS 10, Socket.IO, React Native (Expo SDK 50), Zustand  
**Storage**: In-Memory (Node.js 힙 메모리) - MVP 단계, 외부 DB 없음  
**Testing**: Jest (서버), React Native Testing Library (클라이언트)  
**Target Platform**: Server: Linux/Docker, Client: iOS 15+, Android 10+  
**Project Type**: Mobile + API  
**Performance Goals**: QR 스캔 후 응답 < 500ms, 실시간 반영 0.2~0.5초  
**Constraints**: 최대 4명 동시 접속, 세션 종료 시 데이터 소멸, MVP 단계  
**Scale/Scope**: 4명 동시 플레이어, 40개 보드 칸, 27종 황금열쇠 카드

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                  | Status  | Implementation                                                   |
| -------------------------- | ------- | ---------------------------------------------------------------- |
| I. 서버 중심 진실의 원천   | ✅ PASS | 서버 In-Memory GameState가 SSOT, 클라이언트는 렌더링만           |
| II. QR 기반 엄격 검증      | ✅ PASS | `scan-qr` 이벤트로 서버 검증 후 위치 업데이트                    |
| III. 양심 기반 신고 시스템 | ✅ PASS | `roll-dice`로 사용자 입력 신뢰, 무인도 `island-action` 버튼 제공 |
| IV. 즉시 파산 처리         | ✅ PASS | 파산 시 자산 즉시 이전, Unit Test 필수                           |
| V. 턴 종료 명시적 선언     | ✅ PASS | `end-turn` 이벤트로 명시적 턴 종료                               |
| VI. 연결 복원성            | ✅ PASS | 연결 끊김 시 Pause, 3분 후 이탈 처리                             |
| VII. KISS                  | ✅ PASS | In-Memory 저장소로 단순화, 외부 DB 없음                          |
| VIII. YAGNI                | ✅ PASS | MVP 범위 10개 기능만 구현                                        |
| IX. DRY                    | ✅ PASS | Game Constants 및 공통 타입 정의                                 |
| X. SOLID                   | ✅ PASS | 서비스별 단일 책임 분리                                          |

**Quality Gates**:

- [x] 파산 로직 Unit Test 계획됨
- [x] QR 검증 Integration Test 계획됨
- [x] 연결 끊김 시나리오 Test 계획됨

## Project Structure

### Documentation (this feature)

```text
specs/001-core-game-engine/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── websocket-events.ts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# Mobile + API Structure

server/
├── src/
│   ├── main.ts                    # NestJS 부트스트랩
│   ├── app.module.ts              # 루트 모듈
│   ├── game/
│   │   ├── game.module.ts
│   │   ├── game.gateway.ts        # WebSocket Gateway
│   │   ├── game.service.ts        # 게임 로직
│   │   └── game.controller.ts     # REST API (방 생성)
│   ├── models/
│   │   ├── game-room.ts
│   │   ├── player.ts
│   │   ├── board-tile.ts
│   │   ├── golden-key-card.ts
│   │   └── transaction.ts
│   ├── constants/
│   │   ├── board-data.ts          # 32칸 보드 데이터
│   │   └── golden-key-cards.ts    # 27종 카드 데이터
│   └── utils/
│       └── game-logic.ts          # 통행료 계산, 담보 등
└── tests/
    ├── unit/
    │   ├── game.service.spec.ts
    │   └── bankruptcy.spec.ts     # 파산 로직 필수 테스트
    └── integration/
        └── game.gateway.spec.ts   # WebSocket 통합 테스트

client/
├── app/                           # Expo Router
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   └── game.tsx
│   ├── room/
│   │   ├── create.tsx
│   │   └── [code].tsx
│   └── _layout.tsx
├── components/
│   ├── BoardView.tsx
│   ├── PlayerCard.tsx
│   ├── DiceInput.tsx
│   ├── QRScanner.tsx
│   └── GoldenKeyModal.tsx
├── stores/
│   └── gameStore.ts               # Zustand 스토어
├── services/
│   └── socketService.ts           # Socket.IO 클라이언트
└── constants/
    └── gameConstants.ts
```

**Structure Decision**: Mobile + API 구조 선택. NestJS 서버와 Expo 클라이언트를 분리하여 실시간 멀티플레이어 게임 지원.

## Complexity Tracking

> **No violations requiring justification**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |

## Proposed Changes

### Phase 1: Server Foundation

#### [NEW] [server/](file:///E:/github_coop/blue-marble/server/)

- NestJS 10 프로젝트 초기화
- Game 모듈 구조 설정

#### [NEW] [game.gateway.ts](file:///E:/github_coop/blue-marble/server/src/game/game.gateway.ts)

- WebSocket Gateway 구현
- 13개 Client→Server 이벤트 핸들러
- 11개 Server→Client 이벤트 브로드캐스트

#### [NEW] [game.service.ts](file:///E:/github_coop/blue-marble/server/src/game/game.service.ts)

- 게임 로직 핵심 서비스
- In-Memory 상태 관리 (Map<roomId, GameRoom>)
- 통행료/담보 계산, 파산 처리

---

### Phase 2: Data Models & Constants

#### [NEW] [models/](file:///E:/github_coop/blue-marble/server/src/models/)

- GameRoom, Player, BoardTile, GoldenKeyCard, Transaction 인터페이스

#### [NEW] [board-data.ts](file:///E:/github_coop/blue-marble/server/src/constants/board-data.ts)

- 씨앗사 부루마블 클래식 32칸 데이터
- 가격, 임대료 테이블, 색상 그룹

#### [NEW] [golden-key-cards.ts](file:///E:/github_coop/blue-marble/server/src/constants/golden-key-cards.ts)

- 27종 황금열쇠 카드 데이터

---

### Phase 3: Client Foundation

#### [NEW] [client/](file:///E:/github_coop/blue-marble/client/)

- Expo SDK 50 프로젝트 초기화
- Expo Router 설정

#### [NEW] [socketService.ts](file:///E:/github_coop/blue-marble/client/services/socketService.ts)

- Socket.IO 클라이언트 연결
- 이벤트 송수신 래퍼

#### [NEW] [gameStore.ts](file:///E:/github_coop/blue-marble/client/stores/gameStore.ts)

- Zustand 스토어
- `state-updated` 이벤트 시 상태 동기화

---

### Phase 4: Core Components

#### [NEW] [QRScanner.tsx](file:///E:/github_coop/blue-marble/client/components/QRScanner.tsx)

- Expo Camera 기반 QR 스캐너
- `scan-qr` 이벤트 전송

#### [NEW] [BoardView.tsx](file:///E:/github_coop/blue-marble/client/components/BoardView.tsx)

- 32칸 보드판 시각화
- 플레이어 위치 표시

---

### Phase 5: Tests

#### [NEW] [bankruptcy.spec.ts](file:///E:/github_coop/blue-marble/server/tests/unit/bankruptcy.spec.ts)

- 플레이어 간 파산 시나리오
- 은행 파산 시나리오
- **(Constitution Required)**

#### [NEW] [game.gateway.spec.ts](file:///E:/github_coop/blue-marble/server/tests/integration/game.gateway.spec.ts)

- WebSocket 연결/끊김 테스트
- QR 스캔 검증 테스트
- **(Constitution Required)**

## Verification Plan

### Automated Tests

1. **Unit Tests (서버)**

   ```bash
   cd server && npm test -- --testPathPattern=bankruptcy.spec
   ```

   - 플레이어 간 파산: 자산 승계 확인
   - 은행 파산: 자산 초기화 확인

2. **Integration Tests (서버)**

   ```bash
   cd server && npm test -- --testPathPattern=game.gateway.spec
   ```

   - WebSocket 연결/끊김/재연결
   - QR 스캔 올바른/잘못된 시나리오

3. **Client Tests**
   ```bash
   cd client && npm test
   ```
   - Zustand 스토어 상태 업데이트

### Manual Verification

1. **방 생성 및 입장** (User Required)

   - 2개 기기에서 앱 실행
   - 한 기기에서 방 생성 → 방 코드 확인
   - 다른 기기에서 방 코드로 입장
   - 두 기기에서 플레이어 목록 동기화 확인

2. **QR 스캔 검증** (User Required)

   - 주사위 결과 입력 후 도착지 표시 확인
   - 올바른 칸 QR 스캔 → 위치 업데이트 확인
   - 잘못된 칸 QR 스캔 → 에러 메시지 확인

3. **실시간 동기화** (User Required)
   - 한 플레이어가 땅 구매 → 다른 플레이어 화면에 소유권 표시 확인
   - 건물 건설 시 모든 화면에 건물 표시 확인
