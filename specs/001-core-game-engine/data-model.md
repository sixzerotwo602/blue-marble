# Data Model: 블루마블 코어 게임 엔진

**Feature**: 001-core-game-engine  
**Date**: 2026-01-21  
**Status**: Complete

## 개요

블루마블 게임 엔진의 핵심 데이터 모델 정의. `rulemd/` 디렉토리의 기존 데이터 타입을 확장하여 런타임 게임 상태를 관리한다.

---

## 1. 핵심 열거형 (Enums)

### GamePhase
```typescript
enum GamePhase {
  FIRST_HALF = 'FIRST_HALF',   // 전반전 - 씨앗증서 구매만 가능
  AUCTION = 'AUCTION',          // 경매 페이즈
  SECOND_HALF = 'SECOND_HALF', // 후반전 - 건설 가능
  GAME_OVER = 'GAME_OVER'      // 게임 종료
}
```

### PlayerStatus
```typescript
enum PlayerStatus {
  ACTIVE = 'ACTIVE',           // 활성 플레이어
  BANKRUPT = 'BANKRUPT',       // 파산
  DISCONNECTED = 'DISCONNECTED' // 연결 끊김 (향후 확장용)
}
```

### IslandStatus
```typescript
enum IslandStatus {
  FREE = 'FREE',               // 자유 상태
  TRAPPED = 'TRAPPED'          // 무인도에 갇힌 상태
}
```

---

## 2. 플레이어 모델 (Player)

```typescript
interface Player {
  id: string;                  // 고유 식별자
  name: string;                // 플레이어 이름
  cash: number;                // 보유 현금 (원)
  position: number;            // 현재 위치 (0-39)
  status: PlayerStatus;        // 플레이어 상태
  
  // 자산
  ownedDeeds: string[];        // 보유 씨앗증서 ID 목록
  heldCards: string[];         // 보관 중인 황금열쇠 카드 ID 목록
  
  // 무인도 상태
  islandStatus: IslandStatus;  // 무인도 갇힘 여부
  islandTurnsRemaining: number; // 남은 탈출 시도 턴 수 (0-3)
  
  // 대출 상태
  loan: Loan | null;           // 활성 대출 정보
  
  // 통계
  lapCount: number;            // 완료한 바퀴 수
  consecutiveDoubles: number;  // 연속 더블 횟수 (현재 턴)
}
```

### 초기값
| 필드 | 2인 게임 | 3~4인 게임 |
|------|----------|------------|
| cash | 5,860,000원 | 2,930,000원 |
| position | 0 | 0 |
| status | ACTIVE | ACTIVE |
| islandStatus | FREE | FREE |

---

## 3. 대출 모델 (Loan)

```typescript
interface Loan {
  amount: number;              // 대출 금액 (최대 1,000,000원)
  startTurn: number;           // 대출 시작 턴
  dueTurn: number;             // 상환 기한 턴 (startTurn + 3회전)
  interestRate: number;        // 이자율 (기본 10%)
}
```

### 상환 금액 계산
```typescript
function calculateRepayment(loan: Loan): number {
  return loan.amount * (1 + loan.interestRate);
}
```

---

## 4. 씨앗증서 런타임 모델 (DeedRuntime)

> 기존 `rulemd/board-data.ts`의 `BoardTileData`를 확장

```typescript
interface DeedRuntime {
  tileId: string;              // 연결된 타일 ID (board-data.ts 참조)
  ownerId: string | null;      // 소유자 플레이어 ID (null = 은행/무소유)
  
  // 건물 상태
  buildings: BuildingSlots;
  
  // 담보 상태 (향후 확장용)
  isMortgaged: boolean;
}

interface BuildingSlots {
  villas: 0 | 1 | 2;           // 별장 개수 (최대 2)
  building: boolean;           // 빌딩 유무 (최대 1)
  hotel: boolean;              // 호텔 유무 (최대 1)
}
```

### 건물 기본값
```typescript
const EMPTY_BUILDING_SLOTS: BuildingSlots = {
  villas: 0,
  building: false,
  hotel: false
};
```

---

## 5. 황금열쇠 덱 모델 (GoldenKeyDeck)

> 기존 `rulemd/golden-key-cards.ts`의 `GoldenKeyCardData` 활용

```typescript
interface GoldenKeyDeck {
  drawPile: string[];          // 뽑기 덱 (카드 ID 목록)
  discardPile: string[];       // 버린 덱 (카드 ID 목록)
}
```

### 덱 초기화 로직
- `GOLDEN_KEY_CARDS`에서 `quantity` 속성에 따라 카드 복제
- Fisher-Yates 셔플 알고리즘 적용

---

## 6. 사회복지기금 모델 (WelfareFund)

```typescript
interface WelfareFund {
  balance: number;             // 누적 기금 (원)
}
```

### 상수
| 이벤트 | 금액 | 비고 |
|--------|------|------|
| 기부 (tile-38 도착) | +150,000원 | `FUND_DONATE_AMOUNT` |
| 수령 (tile-20 도착) | 전액 | balance → 0 |

---

## 7. 경매 상태 모델 (AuctionState)

```typescript
interface AuctionState {
  isActive: boolean;           // 경매 진행 중 여부
  currentDeedId: string | null; // 현재 경매 중인 증서 ID
  currentBid: number;          // 현재 입찰가
  highestBidderId: string | null; // 최고 입찰자 ID
  activeBidders: string[];     // 아직 폴드하지 않은 플레이어 ID 목록
  remainingDeeds: string[];    // 남은 경매 대상 증서 ID 목록
}
```

### 경매 진행 규칙
- **시작가**: 해당 증서의 `price` (액면가)
- **최소 호가**: 10,000원
- **전원 폴드 시**: 유찰 (소유주 없음 상태 유지)

---

## 8. 게임 상태 모델 (GameState)

```typescript
interface GameState {
  // 메타데이터
  gameId: string;              // 게임 고유 식별자
  createdAt: Date;             // 게임 생성 시간
  
  // 페이즈 및 턴
  phase: GamePhase;            // 현재 페이즈
  currentPlayerIndex: number;  // 현재 플레이어 인덱스
  turnNumber: number;          // 현재 턴 번호
  lapNumber: number;           // 현재 회전 번호 (대출 상환용)
  
  // 플레이어
  players: Player[];           // 플레이어 목록 (순서대로)
  
  // 보드 상태
  deeds: Map<string, DeedRuntime>; // 증서 런타임 상태 (tileId → DeedRuntime)
  goldenKeyDeck: GoldenKeyDeck;    // 황금열쇠 덱
  welfareFund: WelfareFund;        // 사회복지기금
  
  // 경매 상태 (경매 페이즈에서만 활성)
  auctionState: AuctionState | null;
  
  // 통계
  bankDeedCount: number;       // 은행 보유 증서 수 (페이즈 전환용)
}
```

---

## 9. 주사위 결과 모델 (DiceResult)

```typescript
interface DiceResult {
  die1: number;                // 첫 번째 주사위 (1-6)
  die2: number;                // 두 번째 주사위 (1-6)
  total: number;               // 합계
  isDouble: boolean;           // 더블 여부
}
```

---

## 10. 게임 이벤트 모델 (GameEvent)

> 로깅 및 히스토리 추적용

```typescript
type GameEvent = 
  | { type: 'DICE_ROLLED'; playerId: string; result: DiceResult }
  | { type: 'PLAYER_MOVED'; playerId: string; from: number; to: number }
  | { type: 'DEED_PURCHASED'; playerId: string; deedId: string; price: number }
  | { type: 'RENT_PAID'; payerId: string; ownerId: string; amount: number }
  | { type: 'BUILDING_BUILT'; playerId: string; deedId: string; buildingType: string }
  | { type: 'GOLDEN_KEY_DRAWN'; playerId: string; cardId: string }
  | { type: 'AUCTION_BID'; playerId: string; deedId: string; amount: number }
  | { type: 'PLAYER_BANKRUPT'; playerId: string; creditorId: string | null }
  | { type: 'PHASE_CHANGED'; from: GamePhase; to: GamePhase }
  | { type: 'TURN_ENDED'; playerId: string; turnNumber: number };
```

---

## 엔티티 관계 다이어그램

```
┌─────────────┐         ┌─────────────────┐
│  GameState  │────────▶│     Player      │
│             │  1:N    │                 │
└──────┬──────┘         └────────┬────────┘
       │                         │
       │ 1:N                     │ 1:1
       ▼                         ▼
┌─────────────┐         ┌─────────────────┐
│ DeedRuntime │         │      Loan       │
│             │         │                 │
└──────┬──────┘         └─────────────────┘
       │
       │ ref
       ▼
┌─────────────────────┐
│ BoardTileData       │
│ (rulemd/board-data) │
└─────────────────────┘

┌─────────────────────┐
│ GoldenKeyDeck       │─────ref────▶ GoldenKeyCardData
│                     │              (rulemd/golden-key-cards)
└─────────────────────┘
```

---

## 유효성 검증 규칙

### Player
- `cash >= 0` (음수 시 파산 처리)
- `position: 0-39`
- `islandTurnsRemaining: 0-3`
- `consecutiveDoubles: 0-3`

### DeedRuntime
- `villas: 0-2`
- `building`: `canBuild === true`인 타일에서만 허용
- `hotel`: `canBuild === true`인 타일에서만 허용

### Loan
- `amount: 100,000 ~ 1,000,000` (10만원 단위)
- `dueTurn = startTurn + (플레이어 수 * 3)` (3회전)

### GameState
- `currentPlayerIndex < players.length`
- `bankDeedCount <= TOTAL_DEEDS (29)`
