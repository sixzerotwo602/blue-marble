# Quickstart: 블루마블 코어 게임 엔진

**Feature**: 001-core-game-engine  
**Date**: 2026-01-21

## 개요

블루마블 디지털 보드게임의 CLI 기반 MVP를 빠르게 실행하는 가이드.

---

## 사전 요구사항

- Node.js 20 LTS 이상
- npm 또는 pnpm

---

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 빌드

```bash
npm run build
```

### 3. 게임 실행

#### 일반 게임 모드
```bash
npm start
# 또는
npx ts-node src/cli/index.ts
```

#### 수동 테스트 모드
```bash
npm run test:manual
# 또는
npx ts-node src/cli/index.ts --mode=test
```

#### AI 시뮬레이션 모드
```bash
npm run simulate
# 또는
npx ts-node src/cli/index.ts --mode=simulate --games=100 --strategy=smart
```

---

## CLI 명령어 요약

### 게임 중 명령어

| 명령 | 설명 |
|------|------|
| `roll` / `r` | 주사위 굴리기 |
| `buy` / `b` | 현재 땅 구매 |
| `build` / `bd` | 건물 건설 메뉴 |
| `status` / `s` | 현재 상태 확인 |
| `assets` / `a` | 보유 자산 목록 |
| `loan` / `l` | 대출 메뉴 |
| `end` / `e` | 턴 종료 |
| `save [filename]` | 게임 저장 |
| `load [filename]` | 게임 불러오기 |
| `quit` / `q` | 게임 종료 |

### 수동 테스트 모드 전용

| 명령 | 설명 |
|------|------|
| `debug` / `d` | 디버그 메뉴 진입 |
| `set money [player] [amount]` | 플레이어 자금 설정 |
| `set pos [player] [index]` | 플레이어 위치 설정 |
| `set phase [phase]` | 게임 페이즈 변경 |
| `force roll [die1] [die2]` | 주사위 결과 강제 지정 |
| `give deed [player] [deedId]` | 증서 소유권 이전 |

---

## 프로젝트 구조

```
src/
├── models/          # 게임 도메인 모델
├── services/        # 게임 로직 서비스
├── cli/             # CLI 인터페이스
├── ai/              # AI 전략
├── engine/          # 핵심 게임 엔진
└── lib/             # 유틸리티

rulemd/              # 게임 데이터 (기존 파일)
├── board-data.ts    # 40칸 보드 데이터
├── golden-key-cards.ts  # 27종 황금열쇠 카드
└── enums.ts         # 열거형 정의

tests/
├── unit/            # 단위 테스트
├── integration/     # 통합 테스트
└── simulation/      # 밸런스 테스트
```

---

## 테스트 실행

### 전체 테스트
```bash
npm test
```

### 특정 테스트 파일
```bash
npm test -- bankruptcy.service.test.ts
```

### 커버리지 리포트
```bash
npm run test:coverage
```

### 밸런스 시뮬레이션 (1000게임)
```bash
npm run test:balance
```

---

## 주요 API 사용 예시

### 게임 초기화

```typescript
import { GameEngine } from './src/engine/game-engine';

const engine = new GameEngine();
engine.initialize(['플레이어1', '플레이어2', '플레이어3']);

console.log(engine.getState());
```

### 주사위 굴리기 및 이동

```typescript
const player = engine.turn.getCurrentPlayer();
const diceResult = engine.dice.roll();

console.log(`주사위: ${diceResult.die1} + ${diceResult.die2} = ${diceResult.total}`);
console.log(`더블: ${diceResult.isDouble}`);

const moveResult = engine.movement.move(player, diceResult);
console.log(`이동: ${moveResult.previousPosition} → ${moveResult.newPosition}`);
```

### 씨앗증서 구매

```typescript
const currentTile = engine.getState().board[player.position];
if (currentTile.deedId) {
  const deed = engine.getState().deeds.find(d => d.id === currentTile.deedId);
  if (deed && deed.ownerId === null) {
    const result = engine.economy.buyDeed(player, deed);
    console.log(result.success ? '구매 완료!' : `실패: ${result.reason}`);
  }
}
```

### AI 시뮬레이션

```typescript
import { GameSimulator } from './src/ai/game-simulator';
import { SmartStrategy } from './src/ai/smart.strategy';

const simulator = new GameSimulator({
  players: 4,
  strategy: new SmartStrategy(),
  games: 1000
});

const stats = await simulator.run();
console.log(`평균 게임 길이: ${stats.avgTurns}턴`);
console.log(`승률 분포: ${JSON.stringify(stats.winRates)}`);
```

---

## 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `LOG_LEVEL` | `info` | 로그 레벨 (debug, info, warn, error) |
| `SAVE_DIR` | `./saves` | 게임 저장 디렉토리 |
| `SIMULATION_SPEED` | `fast` | 시뮬레이션 속도 (instant, fast, normal) |

---

## 다음 단계

1. `/speckit.tasks` - 구현 태스크 생성
2. `/speckit.implement` - 태스크별 구현 시작
