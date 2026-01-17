---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments: ['_bmad-output/brainstorming-session-2026-01-14.md']
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: 'gdd'
lastStep: 0
project_name: 'test582'
user_name: 'Yejunpark'
date: '2026-01-14'
game_type: 'simulation'
game_name: 'BlueMarble-CLI'
---

# {{game_name}} - Game Design Document

**Author:** {{user_name}}
**Game Type:** {{game_type}}
**Target Platform(s):** {{platforms}}

---

## Executive Summary

### Game Name

BlueMarble-CLI

### Core Concept

BlueMarble-CLI는 씨앗사의 원작 보드게임 **'부루마불'**을 터미널 환경에서 완벽하게 시뮬레이션하는 TypeScript 기반 프로젝트입니다. 화려한 그래픽이나 네트워크 기능을 배제하고, 오직 **'게임 로직의 엄격한 구현'**과 **'개발자 경험(DX)'**에 집중합니다.

플레이어는 텍스트 기반 메뉴를 통해 자산을 관리하고, 파산 위기 시 매각할 건물을 직접 선택하는 등 깊이 있는 상호작용을 경험합니다. 시드(Seed) 기반의 결정론적 난수 생성 시스템을 도입하여 100% 재현 가능한 테스트 환경을 제공하며, 이를 통해 복잡한 보드게임 규칙 엔진의 신뢰성을 보장합니다.

### Game Type

**Type:** Simulation
**Framework:** This GDD uses the simulation template with type-specific sections for systems, management, sandbox, and economics.
**Focus:** Strict Rule Simulation, Economic Management, Turn-Based Logic.

### Unique Selling Points (USPs)

1. **Pure Simulation:** 그래픽 노이즈 없이 순수한 '자산 관리 및 증식'의 메커니즘을 체험.
2. **Educational Value:** 파산, 대출(예정), 자산 매각 등의 경제적 의사결정을 안전한 시뮬레이션 환경에서 학습.
3. **Transparent Logic:** 모든 확률과 결과가 투명하게 로그로 남고 검증 가능함.

---

## Target Platform(s)

### Primary Platform

**Phase 1: Node.js Runtime (CLI)**
- **Role:** Core Logic Verification & Testbed
- **OS Support:** Linux, macOS, Windows
- **Distribution:** npm package

**Phase 2: Web Browser (Future)**
- **Role:** Production Environment for End Users (Educational App)
- **Requirement:** Core logic must be decoupled from CLI I/O to ensure seamless portability to Web (React/Next.js).

### Platform Considerations

- **Architecture First:** `GameCore` 로직은 100% 순수 TypeScript로 작성되어야 하며, `View` 레이어(Console vs DOM)와 완전히 분리되어야 함.
- **State Management:** Redux 스타일의 단방향 데이터 흐름을 채택하여, 추후 웹 프론트엔드 상태 라이브러리(Redux/Zustand)와 쉽게 연동되도록 설계.
- **Terminal Environment (Phase 1):** 표준 입출력(stdin/stdout) 기반으로 동작하지만, 이는 임시 인터페이스임.

### Control Scheme

**Keyboard Only Interaction**
- **Numeric Input:** 메뉴 선택 (`1`, `2`, `3`...)
- **Text Input:** 예: 자산 매각 시 금액이나 수량 입력
- **Confirmation:** Enter 키
- **Navigation (Optional):** 화살표 키 (메뉴 이동이 필요할 경우), 기본적으로는 숫자 입력을 지향하여 키 입력 오류 최소화.

---

## Target Audience

### Demographics

- **Age Range:** 12세 이상 (경제 관념을 익히기 시작하는 청소년 ~ 성인)
- **Context:** 경제 교육 커리큘럼의 일부로 활용

### Session Length

- **Simulation Mode:** 5분 미만 (봇 대전/고속 시뮬레이션)
- **Play Mode:** 30분 ~ 1시간 (실제 사고와 결정이 필요한 학습 세션)

### Player Motivations

- **Learning:** 경제적 의사결정의 결과를 시뮬레이션을 통해 확인하고 학습.
- **Mastery:** 완벽한 정보(Perfect Information)에 가까운 상태에서 최적의 전략을 수립하는 재미.

## Goals and Context

### Project Goals

1.  **Bug-Free Logic Engine:** 복잡한 예외 처리(파산, 우대권 등)가 난무하는 보드게임 로직을 100% 테스트 커버리지로 구현하여 무결점(Zero Bug) 엔진을 입증.
2.  **Data-Driven Design:** 수천 번의 고속 시뮬레이션(Bot Match)을 통해 게임 밸런스 데이터를 수집하고, 최적의 경제 모델을 도출.
3.  **Scalable Core:** 향후 웹/앱 확장을 고려하여 UI와 완전히 분리된 순수 로직(Pure Logic) 라이브러리 구축.

### Background and Rationale

**Motivation:**
초기 웹 기반 프로젝트 진행 중, UI와 로직이 뒤섞이면서 복잡도가 폭발해 버그 수정이 불가능한 수준에 이르렀습니다. 화려한 인터페이스보다는 **"돌아가는 로직"**이 우선이라는 교훈을 얻어, CLI 환경으로 회귀(Pivot)하였습니다.

**The Gap:**
기존의 부루마불/모두의마블 류 게임들은 '연출'에 치중하여 로직이 블랙박스화 되어 있습니다. 본 프로젝트는 **"데이터 수집의 용이성"**과 **"검증 가능한 로직"**을 최우선으로 하여, 시뮬레이션 및 교육용 도구로서의 가치를 창출합니다.

---

## Core Gameplay

### Game Pillars

1.  **Strict Compliance (엄격한 규칙 준수):**
    *   `ref.yaml` 및 원작 매뉴얼에 명시된 특수 타일(무인도, 우주여행, 사회복지기금) 및 예외 규칙을 타협 없이 100% 구현한다.
    *   *Decision Guideline:* 구현의 복잡함을 이유로 규칙을 단순화하지 않는다.

2.  **Determinism (결정론적 실행):**
    *   동일한 시드(Seed)와 입력값(Action)이 주어지면 언제나 완벽하게 동일한 게임 결과가 나와야 한다.
    *   *Decision Guideline:* `Math.random()` 사용 금지. 반드시 시드 기반 난수 생성기(PRNG)를 사용한다.

3.  **Agency in Crisis (위기 속의 선택권):**
    *   파산이나 강제 이동 등 위기 상황에서 자동 처리가 아닌, 플레이어에게 '어떻게 해결할 것인가'를 묻는다.
    *   *Decision Guideline:* 플레이어의 자산을 시스템이 임의로 처분하지 않는다.

**Pillar Prioritization:** Strict Compliance > Determinism > Agency in Crisis

### Core Gameplay Loop

1.  **Start Turn Phase:**
    *   이전 턴 효과 확인 (무인도 구속 여부, 우주여행 대기 상태 등 체크).
    *   상태에 따른 행동 제약 적용 (예: 무인도 탈출 실패 시 턴 즉시 종료).

2.  **Action Phase (Roll/Move):**
    *   주사위 굴리기 (더블 시 재행동 조건 체크).
    *   말 이동 및 도착 타일 판정.

3.  **Interaction Phase:**
    *   **일반 타일:** 구매 / 건설 / 통행료 지불.
    *   **특수 타일 (Strict Logic):**
        *   **출발지:** 월급 수령 처리.
        *   **무인도:** 3회 휴식 또는 더블 탈출/탈출권 사용 로직.
        *   **우주여행:** 도착 턴에는 행동 불가 -> '다음 턴'에 원하는 곳으로 이동(콜럼비아 호 규칙 적용).
        *   **사회복지기금:** 접수처에서 기부 -> 수령처에서 독식.
        *   **황금열쇠:** 카드 뽑기 및 즉시 효과/보관 효과 적용.

4.  **Crisis Management (Interrupt):**
    *   [통행료 지불 불가] 발생 시 -> **자산 매각 모드** 진입.
    *   건물/땅 매각하여 현금 확보 -> 지불 재시도 -> (실패 시) 파산 처리.

5.  **End Turn Phase:**
    *   턴 종료 선언 및 다음 플레이어에게 제어권 이양.

**Loop Variation:** 매 턴마다 플레이어의 자산 상황과 위치, 특수 타일 효과(우주여행/무인도)에 따라 가능한 행동의 가짓수가 달라짐.

### Win/Loss Conditions

#### Victory Conditions
*   **Last Man Standing:** 다른 모든 플레이어가 파산하고 최후의 1인으로 남았을 때 즉시 승리.

#### Failure Conditions
*   **Bankruptcy (파산):**
    *   타인에게 지불해야 할 금액(통행료 등)이 현재 보유한 '현금 + 매각 가능한 모든 자산 가치'보다 클 때.
    *   국가/은행에 세금을 낼 수 없을 때.

#### Failure Recovery
*   파산 확정 시 회복 불가능.
*   단, 파산 직전까지는 '건물 매각', '우대권 사용' 등을 통해 위기를 모면할 기회(Recovery Chance)가 주어짐.

---

## Game Mechanics

### Primary Mechanics

1.  **Dice Roll & Move (Action):**
    *   **Verb:** `Roll`
    *   **Logic:** 2d6 (주사위 2개) 굴림. 합만큼 이동.
    *   **Rule:** Double 시 한 번 더 행동 가능 (Double 3회 연속 시 즉시 무인도 이동 및 턴 종료).

2.  **Asset Acquisition (Interaction):**
    *   **Verb:** `Buy` / `Construct`
    *   **Logic:** 소유주 없는 땅 도착 시 구매 가능. 본인 땅 도착 시 건물(별장/빌딩/호텔) 건설 가능.
    *   **Rule:** 각 도시는 3단계 건설 가능(서울 제외).

3.  **Toll Payment & Bankruptcy (System):**
    *   **Verb:** `Pay` / `Liquidate`
    *   **Logic:** 타인 땅 도착 시 통행료 즉시 지불. 현금 부족 시 `Liquidate` 모드 진입하여 자산 매각(반값).
    *   **Rule:** 매각 후에도 지불 불가 시 즉시 파산.

4.  **Golden Key Logic (Event):**
    *   **Verb:** `Draw`
    *   **Logic:** 황금열쇠 칸 도착 시 카드 덱에서 최상단 카드 뽑기 및 효과 적용.
    *   **Types:** 즉시 이동, 강제 지불/수령, 보관용 카드(우대권/탈출권).

### Mechanic Interactions

*   **Move + Golden Key:** 이동 효과 카드로 인해 한 턴에 여러 번 이동할 수 있음 (예: 뒤로 3칸 -> 다시 해당 칸 효과 적용).
*   **Bankruptcy + Asset Transfer:** 파산 시 남은 자산이 채권자에게 넘어감. 채권자는 이를 즉시 소유하거나 현금화할 수 있음.

---

## Controls and Input

### Control Scheme (CLI / Keyboard)

| Context | Key Input | Description |
| :--- | :--- | :--- |
| **Main Action** | `Enter` / `Space` | 주사위 굴리기, 턴 넘기기 |
| **Menu Selection** | `1` ~ `9` | 행동 선택 (1. 구매, 2. 패스 등) |
| **Confirmation** | `y` / `n` | 예/아니오 질문 (우대권 사용하시겠습니까?) |
| **Debug/System** | `Ctrl+C` | 게임 강제 종료 |

### Input Feel

*   **Snappy:** 입력 즉시 결과 출력 (네트워크 딜레이 없음).
*   **Clear:** 현재 입력해야 할 정보가 무엇인지 명확한 프롬프트(Prompt) 제공.
    *   *Bad:* `Input?>`
    *   *Good:* `[Turn 1] Player A > Select Action (1. Roll, 2. Status): `

---

## Simulation Specific Design

### Core Simulation Systems

*   **Estate Market (부동산 시장):** 40개 타일로 구성된 폐쇄적 경제 시스템 내에서 한정된 토지 자원에 대한 선점 및 고도화(건설) 경쟁 시뮬레이션.
*   **Probability Distribution (확률 분포):** `2d6` (주사위 2개) 확률 분포에 기반한 이동 빈도 시뮬레이션. (7이 가장 많이 나오고, 2와 12가 가장 적게 나옴을 시스템적으로 검증 가능).
*   **Wealth Circulation (부의 순환):** `Player <-> Bank` 및 `Player <-> Player` 간의 Zero-Sum(또는 Negative-Sum, 세금 등으로 인한) 현금 흐름 추적.

### Management Mechanics

*   **Liquidity Management (유동성 관리):** 고정 자산(부동산)과 유동 자산(현금)의 비율 조절. 과도한 투자는 현금 흐름 경색(파산 위기)을 초래함.
*   **Risk Assessment:** 상대방 랜드마크 위치와 주사위 확률을 계산하여 건설/인수 등의 '투자' 결정.
*   **Asset Portfolio:** 저비용 고효율 타일(초반) vs 고비용 고수익 타일(후반) 전략 수립.

### Building and Construction

*   **Sequential Upgrade:** 대지 구매 -> 별장 -> 빌딩 -> 호텔 순서의 순차적 건설 (자금력에 따른 단계적 투자).
*   **Landmark Exception:** 서울 등 특수 지역은 건물 단계 없이 즉시 랜드마크 건설 (막대한 비용).
*   **Half-Price Rule:** 건설 비용은 구매가의 100%이나, 매각 시에는 50%만 회수됨 (감가상각 시뮬레이션).

### Economic and Resource Loops

*   **Income Sources:**
    *   **Salary:** 출발지 통과 시 급여 수령 (현금 공급).
    *   **Rent:** 타인 소유지 도착 시 임대료 수취.
    *   **Events:** 황금열쇠(복권 당첨, 우승 등).
*   **Expenses:**
    *   **Investment:** 토지 구매 및 건물 건설비.
    *   **Toll:** 타인 토지 도착 시 지불.
    *   **Tax/Donation:** 불우이웃 돕기, 세금 등 (시스템으로 현금 유출).

### Sandbox vs. Scenario

*   **Standard Match:** 오리지널 룰 기반의 4인 FFA (Free For All).
*   **Stress Test Mode (Sandbox):** 봇 4명을 투입하여 10,000턴 이상의 초고속 시뮬레이션 수행 (밸런스 데이터 수집용).
*   **Replay Scenario:** 특정 Seed를 입력하여 과거의 게임 양상을 정확히 재현 및 분석.

---

## Progression and Balance

### Player Progression

**Session-Based Growth (Match Progression Only)**
본 게임은 매 판이 완료되면 모든 진행 상황이 초기화되는 **독립적인 세션(Independent Session)** 구조를 가집니다. 플레이어의 성장은 '계정 레벨업'이 아닌, 게임 내에서의 '경제적 스케일링'으로 표현됩니다.

#### Progression Pacing
*   **Early Game (Turn 1~5):** 토지 선점 단계. 현금이 넘치고 통행료 부담이 적음.
*   **Mid Game (Turn 6~15):** 건물 건설 및 현금 고갈 단계. 통행료가 수십만 원 단위로 상승하며 유동성 위기가 시작됨.
*   **Late Game (Turn 16+):** 랜드마크 확보 및 파산 단계. 통행료가 수백만 원 단위로 폭등하여, 한 번의 실수가 즉시 패배로 직결됨.

### Difficulty Curve

**Exponential Increase (기하급수적 난이도)**
시간이 지날수록(턴이 반복될수록) 게임판 위의 위험도(Risk)가 기하급수적으로 증가합니다.
*   초반: 주사위를 굴리는 것이 즐거운 탐험.
*   후반: 주사위를 굴리는 것 자체가 공포(Survival Horror).
*   **Pacing:** 건설 비용 대비 통행료 수익률이 높아지면서, 후반부로 갈수록 자산 격차가 벌어지는 속도가 빨라짐 (Rich-Get-Richer).

### Economy and Resources

#### Resources
1.  **Cash (현금):** 유동성 자산. 통행료 지불 및 건설의 원천.
2.  **Real Estate (부동산):** 고정 자산. 수익 창출 수단이나, 현금화 시 50% 손실 발생(비유동성 리스크).
3.  **Special Cards:** 우대권(방어권), 무인도 탈출권(시간 절약권).

#### Economy Flow
*   **Initial:** 모든 플레이어에게 균등한 초기 자금(씨앗은행 기준 약 300~500만 원, 룰에 따라 조정) 지급.
*   **In-Flow:** 월급(은행 -> 플레이어), 황금열쇠 상금.
*   **Circulation:** 통행료 (플레이어 -> 플레이어).
*   **Out-Flow (Sink):** 건설비, 세금, 기부금 (플레이어 -> 은행/시스템).
*   **Deflationary Pressure:** 건설 및 반값 매각으로 인해 시스템 전체의 현금 총량은 점차 감소하며, 이는 게임 종료(파산)를 가속화하는 요인으로 작용함.

---

## Level Design Framework

### Structure Type

**Single Cyclic Loop (단일 순환 루프)**
40개의 타일이 사각형으로 배치되어 무한히 순환하는 구조. 별도의 스테이지나 레벨은 존재하지 않으며, 단 하나의 통합된 맵(The Board)에서 모든 플레이가 이루어짐.

### Tile Types (Game Board Layout)

맵은 총 40칸으로 구성되며, 각 타일은 고유한 기능을 가짐.

1.  **Corner Tiles (4개):**
    *   **Start (출발):** 월급 수령 자격 부여.
    *   **Island (무인도):** 3턴간 행동 불능 (탈출 조건 존재).
    *   **Donation (접수처):** 사회복지기금 기부.
    *   **Space Travel (우주여행):** 다음 턴에 원하는 칸으로 이동.
2.  **City Tiles (22개):** 일반적인 대지. 구매 및 건물(별장/빌딩/호텔) 건설 가능.
3.  **Tourism Tiles (6개):** 관광지 (제주도, 콩코드 등). 건물 건설 불가, 통행료 즉시 징수.
4.  **Special Tiles:**
    *   **Gold Key (6개):** 황금열쇠 카드 뽑기.
    *   **Fund (수령처):** 사회복지기금 독식.

### Level Progression

**Positional Value Increase (위치 가치 상승)**
출발지에서 멀어질수록(시계 방향 진행) 타일의 구매가와 통행료가 상승하도록 설계됨.
*   **Line 1 (하단):** 저가형 아시아 지역 (초반 선점용).
*   **Line 2 (좌측):** 중저가형 유럽/중동 지역.
*   **Line 3 (상단):** 중고가형 아메리카/북유럽 지역.
*   **Line 4 (우측):** 초고가형 랜드마크 지역 (서울 등).

### Level Design Principles

*   **Color Coding:** CLI 환경에서도 각 도시가 속한 라인(Line)이나 그룹을 텍스트 색상(ANSI Color)으로 구분하여 시인성 확보.
*   **Clear Information:** 타일 도착 시 '소유주', '현재 통행료', '건설 상태'가 한눈에 들어오도록 텍스트 레이아웃 최적화.

---

## Art and Audio Direction

### Art Style

**Minimalist Terminal Dashboard (TUI)**
복잡한 아스키 아트(ASCII Art)를 지양하고, 정보 전달에 최적화된 깔끔한 텍스트 대시보드 스타일을 추구합니다. 리눅스의 `htop`이나 모던한 CLI 도구(예: `lazygit`, `yarn`)의 UI 감성을 벤치마킹합니다.

#### Color Palette (ANSI Colors)
시스템 메시지와 게임 상태를 명확히 구분하기 위해 표준 ANSI 컬러를 전략적으로 사용합니다.
*   **System/Info:** `Cyan` (알림), `Green` (성공/획득), `Red` (오류/지불).
*   **Player 1:** `Blue` Background / White Text.
*   **Player 2:** `Red` Background / White Text.
*   **Landmarks:** `Yellow` / `Gold` Text.

#### Visual References
*   **Reference 1:** `htop` (명확한 구획 나누기, 게이지 바 표현).
*   **Reference 2:** `MUD Games` (텍스트 기반 상황 묘사).

---

## Technical Specifications

### Technical Stack

*   **Language:** TypeScript (Strict Mode required).
*   **Runtime:** Node.js (v18+ LTS).
*   **Test Framework:** `Vitest` (Fast execution & ESM support).
*   **State Management:** Redux (Library directly used).
*   **CLI UX Libraries:** `chalk` (Color), `inquirer` (Interactive Menu).

### Performance Requirements

*   **Startup Time:** 500ms 이내 즉시 실행 (Instant Boot).
*   **Simulation Throughput:** `Headless Mode` (봇 대전) 실행 시 초당 1,000턴 이상의 로직 연산 처리 가능 (Data Collection).
*   **Resource Usage:** 메모리 100MB 이하 유지 (가벼운 실행 환경).

### Platform-Specific Details

#### Node.js CLI Environment
*   **Compatibility:** Windows, macOS, Linux 터미널 환경 모두 지원.
*   **Module System:** ESM (ECMAScript Modules) 기반 프로젝트 구조 자향.

### Asset Requirements

*   **No Binary Assets:** 이미지, 사운드 파일 등 바이너리 에셋 없음.
*   **Data Driven:** 모든 게임 데이터(카드, 건물 가격, 확률표)는 `JSON` 또는 `YAML` 파일로 관리되거나 코드 내 상수(Constant)로 정의됨.

### Technical Constraints

*   **Zero 'Any' Policy:** TypeScript의 `any` 타입 사용을 원칙적으로 금지하며, 모든 외부 입력(Input)에 대한 런타임 검증(Zod 등 활용 고려) 수행.
*   **Pure Logic Isolation:** `GameCore` 모듈은 어떠한 Node.js 내장 모듈(fs, process 등)에도 의존하지 않아야 함 (추후 브라우저 이식성 보장).

---

## Development Epics

### Epic Structure

## Development Epics

### Epic Overview

| # | Epic Name | Scope | Dependencies | Est. Stories |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **The Core Loop** | Dice, Move, Board Setup, Land Purchase | None | 5 |
| **2** | **Economic Interaction** | Construction, Toll, Bankruptcy, Liquidation | Epic 1 | 6 |
| **3** | **Special Rules** | Golden Key, Space, Island, Donation | Epic 2 | 8 |
| **4** | **CLI UX Polish** | Dashboard UI, Colors, Interactive Prompts | Epic 1, 2, 3 | 4 |

### Recommended Sequence

**Logic First, UI Last:**
복잡한 파산/승계 로직의 무결성을 먼저 확보하기 위해(Epic 1~2), UI 작업을 최대한 미룹니다. 로직이 100% 검증된 후에 예외 규칙(Epic 3)을 얹고, 마지막으로 사용성을 개선(Epic 4)하는 순서를 따릅니다.

### Vertical Slice

**The First Playable Milestone (End of Epic 1):**
*   40칸의 맵 데이터가 로드되고, 플레이어가 주사위를 굴려 이동하며, 빈 땅을 구매하여 자신의 소유로 만드는 로그가 출력되는 상태.
*   *Note:* 돈 계산이나 파산은 아직 없지만, "이동하고 구매한다"는 핵심 경험은 확인 가능해야 함.

---

## Success Metrics

### Technical Metrics

본 프로젝트는 '로직의 무결성'을 최우선으로 하므로, 기술적 지표가 곧 프로젝트 성공 지표가 됩니다.

#### Key Technical KPIs

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Test Coverage** | **100% (Line/Branch)** | Vitest Coverage Report (Core Logic Module only) |
| **Stability** | **0 Crashes** | 1,000 Consecutive Bot Matches (Headless Simulation) |
| **Throughput** | **> 1,000 TPS** | Bot Match Turns Per Second (M1 Mac Benchmark) |

### Gameplay Metrics

#### Key Gameplay KPIs

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Rule Compliance** | **100%** | 모든 특수 규칙(무인도, 우주, 파산 등)에 대한 E2E Test Case 통과 |
| **Win/Loss Ratio** | **Balanced** | 4인 봇(Random Action) 대전 1,000회 시 승률 편차 5% 이내 확인 (Position Balance) |

### Qualitative Success Criteria

1.  **Readability:** 로그만 보고도 "아, 여기서 3번 플레이어가 서울에 걸려서 파산했구나"를 즉시 파악할 수 있어야 함.
2.  **Scalability:** 추후 React 프론트엔드를 붙일 때, CLI 코드를 단 한 줄도 수정하지 않고 그대로 `import` 해서 쓸 수 있어야 함.

---

## Out of Scope

### Features
*   **Networking:** 소켓 통신을 이용한 실시간 멀티플레이 (v2.0 예정). v1.0은 로컬 1인용(Bot 대전) 및 Hot-Seat 방식만 지원.
*   **Save/Load:** 게임 중간 저장 기능 배제 (로그 시뮬레이션 기반이므로 게임 호흡이 매우 짧음).
*   **Graphical GUI:** 웹 브라우저나 그래픽 라이브러리를 사용한 UI 배제 (Strict CLI only).
*   **Sound/BGM:** 오디오 기능 전면 배제.

### Deferred to Post-Launch
*   **Web Port:** 핵심 로직(`GameCore`)의 안정성이 확보된 후, React 기반 웹 프론트엔드 연동 진행 (Phase 2).
*   **Mobile App:** 웹 포팅 완료 후 고려.

---

## Assumptions and Dependencies

### Key Assumptions
*   **Node.js Runtime:** 사용자는 Node.js 18 이상이 설치된 환경에서 실행한다고 가정.
*   **Terminal Environment:** ANSI Color 코드를 지원하는 표준 터미널(iTerm2, VSCode Terminal, Windows Terminal 등) 사용.

### External Dependencies
*   **Dev Dependencies:** `Vitest` (Test), `ESLint` (Lint), `Prettier` (Format).
*   **Runtime Dependencies:**
    *   `chalk` (UI Color).
    *   `inquirer` (User Input).
    *   `redux` (State Management, optional but recommended design pattern).

### Risk Factors
*   **Complexity of Exceptions:** 우주여행, 무인도 등 예외 규칙이 얽힐 때 발생하는 버그 (E2E 테스트로 해결 예정).
*   **Performance:** 봇 시뮬레이션 시 메모리 누수 가능성 (Strict Type 및 객체 재사용으로 관리).

---

## Document Information

**Document:** BlueMarble-CLI - Game Design Document
**Version:** 1.0
**Created:** 2026-01-14
**Author:** User
**Status:** Complete

### Change Log

| Version | Date | Changes |
| :--- | :--- | :--- |
| **1.0** | 2026-01-14 | Initial GDD completed (Steps 1-14) |
