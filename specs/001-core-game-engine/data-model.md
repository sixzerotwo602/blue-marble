# Data Model: 블루마블 디지털 보드게임

**Feature**: 블루마블 TypeScript CLI 게임  
**Date**: 2026-01-21  
**Status**: Complete

---

## 1. Core Entities

### 1.1 Player (플레이어)

플레이어의 게임 내 상태를 관리하는 핵심 엔티티.

```typescript
interface Player {
  id: string;                      // 고유 식별자
  name: string;                    // 플레이어 이름
  money: number;                   // 보유 현금 (원)
  position: number;                // 현재 위치 (0-39)
  deeds: Deed[];                   // 보유 씨앗증서 목록
  heldCards: GoldenKeyCard[];      // 보관형 황금열쇠 목록
  loan: Loan | null;               // 대출 정보 (없으면 null)
  lapsCompleted: number;           // 완료한 바퀴 수
  isStranded: boolean;             // 무인도 갇힘 여부
  strandedTurnsLeft: number;       // 무인도 남은 탈출 시도 횟수
  isBankrupt: boolean;             // 파산 여부
  isWaitingForWarp: boolean;       // 우주여행 워프 대기 상태
}
```

**Validation Rules**:
- `money >= 0` (파산 시 0이 될 수 있음)
- `position` ∈ [0, 39]
- `strandedTurnsLeft` ∈ [0, 3]
- `lapsCompleted >= 0`

**Initial State**:
- 3~4인: `money = 2,930,000`
- 2인: `money = 5,860,000`
- `position = 0`, `lapsCompleted = 0`, `isBankrupt = false`

---

### 1.2 Tile (타일)

보드의 각 칸을 나타내는 엔티티.

```typescript
type TileType = 
  | 'START'         // 출발지 (인덱스 0)
  | 'CITY'          // 도시 (건설 가능)
  | 'VEHICLE'       // 탈것/관광지 (건설 불가)
  | 'GOLDEN_KEY'    // 황금열쇠
  | 'ISLAND'        // 무인도 (인덱스 10)
  | 'SPACE_TRAVEL'  // 우주여행 (인덱스 30)
  | 'FUND_RECEIVE'  // 사회복지기금 접수 (인덱스 20)
  | 'FUND_DONATE';  // 사회복지기금 기부 (인덱스 38)

interface Tile {
  index: number;           // 보드 위치 (0-39)
  type: TileType;          // 타일 유형
  name: string;            // 타일 이름
  deedId: string | null;   // 연결된 씨앗증서 ID (해당 시)
}
```

**Special Tile Indices**:
| 인덱스 | 타일 | 설명 |
|--------|------|------|
| 0 | START | 출발지, 월급 지급 |
| 10 | ISLAND | 무인도, 갇힘 처리 |
| 20 | FUND_RECEIVE | 복지기금 수령 |
| 30 | SPACE_TRAVEL | 우주여행 워프 |
| 38 | FUND_DONATE | 복지기금 기부 |

---

### 1.3 Deed (씨앗증서)

구매 가능한 부동산을 나타내는 엔티티.

```typescript
interface Deed {
  id: string;                  // 고유 식별자
  name: string;                // 부동산 이름
  tileIndex: number;           // 보드 위치
  price: number;               // 구매가
  baseRent: number;            // 기본 통행료
  canBuild: boolean;           // 건설 가능 여부 (도시만 true)
  
  // 건설 비용
  buildingCosts: {
    villa: number;             // 별장 건설 비용
    building: number;          // 빌딩 건설 비용
    hotel: number;             // 호텔 건설 비용
  };
  
  // 통행료 테이블
  rentTable: {
    base: number;              // 기본 (건물 없음)
    villa1: number;            // 별장 1개
    villa2: number;            // 별장 2개
    building: number;          // 빌딩 (별장 포함)
    hotel: number;             // 호텔 (별장 포함)
    full: number;              // 별장2 + 빌딩 + 호텔
  };
  
  // 동적 상태
  ownerId: string | null;      // 소유자 ID (없으면 null = 은행 소유)
  buildings: BuildingState;    // 건설된 건물 상태
}

interface BuildingState {
  villaCount: number;          // 별장 수 (0-2)
  hasBuilding: boolean;        // 빌딩 여부
  hasHotel: boolean;           // 호텔 여부
}
```

**Validation Rules**:
- `villaCount` ∈ [0, 2]
- 탈것(VEHICLE)은 `canBuild = false`, `buildingCosts`와 `rentTable` 일부만 사용

**건설 불가 부동산** (canBuild = false지만 구매 가능):
- 인덱스 6: 제주도
- 인덱스 25: 부산
- 인덱스 39: 서울

---

### 1.4 Building (건물)

건물 유형 정의.

```typescript
type BuildingType = 'VILLA' | 'BUILDING' | 'HOTEL';

interface BuildingInfo {
  type: BuildingType;
  cost: number;
}
```

**슬롯 제한**:
- 별장: 최대 2개
- 빌딩: 최대 1개
- 호텔: 최대 1개
- **순서 제약 없음** (빈 땅에 바로 호텔 건설 가능)

---

### 1.5 GoldenKeyCard (황금열쇠 카드)

황금열쇠 카드 엔티티.

```typescript
type CardEffectType =
  | 'MOVE_TO'           // 지정 위치로 이동
  | 'MOVE_BACK'         // 뒤로 이동
  | 'RECEIVE_MONEY'     // 돈 받기
  | 'PAY_MONEY'         // 돈 지불
  | 'PAY_MAINTENANCE'   // 건물 유지비 지불
  | 'FORCE_SELL'        // 반액대매출
  | 'HOLD_ESCAPE'       // 무인도 탈출권 (보관)
  | 'HOLD_DISCOUNT';    // 우대권 (보관)

interface GoldenKeyCard {
  id: string;                  // 고유 식별자
  name: string;                // 카드 이름
  description: string;         // 카드 설명
  effectType: CardEffectType;  // 효과 유형
  effectValue: number | null;  // 효과 값 (이동 칸 수, 금액 등)
  targetIndex: number | null;  // 이동 목적지 (MOVE_TO인 경우)
  canHold: boolean;            // 보관 가능 여부
  count: number;               // 덱에 존재하는 장수 (보통 1, 일부 2)
}
```

**보관 가능 카드**:
- 무인도 탈출권 (`canHold = true`, `effectType = HOLD_ESCAPE`)
- 우대권 (`canHold = true`, `effectType = HOLD_DISCOUNT`)

**2장 존재 카드**:
- 반액대매출, 우대권, 뒤로2칸, 뒤로3칸

---

### 1.6 Loan (대출)

대출 정보 엔티티.

```typescript
interface Loan {
  amount: number;              // 대출 금액 (최대 1,000,000)
  startLap: number;            // 대출 시점의 lapsCompleted
  dueLap: number;              // 상환 기한 (startLap + 3)
}
```

**Validation Rules**:
- `amount` ∈ [1, 1,000,000]
- 게임 중 1회만 대출 가능
- `dueLap = startLap + 3`

---

### 1.7 WelfareFund (사회복지기금)

공용 복지기금 엔티티.

```typescript
interface WelfareFund {
  balance: number;             // 누적 기금 (원)
}
```

**State Transitions**:
- 기부처(인덱스 38) 도착: `balance += 150,000`
- 접수처(인덱스 20) 도착: 플레이어가 `balance` 전액 수령, `balance = 0`

---

## 2. Game State

### 2.1 GameState (게임 상태)

전체 게임 상태를 관리하는 루트 엔티티.

```typescript
type GamePhase = 'FIRST_HALF' | 'AUCTION' | 'SECOND_HALF';

interface GameState {
  id: string;                  // 게임 ID
  phase: GamePhase;            // 현재 페이즈
  players: Player[];           // 플레이어 목록
  currentPlayerIndex: number;  // 현재 플레이어 인덱스
  turnNumber: number;          // 현재 턴 번호
  
  board: Tile[];               // 40칸 보드
  deeds: Deed[];               // 29종 씨앗증서
  goldenKeyDeck: GoldenKeyCard[];  // 황금열쇠 덱 (셔플됨)
  
  welfareFund: WelfareFund;    // 복지기금
  
  // 경매 상태 (AUCTION 페이즈에서만 사용)
  auctionState: AuctionState | null;
  
  // 턴 내 상태
  turnState: TurnState;
}

interface TurnState {
  doublesCount: number;        // 연속 더블 횟수
  hasRolled: boolean;          // 이번 턴 주사위 굴림 여부
  lastDiceResult: DiceResult | null;
  pendingActions: PendingAction[];  // 처리 대기 중인 액션
}

interface DiceResult {
  die1: number;                // 주사위 1 (1-6)
  die2: number;                // 주사위 2 (1-6)
  total: number;               // 합계
  isDouble: boolean;           // 더블 여부
}
```

---

### 2.2 AuctionState (경매 상태)

경매 진행 상태.

```typescript
interface AuctionState {
  deedsToAuction: Deed[];      // 경매 대상 증서 목록 (액면가 순)
  currentDeedIndex: number;    // 현재 경매 중인 증서 인덱스
  currentBid: number;          // 현재 최고 입찰가
  highestBidderId: string | null;  // 최고 입찰자 ID
  activeBidderIds: string[];   // 아직 폴드하지 않은 입찰자 ID 목록
  currentBidderIndex: number;  // 현재 입찰 순서
  minRaise: number;            // 최소 호가 (10,000원)
}
```

**State Transitions**:
1. 경매 시작: 남은 증서 액면가 순 정렬
2. 입찰: `currentBid += minRaise` 이상
3. 폴드: `activeBidderIds`에서 제거
4. 낙찰: 마지막 1인 남으면 해당 가격으로 낙찰
5. 유찰: 전원 폴드 시 해당 증서는 소유자 없이 후반전으로

---

## 3. Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                        GameState                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐   │
│  │ Player[] │    │ Tile[]   │    │ GoldenKeyCard[]      │   │
│  │ (2-4)    │    │ (40)     │    │ (27 + duplicates)    │   │
│  └────┬─────┘    └────┬─────┘    └──────────────────────┘   │
│       │               │                                      │
│       │ owns          │ references                           │
│       ▼               ▼                                      │
│  ┌──────────┐    ┌──────────┐                               │
│  │ Deed[]   │◄───│ deedId   │                               │
│  │ (29)     │    └──────────┘                               │
│  └────┬─────┘                                                │
│       │                                                      │
│       │ has                                                  │
│       ▼                                                      │
│  ┌──────────────┐                                           │
│  │ BuildingState│                                           │
│  │ (per deed)   │                                           │
│  └──────────────┘                                           │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │ WelfareFund  │    │ AuctionState │                       │
│  └──────────────┘    └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. State Machines

### 4.1 Game Phase State Machine

```
        ┌──────────────┐
        │   INIT       │
        └──────┬───────┘
               │ 게임 시작
               ▼
        ┌──────────────┐
        │  FIRST_HALF  │◄────────────────┐
        └──────┬───────┘                 │
               │ 은행 보유 증서 ≤ 6장      │
               ▼                         │
        ┌──────────────┐                 │
        │   AUCTION    │                 │
        └──────┬───────┘                 │
               │ 모든 증서 경매 완료       │
               ▼                         │
        ┌──────────────┐                 │
        │ SECOND_HALF  │                 │
        └──────┬───────┘                 │
               │ 생존자 1명               │
               ▼                         │
        ┌──────────────┐                 │
        │  GAME_OVER   │                 │
        └──────────────┘                 │
```

### 4.2 Turn State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                          TURN FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [START_TURN] ──► [ROLL_DICE] ──► [MOVE] ──► [LAND_ACTION]     │
│       ▲                │              │            │            │
│       │                │              │            │            │
│       │         ┌──────┴──────┐      │            │            │
│       │         │ Triple      │      │            │            │
│       │         │ Double?     │      │            │            │
│       │         └──────┬──────┘      │            │            │
│       │                │ YES         │            │            │
│       │                ▼             │            │            │
│       │         [GO_TO_ISLAND] ──────┼────────────┼──► [END]   │
│       │                              │            │            │
│       │                              │            ▼            │
│       │                              │    [BUILD/SELL/LOAN]    │
│       │                              │            │            │
│       │                              │            │            │
│       └───── DOUBLE ─────────────────┴────────────┴──► [END]   │
│                                                                 │
│  [STRANDED] ──► [ROLL_ESCAPE] ──► [ESCAPE/WAIT] ──► [END]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Constants

```typescript
// 게임 상수
const GAME_CONSTANTS = {
  BOARD_SIZE: 40,
  TOTAL_DEEDS: 29,
  TOTAL_GOLDEN_KEYS: 27,  // 중복 포함 실제 장수는 더 많음
  
  // 플레이어 수별 초기 자금
  INITIAL_MONEY: {
    2: 5_860_000,
    3: 2_930_000,
    4: 2_930_000,
  },
  
  // 월급 및 고정 금액
  SALARY: 200_000,
  FUND_DONATE_AMOUNT: 150_000,
  TRAVEL_FEE: 200_000,
  
  // 대출
  MAX_LOAN_AMOUNT: 1_000_000,
  LOAN_DURATION_LAPS: 3,
  
  // 경매
  MIN_AUCTION_RAISE: 10_000,
  AUCTION_TRIGGER_THRESHOLD: 6,  // 남은 증서 6장 이하
  
  // 무인도
  MAX_STRANDED_TURNS: 3,
  
  // 특수 타일 인덱스
  TILE_INDEX: {
    START: 0,
    ISLAND: 10,
    FUND_RECEIVE: 20,
    SPACE_TRAVEL: 30,
    FUND_DONATE: 38,
  },
  
  // 황금열쇠 타일 인덱스
  GOLDEN_KEY_INDICES: [2, 5, 12, 16, 22, 32],
  
  // 탈것 타일 인덱스
  VEHICLE_INDICES: [15, 28, 33],
  
  // 건설 불가 부동산 인덱스
  NO_BUILD_INDICES: [6, 25, 39],
} as const;
```

---

## 6. Next Steps

1. **contracts/**: 시스템 인터페이스 정의
2. **quickstart.md**: 개발 환경 설정 가이드
