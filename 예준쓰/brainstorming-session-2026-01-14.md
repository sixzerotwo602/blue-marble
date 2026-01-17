---
title: 'Game Brainstorming Session'
date: '2026-01-14'
author: 'Yejunpark'
version: '1.0'
stepsCompleted: [1, 2]
status: 'in-progress'
---

# Game Brainstorming Session

## Session Info

- **Date:** 2026-01-14
- **Facilitator:** Game Designer Agent
- **Participant:** Yejunpark

---

_Ideas will be captured as we progress through the session._

## Brainstorming Approach

**Selected Mode:** YOLO (Pivot: TypeScript CLI & Original Rules)

**Techniques Available:**
- **System Architecture (Rule-First):** 나무위키 및 매뉴얼 기반의 정확한 규칙(황금열쇠, 파산, 건물 건설 등) 구현 구조 설계
- **Core Loop Simulation:** 턴 구조(주사위 -> 이동 -> 행동 -> 턴 종료)의 엄격한 로직 설계
- **CLI Interaction Design:** 텍스트 기반 보드 시각화 및 명령어 입력 UX
- **Data Modeling:** 보드판, 자산, 플레이어 상태의 TypeScript 모델링

**Focus Areas:**
- **Logic Compliance:** 씨앗사 부루마불 원본 규칙의 완벽한 이식
- **Single Client CLI:** 네트워크 배제, 로컬 플레이/테스트 가능한 구조
- **Foundation Layer:** 추후 확장(웹/멀티)의 기반이 될 견고한 코어 로직

## Party Mode Insights

**Key Takeaways:**
1. **UX:** 텍스트 애니메이션 및 Dashboard UI로 CLI 환경에서도 '손맛'과 가시성 확보
2. **QA:** E2E 테스트 필수, 시드(Seed) 고정을 통한 결정론적(Deterministic) 리플레이 환경 구축
3. **Architecture:** 불변(Immutable) 상태 객체 관리 및 Redux 스타일의 단방향 데이터 흐름(Action-Reducer) 도입

## Ideas Generated

**[Architecture #1]**: Minimalist Menu-Driven CLI
_Core Loop_: 현재 상태 출력 -> 가능한 행동 목록 번호로 표시 -> 번호 입력 -> 결과 출력 및 상태 업데이트
_Novelty_: 아스키 아트나 복잡한 레이아웃 배제. 순수 텍스트 로그(Log) 형태로 진행하여 디버깅 및 자동화 테스트에 최적화.

**[Logic #1]**: Interactive Bankruptcy & Debt Settlement
_Core Loop_: 통행료 발생 -> 잔고 부족 감지 -> [자산 매각 메뉴] 진입 -> 플레이어가 매각할 부동산 선택 (반값에 은행 매각) -> 현금 확보 -> 지불 -> (부족 시 파산 및 승계)
_Novelty_: "자동 파산"이 아닌 "살아남기 위한 선택(Agency)"을 시스템화. 사용자가 직접 빚을 청산하는 과정을 CLI 메뉴로 구현.

**[Logic #2]**: Context-Aware Event Card (Golden Key)
_Core Loop_: 상대 땅 도착 -> 통행료 지불 트리거 전 '우대권' 보유 체크 -> [1. 지불하기, 2. 우대권 사용] 메뉴 출력 -> 사용자 선택에 따라 로직 분기.
_Novelty_: 오리지널 룰의 "전략적 사용"을 보장. 시스템이 강제로 사용하지 않고 사용자에게 묻는 Interactive Flow 구현.

**[QA #1]**: Deterministic Replay System
_Core Loop_: 게임 시작 시 Seed 주입 -> 모든 주사위/황금열쇠 결과가 Seed에 의해 결정 -> 로그 저장 -> 로그 기반으로 똑같은 게임 재현.
_Novelty_: QA가 언급한 "버그 100% 재현" 가능. E2E 테스트의 신뢰성 확보.

**[Architecture #2]**: Type-Safe Rule Engine
_Core Loop_: `ref.yaml` 등에 정의된 오리지널 데이터(지역명, 가격)를 TypeScript Union Type 등으로 엄격하게 정의.
_Novelty_: 런타임 에러 방지 및 오리지널 룰 외의 "변종 룰" 개입 원천 차단.

**[Configuration #1]**: Flexible CLI Arguments
_Core Loop_: `npm start` 시 인자 파싱(`--mode`, `--players`, `--seed`). Human(Hotseat) 모드와 Auto(Bot) 모드 지원.
_Novelty_: QA를 위한 봇 대전과 실제 플레이용 핫시트 모드를 단일 진입점에서 유연하게 전환.

**[Rules #1]**: Last Man Standing (Pure Original)
_Core Loop_: 턴 무한 반복. 자산 상황에 관계없이 오직 `생존자 == 1명`일 때만 게임 종료.
_Novelty_: 인위적인 턴 제한 없음. 오리지널 게임의 "끝장을 보는" 경험을 시뮬레이션. (QA 시 고속 연산 필요)

---

## Themes and Patterns

**Theme 1: "Strict Simulation"**
- 오리지널 규칙의 완벽한 이식 (No House Rules)
- 플레이어의 선택권(Agency) 존중 (파산 처리, 우대권 사용)
- 끝장 승부 (Last Man Standing)

**Theme 2: "Developer Experience (DX)"**
- CLI, Text-based UX
- Deterministic Testing (Seed)
- Input/Output 분리를 통한 테스트 용이성
- Flexible Configuration (Human/Bot/Seed)

## Promising Combinations

**"Interactive Logic" + "CLI Menu"**
- 복잡한 UI 없이도 숫자 입력(`1`, `2`)만으로 파산/면제권 등 고도화된 규칙 처리가 가능함.
- 이를 통해 개발 속도는 높이고, 로직의 깊이는 유지할 수 있음.

**"Last Man Standing" + "Headless Auto Mode"**
- 사람이 플레이하면 몇 시간이 걸릴 "최후의 1인" 룰을, Headless Bot 모드에서는 초고속으로 시뮬레이션하여 밸런스/버그 검증 가능.

---

## Session Complete

**Date:** 2026-01-14
**Duration:** Brainstorming session
**Participant:** Yejunpark

### Output

This brainstorming session generated:

- 10 raw ideas (approx)
- 5 developed concepts
- 2 emerging themes

### Session Summary

#### Most Promising Concepts

**Top Pick: Minimalist Strict Simulator**
오리지널 룰북을 100% 준수하며, 네트워크 없이 로컬에서 동작하는 CLI 게임. 개발 효율성과 로직 검증에 최적화됨.

**Runner-up: Developer-Friendly Architecture**
불변 상태 관리, 시드 기반 결정론적 테스트, 타입 시스템을 활용한 '개발자 경험(DX)' 중심의 설계.

#### Key Insights

1. **Focus on Logic:** UI를 최소화함으로써 복잡한 예외 케이스 처리에 집중 가능.
2. **QA is Key:** E2E 테스트와 리플레이 시스템이 프로젝트 성공의 핵심.
3. **Agency:** 파산 등 위기 상황에서 플레이어에게 절차적 선택권을 부여하여 게임의 깊이 유지.

#### Recommended Next Steps

1. **GDD 작성 (create-gdd):** 도출된 아키텍처와 로직을 체계적인 기획서로 정리.
2. **Tech Spec 작성:** 데이터 모델과 시스템 설계 구체화.
3. **Prototyping:** 핵심 루프 코드 구현.

### Document Status

Status: Complete
Steps Completed: [1, 2, 3, 4]
