# Quickstart: 블루마블 디지털 보드게임

**Feature**: 블루마블 TypeScript CLI 게임  
**Date**: 2026-01-21  
**Status**: Ready for Development

---

## 1. 개발 환경 설정

### 1.1 필수 요구사항

- **Node.js**: 20.x 이상
- **npm**: 10.x 이상 (Node.js와 함께 설치됨)
- **TypeScript**: 5.x (프로젝트 의존성으로 설치)

### 1.2 프로젝트 초기화

```bash
# 프로젝트 디렉토리로 이동
cd d:\github_coop\blue-marble

# 의존성 설치 (package.json이 없는 경우 먼저 생성)
npm init -y

# TypeScript 및 핵심 의존성 설치
npm install typescript ts-node @types/node --save-dev

# CLI 라이브러리 설치
npm install inquirer commander
npm install @types/inquirer --save-dev

# 테스트 프레임워크 설치
npm install vitest --save-dev

# TypeScript 설정 초기화
npx tsc --init
```

### 1.3 tsconfig.json 권장 설정

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 1.4 package.json 스크립트

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts"
  }
}
```

---

## 2. 프로젝트 구조 생성

```bash
# 디렉토리 구조 생성
mkdir -p src/core/models
mkdir -p src/core/systems
mkdir -p src/core/data
mkdir -p src/core/events
mkdir -p src/core/types
mkdir -p src/cli/modes
mkdir -p src/cli/commands
mkdir -p src/ai/strategies
mkdir -p src/ai/simulator
mkdir -p tests/unit/models
mkdir -p tests/unit/systems
mkdir -p tests/integration
mkdir -p tests/fixtures/gameStates
```

---

## 3. 기존 데이터 파일 이전

```bash
# 보드 데이터 복사
cp rulemd/board-data.ts src/core/data/boardData.ts

# 황금열쇠 카드 데이터 복사
cp rulemd/golden-key-cards.ts src/core/data/goldenKeyData.ts
```

**주의**: 복사 후 import 경로 및 export 구문을 프로젝트 구조에 맞게 수정해야 합니다.

---

## 4. 개발 순서 (권장)

### Phase 1: 기본 엔진 (Core)

| 순서 | 파일 | 설명 |
|------|------|------|
| 1 | `src/core/types/index.ts` | 공통 타입 정의 |
| 2 | `src/core/models/Player.ts` | 플레이어 모델 |
| 3 | `src/core/models/Tile.ts` | 타일 모델 |
| 4 | `src/core/models/Deed.ts` | 씨앗증서 모델 |
| 5 | `src/core/models/Building.ts` | 건물 모델 |
| 6 | `src/core/models/GoldenKeyCard.ts` | 황금열쇠 모델 |
| 7 | `src/core/data/boardData.ts` | 보드 데이터 정리 |
| 8 | `src/core/data/goldenKeyData.ts` | 황금열쇠 데이터 정리 |
| 9 | `src/core/systems/DiceSystem.ts` | 주사위 시스템 |
| 10 | `src/core/systems/MovementSystem.ts` | 이동 시스템 |
| 11 | `src/core/systems/TurnSystem.ts` | 턴 시스템 |

### Phase 2: 경제 시스템

| 순서 | 파일 | 설명 |
|------|------|------|
| 12 | `src/core/systems/EconomySystem.ts` | 구매/매각/통행료 |
| 13 | `src/core/systems/PhaseSystem.ts` | 페이즈 관리 |
| 14 | `src/core/systems/AuctionSystem.ts` | 경매 시스템 |
| 15 | `src/core/systems/BuildingSystem.ts` | 건설 시스템 |
| 16 | `src/core/systems/LoanSystem.ts` | 대출 시스템 |
| 17 | `src/core/systems/BankruptcySystem.ts` | 파산 처리 |

### Phase 3: 특수 타일

| 순서 | 파일 | 설명 |
|------|------|------|
| 18 | `src/core/systems/SpecialTileSystem.ts` | 특수 타일 |
| 19 | `src/core/systems/GoldenKeySystem.ts` | 황금열쇠 |

### Phase 4: CLI 인터페이스

| 순서 | 파일 | 설명 |
|------|------|------|
| 20 | `src/cli/CLIRenderer.ts` | 보드 시각화 |
| 21 | `src/cli/CLIInput.ts` | 입력 처리 |
| 22 | `src/cli/CLIGame.ts` | 게임 진입점 |
| 23 | `src/cli/modes/ManualTestMode.ts` | 수동 테스트 |
| 24 | `src/cli/modes/DebugMenu.ts` | 디버그 메뉴 |

### Phase 5: AI 시스템

| 순서 | 파일 | 설명 |
|------|------|------|
| 25 | `src/ai/AIPlayer.ts` | AI 플레이어 베이스 |
| 26 | `src/ai/strategies/RandomStrategy.ts` | 랜덤 AI |
| 27 | `src/ai/strategies/BasicStrategy.ts` | 기본 AI |
| 28 | `src/ai/strategies/SmartStrategy.ts` | 전략적 AI |
| 29 | `src/ai/simulator/GameSimulator.ts` | 게임 시뮬레이터 |
| 30 | `src/ai/simulator/BatchRunner.ts` | 배치 실행 |

---

## 5. 첫 번째 파일: 타입 정의

`src/core/types/index.ts` 생성:

```typescript
/**
 * 블루마블 공통 타입 정의
 */

export type GamePhase = 'FIRST_HALF' | 'AUCTION' | 'SECOND_HALF';

export type TileType = 
  | 'START'
  | 'CITY'
  | 'VEHICLE'
  | 'GOLDEN_KEY'
  | 'ISLAND'
  | 'SPACE_TRAVEL'
  | 'FUND_RECEIVE'
  | 'FUND_DONATE';

export type BuildingType = 'VILLA' | 'BUILDING' | 'HOTEL';

export type CardEffectType =
  | 'MOVE_TO'
  | 'MOVE_BACK'
  | 'RECEIVE_MONEY'
  | 'PAY_MONEY'
  | 'PAY_MAINTENANCE'
  | 'FORCE_SELL'
  | 'HOLD_ESCAPE'
  | 'HOLD_DISCOUNT';

// 게임 상수
export const GAME_CONSTANTS = {
  BOARD_SIZE: 40,
  TOTAL_DEEDS: 29,
  
  INITIAL_MONEY: {
    2: 5_860_000,
    3: 2_930_000,
    4: 2_930_000,
  },
  
  SALARY: 200_000,
  FUND_DONATE_AMOUNT: 150_000,
  TRAVEL_FEE: 200_000,
  
  MAX_LOAN_AMOUNT: 1_000_000,
  LOAN_DURATION_LAPS: 3,
  
  MIN_AUCTION_RAISE: 10_000,
  AUCTION_TRIGGER_THRESHOLD: 6,
  
  MAX_STRANDED_TURNS: 3,
  
  TILE_INDEX: {
    START: 0,
    ISLAND: 10,
    FUND_RECEIVE: 20,
    SPACE_TRAVEL: 30,
    FUND_DONATE: 38,
  },
  
  GOLDEN_KEY_INDICES: [2, 5, 12, 16, 22, 32],
  VEHICLE_INDICES: [15, 28, 33],
  NO_BUILD_INDICES: [6, 25, 39],
} as const;
```

---

## 6. 테스트 작성 가이드

### 6.1 단위 테스트 예시

`tests/unit/systems/DiceSystem.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { DiceSystem } from '../../../src/core/systems/DiceSystem';

describe('DiceSystem', () => {
  it('주사위 결과는 1-6 범위여야 함', () => {
    const dice = new DiceSystem();
    for (let i = 0; i < 100; i++) {
      const result = dice.roll();
      expect(result.die1).toBeGreaterThanOrEqual(1);
      expect(result.die1).toBeLessThanOrEqual(6);
      expect(result.die2).toBeGreaterThanOrEqual(1);
      expect(result.die2).toBeLessThanOrEqual(6);
    }
  });
  
  it('더블 감지가 정확해야 함', () => {
    const dice = new DiceSystem();
    // 시드 고정 또는 목 사용
    // ...
  });
});
```

### 6.2 통합 테스트 예시

`tests/integration/gameFlow.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { GameEngine } from '../../src/core/systems/GameEngine';

describe('Game Flow', () => {
  it('2인 게임을 완료할 수 있어야 함', () => {
    const engine = new GameEngine();
    engine.initialize(['Player 1', 'Player 2']);
    
    // 게임 진행 시뮬레이션
    while (!engine.isGameOver()) {
      // AI 또는 자동 진행
    }
    
    expect(engine.getWinner()).toBeDefined();
  });
});
```

---

## 7. 실행 명령어

```bash
# 개발 모드 실행
npm run dev

# 테스트 실행
npm test

# 빌드
npm run build

# 프로덕션 실행
npm start
```

---

## 8. 참고 문서

| 문서 | 경로 | 설명 |
|------|------|------|
| 스펙 | `specs/001-core-game-engine/spec.md` | 기능 요구사항 |
| 리서치 | `specs/001-core-game-engine/research.md` | 기술 결정 |
| 데이터 모델 | `specs/001-core-game-engine/data-model.md` | 엔티티 정의 |
| 계약 | `specs/001-core-game-engine/contracts/game-engine.ts` | 인터페이스 |
| 게임 규칙 | `blue_mable.md` | 원본 규칙 (Single Source of Truth) |
| 보드 데이터 | `rulemd/board-data.ts` | 기존 보드 데이터 |
| 카드 데이터 | `rulemd/golden-key-cards.ts` | 기존 황금열쇠 데이터 |

---

## 9. 주의사항

### 9.1 건물 건설

- ❌ 순차 업그레이드가 **아님**
- ✅ 자금만 있으면 빈 땅에 바로 호텔 건설 가능
- ✅ 한 턴에 별장2+빌딩+호텔 동시 건설 가능

### 9.2 우주여행 월급

- ❌ `if (targetIndex < 30)` 하드코딩 금지
- ✅ `if (targetIndex < currentTileIndex)` 동적 비교 사용

### 9.3 Constitution 준수

- 파산 로직 Unit Test 필수
- 턴 종료는 명시적 선언 필요
- GameEngine이 유일한 상태 관리자 (Single Source of Truth)

---

## 10. 다음 단계

1. **`/speckit.tasks`** 실행하여 작업 목록 생성
2. 또는 위 개발 순서에 따라 직접 구현 시작
