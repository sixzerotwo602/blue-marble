# Data Model: 001-core-game-engine

**Branch**: `001-core-game-engine` | **Spec**: [spec.md](./spec.md)

## 1. Entity Definitions

### GameRoom

게임 세션의 루트 엔티티입니다.

```typescript
interface GameRoom {
  id: string; // UUID
  roomCode: string; // 6자리 랜덤 코드 (입장용)
  status: "waiting" | "playing" | "paused" | "finished";
  hostPlayerId: string; // 방장 ID
  players: Player[]; // 플레이어 목록

  // 게임 진행 상태
  currentTurnIndex: number; // players 배열 인덱스
  turnOrder: string[]; // playerIds ordered by turn
  turnPhase:
    | "idle"
    | "diceInput"
    | "moving"
    | "landed"
    | "actionPhase"
    | "turnEnd";
  diceResult: [number, number] | null; // 최근 주사위 결과

  createdAt: number; // Timestamp
}
```

### Player

게임에 참여하는 사용자 정보입니다.

```typescript
interface Player {
  id: string; // Socket ID or UUID
  name: string; // 닉네임
  color: "red" | "blue" | "yellow" | "green";

  // 자산 및 위치
  money: number; // 보유 현금
  position: number; // 현재 위치 (0-39)
  ownedTileIds: number[]; // 소유한 땅 인덱스 목록

  // 상태 플래그
  isConnected: boolean; // 접속 상태
  isBankrupt: boolean; // 파산 여부

  // 특수 상태 (Edge Cases)
  islandTurnsLeft: number; // 무인도 남은 턴 (3, 2, 1, 0=탈출)
  doubleCount: number; // 현재 턴의 더블 연속 횟수
  isSpaceTravelPending: boolean; // 우주여행 탑승 대기 상태 (다음 턴 이동)

  // 보유 아이템
  hasIslandEscapeCard: boolean; // 무인도 탈출권 보유 여부
  hasTollExemptCard: boolean; // 우대권 보유 여부
}
```

### BoardTile

보드판의 각 칸 정보입니다. (32칸 -> 40칸 확장 반영)

```typescript
interface BoardTile {
  index: number; // 0-39
  name: string; // "서울", "황금열쇠" 등
  type:
    | "start"
    | "property"
    | "vehicle"
    | "goldenKey"
    | "island"
    | "travel"
    | "fundDonate"
    | "fundReceive"
    | "tax";

  // 부동산 속성 (type === 'property' | 'vehicle')
  colorGroup?: string; // 독점 판정용 그룹
  price: number; // 구매가
  rentLevels: number[]; // [대지, 빌라, 빌라2, 건물, 호텔] 통행료

  // 소유 상태
  ownerId: string | null; // 소유자 (null이면 은행/빈땅)
  buildingLevel: 0 | 1 | 2 | 3 | 4; // 0=대지, 1~4=건물
  isMortgaged: boolean; // 담보 설정 여부
  mortgageValue: number; // 담보 가치 (구매가의 50%)
}
```

### Transaction

거래 기록 (로그 및 클라이언트 애니메이션용)

```typescript
interface Transaction {
  id: string;
  timestamp: number;
  fromPlayerId: string | "BANK"; // 은행일 경우 'BANK'
  toPlayerId: string | "BANK" | "FUND"; // 사회복지기금일 경우 'FUND'
  amount: number;
  reason:
    | "rent"
    | "purchase"
    | "build"
    | "salary"
    | "goldenKey"
    | "mortgage"
    | "bankruptcy"
    | "travelFee"
    | "donate"
    | "tax";
}
```

## 2. Key Relationships

- `GameRoom` contains `Player[]` (Max 4)
- `Player` "owns" `BoardTile` (via `ownedTileIds` & `BoardTile.ownerId`)
- `Player` has transient `Transaction[]` (history)

## 3. Persistent Models (PostgreSQL)

게임 플레이 데이터 축적을 위한 영구 저장 모델입니다.
자세한 스키마는 [db-schema.ts](./contracts/db-schema.ts)를 참조하세요.

### 테이블 구조

```
┌─────────────────┐      ┌──────────────────┐
│   game_sessions │──┬─▶│  game_players    │
│   (게임 세션)    │  │   │  (참여 플레이어)  │
└─────────────────┘  │   └──────────────────┘
                     │
                     ├─▶┌──────────────────┐
                     │   │  game_events     │
                     │   │  (이벤트 로그)    │
                     │   └──────────────────┘
                     │
                     └─▶┌──────────────────┐
                         │  turn_snapshots  │
                         │  (턴 스냅샷)     │
                         └──────────────────┘
```

### GameSession

```typescript
interface GameSession {
  id: string; // UUID
  roomCode: string; // 방 코드
  startedAt: Date; // 게임 시작 시간
  endedAt: Date | null; // 게임 종료 시간
  winnerId: string | null; // 승자 ID
  totalTurns: number; // 총 턴 수
  endReason: "bankruptcy" | "timeout" | "manual" | null;
}
```

### GamePlayer (식별자 구조)

```typescript
interface GamePlayer {
  id: string;
  sessionId: string; // FK → game_sessions

  // 식별자 계층 (익명 + 향후 계정 연동 대비)
  visitorId: string; // 기기 기반 익명 ID (앱 설치 시 생성)
  accountId: string | null; // 계정 ID (향후 로그인 시 연결)

  playerName: string;
  color: PlayerColor;
  finalRank: number | null;
  finalAssetValue: number | null;
}
```

### GameEvent (이벤트 로그)

```typescript
interface GameEvent {
  id: string;
  sessionId: string; // FK → game_sessions
  playerId: string;
  turnNumber: number;
  eventType: GameEventType; // 23종 이벤트 타입
  eventData: Record<string, unknown>; // JSONB (맥락 정보 포함)
  decisionDurationMs: number | null; // 의사결정 소요 시간
  createdAt: Date;
}
```

### TurnSnapshot (턴 상태 스냅샷)

```typescript
interface TurnSnapshot {
  id: string;
  sessionId: string;
  turnNumber: number;
  playerId: string;

  // 상태 정보
  position: number; // 현재 위치 (0-39)
  money: number; // 현금
  ownedTiles: number[]; // 소유 부동산
  buildingLevels: Record<number, number>; // 타일별 건물 레벨
  isBankrupt: boolean;
  isOnIsland: boolean;
  heldCards: string[];
  totalAssetValue: number; // 총 자산 가치
}
```
