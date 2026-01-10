# Implementation Plan: 부루마블 MVP 핵심 엔진 (CLI 테스트 모드)

**Branch**: `001-core-game-engine` | **Date**: 2026-01-10 | **Spec**: [spec.md](file:///e:/github_coop/blue-marble/specs/001-core-game-engine/spec.md)
**Input**: Feature specification from `/specs/001-core-game-engine/spec.md`

## Summary

CLI 기반 부루마블 MVP 구현. 터미널에서 텍스트로 모든 게임을 제어하며, 한 명의 사용자가 2~4명의 플레이어를 번갈아 컨트롤하여 게임 로직을 검증.

**핵심 기능**: 터미널 게임 설정, 자동 주사위, 땅 구매(Y/N), 건물 건설(메뉴), 통행료 합산, 파산 처리, 게임 종료

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 18+  
**Primary Dependencies**: readline (내장), ts-node (개발)  
**Storage**: In-Memory (변수)  
**Testing**: Vitest  
**Target Platform**: Node.js CLI (터미널)  
**Project Type**: Single CLI Application  
**Performance Goals**: 응답 1초 이내  
**Constraints**: 단일 프로세스, 네트워크 없음

## Constitution Check

| Principle                | Status  | Notes                               |
| ------------------------ | ------- | ----------------------------------- |
| I. 서버 중심 진실의 원천 | ⚠️ 변형 | 단일 프로세스, 메모리가 진실의 원천 |
| II~III, VI               | ⛔ 제외 | CLI 테스트 모드                     |
| IV~V                     | ✅ 준수 | 파산/턴 종료 로직                   |
| VII~X                    | ✅ 준수 | KISS, YAGNI, DRY, SOLID             |

## Project Structure

### Documentation

```text
specs/001-core-game-engine/
├── spec.md              # CLI 기능 명세
├── plan.md              # 이 파일
├── research.md          # 기술 리서치
├── data-model.md        # 데이터 모델
├── quickstart.md        # CLI 실행 가이드
├── contracts/           # 타입 정의 (참조용)
└── tasks.md             # 구현 태스크
```

### Source Code

```text
src/
├── cli/                     # CLI 입출력
│   ├── prompts.ts           # readline 프롬프트
│   ├── display.ts           # 터미널 출력 포매터
│   └── gameLoop.ts          # 메인 게임 루프
├── services/                # 비즈니스 로직
│   ├── gameService.ts       # 게임 흐름
│   ├── diceService.ts       # 주사위
│   ├── propertyService.ts   # 땅 구매
│   ├── buildingService.ts   # 건물 건설
│   ├── tollCalculator.ts    # 통행료 계산
│   └── bankruptcyService.ts # 파산 처리
├── data/                    # 정적 데이터
│   ├── boardData.ts         # 40칸 보드판
│   └── constants.ts         # 게임 상수
├── types/                   # TypeScript 타입
│   └── index.ts
└── index.ts                 # 엔트리 포인트

tests/
└── unit/                    # 단위 테스트
    ├── tollCalculator.test.ts
    ├── bankruptcyService.test.ts
    └── gameService.test.ts
```

---

## Proposed Changes

### Component: Core Types

#### [NEW] [types/index.ts](file:///e:/github_coop/blue-marble/src/types/index.ts)

- Game, Player, BoardTileState, Building 인터페이스
- GameStatus, TileType enum
- data-model.md 기반

---

### Component: Data

#### [NEW] [data/boardData.ts](file:///e:/github_coop/blue-marble/src/data/boardData.ts)

- contracts/board-data.ts 기반 40칸 데이터

#### [NEW] [data/constants.ts](file:///e:/github_coop/blue-marble/src/data/constants.ts)

- GAME_CONSTANTS (INITIAL_MONEY, SALARY 등)

---

### Component: Services

#### [NEW] [services/diceService.ts](file:///e:/github_coop/blue-marble/src/services/diceService.ts)

- rollDice(): 주사위 2개 굴림

#### [NEW] [services/gameService.ts](file:///e:/github_coop/blue-marble/src/services/gameService.ts)

- initializeGame(), movePlayer(), endTurn(), checkGameEnd()

#### [NEW] [services/propertyService.ts](file:///e:/github_coop/blue-marble/src/services/propertyService.ts)

- purchaseProperty(), canAffordPurchase()

#### [NEW] [services/buildingService.ts](file:///e:/github_coop/blue-marble/src/services/buildingService.ts)

- buildVilla(), buildBuilding(), buildHotel()

#### [NEW] [services/tollCalculator.ts](file:///e:/github_coop/blue-marble/src/services/tollCalculator.ts)

- calculateToll(), isMonopoly()

#### [NEW] [services/bankruptcyService.ts](file:///e:/github_coop/blue-marble/src/services/bankruptcyService.ts)

- sellBuilding(), sellLand(), declareBankruptcy()

---

### Component: CLI

#### [NEW] [cli/prompts.ts](file:///e:/github_coop/blue-marble/src/cli/prompts.ts)

- readline 래퍼, 입력 처리 함수

#### [NEW] [cli/display.ts](file:///e:/github_coop/blue-marble/src/cli/display.ts)

- 보드 상태 출력, 플레이어 정보 출력

#### [NEW] [cli/gameLoop.ts](file:///e:/github_coop/blue-marble/src/cli/gameLoop.ts)

- 메인 게임 루프, 턴 처리

#### [NEW] [index.ts](file:///e:/github_coop/blue-marble/src/index.ts)

- 엔트리 포인트, 메인 메뉴

---

## Verification Plan

### Automated Tests

```bash
# 모든 단위 테스트 실행
npm run test
```

**테스트 케이스**:

1. `tollCalculator.test.ts`: 합산 통행료 계산, 독점 2배
2. `bankruptcyService.test.ts`: 건물/땅 매각 환급률
3. `gameService.test.ts`: 더블 추가 턴, 출발점 월급

### Manual Verification

```bash
# 1. 게임 실행
npm start

# 2. 새 게임 시작 (1 선택)
# 3. 플레이어 2명 설정
# 4. Enter로 주사위 굴림
# 5. Y/N으로 땅 구매
# 6. 건물 건설 메뉴 테스트
# 7. 파산 상황 시뮬레이션
# 8. 1명 남을 때 게임 종료 확인
```

---

## Complexity Tracking

| Violation                    | Why Needed                   | Simpler Alternative Rejected |
| ---------------------------- | ---------------------------- | ---------------------------- |
| 메모리 진실의 원천 (I)       | CLI 테스트 모드, 서버 불필요 | 서버 구축 오버엔지니어링     |
| QR/양심 시스템 제거 (II~III) | 자동화된 테스트 환경         | 물리적 보드 필요             |
