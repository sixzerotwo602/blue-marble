---
title: "게임 아키텍처 (Game Architecture)"
project: "부루마블 (Blue Marble)"
date: "2026-01-17"
author: "sungsu"
version: "1.0"
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
status: "complete"

# Source Documents
gdd: 'e:\github_coop\blue-marble\_bmad-output\gdd.md'
epics: 'e:\github_coop\blue-marble\_bmad-output\epics.md'
brief: ""
---

## 요약 (Executive Summary)

**부루마블(Blue Marble)** 아키텍처는 **CLI 및 웹**을 대상으로 하는 **Headless TypeScript Core**로 설계되었습니다.

**주요 아키텍처 의사결정 (Key Architectural Decisions):**

- **Core/Adapter 패턴:** 게임 로직과 UI를 분리하는 엄격한 Hexagonal 아키텍처.
- **상태 관리 (State Management):** 예측 가능한 게임 흐름을 위한 Redux 스타일의 불변 상태(Immutable State).
- **새로운 패턴 (Novel Pattern):** 복잡한 연쇄 규칙(예: 황금열쇠 -> 이동) 처리를 위한 "Effect Queue".

**프로젝트 구조:** 4개의 핵심 시스템(규칙, 경제, 보드, 플레이어)을 갖춘 도메인 주도 Hexagonal 조직.

**구현 패턴:** AI 에이전트의 일관성을 보장하는 4가지 패턴 정의.

**진행 단계:** 구현 단계 (설정 및 Epic)

# 게임 아키텍처 (Game Architecture)

## 문서 상태 (Document Status)

이 아키텍처 문서는 BMGD 아키텍처 워크플로우를 통해 작성되었습니다.

**완료된 단계:** 1 of 9 (초기화)

---

**완료된 단계:** 1, 2 of 9 (컨텍스트 분석)

---

## 프로젝트 컨텍스트 (Project Context)

### 게임 개요 (Game Overview)

**부루마블(Blue Marble)** - 클래식 보드게임을 웹 기반 디지털로 구현하며, 전략, 경제, 규칙의 무결성에 중점을 둡니다. 40개의 타일 보드, 싱글 플레이어(vs AI) 및 로컬 멀티플레이어 모드를 제공하며, 깔끔한 2D UI와 3D 주사위 물리를 특징으로 합니다.

### 기술 범위 (Technical Scope)

**플랫폼:** 웹 (모바일 우선, 반응형, TypeScript)
**장르:** 디지털 보드게임 / 전략
**프로젝트 수준:** 중간 복잡도 (로직 중심)

### 핵심 시스템 (Core Systems)

| 시스템                  | 복잡도 | 설명                                                                                              |
| :---------------------- | :----- | :------------------------------------------------------------------------------------------------ |
| **Turn & State Engine** | 중간   | 순환적인 게임 흐름(주사위 -> 이동 -> 행동 -> 턴 종료)을 관리하고 상태(자금, 위치)를 동기화합니다. |
| **Economy & Trade**     | 높음   | 자산 소유권, 통행료 계산, 파산 로직, 경매를 정밀한 정수 연산으로 처리합니다.                      |
| **Board Logic**         | 중간   | 40개의 타일 데이터, 플레이어 이동, 특수 타일 효과(무인도, 우주, 기금)를 관리합니다.               |
| **AI Controller**       | 중간   | 싱글 플레이어 상대를 위한 성격 기반(공격적/안전지향) 의사결정을 구현합니다.                       |
| **Asset Manager**       | 낮음   | 2D UI 자산과 3D 주사위 모델을 효율적으로 로드하고 표시합니다.                                     |

### 기술 요구사항 (Technical Requirements)

- **성능:** 모바일/데스크톱 60fps 목표, 초기 로딩 3초 미만.
- **입력:** 모바일 터치 최적화, 데스크톱 클릭.
- **렌더링:** 하이브리드 접근 방식 예상 (UI/보드는 DOM/Canvas, 주사위는 WebGL).
- **사운드:** SFX/BGM 지원 및 음소거 토글.

### 복잡성 요인 (Complexity Drivers)

**상태 관리 및 규칙 무결성 (State Management & Rule Integrity):**
가장 중요한 점은 복잡한 게임 규칙(특히 경제 및 파산)이 엣지 케이스 실패 없이 100% 정확하게 구현되었는지 검증하는 것입니다. "기본 골격(Basic Skeleton)"을 버그 없이 보장하는 것이 주요 과제입니다.

**하이브리드 렌더링 (Hybrid Rendering):**
주사위를 위한 경량 3D 물리 엔진과 반응형 2D DOM/Canvas 보드를 통합하려면 세심한 좌표 매핑과 z-index 관리가 필요합니다.

### 기술적 위험 (Technical Risks)

- **저사양 모바일 성능:** 3D 주사위 물리가 배터리를 소모하거나 구형 기기에서 끊길 수 있음. 폴백(fallback) 옵션 필요.
- **로직 디버깅:** 복잡한 상호작용(예: 황금열쇠 효과 중 파산)은 추적하기 어려울 수 있음. 엄격한 TDD 필수.

---

## 엔진 및 프레임워크 (Engine & Framework)

### 선택된 엔진: Headless Core (CLI 우선)

**핵심 스택:** TypeScript + Node.js
**테스트:** Vitest (빠른 단위 테스트)

**근거:**
사용자가 **CLI를 통한 로직 검증**을 우선할 것을 요청했습니다. "게임 코어"를 "프레젠테이션 계층(UI)"과 분리함으로써, 3D/2D 렌더링을 시도하기 전에 복잡한 규칙(경제, 상태 머신)이 100% 견고함을 보장합니다.

### 아키텍처 전략 (Architecture Strategy)

**Hexagonal Architecture (Ports & Adapters)** 접근 방식을 사용합니다:

1.  **Core Domain:** 순수 TypeScript 클래스 (Board, Player, GameState). UI 코드 없음.
2.  **Adapters:**
    - **CLI Adapter:** 텍스트 기반 플레이 및 테스트용.
    - **Web Adapter (미래):** React/Three.js 프론트엔드용.

### 프로젝트 초기화 (Project Initialization)

```bash
# Initialize TypeScript Node project
npm init -y
npm install -D typescript ts-node vitest @types/node
npx tsc --init
```

### 엔진 제공 아키텍처 (커스텀 구현)

커스텀 엔진을 구축하므로 아키텍처를 정의합니다:

| 컴포넌트      | 솔루션                                   | 비고                                               |
| ------------- | ---------------------------------------- | -------------------------------------------------- |
| **Game Loop** | 커스텀 이벤트 기반 루프                  | `Game.start()`, `Game.next()`                      |
| **State**     | 불변 상태 스토어 (Immutable State Store) | Redux 패턴과 유사 (Action -> Reducer -> New State) |
| **Input**     | CLI 프롬프트 / 미래의 UI 이벤트          | `PlayerAction` 인터페이스로 추상화                 |
| **Random**    | 시드 기반 RNG (Seeded RNG)               | 재현 가능한 리플레이/디버깅용                      |

### 남은 아키텍처 의사결정 (Remaining Architectural Decisions)

- **State Sync Pattern:** 상태 변경을 CLI/Web 어댑터에 어떻게 전파할 것인가? (Observer 패턴?)
- **Data Persistence:** 게임 세션을 어떻게 저장/로드할 것인가? (JSON 직렬화?)
- **Module Structure:** `core/`와 `cli/` 사이의 엄격한 경계 정의.

## 아키텍처 의사결정 (Architectural Decisions)

### 상태 관리: Redux 스타일 (Immutable)

**결정:** Store-Action-Reducer 패턴을 구현합니다.
**근거:**

- **예측 가능성:** 동일한 Input + State이면 Output은 항상 동일합니다. 로직 버그 디버깅에 필수적입니다.
- **추적 가능성:** 모든 `Action`(예: `BUY_LAND`)을 로그로 남겨 게임 세션의 정확한 기록을 볼 수 있습니다.
- **테스트:** 단위 테스트가 순수 함수형이 됩니다: `reducer(oldState, action) => expectedState`.

### 게임 루프: 이벤트 기반 (Event-Driven)

**결정:** 게임 엔진은 이벤트/액션이 발생할 때만 진행됩니다.
**근거:**

- 보드게임은 본질적으로 턴 기반이며 이벤트 중심입니다. "Game Tick"은 CLI 애플리케이션에 불필요한 오버헤드입니다.
- 미래에 "Play by Email" 스타일의 비동기 플레이를 지원합니다.

### 모듈 경계: 엄격한 Hexagonal (Strict Hexagonal)

**결정:** `Core` 로직은 외부 프레임워크(React, CLI)에 대한 의존성이 없습니다.
**근거:**

- 게임 규칙을 건드리지 않고 "프론트엔드"(CLI -> Web 2D -> Web 3D)를 교체할 수 있습니다.
- `Core`는 `IPlayerInput`, `IGameOutput`과 같은 **포트(Ports)**(인터페이스)를 통해 통신합니다.

---

## 횡단 관심사 (Cross-cutting Concerns)

### 에러 처리: Result 패턴

**전략:** 예외(Exception)를 던지는 대신 `Result<Value, Error>` 객체를 반환합니다.
**근거:**

- 게임 로직에서 "돈 부족"은 유효한 게임 상태이지 시스템 충돌이 아닙니다.
- 예외는 진정으로 복구 불가능한 시스템 오류(예: "메모리 부족")를 위해 예약되어야 합니다.

### 로깅: 의존성 주입 (ILogger)

**전략:** `Core`는 `ILogger` 인터페이스에 의존합니다. `CLI`는 `ConsoleLogger`를 주입합니다.
**근거:**

- **개발:** `ConsoleLogger`는 터미널에 색상 텍스트를 출력합니다.
- **배포:** `FileLogger` 또는 `NoOpLogger`를 핵심 코드 변경 없이 사용할 수 있습니다.
- **형식:** `[Time] [Level] [Module] Message` (예: `[12:00] [INFO] [Turn] Player 1 rolled 5`)

### 설정: 타입 안전 상수 (Type-safe Constants)

**전략:** `const config = { ... }` 객체를 깊은 동결(frozen deep)합니다.
**구조:**

- `GameConfig`: 규칙, 시작 자금, 보드 레이아웃.
- `AppConfig`: 로깅 레벨, 디버그 모드 (CLI 플래그).

## 프로젝트 구조 (Project Structure)

### 조직 패턴: 도메인 주도 Hexagonal (Domain-Driven Hexagonal)

**결정:** 코드는 "도메인 계층"별로 먼저 구성하고, 그 다음 "시스템"별로 구성합니다.
**근거:**

- "비즈니스 로직"(게임 규칙)을 "인프라"(CLI, Web)와 순수하게 격리합니다.
- 실수로 UI 코드를 게임 엔진으로 임포트하는 것을 불가능하게 합니다.

### 디렉토리 구조 (Directory Structure)

```
/src
├── core/                   # [순수 도메인 계층]
│   ├── board/              # 보드, 타일, 맵 데이터
│   ├── economy/            # 은행, 경매, 통행료 계산
│   ├── player/             # 플레이어 상태, 자산
│   ├── rules/              # 게임 종료, 파산, 황금열쇠 로직
│   ├── types/              # 순수 인터페이스 (ILogger, IInput)
│   └── game.ts             # 메인 진입점 (Facade)
├── adapters/               # [인프라 계층]
│   ├── cli/                # CLI 구현 (콘솔 뷰)
│   ├── web/                # (미래) React 어댑터
│   └── storage/            # JSON 파일 저장소
├── tests/                  # Vitest 단위 테스트
└── main.ts                 # 애플리케이션 진입점
```

### 시스템 위치 매핑 (System Location Mapping)

| 시스템           | 위치                   | 책임                                  |
| ---------------- | ---------------------- | ------------------------------------- |
| **Logic Engine** | `/src/core`            | 상태 변경 계산, 이동 유효성 검사.     |
| **Data Models**  | `/src/core/*/model.ts` | `Player`, `Land`, `GameContext` 정의. |
| **Interfaces**   | `/src/core/types`      | 로깅, 입력, 저장소를 위한 계약.       |
| **CLI View**     | `/src/adapters/cli`    | 텍스트 렌더링, 키보드 입력 읽기.      |

### 아키텍처 경계 (Architectural Boundaries)

1.  **Core 독립성:** `/src/core`는 `/src/adapters`에서 임포트해서는 안 됩니다.
2.  **인터페이스 주도:** 어댑터는 `/src/core/types`에 정의된 인터페이스를 구현합니다.
3.  **전역 상태 없음:** 전역 변수 없음 ( `config` 상수 제외). 모든 상태는 인자를 통해 전달됩니다.

## 구현 패턴 (Implementation Patterns)

### 새로운 패턴: Effect Queue 시스템 (Novel Pattern)

**목적:** 단일 원자적 리듀서 상태 변경으로 해결할 수 없는 복잡한 연쇄 이벤트(예: 황금열쇠 -> 이동 -> 통행료 지불 -> 파산)를 처리합니다.

**구성요소:**

- **Action:** 사용자 의도 (`ROLL_DICE`)
- **Reducer:** 즉각적인 상태 변경 계산.
- **Effect:** 부수 효과 기술자 (`MOVE_PLAYER_ANIMATION`, `OPEN_POPUP`).
- **Queue:** 대기 중인 Effect의 FIFO 목록.

**데이터 흐름:**

1. UI가 `Action`을 디스패치합니다.
2. Reducer가 `State` 업데이트 + `Effect[]` 생성.
3. Game Loop가 큐에서 첫 번째 `Effect`를 가져옵니다.
4. Adapter가 `Effect`를 실행합니다 (시각/로직).
5. Effect 완료 시 다음 `Action` 트리거 (있는 경우).

**구현 가이드:**

```typescript
interface GameResult {
  state: GameState;
  effects: Effect[];
}

function gameReducer(state: GameState, action: Action): GameResult {
  // Logic here...
  return { state: newState, effects: [effect1, effect2] };
}
```

### 엔티티 패턴: 정적 데이터 파사드 (Static Data Facade)

**생성:** "인스턴스화" 대신 "조회".
**근거:** 보드는 불변의 40개 타일입니다. 팩토리가 필요 없습니다.

**예시:**

```typescript
// /src/core/board/BoardData.ts
export const BOARD_TILES: ReadonlyArray<Tile> = [
  { id: 0, type: "START", name: "Start" },
  { id: 1, type: "CITY", name: "Taipei", cost: 5 },
  // ...
];

export const getTile = (id: number) => BOARD_TILES[id];
```

### 통신 패턴: 타입 안전 디스패치 (Type-safe Dispatch)

**패턴:** Discriminated Union Actions.
**근거:** 문자열 오타 방지 및 엄격한 페이로드 타이핑 보장.

**예시:**

```typescript
type Action =
  | { type: 'ROLL_DICE' }
  | { type: 'BUY_LAND'; payload: { tileId: number } };

function dispatch(action: Action) { ... }
```

### 일관성 규칙 (Consistency Rules)

| 패턴                           | 관례                             | 강제 방법        |
| ------------------------------ | -------------------------------- | ---------------- |
| **불변성 (Immutability)**      | 모든 상태 속성에 `readonly` 사용 | 컴파일러 + 린터  |
| **순수 함수 (Pure Functions)** | Reducer는 순수해야 함            | 코드 리뷰        |
| **Core 내 UI 없음**            | `console.log` 직접 사용 금지     | 리뷰 + 린트 규칙 |

### 검증 날짜 (Validation Date)

2026-01-17

---

## 개발 환경 (Development Environment)

### 사전 요구사항 (Prerequisites)

- **Node.js:** v20+ (LTS)
- **패키지 매니저:** npm
- **언어:** TypeScript 5.0+

### 설정 명령어 (Setup Commands)

```bash
# 1. Initialize Project
npm init -y

# 2. Install Core Dependencies
npm install -D typescript ts-node vitest @types/node

# 3. Configure TypeScript
npx tsc --init
```

### 첫 단계 (First Steps)

1.  `src/core`, `src/adapters`, `src/tests` 디렉토리 생성.
2.  `src/core/types`에 `ILogger` 인터페이스 구현.
3.  `src/core/game.ts`에 기본 `GameState` 인터페이스 생성.
