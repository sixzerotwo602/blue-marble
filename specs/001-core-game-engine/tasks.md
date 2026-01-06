# Tasks: 부루마블 핵심 게임 엔진 (001-core-game-engine)

**Input**: Design documents from `/specs/001-core-game-engine/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 테스트는 별도 요청 없으므로 구현 태스크만 생성

**Organization**: 8개 User Story 기반으로 구성 (P1 4개, P2 3개, P3 1개)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile + API 구조**: `api/src/`, `mobile/src/`
- 서버: NestJS 10 (api/)
- 클라이언트: React Native Expo (mobile/)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 초기화 및 기본 구조 생성

- [ ] T001 Create project structure per implementation plan (api/, mobile/)
- [ ] T002 Initialize NestJS 10 project in api/ with Socket.IO dependencies
- [ ] T003 [P] Initialize Expo project in mobile/ with Zustand, Socket.IO client
- [ ] T004 [P] Configure ESLint, Prettier for api/ and mobile/
- [ ] T005 [P] Setup PostgreSQL database with Prisma schema in api/prisma/schema.prisma
- [ ] T006 [P] Copy contracts/ files to api/src/contracts/ and mobile/src/contracts/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 User Story 구현 전에 완료해야 하는 핵심 인프라

**⚠️ CRITICAL**: 이 Phase 완료 전까지 User Story 작업 불가

- [ ] T007 Implement In-Memory GameState store in api/src/stores/game-state.store.ts
- [ ] T008 [P] Create BoardTile static data from board-data.ts in api/src/data/board-tiles.ts
- [ ] T009 [P] Create GoldenKeyCard static data from golden-key-cards.ts in api/src/data/golden-keys.ts
- [ ] T010 [P] Create Enum types from enums.ts in api/src/types/enums.ts
- [ ] T011 [P] Setup WebSocket Gateway skeleton in api/src/gateways/game.gateway.ts
- [ ] T012 [P] Implement error codes and messages from websocket-events.ts in api/src/constants/errors.ts
- [ ] T013 [P] Create GameRoom and Player interfaces in api/src/models/game-room.model.ts
- [ ] T014 [P] Create Zustand store skeleton in mobile/src/stores/game.store.ts
- [ ] T015 [P] Setup Socket.IO client service in mobile/src/services/socket.service.ts
- [ ] T016 Implement Prisma models for GameSession, GamePlayer, GameEvent, TurnSnapshot in api/prisma/schema.prisma
- [ ] T017 Create GameEventLogger service for PostgreSQL in api/src/services/event-logger.service.ts

**Checkpoint**: Foundation ready - User Story 구현 시작 가능

---

## Phase 3: User Story 1 - 게임방 생성 및 입장 (Priority: P1) 🎯 MVP

**Goal**: 플레이어가 방을 생성/입장하고, 호스트가 게임을 시작할 수 있음

**Independent Test**: 4명이 각자 기기에서 같은 방에 입장, 각각 다른 색상 말 배정 확인

### Implementation for User Story 1

- [ ] T018 [P] [US1] Implement create-room event handler in api/src/gateways/game.gateway.ts
- [ ] T019 [P] [US1] Implement join-room event handler in api/src/gateways/game.gateway.ts
- [ ] T020 [P] [US1] Implement start-game event handler (min 2 players) in api/src/gateways/game.gateway.ts
- [ ] T021 [US1] Create RoomService for room CRUD operations in api/src/services/room.service.ts
- [ ] T022 [US1] Implement player color auto-assignment logic in api/src/services/room.service.ts
- [ ] T023 [US1] Implement random turn order generation in api/src/services/game.service.ts
- [ ] T024 [US1] Create room-created, player-joined, game-started event payloads in api/src/gateways/game.gateway.ts
- [ ] T025 [P] [US1] Create HomeScreen with "새 게임", "방 입장" buttons in mobile/src/screens/HomeScreen.tsx
- [ ] T026 [P] [US1] Create LobbyScreen showing players list in mobile/src/screens/LobbyScreen.tsx
- [ ] T027 [US1] Implement room code input and join flow in mobile/src/screens/JoinRoomScreen.tsx
- [ ] T028 [US1] Connect Zustand store to Socket.IO room events in mobile/src/stores/game.store.ts

**Checkpoint**: US1 완료 - 방 생성/입장/게임시작 가능

---

## Phase 4: User Story 2 - 주사위 굴리기 및 이동 (Priority: P1)

**Goal**: 주사위 결과 입력 후 QR 스캔으로 이동 완료, 잘못된 QR 시 에러 표시

**Independent Test**: 주사위 7 입력 → 7칸 떨어진 QR 스캔 → 위치 업데이트, 잘못된 QR → 에러

### Implementation for User Story 2

- [ ] T029 [P] [US2] Implement roll-dice event handler in api/src/gateways/game.gateway.ts
- [ ] T030 [P] [US2] Implement scan-qr event handler in api/src/gateways/game.gateway.ts
- [ ] T031 [US2] Create MoveService for position calculation in api/src/services/move.service.ts
- [ ] T032 [US2] Implement QR validation logic (expected vs scanned position) in api/src/services/move.service.ts
- [ ] T033 [US2] Add INVALID_QR and INVALID_MOVE_DISTANCE error handling in api/src/services/move.service.ts
- [ ] T034 [US2] Implement salary (start) and social fund (0 fund rule) logic in api/src/services/move.service.ts
- [ ] T035 [US2] Log DICE_ROLL, MOVE, SALARY_RECEIVED, SOCIAL_FUND_RECEIVED events in api/src/services/event-logger.service.ts
- [ ] T036 [P] [US2] Create GameScreen main game UI in mobile/src/screens/GameScreen.tsx
- [ ] T037 [P] [US2] Create DiceInputModal component in mobile/src/components/DiceInputModal.tsx
- [ ] T038 [P] [US2] Create QRScanner component with camera integration in mobile/src/components/QRScanner.tsx
- [ ] T039 [US2] Implement move destination display after dice input in mobile/src/screens/GameScreen.tsx
- [ ] T040 [US2] Handle scan-qr response and error display in mobile/src/screens/GameScreen.tsx

**Checkpoint**: US2 완료 - 주사위 입력→QR 스캔→이동 흐름 작동

---

## Phase 5: User Story 3 - 땅 구매 및 건물 건설 (Priority: P1)

**Goal**: 빈 땅 구매, 소유 땅에서 빌라/건물/호텔 건설

**Independent Test**: 빈 땅 도착 → 구매 버튼 → 구매 후 소유 표시, 재방문 시 건설 옵션

### Implementation for User Story 3

- [ ] T041 [P] [US3] Implement buy-property event handler in api/src/gateways/game.gateway.ts
- [ ] T042 [P] [US3] Implement build event handler in api/src/gateways/game.gateway.ts
- [ ] T043 [US3] Create PropertyService for purchase and build logic in api/src/services/property.service.ts
- [ ] T044 [US3] Implement ownership transfer and money deduction in api/src/services/property.service.ts
- [ ] T045 [US3] Implement building level progression (0→1→2→3→4) in api/src/services/property.service.ts
- [ ] T046 [US3] Add INSUFFICIENT_FUNDS validation in api/src/services/property.service.ts
- [ ] T047 [US3] Log PROPERTY_PURCHASE, PROPERTY_SKIP, BUILDING_CONSTRUCT events in api/src/services/event-logger.service.ts
- [ ] T048 [P] [US3] Create PropertyActionModal (구매/건설 선택) in mobile/src/components/PropertyActionModal.tsx
- [ ] T049 [P] [US3] Create BuildingSelector component (disable if no funds) in mobile/src/components/BuildingSelector.tsx
- [ ] T050 [US3] Display owned properties with building levels in mobile/src/components/PlayerAssets.tsx
- [ ] T051 [US3] Handle buy/build response and balance update in mobile/src/screens/GameScreen.tsx

**Checkpoint**: US3 완료 - 구매/건설 기능 작동

---

## Phase 6: User Story 4 - 통행료 지불 (Priority: P1)

**Goal**: 타인 소유 땅 도착 시 통행료 자동 계산/지불, 잔고 부족 시 담보 옵션

**Independent Test**: 타인 땅 도착 → 통행료 팝업 → 확인 시 자동 이체

### Implementation for User Story 4

- [ ] T052 [P] [US4] Implement pay-rent event handler in api/src/gateways/game.gateway.ts
- [ ] T053 [US4] Create RentService for rent calculation in api/src/services/rent.service.ts
- [ ] T054 [US4] Implement rent calculation based on building level in api/src/services/rent.service.ts
- [ ] T055 [US4] Implement money transfer between players in api/src/services/transaction.service.ts
- [ ] T056 [US4] Add insufficient balance handling (mortgage or immediate bankruptcy) in api/src/services/rent.service.ts
- [ ] T057 [P] [US4] Implement set-mortgage event handler in api/src/gateways/game.gateway.ts
- [ ] T058 [P] [US4] Implement release-mortgage event handler in api/src/gateways/game.gateway.ts
- [ ] T059 [US4] Create MortgageService for mortgage set/release in api/src/services/mortgage.service.ts
- [ ] T060 [US4] Log RENT_PAID, MORTGAGE_SET, MORTGAGE_RELEASE events in api/src/services/event-logger.service.ts
- [ ] T061 [P] [US4] Create RentPaymentModal in mobile/src/components/RentPaymentModal.tsx
- [ ] T062 [P] [US4] Create MortgageModal in mobile/src/components/MortgageModal.tsx
- [ ] T063 [US4] Handle rent notification for property owner (FR-026) in mobile/src/components/NotificationToast.tsx

**Checkpoint**: US1-4 완료 - 기본 게임 플레이 가능 (MVP Core)

---

## Phase 7: User Story 5 - 황금열쇠 이벤트 처리 (Priority: P2)

**Goal**: 황금열쇠 칸 도착 시 랜덤 카드 효과 적용, 이동 카드는 QR 스캔 필요

**Independent Test**: 황금열쇠 도착 → 27종 카드 랜덤 표시 → 효과 적용

### Implementation for User Story 5

- [ ] T064 [P] [US5] Implement golden-key landed detection in api/src/services/move.service.ts
- [ ] T065 [US5] Create GoldenKeyService for card draw and effect in api/src/services/golden-key.service.ts
- [ ] T066 [US5] Implement all CardEffectType handlers in api/src/services/golden-key.service.ts
- [ ] T067 [US5] Handle forced move cards with QR lock in api/src/services/golden-key.service.ts
- [ ] T068 [US5] Handle holdable cards (탈출권, 우대권) in api/src/services/golden-key.service.ts
- [ ] T069 [US5] Implement use-holdable-card event handler in api/src/gateways/game.gateway.ts
- [ ] T070 [US5] Log GOLDEN_KEY_DRAWN, GOLDEN_KEY_EFFECT, CARD_ACQUIRED events in api/src/services/event-logger.service.ts
- [ ] T071 [P] [US5] Create GoldenKeyModal for card display in mobile/src/components/GoldenKeyModal.tsx
- [ ] T072 [US5] Handle forced move flow with QR lock UI in mobile/src/screens/GameScreen.tsx
- [ ] T073 [US5] Display held cards in player info in mobile/src/components/PlayerCards.tsx

**Checkpoint**: US5 완료 - 황금열쇠 카드 시스템 작동

---

## Phase 8: User Story 6 - 무인도 처리 (Priority: P2)

**Goal**: 무인도 갇힘 상태 관리, 더블/비용/3턴 대기 탈출

**Independent Test**: 무인도 도착 → 탈출 옵션 표시 → 선택에 따른 처리

### Implementation for User Story 6

- [ ] T074 [P] [US6] Detect island landing in api/src/services/move.service.ts
- [ ] T075 [US6] Create IslandService for island state management in api/src/services/island.service.ts
- [ ] T076 [US6] Implement island-action event handler in api/src/gateways/game.gateway.ts
- [ ] T077 [US6] Implement double escape logic in api/src/services/island.service.ts
- [ ] T078 [US6] Implement pay escape logic (50,000원) in api/src/services/island.service.ts
- [ ] T079 [US6] Implement 3-turn auto escape in api/src/services/island.service.ts
- [ ] T080 [US6] Handle escape card usage in api/src/services/island.service.ts
- [ ] T081 [US6] Log ISLAND_ENTER, ISLAND_ESCAPE, ISLAND_ESCAPE_FAIL events in api/src/services/event-logger.service.ts
- [ ] T082 [P] [US6] Create IslandEscapeModal in mobile/src/components/IslandEscapeModal.tsx
- [ ] T083 [US6] Display island turn counter in mobile/src/screens/GameScreen.tsx

**Checkpoint**: US6 완료 - 무인도 시스템 작동

---

## Phase 9: User Story 7 - 파산 처리 (Priority: P2)

**Goal**: 파산 선언 시 자산 이전, 마지막 1명 승리

**Independent Test**: 지불 불가 → 파산 선언 → 자산 이전 → 1명 남으면 승리

### Implementation for User Story 7

- [ ] T084 [P] [US7] Implement declare-bankruptcy event handler in api/src/gateways/game.gateway.ts
- [ ] T085 [US7] Create BankruptcyService for asset transfer in api/src/services/bankruptcy.service.ts
- [ ] T086 [US7] Implement player-to-player asset transfer in api/src/services/bankruptcy.service.ts
- [ ] T087 [US7] Implement bank bankruptcy (소유주 없음 초기화) in api/src/services/bankruptcy.service.ts
- [ ] T088 [US7] Implement victory condition check (1명 남음) in api/src/services/game.service.ts
- [ ] T089 [US7] Trigger game-ended event on victory in api/src/gateways/game.gateway.ts
- [ ] T090 [US7] Log BANKRUPTCY events in api/src/services/event-logger.service.ts
- [ ] T091 [US7] Save final game results to GameSession in api/src/services/event-logger.service.ts
- [ ] T092 [P] [US7] Create BankruptcyModal in mobile/src/components/BankruptcyModal.tsx
- [ ] T093 [P] [US7] Create VictoryScreen in mobile/src/screens/VictoryScreen.tsx

**Checkpoint**: US7 완료 - 파산/승리 처리 작동

---

## Phase 10: User Story 8 - 턴 관리 및 연결 복원 (Priority: P3)

**Goal**: 명시적 턴 종료, 연결 끊김 시 일시정지/복구

**Independent Test**: 턴 종료 → 다음 플레이어로 이동, 연결 끊김 → 일시정지 알림

### Implementation for User Story 8

- [ ] T094 [P] [US8] Implement end-turn event handler in api/src/gateways/game.gateway.ts
- [ ] T095 [US8] Create TurnService for turn management in api/src/services/turn.service.ts
- [ ] T096 [US8] Implement turn rotation logic in api/src/services/turn.service.ts
- [ ] T097 [US8] Implement double dice re-roll logic (maintain on forced move) in api/src/services/turn.service.ts
- [ ] T098 [US8] Handle player disconnect detection in api/src/gateways/game.gateway.ts
- [ ] T099 [US8] Implement game-paused/game-resumed events in api/src/gateways/game.gateway.ts
- [ ] T100 [US8] Implement 3-minute disconnect timeout in api/src/services/connection.service.ts
- [ ] T101 [US8] Log TURN_START, TURN_END, DOUBLE_ROLLED events in api/src/services/event-logger.service.ts
- [ ] T102 [US8] Save TurnSnapshot at each turn start in api/src/services/event-logger.service.ts
- [ ] T103 [P] [US8] Create EndTurnButton component in mobile/src/components/EndTurnButton.tsx
- [ ] T104 [P] [US8] Create GamePausedOverlay in mobile/src/components/GamePausedOverlay.tsx
- [ ] T105 [US8] Implement reconnection flow in mobile/src/services/socket.service.ts

**Checkpoint**: 모든 User Story 완료

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: 전체 시스템 개선 및 마무리 작업

- [ ] T106 [P] Create 실시간 랭킹 계산 로직 (FR-027) in api/src/services/ranking.service.ts
- [ ] T107 [P] Create RankingDisplay component in mobile/src/components/RankingDisplay.tsx
- [ ] T108 [P] Add DUPLICATE_LOGIN validation in api/src/gateways/game.gateway.ts
- [ ] T109 [P] Implement visitor ID generation and storage in mobile/src/services/visitor.service.ts
- [ ] T110 [P] Add comprehensive error handling across all services
- [ ] T111 [P] Add request logging and monitoring
- [ ] T112 Code cleanup and refactoring
- [ ] T113 Run quickstart.md validation (server + client both working)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 후 - 모든 User Story 블로킹
- **User Stories (Phase 3-10)**: Foundational 완료 후 시작 가능
  - P1 스토리들 (US1-4): 순차 권장 (US1→US2→US3→US4)
  - P2 스토리들 (US5-7): P1 완료 후 병렬 가능
  - P3 스토리 (US8): 마지막 구현
- **Polish (Phase 11)**: 모든 원하는 스토리 완료 후

### User Story Dependencies

| Story           | Depends On   | Can Run Parallel With |
| --------------- | ------------ | --------------------- |
| US1 (방 생성)   | Foundational | -                     |
| US2 (이동)      | US1          | -                     |
| US3 (구매/건설) | US2          | -                     |
| US4 (통행료)    | US3          | -                     |
| US5 (황금열쇠)  | US2          | US6, US7              |
| US6 (무인도)    | US2          | US5, US7              |
| US7 (파산)      | US4          | US5, US6              |
| US8 (턴 관리)   | US1          | -                     |

### Parallel Opportunities

**Phase 1 (Setup)**: T002~T006 모두 병렬 가능
**Phase 2 (Foundational)**: T008~T015 모두 병렬 가능
**각 User Story 내**: [P] 마크된 태스크들 병렬 가능

---

## Implementation Strategy

### MVP First (User Story 1-4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete US1-US4 순차적으로
4. **STOP and VALIDATE**: 기본 게임 플레이 테스트
5. Deploy/Demo if ready → **MVP 완료!**

### Full Implementation

1. MVP 완료 후
2. US5 (황금열쇠), US6 (무인도), US7 (파산) 병렬 추가
3. US8 (턴 관리) 추가
4. Polish Phase 마무리

---

## Summary

| Category                   | Count                |
| -------------------------- | -------------------- |
| **Total Tasks**            | 113                  |
| **Phase 1 (Setup)**        | 6                    |
| **Phase 2 (Foundational)** | 11                   |
| **US1 (방 생성)**          | 11                   |
| **US2 (이동)**             | 12                   |
| **US3 (구매/건설)**        | 11                   |
| **US4 (통행료)**           | 12                   |
| **US5 (황금열쇠)**         | 10                   |
| **US6 (무인도)**           | 10                   |
| **US7 (파산)**             | 10                   |
| **US8 (턴 관리)**          | 12                   |
| **Polish**                 | 8                    |
| **Parallel Opportunities** | ~45 tasks marked [P] |
| **MVP Scope**              | US1-US4 (52 tasks)   |
