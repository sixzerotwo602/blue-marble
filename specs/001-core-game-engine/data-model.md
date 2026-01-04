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
  color: "red" | "blue" | "yellow" | "white";

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
  rentLevels: number[]; // [대지, 별장, 별장2, 빌딩, 호텔] 통행료

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
