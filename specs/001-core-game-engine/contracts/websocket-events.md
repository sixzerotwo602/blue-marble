# WebSocket Events Contract

**Date**: 2026-01-09  
**Feature**: 001-core-game-engine

이 문서는 클라이언트-서버 간 WebSocket 이벤트 계약을 정의합니다.

---

## 1. Connection Events

### 1.1 Client → Server

#### `join_game`

게임 룸에 참가합니다.

```typescript
interface JoinGameRequest {
  gameId: string;
  playerName: string;
  playerColor: "RED" | "BLUE" | "YELLOW" | "WHITE";
  reconnectToken?: string; // 재접속 시
}
```

#### `leave_game`

게임 룸을 떠납니다.

```typescript
interface LeaveGameRequest {
  gameId: string;
}
```

### 1.2 Server → Client

#### `player_joined`

새 플레이어가 참가했습니다.

```typescript
interface PlayerJoinedEvent {
  player: PlayerState;
  gameState: GameState;
}
```

#### `player_left`

플레이어가 떠났습니다.

```typescript
interface PlayerLeftEvent {
  playerId: string;
  reason: "LEFT" | "DISCONNECTED" | "KICKED";
}
```

#### `player_reconnected`

플레이어가 재접속했습니다.

```typescript
interface PlayerReconnectedEvent {
  playerId: string;
}
```

#### `player_ai_takeover`

플레이어가 AI로 대체되었습니다.

```typescript
interface PlayerAITakeoverEvent {
  playerId: string;
}
```

---

## 2. Game Setup Events

### 2.1 Client → Server

#### `start_game`

게임을 시작합니다 (호스트만 가능).

```typescript
interface StartGameRequest {
  gameId: string;
  settings: {
    mode: "ORDINARY" | "OPTION";
    timeLimitMinutes: number | null; // null = 무제한
  };
}
```

### 2.2 Server → Client

#### `game_started`

게임이 시작되었습니다.

```typescript
interface GameStartedEvent {
  gameState: GameState;
  turnOrder: string[]; // playerId 순서
}
```

#### `phase_changed`

게임 페이즈가 변경되었습니다.

```typescript
interface PhaseChangedEvent {
  from: GamePhase;
  to: GamePhase;
}
```

---

## 3. Turn Events

### 3.1 Client → Server

#### `roll_dice`

주사위를 굴립니다.

```typescript
interface RollDiceRequest {
  gameId: string;
  // 서버 RNG 사용 시 추가 데이터 없음
  // 사용자 입력 모드 시:
  userInput?: { die1: number; die2: number };
}
```

#### `end_turn`

턴을 종료합니다.

```typescript
interface EndTurnRequest {
  gameId: string;
}
```

### 3.2 Server → Client

#### `turn_started`

새 턴이 시작되었습니다.

```typescript
interface TurnStartedEvent {
  playerId: string;
  isExtraTurn: boolean; // 더블로 인한 추가 턴
}
```

#### `dice_rolled`

주사위가 굴려졌습니다.

```typescript
interface DiceRolledEvent {
  playerId: string;
  die1: number;
  die2: number;
  total: number;
  isDouble: boolean;
}
```

#### `player_moved`

플레이어가 이동했습니다.

```typescript
interface PlayerMovedEvent {
  playerId: string;
  fromPosition: number;
  toPosition: number;
  passedStart: boolean;
  salaryReceived: number; // 0이면 출발 통과 안함
}
```

#### `turn_ended`

턴이 종료되었습니다.

```typescript
interface TurnEndedEvent {
  playerId: string;
  nextPlayerId: string;
}
```

---

## 4. Property Events

### 4.1 Client → Server

#### `purchase_property`

증서를 구매합니다.

```typescript
interface PurchasePropertyRequest {
  gameId: string;
  propertyId: string;
}
```

#### `decline_purchase`

구매를 거절합니다.

```typescript
interface DeclinePurchaseRequest {
  gameId: string;
  propertyId: string;
}
```

#### `build`

건물을 건설합니다.

```typescript
interface BuildRequest {
  gameId: string;
  propertyId: string;
  level: "VILLA" | "BUILDING" | "HOTEL";
}
```

#### `sell_building`

건물을 매각합니다.

```typescript
interface SellBuildingRequest {
  gameId: string;
  propertyId: string;
}
```

### 4.2 Server → Client

#### `property_purchased`

증서가 구매되었습니다.

```typescript
interface PropertyPurchasedEvent {
  playerId: string;
  propertyId: string;
  price: number;
}
```

#### `building_built`

건물이 건설되었습니다.

```typescript
interface BuildingBuiltEvent {
  playerId: string;
  propertyId: string;
  newLevel: BuildingLevel;
  cost: number;
}
```

#### `building_sold`

건물이 매각되었습니다.

```typescript
interface BuildingSoldEvent {
  playerId: string;
  propertyId: string;
  newLevel: BuildingLevel;
  refund: number;
}
```

#### `purchase_available`

구매 가능한 증서가 있습니다.

```typescript
interface PurchaseAvailableEvent {
  playerId: string;
  propertyId: string;
  price: number;
  canAfford: boolean;
}
```

---

## 5. Payment Events

### 5.1 Client → Server

#### `pay_toll`

통행료를 지불합니다.

```typescript
interface PayTollRequest {
  gameId: string;
  useFreePass: boolean; // 우대권 사용 여부
}
```

#### `settle_shortage`

자금 부족 정산을 수행합니다.

```typescript
interface SettleShortageRequest {
  gameId: string;
  actions: SettlementAction[];
}

type SettlementAction =
  | { type: "SELL_BUILDING"; propertyId: string }
  | { type: "TRANSFER_PROPERTY"; propertyId: string }
  | { type: "TAKE_LOAN"; amount: number };
```

### 5.2 Server → Client

#### `toll_required`

통행료 지불이 필요합니다.

```typescript
interface TollRequiredEvent {
  playerId: string;
  toPlayerId: string;
  propertyId: string;
  amount: number;
  canUseFreePass: boolean;
}
```

#### `toll_paid`

통행료가 지불되었습니다.

```typescript
interface TollPaidEvent {
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  usedFreePass: boolean;
}
```

#### `shortage_settlement_required`

자금 부족 정산이 필요합니다.

```typescript
interface ShortageSettlementRequiredEvent {
  playerId: string;
  shortageAmount: number;
  availableActions: {
    sellableBuildings: Array<{ propertyId: string; refund: number }>;
    transferableProperties: Array<{ propertyId: string; value: number }>;
    canTakeLoan: boolean;
    maxLoanAmount: number;
  };
}
```

#### `cash_changed`

현금이 변동되었습니다.

```typescript
interface CashChangedEvent {
  playerId: string;
  previousCash: number;
  newCash: number;
  reason: string;
}
```

---

## 6. Special Tile Events

### 6.1 Golden Key

#### `golden_key_drawn` (Server → Client)

황금열쇠 카드를 뽑았습니다.

```typescript
interface GoldenKeyDrawnEvent {
  playerId: string;
  card: GoldenKeyCard;
  effectApplied: boolean; // false면 전반전에 효력 없음
}
```

### 6.2 Island

#### `player_trapped` (Server → Client)

플레이어가 무인도에 갇혔습니다.

```typescript
interface PlayerTrappedEvent {
  playerId: string;
  turnsRemaining: number;
}
```

#### `escape_attempt` (Client → Server)

무인도 탈출을 시도합니다.

```typescript
interface EscapeAttemptRequest {
  gameId: string;
  useEscapeCard: boolean;
}
```

#### `escape_result` (Server → Client)

탈출 시도 결과입니다.

```typescript
interface EscapeResultEvent {
  playerId: string;
  success: boolean;
  method: "DOUBLE" | "ESCAPE_CARD" | "TURNS_EXPIRED";
  diceRoll?: DiceRoll;
}
```

### 6.3 Space Travel

#### `space_travel_started` (Server → Client)

우주여행이 시작되었습니다.

```typescript
interface SpaceTravelStartedEvent {
  playerId: string;
  travelFee: number;
  paidTo: string | null; // null이면 무료
}
```

#### `choose_destination` (Client → Server)

목적지를 선택합니다.

```typescript
interface ChooseDestinationRequest {
  gameId: string;
  destinationTileIndex: number;
}
```

### 6.4 Welfare Fund

#### `welfare_donation` (Server → Client)

사회복지기금에 기부했습니다.

```typescript
interface WelfareDonationEvent {
  playerId: string;
  amount: number;
  newPotTotal: number;
}
```

#### `welfare_payout` (Server → Client)

사회복지기금을 수령했습니다.

```typescript
interface WelfarePayoutEvent {
  playerId: string;
  amount: number;
}
```

---

## 7. Game End Events

### 7.1 Server → Client

#### `player_bankrupt`

플레이어가 파산했습니다.

```typescript
interface PlayerBankruptEvent {
  playerId: string;
  creditorId: string | null; // null이면 은행
  assetsTransferred: {
    cash: number;
    properties: string[];
  };
}
```

#### `game_ended`

게임이 종료되었습니다.

```typescript
interface GameEndedEvent {
  winnerId: string;
  reason: "LAST_SURVIVOR" | "TIME_LIMIT";
  finalStandings: Array<{
    playerId: string;
    rank: number;
    totalAssets: number;
    cash: number;
    propertyValue: number;
  }>;
}
```

---

## 8. Auction Events (Phase Transition)

### 8.1 Server → Client

#### `auction_started`

경매가 시작되었습니다.

```typescript
interface AuctionStartedEvent {
  propertyId: string;
  startingPrice: number;
  interestedPlayers: string[];
}
```

#### `auction_bid` (Client → Server)

경매에 입찰합니다.

```typescript
interface AuctionBidRequest {
  gameId: string;
  propertyId: string;
  interested: boolean;
}
```

#### `auction_result` (Server → Client)

경매 결과입니다.

```typescript
interface AuctionResultEvent {
  propertyId: string;
  winnerId: string | null; // null이면 낙찰자 없음
  diceResults?: Array<{ playerId: string; roll: number }>;
}
```

---

## 9. State Sync

### 9.1 Client → Server

#### `request_state`

현재 게임 상태를 요청합니다.

```typescript
interface RequestStateRequest {
  gameId: string;
}
```

### 9.2 Server → Client

#### `state_sync`

전체 게임 상태를 동기화합니다.

```typescript
interface StateSyncEvent {
  gameState: GameState;
  timestamp: number;
}
```

---

## Error Events

### `error` (Server → Client)

```typescript
interface ErrorEvent {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}
```

### Error Codes

| Code                 | Description               |
| -------------------- | ------------------------- |
| `NOT_YOUR_TURN`      | 본인 턴이 아닙니다        |
| `ALREADY_ROLLED`     | 이미 주사위를 굴렸습니다  |
| `INSUFFICIENT_FUNDS` | 자금이 부족합니다         |
| `PROPERTY_NOT_OWNED` | 소유하지 않은 증서입니다  |
| `CANNOT_BUILD`       | 건물을 건설할 수 없습니다 |
| `GAME_NOT_FOUND`     | 게임을 찾을 수 없습니다   |
| `INVALID_ACTION`     | 유효하지 않은 액션입니다  |
