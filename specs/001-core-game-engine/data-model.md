# Data Model: 부루마블 핵심 게임 엔진

**Date**: 2026-01-09  
**Feature**: 001-core-game-engine  
**Status**: Complete

---

## 1. Core Entities

### 1.1 PlayerState

플레이어의 게임 내 상태를 나타냅니다.

```typescript
interface PlayerState {
  // 식별자
  id: string; // UUID
  name: string; // 표시 이름
  color: PlayerColor; // 말 색상 (RED, BLUE, YELLOW, WHITE)

  // 위치 및 상태
  position: number; // 보드 인덱스 (0-39)
  cash: number; // 보유 현금 (원)
  bankrupt: boolean; // 파산 여부

  // 특수 상태
  islandTurnsLeft: number; // 무인도 남은 턴 (0이면 정상)
  pendingSpaceChoice: boolean; // 우주여행 목적지 선택 대기

  // 보유 자산
  ownedPropertyIds: string[]; // 소유 증서 ID 목록

  // 보유 카드
  freePassCards: number; // 우대권 카드 수
  islandEscapeCards: number; // 무인도 탈출권 카드 수

  // 대출 정보
  loanTaken: boolean; // 대출 사용 여부 (1회 제한)
  loanOutstanding: number; // 미상환 대출금
  loanLapsRemaining: number; // 상환 기한 (출발 통과 횟수)

  // 연결 상태
  connectionStatus: ConnectionStatus; // CONNECTED, DISCONNECTED, AI_CONTROLLED
  disconnectedAt: number | null; // 연결 끊김 시각 (Unix timestamp)
  socketId: string | null; // Socket.io 연결 ID
}

enum PlayerColor {
  RED = "RED",
  BLUE = "BLUE",
  YELLOW = "YELLOW",
  WHITE = "WHITE",
}

enum ConnectionStatus {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  AI_CONTROLLED = "AI_CONTROLLED",
}
```

### 1.2 PropertySpec (정적 데이터)

증서의 정적 정보를 나타냅니다. JSON 파일에서 로드됩니다.

```typescript
interface PropertySpec {
  // 식별자
  id: string; // 고유 ID (예: "taipei", "seoul")
  name: string; // 표시 이름 (예: "타이베이", "서울")
  tileIndex: number; // 보드 인덱스 (0-39)

  // 유형
  type: PropertyType; // CITY, TRANSPORT, SPECIAL
  canBuild: boolean; // 건물 건설 가능 여부

  // 가격
  purchasePrice: number; // 매입가 (원)

  // 건설비 (건설 가능한 경우에만)
  buildCost?: {
    villa: number; // 별장 건설비
    building: number; // 빌딩 건설비
    hotel: number; // 호텔 건설비
  };

  // 통행료 (기본 통행료 + 건물별 통행료 합산)
  toll: {
    land: number; // 대지 통행료
    villa?: number; // 별장 1개당 통행료
    building?: number; // 빌딩 1개당 통행료
    hotel?: number; // 호텔 1개당 통행료
  };

  // 특수 속성
  isColumbia: boolean; // 컬럼비아호 (우주여행료 수취)
  isSeoul: boolean; // 서울 (옵션 게임 경매 대상)
}

enum PropertyType {
  CITY = "CITY", // 일반 도시 (건설 가능)
  TRANSPORT = "TRANSPORT", // 탈것 (건설 불가)
  SPECIAL = "SPECIAL", // 특수 (제주도, 부산, 서울 - 건설 불가)
}
```

### 1.3 PropertyState (동적 데이터)

증서의 동적 상태를 나타냅니다.

```typescript
interface PropertyState {
  propertyId: string; // PropertySpec.id 참조
  ownerId: string | null; // 소유자 PlayerState.id (null이면 미소유)
  buildings: {
    villa: number; // 0-2 (별장 수)
    building: number; // 0-1 (빌딩 수)
    hotel: number; // 0-1 (호텔 수)
  };
}
```

### 1.4 GoldenKeyCard (정적 데이터)

황금열쇠 카드 정의입니다. JSON 파일에서 로드됩니다.

```typescript
interface GoldenKeyCard {
  id: string; // 고유 ID
  name: string; // 카드 이름
  description: string; // 효과 설명

  // 정책
  keepPolicy: CardKeepPolicy; // 보관 정책
  phasePolicy: CardPhasePolicy; // 페이즈 정책

  // 효과 (다양한 타입)
  effect: CardEffect;
}

enum CardKeepPolicy {
  DISCARD_BOTTOM = "DISCARD_BOTTOM", // 즉시 실행 후 덱 맨 아래로
  KEEP_UNTIL_USE = "KEEP_UNTIL_USE", // 사용 전까지 보관
}

enum CardPhasePolicy {
  ANYTIME = "ANYTIME", // 전반전/후반전 모두 적용
  SECOND_HALF_ONLY = "SECOND_HALF_ONLY", // 후반전에만 효력
}

type CardEffect =
  | { type: "MOVE_TO"; targetTileIndex: number; collectSalary: boolean }
  | { type: "MOVE_STEPS"; steps: number } // 음수면 후퇴
  | { type: "PAY_BANK"; amount: number }
  | { type: "RECEIVE_BANK"; amount: number }
  | { type: "PAY_PER_BUILDING"; villa: number; building: number; hotel: number }
  | { type: "GRANT_FREE_PASS" }
  | { type: "GRANT_ISLAND_ESCAPE" }
  | { type: "FORCE_SELL_MOST_EXPENSIVE_HALF" }
  | { type: "SEND_TO_ISLAND" }
  | { type: "WORLD_TOUR" } // 한 바퀴
  | { type: "RECEIVE_FROM_EACH_PLAYER"; amount: number }
  | { type: "SPACE_TRAVEL_FREE" }; // 우주여행 무료
```

### 1.5 GameState

게임 전체 상태를 나타냅니다.

```typescript
interface GameState {
  // 식별자
  id: string; // 게임 세션 ID
  createdAt: number; // 생성 시각 (Unix timestamp)

  // 설정
  mode: GameMode; // 게임 모드
  timeLimitMinutes: number | null; // 시간 제한 (null이면 무제한)
  startedAt: number | null; // 게임 시작 시각

  // 페이즈
  phase: GamePhase; // 현재 페이즈

  // 플레이어
  players: PlayerState[]; // 플레이어 목록 (2-4명)
  currentTurnIndex: number; // 현재 턴 플레이어 인덱스
  turnOrder: string[]; // 턴 순서 (playerId 배열)

  // 증서 상태
  propertyStates: PropertyState[]; // 모든 증서의 현재 상태

  // 공용 자원
  welfarePot: number; // 사회복지기금 누적액

  // 황금열쇠 덱
  goldenKeyDeck: string[]; // 카드 ID 덱 (셔플된 순서)

  // 미판매 증서 (전반전)
  unsoldPropertyIds: string[]; // 아직 팔리지 않은 증서 ID

  // 턴 상태
  currentTurn: TurnState | null; // 현재 턴 진행 상태

  // 종료
  endedAt: number | null; // 게임 종료 시각
  winnerId: string | null; // 승자 ID
}

enum GameMode {
  ORDINARY = "ORDINARY", // 정식 게임
  OPTION = "OPTION", // 옵션 게임
}

enum GamePhase {
  SETUP = "SETUP", // 게임 설정 중
  DRAFT = "DRAFT", // 옵션 모드: 드래프트 구매 중
  FIRST_HALF = "FIRST_HALF", // 전반전
  AUCTION = "AUCTION", // 잔여 증서 경매
  SECOND_HALF = "SECOND_HALF", // 후반전
  ENDED = "ENDED", // 게임 종료
}

interface TurnState {
  playerId: string; // 현재 턴 플레이어
  diceRoll: DiceRoll | null; // 주사위 결과
  hasRolled: boolean; // 주사위 굴렸는지
  hasMoved: boolean; // 이동했는지
  pendingActions: PendingAction[]; // 처리해야 할 액션
  extraTurnGranted: boolean; // 더블로 추가 턴 부여
}

interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
  isDouble: boolean;
}

type PendingAction =
  | { type: "PURCHASE_DECISION"; propertyId: string }
  | { type: "PAY_TOLL"; amount: number; toPlayerId: string }
  | { type: "GOLDEN_KEY"; cardId: string }
  | { type: "SPACE_CHOICE" }
  | { type: "BUILD_DECISION" }
  | { type: "SETTLE_SHORTAGE"; amount: number; toPlayerId: string | null };
```

### 1.6 TileSpec (정적 데이터)

보드 칸 정의입니다. JSON 파일에서 로드됩니다.

```typescript
interface TileSpec {
  index: number; // 보드 인덱스 (0-39)
  type: TileType; // 칸 유형
  propertyId?: string; // 증서 ID (CITY/TRANSPORT/SPECIAL인 경우)
}

enum TileType {
  START = "START", // 출발
  CITY = "CITY", // 도시 (증서)
  TRANSPORT = "TRANSPORT", // 탈것 (증서)
  SPECIAL = "SPECIAL", // 특수 증서 (제주도, 부산, 서울)
  GOLDEN_KEY = "GOLDEN_KEY", // 황금열쇠
  ISLAND = "ISLAND", // 무인도
  SPACE_TRAVEL = "SPACE_TRAVEL", // 우주여행
  WELFARE_DONATION = "WELFARE_DONATION", // 사회복지기금 기부
  WELFARE_PAYOUT = "WELFARE_PAYOUT", // 사회복지기금 접수
}
```

---

## 2. State Transitions

### 2.1 GamePhase Transitions

```
SETUP ─────────────────────┬────────────────────────> FIRST_HALF (Ordinary 모드)
                           └───> DRAFT ───> AUCTION ───> SECOND_HALF (Option 모드)

FIRST_HALF ───> (미판매 증서 ≤ 5) ───> AUCTION ───> SECOND_HALF

SECOND_HALF ───> (생존자 1명 또는 시간 종료) ───> ENDED
```

### 2.2 PlayerState.connectionStatus Transitions

```
CONNECTED ───> (disconnect 이벤트) ───> DISCONNECTED
DISCONNECTED ───> (60초 타임아웃) ───> AI_CONTROLLED
DISCONNECTED ───> (reconnect 이벤트) ───> CONNECTED
AI_CONTROLLED ───> (reconnect 이벤트) ───> CONNECTED
```

### 2.3 PropertyState.buildings Transitions

```
(자금과 제한(별장2, 빌딩1, 호텔1) 내에서 자유롭게 건설/매각 가능)

건설 시:
buildings.villa < 2 ───> buildings.villa + 1
buildings.building < 1 ───> buildings.building + 1
buildings.hotel < 1 ───> buildings.hotel + 1

매각 시:
buildings.hotel > 0 ───> buildings.hotel - 1
buildings.building > 0 ───> buildings.building - 1
buildings.villa > 0 ───> buildings.villa - 1
```

### 2.4 Turn Flow

```
턴 시작
    │
    ├──> [무인도 감금 상태?] ──Yes──> 무인도 탈출 시도
    │                                    │
    │                              ├──> [더블?] ──Yes──> 탈출 + 추가 이동
    │                              └──> [탈출권 사용?] ──Yes──> 탈출 + 정상 이동
    │                                    └──No──> 턴 종료
    │
    ├──> [우주여행 대기?] ──Yes──> 목적지 선택 ──> 이동 ──> 착지 처리
    │
    └──> 주사위 굴리기
              │
              └──> 이동 (출발 통과 시 월급)
                      │
                      └──> 착지 처리
                            │
                            ├──> [도시] ──> 구매/통행료
                            ├──> [황금열쇠] ──> 카드 효과
                            ├──> [무인도] ──> 감금
                            ├──> [우주여행] ──> 탑승 + 대기
                            └──> [기타] ──> 해당 효과
                                    │
                                    └──> [더블?] ──Yes──> 추가 턴
                                         └──No──> [턴 종료 버튼] ──> 다음 플레이어
```

---

## 3. Validation Rules

### 3.1 PlayerState Invariants

```typescript
// 현금은 0 이상 (파산 전까지)
assert(player.cash >= 0 || player.bankrupt);

// 무인도 턴은 0-3
assert(player.islandTurnsLeft >= 0 && player.islandTurnsLeft <= 3);

// 파산 시 자산 없음
if (player.bankrupt) {
  assert(player.cash === 0);
  assert(player.ownedPropertyIds.length === 0);
  assert(player.freePassCards === 0);
  assert(player.islandEscapeCards === 0);
}

// 대출은 1회만
if (player.loanOutstanding > 0) {
  assert(player.loanTaken === true);
}
```

### 3.2 PropertyState Invariants

```typescript
// 건물은 소유자가 있어야 함
if (
  propState.buildings.villa > 0 ||
  propState.buildings.building > 0 ||
  propState.buildings.hotel > 0
) {
  assert(propState.ownerId !== null);
}

// 건물 건설 불가 증서는 건물 없음
const spec = getPropertySpec(propState.propertyId);
if (!spec.canBuild) {
  assert(propState.buildings.villa === 0);
  assert(propState.buildings.building === 0);
  assert(propState.buildings.hotel === 0);
}

// 건물 개수 제한 확인
assert(propState.buildings.villa >= 0 && propState.buildings.villa <= 2);
assert(propState.buildings.building >= 0 && propState.buildings.building <= 1);
assert(propState.buildings.hotel >= 0 && propState.buildings.hotel <= 1);
```

### 3.3 GameState Invariants

```typescript
// 플레이어 수 제한
assert(game.players.length >= 2 && game.players.length <= 4);

// 현재 턴 인덱스 유효
assert(
  game.currentTurnIndex >= 0 && game.currentTurnIndex < game.players.length
);

// 생존자 1명이면 게임 종료
const alive = game.players.filter((p) => !p.bankrupt);
if (alive.length === 1) {
  assert(game.phase === GamePhase.ENDED);
}
```

---

## 4. Entity Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                          GameState                               │
│ ┌─────────────┐  ┌─────────────────┐  ┌───────────────────────┐ │
│ │ PlayerState │  │ PropertyState   │  │ TurnState             │ │
│ │ (2-4개)     │  │ (29개)          │  │ (현재 턴)             │ │
│ └──────┬──────┘  └────────┬────────┘  └───────────────────────┘ │
│        │                  │                                      │
│        │ ownerId 참조     │ propertyId 참조                      │
│        ▼                  ▼                                      │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │                    PropertySpec (정적)                       │ │
│ │                    TileSpec (정적)                           │ │
│ │                    GoldenKeyCard (정적)                      │ │
│ └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Sample Data

### properties.json (발췌)

```json
[
  {
    "id": "taipei",
    "name": "타이베이",
    "tileIndex": 1,
    "type": "CITY",
    "canBuild": true,
    "purchasePrice": 50000,
    "buildCost": { "villa": 50000, "building": 150000, "hotel": 250000 },
    "toll": {
      "land": 2000,
      "villa": 10000,
      "building": 90000,
      "hotel": 250000
    },
    "isColumbia": false,
    "isSeoul": false
  },
  {
    "id": "seoul",
    "name": "서울",
    "tileIndex": 39,
    "type": "SPECIAL",
    "canBuild": false,
    "purchasePrice": 1000000,
    "toll": { "land": 2000000 },
    "isColumbia": false,
    "isSeoul": true
  }
]
```

### golden-keys.json (발췌)

```json
[
  {
    "id": "nobel-peace-prize",
    "name": "노벨평화상",
    "description": "상금 30만원을 받습니다",
    "keepPolicy": "DISCARD_BOTTOM",
    "phasePolicy": "ANYTIME",
    "effect": { "type": "RECEIVE_BANK", "amount": 300000 }
  },
  {
    "id": "free-pass",
    "name": "우대권",
    "description": "1회 통행료를 면제받습니다",
    "keepPolicy": "KEEP_UNTIL_USE",
    "phasePolicy": "ANYTIME",
    "effect": { "type": "GRANT_FREE_PASS" }
  }
]
```
