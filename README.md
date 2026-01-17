# Blue Marble (부루마블) 게임 엔진

TypeScript + Redux Toolkit 기반의 부루마블 게임 엔진입니다.

## 📦 설치

```bash
npm install
```

## 🧪 테스트

```bash
npm test
```

## 🎮 빠른 시작

### 1. 게임 초기화

```typescript
import { createTestStore } from "./src/core/state/store.js";
import {
  initializeGame,
  addPlayer,
  startGame,
} from "./src/core/state/gameSlice.js";
import { BOARD_DATA } from "./src/core/data/boardData.js";

const store = createTestStore();

// 게임 초기화 (시드로 결정론적 주사위)
store.dispatch(initializeGame({ seed: "MY_SEED", tiles: [...BOARD_DATA] }));

// 플레이어 추가 (2-4명)
store.dispatch(addPlayer({ id: "p1", name: "플레이어 1" }));
store.dispatch(addPlayer({ id: "p2", name: "플레이어 2" }));

// 게임 시작
store.dispatch(startGame());
```

### 2. 주사위 굴리기 & 이동

```typescript
import { DiceRoller } from "./src/core/logic/diceRoller.js";
import { movePlayer } from "./src/core/state/gameSlice.js";

const diceRoller = new DiceRoller("MY_SEED");
const { sum, isDouble } = diceRoller.roll();

store.dispatch(movePlayer({ playerId: "p1", steps: sum }));
```

### 3. 땅 구매

```typescript
import { buyLand } from "./src/core/state/gameSlice.js";

store.dispatch(buyLand({ playerId: "p1", tileId: 1 }));
```

### 4. 건물 건설

```typescript
import { buildBuilding } from "./src/core/state/gameSlice.js";

// 별장 (최대 2개)
store.dispatch(
  buildBuilding({ playerId: "p1", tileId: 1, buildingType: "villa" })
);

// 빌딩 (최대 1개)
store.dispatch(
  buildBuilding({ playerId: "p1", tileId: 1, buildingType: "building" })
);

// 호텔 (최대 1개)
store.dispatch(
  buildBuilding({ playerId: "p1", tileId: 1, buildingType: "hotel" })
);
```

### 5. 통행료 지불

```typescript
import { payToll } from "./src/core/state/gameSlice.js";

store.dispatch(payToll({ payerId: "p2", tileId: 1 }));
```

### 6. 턴 종료

```typescript
import { endTurn } from "./src/core/state/gameSlice.js";

store.dispatch(endTurn());
```

---

## 🤖 AI 시뮬레이션

```typescript
import {
  runSimulation,
  runMultipleSimulations,
  aggregateResults,
} from "./src/core/simulation/simulationRunner.js";

// 단일 시뮬레이션
const result = runSimulation({
  maxTurns: 100,
  aiStrategy: "PURCHASE_ALL", // 또는 'RANDOM'
  seed: "SIM_1",
});

console.log(`승자: ${result.winnerId}`);
console.log(`총 턴: ${result.totalTurns}`);

// 다중 시뮬레이션
const results = runMultipleSimulations(10, {
  maxTurns: 100,
  aiStrategy: "RANDOM",
});
const stats = aggregateResults(results);

console.log(`AI1 승률: ${(stats.ai1Wins / stats.totalGames) * 100}%`);
```

---

## 🖥️ TUI 대시보드

```typescript
import { printDashboard, renderDashboard } from "./src/core/tui/dashboard.js";

// 전체 대시보드 출력 (콘솔 클리어 포함)
printDashboard(store.getState().game);

// 렌더링만 (문자열 반환)
const output = renderDashboard(store.getState().game);
console.log(output);
```

---

## 📋 주요 액션

| 액션                | 설명          |
| :------------------ | :------------ |
| `initializeGame`    | 게임 초기화   |
| `addPlayer`         | 플레이어 추가 |
| `startGame`         | 게임 시작     |
| `movePlayer`        | 플레이어 이동 |
| `buyLand`           | 땅 구매       |
| `buildBuilding`     | 건물 건설     |
| `payToll`           | 통행료 지불   |
| `declareBankruptcy` | 파산 선언     |
| `endTurn`           | 턴 종료       |
| `giveCard`          | 카드 지급     |
| `useCard`           | 카드 사용     |

---

## 🗺️ 보드 구성

| 타일 ID | 타일 유형       |
| :------ | :-------------- |
| 0       | 시작            |
| 1-9     | 도시 (아시아)   |
| 10      | 무인도          |
| 11-19   | 도시 (유럽)     |
| 20      | 우주여행        |
| 21-29   | 도시 (아메리카) |
| 30      | 사회복지기금    |
| 31-39   | 도시 (기타)     |

---

## 📁 프로젝트 구조

```
src/core/
├── ai/           # AI Agent (Random, Purchase-All)
├── data/         # 40칸 보드 데이터
├── logic/        # 주사위, 통행료 계산
├── model/        # Player, Tile, GameState 타입
├── simulation/   # 헤드리스 시뮬레이션
├── state/        # Redux gameSlice
└── tui/          # 대시보드, 입력 컨트롤러

tests/core/       # 144개 단위 테스트
```

---

## 📜 라이선스

MIT
