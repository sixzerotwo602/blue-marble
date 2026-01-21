# Tasks: 블루마블 코어 게임 엔진

**Input**: Design documents from `/specs/001-core-game-engine/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/game-engine.ts ✅, quickstart.md ✅

**Tests**: Constitution에서 파산 로직 Unit Test 필수로 명시됨. 핵심 서비스에 대한 단위 테스트 포함.

**Organization**: User Story 기반으로 구성 (P1 우선, 독립 구현/테스트 가능)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 해당 User Story (US1, US2, ... US12)
- 정확한 파일 경로 포함

## Path Conventions

- **Single CLI project**: `src/`, `tests/` at repository root
- **Existing data**: `rulemd/` (board-data.ts, golden-key-cards.ts, enums.ts)

---

## Phase 1: Setup (프로젝트 초기화)

**Purpose**: 프로젝트 구조 및 기본 설정

- [ ] T001 Create project structure per plan.md in src/, tests/, rulemd/
- [ ] T002 Initialize TypeScript project with tsconfig.json and package.json
- [ ] T003 [P] Configure Vitest testing framework in vitest.config.ts
- [ ] T004 [P] Configure ESLint and Prettier in .eslintrc.js and .prettierrc
- [ ] T005 [P] Add npm scripts (build, test, start, simulate) in package.json

---

## Phase 2: Foundational (핵심 기반)

**Purpose**: 모든 User Story가 의존하는 핵심 인프라

**⚠️ CRITICAL**: 이 페이즈 완료 전까지 User Story 구현 불가

- [ ] T006 Extend enums in rulemd/enums.ts (GamePhase, PlayerStatus, IslandStatus)
- [ ] T007 [P] Create Player model interface in src/models/player.ts
- [ ] T008 [P] Create Loan model interface in src/models/loan.ts
- [ ] T009 [P] Create DeedRuntime model interface in src/models/deed-runtime.ts
- [ ] T010 [P] Create BuildingSlots model interface in src/models/building.ts
- [ ] T011 [P] Create GoldenKeyDeck model interface in src/models/golden-key-deck.ts
- [ ] T012 [P] Create WelfareFund model interface in src/models/welfare-fund.ts
- [ ] T013 [P] Create AuctionState model interface in src/models/auction-state.ts
- [ ] T014 [P] Create GameState model interface in src/models/game-state.ts
- [ ] T015 [P] Create DiceResult model interface in src/models/dice-result.ts
- [ ] T016 Create GameEngine class skeleton implementing IGameEngine in src/engine/game-engine.ts
- [ ] T017 [P] Create constants file with game rules in src/lib/constants.ts
- [ ] T018 [P] Create utility functions (shuffle, clamp) in src/lib/utils.ts

**Checkpoint**: 기반 완료 - User Story 구현 시작 가능

---

## Phase 3: User Story 1 - 기본 게임 플레이 (Priority: P1) 🎯 MVP

**Goal**: 2~4명 플레이어가 40칸 보드에서 완전한 게임을 진행할 수 있다

**Independent Test**: 2명 플레이어로 게임 시작하여 한 명이 파산할 때까지 전체 게임 완료 가능

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implement DiceService.roll() in src/services/dice.service.ts
- [ ] T020 [P] [US1] Implement DiceService.resetDoubleCount() and getDoubleCount()
- [ ] T021 [US1] Implement TurnService.getCurrentPlayer() in src/services/turn.service.ts
- [ ] T022 [US1] Implement TurnService.endTurn() and nextPlayer()
- [ ] T023 [US1] Implement MovementService.move() in src/services/movement.service.ts
- [ ] T024 [US1] Implement MovementService.teleport() with salary check
- [ ] T025 [US1] Implement GameEngine.initialize() with player count validation
- [ ] T026 [US1] Implement GameEngine.getState() returning full GameState
- [ ] T027 [US1] Implement GameEngine.isGameOver() and getWinner()
- [ ] T028 [US1] Create CLI entry point in src/cli/index.ts
- [ ] T029 [US1] Implement CLI renderer for game state in src/cli/renderer.ts
- [ ] T030 [US1] Implement CLI input handler in src/cli/input-handler.ts

**Checkpoint**: 기본 주사위 굴리기, 이동, 턴 전환이 가능한 최소 게임 플레이 가능

---

## Phase 4: User Story 2 - 더블 및 트리플 더블 시스템 (Priority: P1)

**Goal**: 더블 시 추가 턴, 트리플 더블 시 무인도 직행

**Independent Test**: 더블 발생 시 추가 턴 확인, 3연속 더블 시 무인도 이동 확인

### Implementation for User Story 2

- [ ] T031 [US2] Extend DiceService with consecutive double tracking
- [ ] T032 [US2] Implement TurnService.grantExtraTurn() for double handling
- [ ] T033 [US2] Implement triple double → island logic in TurnService
- [ ] T034 [US2] Update CLI renderer to show double status

**Checkpoint**: 더블 시스템 완전 작동

---

## Phase 5: User Story 3 - 씨앗증서 구매 및 통행료 징수 (Priority: P1)

**Goal**: 빈 땅 구매, 상대 땅 통행료 지불

**Independent Test**: 빈 땅 구매, 상대 땅 도착 시 통행료 지불, 건물별 통행료 차등 확인

### Implementation for User Story 3

- [ ] T035 [P] [US3] Implement DeedService.getBankDeeds() in src/services/deed.service.ts
- [ ] T036 [P] [US3] Implement DeedService.getPlayerDeeds() for ownership query
- [ ] T037 [US3] Implement EconomyService.buyDeed() in src/services/economy.service.ts
- [ ] T038 [US3] Implement EconomyService.calculateRent() using rentLevels from board-data.ts
- [ ] T039 [US3] Implement EconomyService.collectRent() with shortfall handling
- [ ] T040 [US3] Update CLI with buy command and rent notification

**Checkpoint**: 증서 구매 및 통행료 시스템 작동

---

## Phase 6: User Story 4 - 전반전/후반전 페이즈 시스템 (Priority: P1)

**Goal**: 전반전(구매만)/후반전(건설 가능) 페이즈 분리, 경매 트리거

**Independent Test**: 전반전에서 건설 불가 확인, 증서 6장 이하 시 경매 트리거 확인

### Implementation for User Story 4

- [ ] T041 [US4] Create PhaseManager in src/engine/phase-manager.ts
- [ ] T042 [US4] Implement PhaseSystem.getCurrentPhase() and shouldTriggerAuction()
- [ ] T043 [US4] Implement PhaseSystem.startAuction() and transitionToSecondHalf()
- [ ] T044 [US4] Implement phase validation in BuildingService (block in FIRST_HALF)
- [ ] T045 [US4] Update CLI to display current phase

**Checkpoint**: 페이즈 전환 시스템 작동

---

## Phase 7: User Story 5 - 라운드 로빈 경매 시스템 (Priority: P1)

**Goal**: 남은 증서 경매, 입찰/폴드 메커니즘

**Independent Test**: 남은 증서 액면가 순 경매, 입찰/폴드 시스템, 전원 폴드 시 유찰 확인

### Implementation for User Story 5

- [ ] T046 [US5] Implement AuctionService.startAuction() in src/services/auction.service.ts
- [ ] T047 [US5] Implement AuctionService.placeBid() with minimum raise validation
- [ ] T048 [US5] Implement AuctionService.fold() removing player from active bidders
- [ ] T049 [US5] Implement AuctionService.processCurrentAuction() for round-robin
- [ ] T050 [US5] Implement AuctionService.nextDeed() and isAuctionComplete()
- [ ] T051 [US5] Create CLI auction interface in src/cli/auction-handler.ts

**Checkpoint**: 완전한 경매 시스템 작동

---

## Phase 8: User Story 6 - 건물 건설 시스템 (Priority: P1)

**Goal**: 후반전에서 별장/빌딩/호텔 건설 (순서 제약 없음)

**Independent Test**: 빈 땅에 바로 호텔 건설, 한 턴에 별장2+빌딩+호텔 동시 건설 확인

### Implementation for User Story 6

- [ ] T052 [US6] Implement BuildingService.getAvailableBuildings() in src/services/building.service.ts
- [ ] T053 [US6] Implement BuildingService.calculateBuildCost() using buildingPrices
- [ ] T054 [US6] Implement BuildingService.canBuild() with slot and phase validation
- [ ] T055 [US6] Implement BuildingService.build() with multi-building support
- [ ] T056 [US6] Update rent calculation for building combinations in EconomyService
- [ ] T057 [US6] Create CLI build menu in src/cli/build-handler.ts

**Checkpoint**: 건물 건설 및 통행료 증가 시스템 작동

---

## Phase 9: User Story 7 - 특수 타일 (Priority: P1)

**Goal**: 우주여행, 무인도, 복지기금 효과 구현

**Independent Test**: 각 특수 타일 효과 정상 작동 확인

### Implementation for User Story 7

- [ ] T058 [US7] Implement SpecialTileService in src/services/special-tile.service.ts
- [ ] T059 [US7] Implement handleSpaceTravel() with fee payment
- [ ] T060 [US7] Implement executeWarp() with salary check for backward movement
- [ ] T061 [US7] Implement handleIsland() setting trapped state
- [ ] T062 [US7] Implement attemptEscape() with 3-turn limit and forced exit
- [ ] T063 [US7] Implement handleDonate() adding to welfare fund
- [ ] T064 [US7] Implement handleReceive() collecting welfare fund
- [ ] T065 [US7] Update TileEffectService to route to special tile handlers

**Checkpoint**: 모든 특수 타일 효과 작동

---

## Phase 10: User Story 8 - 황금열쇠 카드 시스템 (Priority: P1)

**Goal**: 27종 카드 뽑기, 효과 적용, 보관형 카드 관리

**Independent Test**: 카드 뽑기, 즉시 효과, 보관형 카드 저장 및 사용 확인

### Implementation for User Story 8

- [ ] T066 [US8] Implement GoldenKeyService.initializeDeck() in src/services/golden-key.service.ts
- [ ] T067 [US8] Implement GoldenKeyService.drawCard() with reshuffle logic
- [ ] T068 [US8] Implement GoldenKeyService.executeCard() for all effect types
- [ ] T069 [US8] Implement card effects: MOVE_TO, MOVE_BACK, TO_ISLAND
- [ ] T070 [US8] Implement card effects: RECEIVE, PAY, BUILDING_FEE
- [ ] T071 [US8] Implement card effects: FORCE_SELL, ISLAND_ESCAPE, TOLL_EXEMPT
- [ ] T072 [US8] Implement card effects: WORLD_TOUR, COLLECT_FROM_ALL, SPECIAL
- [ ] T073 [US8] Implement GoldenKeyService.useHeldCard() for stored cards
- [ ] T074 [US8] Create CLI card display and hold management

**Checkpoint**: 완전한 황금열쇠 시스템 작동

---

## Phase 11: User Story 9 - 대출 및 파산 시스템 (Priority: P1)

**Goal**: 1회 대출, 3회전 상환, 파산 처리

**Independent Test**: 대출 실행, 상환 기한, 파산 시 자산 청산 확인

### Tests for User Story 9 (Constitution 필수) ⚠️

> **NOTE**: 파산 로직은 Constitution IV에서 Unit Test 필수로 명시됨

- [ ] T075 [P] [US9] Create bankruptcy service unit tests in tests/unit/services/bankruptcy.service.test.ts
- [ ] T076 [P] [US9] Test player-to-player bankruptcy (asset transfer to creditor)
- [ ] T077 [P] [US9] Test bank bankruptcy (assets reset to unowned)
- [ ] T078 [P] [US9] Create loan service unit tests in tests/unit/services/loan.service.test.ts

### Implementation for User Story 9

- [ ] T079 [US9] Implement LoanService.canTakeLoan() in src/services/loan.service.ts
- [ ] T080 [US9] Implement LoanService.takeLoan() with 1,000,000 limit
- [ ] T081 [US9] Implement LoanService.repayLoan() with interest calculation
- [ ] T082 [US9] Implement LoanService.checkLoanDue() for 3-lap tracking
- [ ] T083 [US9] Implement BankruptcyService.isBankrupt() in src/services/bankruptcy.service.ts
- [ ] T084 [US9] Implement BankruptcyService.liquidateAssets() for forced sale
- [ ] T085 [US9] Implement BankruptcyService.processBankruptcy() with creditor logic
- [ ] T086 [US9] Integrate bankruptcy check in EconomyService.collectRent()
- [ ] T087 [US9] Create CLI loan menu and bankruptcy notification

**Checkpoint**: 대출/파산 시스템 작동, Unit Test 통과

---

## Phase 12: User Story 10 - 수동 테스트 모드 (Priority: P2)

**Goal**: 개발자가 모든 플레이어를 조작하며 게임 규칙 검증

**Independent Test**: 테스트 모드에서 모든 플레이어 정보 확인, 디버그 명령 사용 가능

### Implementation for User Story 10

- [ ] T088 [US10] Create debug menu in src/cli/debug-menu.ts
- [ ] T089 [US10] Implement set money command for player cash modification
- [ ] T090 [US10] Implement set pos command for player position modification
- [ ] T091 [US10] Implement set phase command for game phase change
- [ ] T092 [US10] Implement force roll command for deterministic dice
- [ ] T093 [US10] Implement give deed command for ownership transfer
- [ ] T094 [US10] Add --mode=test CLI flag for test mode activation

**Checkpoint**: 수동 테스트 모드 완전 작동

---

## Phase 13: User Story 11 - AI 봇 시뮬레이션 모드 (Priority: P2)

**Goal**: AI 봇들이 자율 플레이, 밸런스 검증용 통계 수집

**Independent Test**: AI 플레이어들로만 구성된 게임이 자동 완료되고 통계 수집 확인

### Implementation for User Story 11

- [ ] T095 [P] [US11] Create AIStrategy interface in src/ai/ai-strategy.ts
- [ ] T096 [P] [US11] Implement RandomStrategy in src/ai/random.strategy.ts
- [ ] T097 [P] [US11] Implement BasicStrategy in src/ai/basic.strategy.ts
- [ ] T098 [P] [US11] Implement SmartStrategy in src/ai/smart.strategy.ts
- [ ] T099 [US11] Create GameSimulator in src/ai/game-simulator.ts
- [ ] T100 [US11] Implement batch simulation with statistics collection
- [ ] T101 [US11] Add --mode=simulate CLI flag with --games and --strategy options
- [ ] T102 [US11] Implement balance report (win rates, avg turns, top properties)

**Checkpoint**: AI 시뮬레이션 및 통계 수집 작동

---

## Phase 14: User Story 12 - 게임 상태 저장/불러오기 (Priority: P3)

**Goal**: JSON 파일로 게임 상태 저장 및 복원

**Independent Test**: 게임 중간 저장 후 불러오기하여 정확히 같은 상태로 복원 확인

### Implementation for User Story 12

- [ ] T103 [US12] Create SaveService in src/services/save.service.ts
- [ ] T104 [US12] Implement saveGame() with JSON serialization
- [ ] T105 [US12] Implement loadGame() with JSON deserialization
- [ ] T106 [US12] Add version field for migration compatibility
- [ ] T107 [US12] Create CLI save and load commands

**Checkpoint**: 저장/불러오기 완전 작동

---

## Phase 15: Polish & Cross-Cutting Concerns

**Purpose**: 전체 시스템 개선 및 마무리

- [ ] T108 [P] Update README.md with installation and usage instructions
- [ ] T109 [P] Create CHANGELOG.md with version history
- [ ] T110 Run quickstart.md validation commands
- [ ] T111 [P] Create integration tests in tests/integration/game-flow.test.ts
- [ ] T112 [P] Create balance simulation test in tests/simulation/balance.test.ts
- [ ] T113 Code cleanup and refactoring for consistency
- [ ] T114 Performance optimization for simulation mode (target: 1000 games in 5 min)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 필요 - **모든 User Story 차단**
- **User Stories (Phase 3-14)**: Foundational 완료 필요
  - P1 스토리(US1-US9)가 P2, P3보다 우선
  - 같은 우선순위 내에서는 병렬 가능 (팀 역량에 따라)
- **Polish (Phase 15)**: 모든 User Story 완료 후

### User Story Dependencies

| Story | Priority | 의존성 |
|-------|----------|--------|
| US1 (기본 플레이) | P1 | Foundational only - MVP |
| US2 (더블 시스템) | P1 | US1 (TurnService 확장) |
| US3 (증서/통행료) | P1 | US1 (기본 이동) |
| US4 (페이즈) | P1 | US3 (은행 증서 추적) |
| US5 (경매) | P1 | US4 (페이즈 전환) |
| US6 (건설) | P1 | US4, US3 (페이즈 및 통행료) |
| US7 (특수 타일) | P1 | US1 (이동 시스템) |
| US8 (황금열쇠) | P1 | US7 (특수 타일) |
| US9 (대출/파산) | P1 | US3 (경제 시스템) |
| US10 (테스트 모드) | P2 | US1-9 (모든 P1 완료) |
| US11 (AI 시뮬레이션) | P2 | US1-9 (모든 P1 완료) |
| US12 (저장/불러오기) | P3 | US1 (GameState) |

### Within Each User Story

- 모델(Model) → 서비스(Service) → CLI 순서
- Constitution 필수 테스트는 구현 전 작성 (US9)
- 핵심 구현 완료 후 통합

### Parallel Opportunities

- Phase 1: T003, T004, T005 병렬 가능
- Phase 2: T007-T015, T017, T018 병렬 가능 (모든 모델)
- Phase 3: T019, T020 병렬 가능
- Phase 5: T035, T036 병렬 가능
- Phase 11: T095, T096, T097, T098 병렬 가능 (AI 전략)
- Phase 15: T108, T109, T111, T112 병렬 가능

---

## Parallel Example: Phase 2 (Foundational)

```bash
# 모든 모델 인터페이스 동시 생성:
Task: "Create Player model interface in src/models/player.ts"
Task: "Create Loan model interface in src/models/loan.ts"
Task: "Create DeedRuntime model interface in src/models/deed-runtime.ts"
Task: "Create BuildingSlots model interface in src/models/building.ts"
Task: "Create GoldenKeyDeck model interface in src/models/golden-key-deck.ts"
Task: "Create WelfareFund model interface in src/models/welfare-fund.ts"
Task: "Create AuctionState model interface in src/models/auction-state.ts"
Task: "Create GameState model interface in src/models/game-state.ts"
Task: "Create DiceResult model interface in src/models/dice-result.ts"
```

---

## Parallel Example: Phase 11 (AI Strategies)

```bash
# 모든 AI 전략 동시 구현:
Task: "Create AIStrategy interface in src/ai/ai-strategy.ts"
Task: "Implement RandomStrategy in src/ai/random.strategy.ts"
Task: "Implement BasicStrategy in src/ai/basic.strategy.ts"
Task: "Implement SmartStrategy in src/ai/smart.strategy.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - 모든 스토리 차단)
3. Complete Phase 3: User Story 1 (기본 게임 플레이)
4. **STOP and VALIDATE**: 2인 게임 테스트
5. Deploy/demo if ready

### P1 Complete (게임 규칙 완전 구현)

1. Complete Setup + Foundational → 기반 완료
2. Complete US1-US9 (P1 스토리) → 전체 게임 규칙 작동
3. Validate all 27 golden keys, 29 deeds, bankruptcy logic
4. Run Constitution quality gates

### Incremental Delivery

1. MVP (US1) → 기본 턴 플레이
2. +US2-3 → 더블, 증서, 통행료
3. +US4-6 → 페이즈, 경매, 건설
4. +US7-8 → 특수 타일, 황금열쇠
5. +US9 → 대출, 파산 (테스트 필수)
6. +US10-11 (P2) → 테스트/시뮬레이션
7. +US12 (P3) → 저장/불러오기

---

## Notes

- [P] 태스크 = 다른 파일, 의존성 없음
- [Story] 라벨 = 해당 User Story 연결 (추적용)
- 각 User Story는 독립적으로 완료 및 테스트 가능해야 함
- Constitution IV: 파산 로직은 Unit Test 필수 (T075-T078)
- 태스크 또는 논리적 그룹 완료 후 커밋
- 체크포인트에서 스토리 독립 검증 가능
- 회피: 모호한 태스크, 같은 파일 충돌, 스토리 간 독립성 파괴
