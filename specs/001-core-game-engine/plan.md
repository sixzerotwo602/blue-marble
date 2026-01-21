# Implementation Plan: 블루마블 코어 게임 엔진

**Branch**: `001-core-game-engine` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-game-engine/spec.md`

## Summary

블루마블 디지털 보드게임의 핵심 게임 엔진을 TypeScript로 구현한다. 40칸 보드, 29종 씨앗증서, 27종 황금열쇠 카드, 전반전/후반전 페이즈 시스템, 경매, 건설, 대출, 파산 처리 등 전체 게임 규칙을 포함한다. CLI 기반 MVP로 수동 테스트 모드와 AI 시뮬레이션 모드를 제공한다.

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 20 LTS  
**Primary Dependencies**: `readline` (CLI), `fs` (파일 저장/불러오기)  
**Storage**: JSON 파일 (게임 상태 저장/불러오기)  
**Testing**: Vitest (단위/통합 테스트)  
**Target Platform**: Node.js CLI (Windows/macOS/Linux)  
**Project Type**: Single CLI application  
**Performance Goals**: 1000게임 AI 시뮬레이션 5분 이내 완료  
**Constraints**: 의존성 최소화 (외부 라이브러리 없이 순수 Node.js)  
**Scale/Scope**: 2~4명 플레이어, 40칸 보드, 평균 80~120턴 게임

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 상태 | 비고 |
|------|------|------|
| I. 서버 중심 진실의 원천 | ⚠️ 해당 없음 | MVP는 로컬 CLI 기반, 향후 웹 확장 시 적용 |
| II. QR 기반 엄격 검증 | ⚠️ 해당 없음 | CLI 환경에서는 QR 스캔 없음 |
| III. 양심 기반 신고 시스템 | ✅ 적용 | 수동 테스트 모드에서 주사위 결과 직접 입력 |
| IV. 즉시 파산 처리 | ✅ 필수 준수 | 파산 로직 Unit Test 필수 |
| V. 턴 종료 명시적 선언 | ✅ 필수 준수 | CLI에서 명시적 턴 종료 명령 구현 |
| VI. 연결 복원성 | ⚠️ 해당 없음 | 로컬 CLI 환경, 네트워크 없음 |
| VII. KISS | ✅ 필수 준수 | 단순한 구조 유지 |
| VIII. YAGNI | ✅ 필수 준수 | MVP 기능만 구현 |
| IX. DRY | ✅ 필수 준수 | 상수는 data 파일에서 재사용 |
| X. SOLID | ✅ 필수 준수 | 모듈별 단일 책임 |

**품질 게이트**:
- [x] 파산 로직 Unit Test 필수
- [ ] QR 검증 Integration Test - MVP에서 해당 없음
- [ ] 연결 끊김 시나리오 Test - MVP에서 해당 없음

## Project Structure

### Documentation (this feature)

```text
specs/001-core-game-engine/
├── plan.md              # 이 파일
├── research.md          # Phase 0 출력
├── data-model.md        # Phase 1 출력
├── quickstart.md        # Phase 1 출력
├── contracts/           # Phase 1 출력 - 게임 엔진 인터페이스
└── tasks.md             # Phase 2 출력 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── models/              # 게임 도메인 모델
│   ├── player.ts        # 플레이어 모델
│   ├── tile.ts          # 타일/보드 모델
│   ├── deed.ts          # 씨앗증서 모델
│   ├── building.ts      # 건물 모델
│   ├── golden-key.ts    # 황금열쇠 카드 모델
│   └── game-state.ts    # 게임 상태 모델
├── services/            # 게임 로직 서비스
│   ├── dice.service.ts  # 주사위 서비스
│   ├── turn.service.ts  # 턴 관리 서비스
│   ├── deed.service.ts  # 증서 구매/매각 서비스
│   ├── building.service.ts # 건설 서비스
│   ├── auction.service.ts  # 경매 서비스
│   ├── loan.service.ts     # 대출 서비스
│   ├── bankruptcy.service.ts # 파산 처리 서비스
│   ├── tile-effect.service.ts # 타일 효과 서비스
│   └── golden-key.service.ts  # 황금열쇠 카드 서비스
├── cli/                 # CLI 인터페이스
│   ├── index.ts         # CLI 진입점
│   ├── renderer.ts      # 화면 출력
│   ├── input-handler.ts # 입력 처리
│   └── debug-menu.ts    # 디버그 메뉴 (수동 테스트)
├── ai/                  # AI 전략
│   ├── ai-strategy.ts   # AI 전략 인터페이스
│   ├── random.strategy.ts  # 랜덤 전략
│   ├── basic.strategy.ts   # 기본 전략
│   └── smart.strategy.ts   # 스마트 전략
├── engine/              # 핵심 게임 엔진
│   ├── game-engine.ts   # 게임 엔진 메인
│   └── phase-manager.ts # 페이즈 관리자
└── lib/                 # 유틸리티
    ├── constants.ts     # 상수
    └── utils.ts         # 헬퍼 함수

rulemd/                  # 게임 데이터 (기존 파일 재사용)
├── board-data.ts        # 40칸 보드 데이터
├── golden-key-cards.ts  # 27종 황금열쇠 카드 데이터
└── enums.ts             # 열거형 정의

tests/
├── unit/
│   ├── services/        # 서비스 단위 테스트
│   │   ├── bankruptcy.service.test.ts  # 파산 로직 (필수)
│   │   ├── auction.service.test.ts
│   │   └── ...
│   └── models/          # 모델 단위 테스트
├── integration/
│   ├── game-flow.test.ts    # 전체 게임 플로우
│   └── phase-transition.test.ts # 페이즈 전환
└── simulation/
    └── balance.test.ts      # 1000게임 밸런스 테스트
```

**Structure Decision**: Single CLI application 구조 선택. `rulemd/` 디렉토리의 기존 데이터 파일을 재사용하고, `src/` 하위에 도메인 중심 모듈 구조로 구성.

## Complexity Tracking

해당 없음 - Constitution 위반 사항 없음.
