# Implementation Plan: 블루마블 디지털 보드게임

**Branch**: `001-core-game-engine` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-game-engine/spec.md`

---

## Summary

블루마블 보드게임을 TypeScript로 구현하는 CLI 기반 MVP 프로젝트. 2~4명 플레이어가 40칸 보드에서 주사위를 굴려 이동하고, 29종 씨앗증서를 구매/매각하며, 전반전/후반전 페이즈와 경매 시스템을 거쳐 최후의 1인이 승리하는 게임 엔진을 구현한다. 수동 테스트 모드와 AI 시뮬레이션 기능을 포함한다.

---

## Technical Context

**Language/Version**: TypeScript 5.x  
**Runtime**: Node.js 20+  
**Primary Dependencies**: Inquirer.js (CLI 입력), Commander.js (CLI 명령어)  
**Storage**: JSON 파일 기반 상태 저장 (로컬 파일시스템)  
**Testing**: Vitest  
**Target Platform**: Node.js CLI (크로스 플랫폼)  
**Project Type**: Single project (CLI 애플리케이션)  
**Performance Goals**: 1000게임 AI 시뮬레이션 5분 이내 완료  
**Constraints**: 메모리 < 500MB, 단일 프로세스 실행  
**Scale/Scope**: 2~4 플레이어, 40칸 보드, 29종 증서, 27종 황금열쇠

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| 원칙 | 상태 | 적용 방식 |
|------|------|----------|
| I. 서버 중심 진실의 원천 | ✅ PASS | MVP는 CLI 단일 프로세스로 GameEngine이 유일한 상태 관리자 역할 |
| II. QR 기반 엄격 검증 | ⚠️ N/A | MVP는 CLI 기반으로 QR 불필요, 향후 웹 확장 시 적용 |
| III. 양심 기반 신고 시스템 | ✅ PASS | CLI에서 사용자 입력 신뢰, 수동 테스트 모드 지원 |
| IV. 즉시 파산 처리 | ✅ PASS | BankruptcySystem에서 즉시 자산 이전 구현 필수 |
| V. 턴 종료 명시적 선언 | ✅ PASS | TurnSystem에서 명시적 턴 종료 명령 필수 |
| VI. 연결 복원성 | ⚠️ N/A | MVP는 오프라인 CLI, 향후 웹 확장 시 적용 |
| VII. KISS | ✅ PASS | 최소한의 추상화, 직접적인 구현 우선 |
| VIII. YAGNI | ✅ PASS | MVP 범위만 구현, 웹 UI는 제외 |
| IX. DRY | ✅ PASS | 공통 로직은 시스템 모듈로 추출 |
| X. SOLID | ✅ PASS | 시스템별 단일 책임, 인터페이스 분리 |

### 품질 게이트

| 테스트 | 상태 | 구현 계획 |
|--------|------|----------|
| 파산 로직 Unit Test | 🔲 TODO | BankruptcySystem에 테스트 커버리지 80%+ 필수 |
| 통합 테스트 | 🔲 TODO | 전체 게임 플로우 E2E 테스트 |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-core-game-engine/
├── plan.md              # 이 파일
├── spec.md              # 기능 스펙
├── research.md          # Phase 0 리서치 결과
├── data-model.md        # Phase 1 데이터 모델
├── quickstart.md        # Phase 1 빠른 시작 가이드
├── contracts/           # Phase 1 API 계약 (internal)
│   └── game-engine.ts   # 게임 엔진 인터페이스
├── checklists/          # 품질 체크리스트
│   └── requirements.md  # 요구사항 체크리스트
└── tasks.md             # Phase 2 작업 목록 (별도 생성)
```

### Source Code (repository root)

```text
src/
├── core/                    # 핵심 게임 로직 (플랫폼 독립)
│   ├── models/              # 도메인 모델
│   │   ├── Player.ts        # 플레이어 모델
│   │   ├── Tile.ts          # 타일 모델
│   │   ├── Deed.ts          # 씨앗증서 모델
│   │   ├── Building.ts      # 건물 모델
│   │   ├── GoldenKeyCard.ts # 황금열쇠 카드 모델
│   │   ├── Loan.ts          # 대출 모델
│   │   └── index.ts         # 모델 export
│   │
│   ├── systems/             # 게임 시스템
│   │   ├── GameEngine.ts    # 메인 게임 엔진
│   │   ├── PhaseSystem.ts   # 전반전/후반전 관리
│   │   ├── TurnSystem.ts    # 턴 관리
│   │   ├── DiceSystem.ts    # 주사위 + 더블 로직
│   │   ├── MovementSystem.ts    # 이동 로직
│   │   ├── EconomySystem.ts     # 구매/매각/통행료
│   │   ├── AuctionSystem.ts     # 경매 시스템
│   │   ├── BuildingSystem.ts    # 건설 시스템
│   │   ├── LoanSystem.ts        # 대출 시스템
│   │   ├── BankruptcySystem.ts  # 파산 처리
│   │   ├── SpecialTileSystem.ts # 특수 타일 처리
│   │   ├── GoldenKeySystem.ts   # 황금열쇠 처리
│   │   └── index.ts         # 시스템 export
│   │
│   ├── data/                # 게임 데이터
│   │   ├── boardData.ts     # 40칸 타일 정의
│   │   ├── deedData.ts      # 29종 씨앗증서 데이터
│   │   └── goldenKeyData.ts # 황금열쇠 카드 데이터
│   │
│   ├── events/              # 이벤트 시스템
│   │   ├── GameEvent.ts     # 이벤트 타입 정의
│   │   └── EventBus.ts      # 이벤트 버스
│   │
│   └── types/               # 타입 정의
│       └── index.ts         # 공통 타입/인터페이스
│
├── cli/                     # 터미널 인터페이스
│   ├── CLIGame.ts           # CLI 게임 진입점
│   ├── CLIRenderer.ts       # 텍스트 렌더링
│   ├── CLIInput.ts          # 입력 처리
│   ├── modes/
│   │   ├── ManualTestMode.ts   # 수동 테스트 모드
│   │   └── DebugMenu.ts        # 디버그 메뉴
│   └── commands/            # CLI 명령어들
│
├── ai/                      # AI 시스템
│   ├── AIPlayer.ts          # AI 플레이어 베이스
│   ├── strategies/
│   │   ├── RandomStrategy.ts   # 랜덤 AI
│   │   ├── BasicStrategy.ts    # 기본 규칙 AI
│   │   └── SmartStrategy.ts    # 전략적 AI
│   └── simulator/
│       ├── GameSimulator.ts    # 게임 시뮬레이터
│       ├── BatchRunner.ts      # 다중 게임 실행
│       └── StatsCollector.ts   # 통계 수집기
│
└── index.ts                 # 메인 진입점

tests/
├── unit/                    # 단위 테스트
│   ├── models/
│   ├── systems/
│   └── ai/
├── integration/             # 통합 테스트
│   └── gameFlow.test.ts
└── fixtures/                # 테스트 픽스처
    └── gameStates/
```

**Structure Decision**: Single project 구조 선택. MVP는 CLI 단일 애플리케이션이며, core/ 모듈은 향후 웹 확장 시에도 재사용 가능하도록 플랫폼 독립적으로 설계.

---

## Complexity Tracking

> 현재 Constitution Check에 위반 사항이 없으므로 해당 없음.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (없음) | - | - |

---

## Generated Artifacts

| Artifact | Status | Path |
|----------|--------|------|
| research.md | ✅ | `specs/001-core-game-engine/research.md` |
| data-model.md | ✅ | `specs/001-core-game-engine/data-model.md` |
| contracts/ | ✅ | `specs/001-core-game-engine/contracts/game-engine.ts` |
| quickstart.md | ✅ | `specs/001-core-game-engine/quickstart.md` |
