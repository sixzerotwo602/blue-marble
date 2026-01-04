# Tasks: 001-core-game-engine

**Branch**: `001-core-game-engine` | **Status**: 0/0 Completed
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup (Environment & Infrastructure)

_Goal: Initialize NestJS project and basic infrastructure for WebSocket communication._

- [ ] T001 Initialize NestJS Project structure in `server/` with `npm i`
- [ ] T002 Install dependencies (`@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io`)
- [ ] T003 Setup `server/src/game` module and `GameGateway` skeleton
- [ ] T004 Create `server/src/common/filters/ws-exception.filter.ts` for standardized error handling
- [ ] T005 Setup `client/` Expo project with `socket.io-client` and `zustand`

## Phase 2: Foundational (Contracts & State Store)

_Goal: Implement data models and in-memory state management._

- [ ] T006 Create `server/src/game/models/types.ts` and copy content from `contracts/types.ts`
- [ ] T007 Create `server/src/game/models/enums.ts` from `contracts/enums.ts`
- [ ] T008 Implement `server/src/game/game.store.ts` (In-Memory `Map<string, GameRoom>`)
- [ ] T009 Implement `server/src/game/data/board.ts` with 40-tile data from `contracts/board-data.ts`
- [ ] T010 Implement `server/src/game/data/gold-keys.ts` with 27-card data from `contracts/golden-key-cards.ts`
- [ ] T011 [Client] Implement `client/src/stores/gameStore.ts` with Zustand mirroring server state

## Phase 3: Game Room & Start (User Story 1 & 2)

_Goal: Allow users to create/join rooms and start the game._

- [ ] T012 [US1] Implement `createRoom` event handler in `GameGateway` (Generate 6-digit code)
- [ ] T013 [US1] Implement `joinRoom` event handler (Validate code, Max 4 players)
- [ ] T014 [US1] Implement `startGame` handler (Host only, Init game state, Assign turn order)
- [ ] T015 [US1] [Client] Implement Room Creation/Join UI and Waiting Room screen
- [ ] T016 [US2] Implement `TurnManager` logic in `GameService` (Cycle turns, Timeout handling)
- [ ] T017 [US8] Implement `handleEndTurn` logic (Validate action complete, Pass turn)
- [ ] T018 [US2] [P] Implement `scanQr` handler (Validate `tileIndex` vs `diceResult` + `currentPosition`)

## Phase 4: Movement & Edge Cases (User Story 2 & 6)

_Goal: Dice rolling, core movement, and special tile logic (Island, Travel)._

- [ ] T019 [US2] Implement `rollDice` handler (Random 1-6 x2, Double check)
- [ ] T020 [US2] Implement Double Consecutive Check (3 doubles -> Turn End & Island penalty check - _Spec clarified: just turn end_)
- [ ] T021 [US2] Implement `movePlayer` logic (Handle pass-through Start tile -> Salary +200k)
- [ ] T022 [US6] **Island**: Implement `Enter` logic (Lock movement) and `IslandAction` (Dice/Pay/Card/Wait)
- [ ] T023 [US6] **Space Travel**: Implement `Enter` (Columbia) -> Next turn `UseTravel` logic (Move anywhere)
- [ ] T024 [US6] **Social Fund**: Implement `Donate` (Pay 150k) and `Receive` (Get pool money) logic
- [ ] T025 [Test] **QR Validation Integration Test**: Verify correct/incorrect scan scenarios (Constitution II)

## Phase 5: Economy & Property (User Story 3 & 4)

_Goal: Buying land, paying rent, and building construction._

- [ ] T026 [US3] Implement `buyProperty` handler (Check balance, Set owner, Handle `Vehicle` vs `City`)
- [ ] T027 [US3] Implement `build` handler (Check building rules, Max Hotel, Update rent)
- [ ] T028 [US4] Implement `payRent` logic (Auto-calculate based on building level & Owner)
- [ ] T029 [US4] Implement `Vehicle` special rent rules (Copying spec logic: 300k, etc.)
- [ ] T030 [US3] [Client] Implement Property Buy/Build Modal & Animations

## Phase 6: Interactions & Bankruptcy (User Story 5, 7)

_Goal: Golden Keys, Trading (limited), and Bankruptcy handling._

- [ ] T031 [US5] Implement `GoldenKey` draw logic (Random weighted or deck shuffle)
- [ ] T032 [US5] Implement Card Effects: `MOVE_TO`, `RECEIVE`, `PAY`, `BUILDING_FEE`
- [ ] T033 [US5] Implement Holdable Cards (`Escpe`, `FreePass`) usage logic
- [ ] T034 [US7] Implement `declareBankruptcy` handler (Asset transfer to creditor/Bank)
- [ ] T035 [US7] Implement `sellAsset` / `mortgage` handlers for liquidity
- [ ] T036 [US7] [Client] Implement Bankruptcy Screen & Victory Summary
- [ ] T037 [Test] **Bankruptcy Logic Unit Test**: Verify asset transfer and state reset (Constitution IV)

## Phase 7: Polish & Verification

_Goal: Final testing and cleanup._

- [ ] T038 Create E2E Test Scenarios for Full Game Loop (Start -> Buy -> Bankruptcy -> Win)
- [ ] T039 Verify 'Bankless' & 'Math-free' criteria (Logs checking auto-calc)
- [ ] T040 Update API Documentation (if any drift from contracts)
- [ ] T041 Conduct quick manual playtest via `client/`
- [ ] T042 [Test] **Connection Resilience Test**: Verify global pause & auto-forfeit logic (Constitution VI)
