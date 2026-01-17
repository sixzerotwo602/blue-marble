---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  [
    'e:\github_coop\blue-marble\_bmad-output\analysis\brainstorming-session-2026-01-17.md',
  ]
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 0
workflowType: "gdd"
lastStep: 0
project_name: "bmad"
user_name: "sungsu"
date: "2026-01-17"
game_type: "strategy"
game_name: "Blue Marble"
---

# Blue Marble - Game Design Document

**Author:** {{user_name}}
**Game Type:** Strategy
**Target Platform(s):** Cross-Platform (Web & Mobile)

---

## Executive Summary

### Core Concept

**Blue Marble**은 1980년대 대한민국의 전설적인 보드게임 '부루마블'을 디지털로 완벽하게 이식한 **턴제 전략 보드게임**입니다. 플레이어는 주사위를 굴려 전 세계를 여행하며 도시를 구매하고, 건물을 짓고, 통행료를 징수하여 경제적 우위를 점해야 합니다. 운(Luck) 요소와 더불어 자금 관리, 경매 입찰, 건설 타이밍 등 고도의 전략적 판단이 요구됩니다.

이 프로젝트의 핵심 목표는 모노폴리 류의 파생 게임이 아닌, **원작의 고유한 규칙과 메커니즘을 엄격하게 구현**하는 것입니다. 전반전의 빠른 토지 확보 경쟁, 6개 땅이 남았을 때 발동하는 긴장감 넘치는 **경매 시스템**, 그리고 후반전의 전략적 **건물을 짓는 단계**로 이어지는 3단계 페이즈 시스템을 충실히 재현합니다. 또한 우주여행(20만원 지불 후 즉시 이동), 무인도(3턴 고립), 황금열쇠 등 원작의 아이코닉한 요소들을 디지털 환경에 맞게 최적화합니다.

**Type:** 전략 (Strategy)
**Framework:** 이 GDD는 **자원 관리, 맵 장악, 승리 조건**에 초점을 맞춘 **전략(Strategy)** 템플릿을 기반으로 하며, 다수가 함께 즐기는 **파티 게임(Party Game)**의 요소를 적극 반영합니다.

### Target Audience

### Target Platform(s)

**Primary Platform:** Cross-Platform (Web & Mobile)

- **Web:** 설치 없이 브라우저로 바로 접속하여 즐기는 접근성 (PC/Tablet).
- **Mobile:** iOS/Android 환경에서 터치 인터페이스로 간편하게 플레이.

**Platform Considerations:**

- **반응형 UI:** PC의 가로 넓은 화면과 모바일의 세로 화면에 모두 최적화된 레이아웃.
- **동기화:** 계정 연동을 통해 기기를 넘나드는 끊김 없는 플레이 경험 제공.

**Control Scheme:**

- **Touch & Click:** 복잡한 조작 없이 단순한 탭(모바일)과 클릭(PC)만으로 주사위 굴리기, 구매, 건설 등 모든 액션 수행.

### Target Audience

**Demographics:**

- **핵심 타겟:** 3040 '올드비' (향수 자극), 가족 단위 플레이어 (교육/건전함), 경제/부동산 테마 선호층.
- **연령:** 전연령가 (Everyone).

**Gaming Experience:**

- **접근성:** 룰이 직관적이라 남녀노소 누구나 쉽게 시작 가능.
- **깊이:** 단순 이동을 넘어선 자산 관리와 확률 계산이 필요한 "Easy to learn, Hard to master".

**Player Motivations:**

- **향수 (Nostalgia):** 어릴 적 즐기던 부루마블의 감성을 현대적으로 다시 경험.
- **대리 만족:** 전 세계 도시를 소유하고 건물을 짓는 부동산 재벌의 쾌감.
- **소통 (Social):** 가족, 친구들과 함께 웃고 떠들며 즐기는 파티 게임의 재미.

### Unique Selling Points (USPs)

1.  **The Authentic Original:** 시중에 없는 '경매 시스템(6 land rule)'과 '우주여행(즉시 이동)' 등 원작의 디테일한 룰을 완벽하게 살린 유일한 디지털 버전입니다.
2.  **No P2W, Just Strategy:** 승패를 가르는 것은 지갑의 두께가 아닌, 당신의 **협상 능력**과 **투자 감각**, 그리고 약간의 **운**뿐입니다.
3.  **Zero-Friction Multiplayer:** 링크 하나로 초대하고, 1초 만에 접속합니다. 다운로드는 필요 없습니다.

### Competitive Positioning

기존 '모두의 마블' 류 게임이 화려한 이펙트와 캐릭터 수집에 집중한다면, **Blue Marble**은 **"보드게임 본연의 클래식함과 웹 기반의 가벼움"**으로 승부합니다. 복잡한 설치나 학습 없이 친구들과 바로 즐길 수 있는 **'디지털 파티 게임의 표준'**을 지향합니다.

---

## Goals and Context

### Project Goals

### Project Goals

1.  **Perfect Originality (완벽한 원작 구현):** 부루마블 클래식 규칙(경매, 우주여행, 무인도 등)을 디지털 환경에서 오차 없이 100% 구현합니다.
2.  **High Accessibility (높은 접근성):** 별도 설치 없이 웹 브라우저 하나로 PC와 모바일 어디서든 친구들과 즉시 플레이할 수 있는 환경을 제공합니다.
3.  **Pure Fair Play (공정한 경쟁):** 현대 모바일 게임의 P2W(Pay to Win) 요소나 캐릭터 스킬을 배제하고, 오직 주사위 운과 전략적 판단만으로 승부하는 환경을 조성합니다.
4.  **Modern Retro (세련된 복고):** 80년대 원작의 향수를 자극하는 아트 스타일을 유지하되, UX/UI는 현대적인 감각으로 재해석하여 불편함을 없앱니다.

### Background and Rationale

**"왜 지금 부루마블인가?"**
현재 시장의 보드게임들은 복잡한 파생 규칙과 과도한 과금 유도(캐릭터 뽑기, 주사위 컨트롤 등)로 인해 '순수한 보드게임의 재미'를 잃어가고 있습니다. 3040 세대에게는 어릴 적 추억을, 1020 세대에게는 근본적인 전략 게임의 재미를 전달하기 위해, **가장 클래식하고 공정한 부루마블**을 디지털로 부활시키고자 합니다.

---

## Core Gameplay

### Game Pillars

### Game Pillars

1.  **Strategic Management (전략적 관리):** 단순한 운 싸움이 아닌, 제한된 자금으로 언제 땅을 사고 건물을 지을지 결정하는 경제 전략이 승패를 가릅니다.
2.  **Calculated Risk (계산된 모험):** 언제 무리해서 투자할지, 언제 자금을 아낄지 확률(주사위, 황금열쇠)과 리스크를 계산하여 판단해야 합니다.
3.  **Social Tension (사회적 긴장감):** 경매 입찰과 통행료 지불 과정에서 발생하는 플레이어 간의 심리전과 상호작용이 게임의 핵심 재미입니다.

**Pillar Prioritization:** Social Tension > Strategic Management > Calculated Risk (플레이어 간 상호작용이 가장 우선시됩니다.)

### Core Gameplay Loop

플레이어는 자신의 턴에 주사위를 굴려 말판을 이동하고, 도착한 칸의 상태에 따라 경제적 결정을 내립니다. 게임 초반에는 빠른 선점으로 땅을 확보하고, 중반부 경매를 통해 독점을 노리며, 후반부에는 건물을 지어 수익을 극대화합니다. 이 과정에서 파산 위기를 넘기고 상대방을 파산시키는 것이 목표입니다.

**Loop Diagram:**
`Turn Start` -> `Roll Dice` -> `Move Token` -> `Check Tile Status` -> `Action (Buy/Build/Pay/Event)` -> `Turn End`

**Loop Timing:** 턴당 약 30~60초

**Loop Variation:**

- **Phase Shift:** 전반전(구매 중심) -> 경매(입찰 중심) -> 후반전(건설 중심)으로 페이즈가 바뀌며 플레이 양상이 변화합니다.
- **Board Evolution:** 빈 땅이 줄어들고 건물이 올라갈수록 통행료가 기하급수적으로 늘어나 긴장감이 고조됩니다.

### Win/Loss Conditions

#### Victory Conditions

1.  **Last Man Standing:** 다른 모든 플레이어가 파산하고 혼자 남았을 때 즉시 승리합니다.
2.  **Asset Victory:** 제한 시간(옵션) 종료 시, 총 자산(현금 + 부동산 가치)이 가장 높은 플레이어가 승리합니다.

#### Failure Conditions

- **Bankruptcy (파산):** 다른 플레이어나 은행에 지불해야 할 금액(통행료, 벌금)보다 현재 보유한 자산(현금 + 처분 가능 부동산)이 적을 경우 패배합니다.

#### Failure Recovery

- **Permadeath:** 파산한 플레이어는 해당 게임 세션에서 즉시 탈락하며, 부활할 수 없습니다. (관전 모드로 전환)

---

## Game Mechanics

### Primary Mechanics

1.  **Movement (이동):** 주사위 2개를 굴려 나온 합계만큼 이동합니다. 더블이 나오면 한 번 더 행동할 수 있으며, 3연속 더블 시 즉시 무인도에 갇힙니다.
2.  **Acquisition (획득):**
    - **General:** 주인이 없는 땅에 도착하면 구매할 수 있습니다.
    - **Auction (경매):** 주인이 없는 땅이 6개 남았을 때 강제 발동되어, 남은 땅들을 경매로 판매합니다.
3.  **Construction (건설):** 후반전 페이즈부터는 자기 땅에 도착할 때마다 건물(별장/빌딩/호텔)을 건설하여 가치를 높일 수 있습니다.
4.  **Economy (경제):** 남의 땅에 도착하면 통행료를 지불하고, 자금이 부족하면 건물을 헐거나 땅을 반값에 매각해야 합니다.
5.  **Special Actions (특수 행동):**
    - **Space Travel (우주여행):** 비용(20만원)을 내고 원하는 칸으로 즉시 이동합니다.
    - **Desert Island (무인도):** 3턴 동안 갇히지만, 더블이 나오면 즉시 탈출합니다. 갇혀 있는 동안도 임대료는 받을 수 있습니다.
    - **Social Welfare (사회복지기금):** 기부처(38번)에 도착하면 기금을 내고, 접수처(20번)에 도착하면 쌓인 기금을 모두 가져갑니다.

### Mechanic Interactions

- **Money + Movement:** 돈을 지불하여 이동 규칙을 무시하고 원하는 곳으로 갑니다(우주여행).
- **Dice + Economy:** 주사위 운(더블 탈출)이 경제적 손실(무인도 고립)을 방어하거나 기회(임대료 수입 유지)를 제공합니다.

### Mechanic Progression

- **Phase Mechanics:** 게임은 `Expansion(단순 구매)` -> `Auction(입찰 경쟁)` -> `Development(건설 및 파산 유도)` 단계로 진행되며, 각 단계마다 플레이어가 집중해야 할 메카닉이 변화합니다.

### Controls and Input

### Control Scheme (Cross-Platform)

| Action        | Input (Shared) | Description                               |
| :------------ | :------------- | :---------------------------------------- |
| **Roll Dice** | Tap / Click    | 주사위 버튼을 눌러 굴립니다.              |
| **Map View**  | Drag / Swipe   | 보드판을 자유롭게 둘러봅니다.             |
| **Select**    | Tap / Click    | 구매, 건설, 매각 등 UI 버튼을 선택합니다. |
| **Zoom**      | Pinch / Wheel  | 맵을 확대하거나 축소합니다.               |

### Input Feel

- **Response:** 버튼 클릭 시 즉각적인 시각/청각 피드백(Effect)을 주어 '손맛'을 살립니다.
- **Dice Physics:** 주사위가 구르는 물리적인 느낌을 고퀄리티 애니메이션으로 구현하여 긴장감을 줍니다.

### Accessibility Controls

- **One-Finger Play:** 모든 조작을 한 손가락(또는 마우스)만으로 가능하게 하여 접근성을 극대화합니다.
- **Color Blind Mode:** 색약 유저를 위해 토지 색상 외에 패턴이나 아이콘으로 소유권을 구분할 수 있게 지원합니다.

---

## Strategy Specific Design

### Resource Systems (자원 및 경제)

- **Initial Funds (초기 자금):**
  - **2인 플레이:** 5,860,000원
  - **3~4인 플레이:** 2,930,000원
- **Liquidation Priority (유동성 확보):** 현금이 부족할 경우 다음 순서로 자산을 처분합니다.
  1.  **Cash:** 보유 현금 우선 차감
  2.  **Building (건물 매각):**
      - **Refund:** 건설비의 100% 환급.
      - **Visual Logic:** **매각 즉시 해당 건물은 지도 상에서 시각적으로 제거**됨으로써(건설 전 상태로 복구) 자산 감소를 직관적으로 보여줍니다.
  3.  **Land (토지 매각):** 토지 구매가의 50% 환급. (소유권 은행 귀속)

### Tech & Progression (건설 및 발전)

- **Construction Freedom (자유 건설):** 단계적 업그레이드(별장->빌딩->호텔)를 따를 필요가 없습니다. 자금만 충분하다면, 해당 토지의 **최대 건설 가능 개수(예: 별장 2, 빌딩 1, 호텔 1)** 내에서 원하는 만큼 즉시 건설할 수 있습니다.
- **Constraints:**
  - **Physical Presence:** 플레이어의 말이 해당 토지에 위치해야만 건설/증축이 가능합니다.
  - **Phase Lock:** '건설' 행위는 오직 **후반전(Development Phase)**에만 해금됩니다.

### Map & Terrain (맵 및 지형)

- **Layout:** 기본적으로 `specs/001-core-game-engine/contracts/board-data.ts`의 40칸 구성을 따릅니다.
- **Social Welfare (사회복지기금):**
  - **Tile 38 (기부처):** 도착 시 기금 납부.
  - **Tile 20 (접수처):** 도착 시 적립된 기금 모두 수령. (Brainstorming 반영)
- **Interaction:** 타인 소유 땅에 도착 시 통행료 지불 외 별도의 상호작용은 없습니다.

### AI Opponent (인공지능)

- **Fairness:** AI는 주사위 확률을 절대 조작하지 않으며, 오직 판단 로직만으로 플레이합니다.
- **Personalities:**
  - **Aggressive (독점형):** 자금이 부족해도 무리해서 땅을 매입하고 랜드마크 건설을 지향.
  - **Safe (안전형):** 파산 위험을 최소화하며 저렴한 땅 위주로 방어적 운영.
  - **Random:** 예측 불가능한 패턴으로 행동.

---

## Progression and Balance

### Player Progression

### Player Progression

**Session Progression (인게임 성장):**
플레이어는 매 게임마다 0원에서 시작하여, '토지 확보 -> 건물 건설 -> 임대료 수익 증대'의 과정을 통해 자산을 불려나갑니다. 게임 후반으로 갈수록 보유 자산의 가치가 기하급수적으로 증가합니다.

**Meta Progression (메타 성장):**

- **Ranking System:** 승패와 자산 획득량에 따라 MMR/Elo 등급이 변동되는 경쟁 시스템을 도입합니다.
- **Cosmetics (No P2W):** 게임 밸런스에 영향을 주지 않는 주사위 스킨, 말(Token) 스킨, 이모티콘 같은 꾸미기 요소만 제공합니다.

### Difficulty Curve

**Phase-based Escalation (J-Curve):**

1.  **Expansion (전반):** 자금 여유가 있고 빈 땅이 많아 난이도가 낮고 평화롭습니다.
2.  **Auction (중반):** 땅이 줄어들며 입찰 경쟁이 시작되고 자금 압박이 생깁니다.
3.  **Development (후반):** 건물이 올라가며 통행료가 급증합니다. 한 번의 주사위 실수로 파산할 수 있는 높은 긴장 상태가 유지됩니다.

### Economy and Resources

**Currency:** 원(KRW). (초기 자금: 2인 586만 / 4인 293만)
**Inflation & Deflation:**

- **Inflation:** 월급(20만)과 황금열쇠 보너스로 시장에 돈이 풀립니다.
- **Deflation:** 건물 건설비와 무인도/우주여행/사회복지기금 비용으로 자금이 회수됩니다.
- **Transfers:** 플레이어 간의 통행료 거래는 제로섬(Zero-sum)이지만, 파산 시 자산이 반값에 은행에 매각되므로 전체 자산 가치는 급격히 하락합니다.

---

## Level Design Framework

### Level Types

### Level Types

**Single Loop Board:**
게임은 `specs/001-core-game-engine/contracts/board-data.ts`에 정의된 **40칸 클래식 보드** 단 하나로 구성됩니다. 별도의 맵 변형이나 스테이지 구분은 없습니다.

### Level Progression

**Infinite Loop:**
모든 플레이어는 `Start` 지점에서 시작하여 주사위 눈만큼 시계 방향으로 무한히 순환합니다. 맵 자체가 변하거나 확장되지 않으며, 오직 플레이어들의 건물 건설 현황만이 보드의 시각적 풍경을 변화시킵니다.

#### Tutorial Integration

- **MVP Exempt:** 현재 버전(MVP)에서는 별도의 튜토리얼 모드를 구현하지 않습니다. (플레이어는 게임을 하며 규칙을 익히거나 외부 가이드를 참고합니다.)

---

## Art and Audio Direction

### Art Style

### Art Style

**To Be Defined:**
현재 단계에서는 아트 스타일을 확정하지 않았습니다. 추후 프로토타입 단계에서 구체화할 예정입니다.

### Audio and Music

**To Be Defined:**
오디오 및 음악 방향성은 추후 결정합니다.

---

## Technical Specifications

### Performance Requirements

{{performance_requirements}}

### Platform-Specific Details

### Asset Requirements

{{asset_requirements}}

---

## Development Epics

### Epic Structure

### Epic Overview

| #   | Epic Name                       | Scope                             | Dependencies | Est. Stories |
| --- | ------------------------------- | --------------------------------- | ------------ | ------------ |
| 1   | **Core Skeleton (Engine)**      | 게임 루프, 이동, 보드 데이터 로드 | None         | 5            |
| 2   | **Basic Economy (Trade)**       | 토지 구매, 통행료, 파산           | Epic 1       | 6            |
| 3   | **Advanced Rules (Game Logic)** | 경매, 건설(후반전), 특수 지역     | Epic 2       | 7            |
| 4   | **Single Player (AI)**          | AI 플레이어 로직                  | Epic 3       | 4            |
| 5   | **Polish (UX/FX)**              | 애니메이션, 사운드, 연출          | Epic 4       | 5            |

### Recommended Sequence

1. **Skeleton First (Epic 1):** 이동이 불가능하면 게임 성립 불가. 물리적 기반부터 완성합니다.
2. **Logic Integration (Epic 2, 3):** 보드게임의 핵심 규칙을 순차적으로 구현하여 논리적 완결성을 확보합니다.
3. **AI & Polish (Epic 4, 5):** 기능 구현 후 사용자 경험(UX)과 콘텐츠(AI)를 채워 넣습니다.

### Vertical Slice

**The Core Loop:** Epic 2 (Basic Economy) 단계에서 이미 "이동 -> 구매 -> 통행료 -> 파산"의 완전한 승패 사이클을 경험할 수 있습니다. 이것이 이 게임의 Vertical Slice입니다.

---

## Success Metrics

### Technical Metrics

### Technical Metrics

- **Rule Integrity (규칙 정합성):**
  - **Rule Coverage:** `spec.md` 및 `epics.md`에 정의된 모든 핵심 규칙(이동, 구매, 통행료, 매각, 파산, 특수지역)의 구현율 100%.
  - **Logic Stability:** 복합 상황(예: 파산 시 자산 경매 처리, 무인도에서의 더블 탈출 등)에서 로직 오류 0건.

### Gameplay Metrics

- **Flow Verification (흐름 검증):**
  - **Complete Loop:** 게임 시작부터 승자 결정까지 끊김(Crash/Stuck) 없이 진행되는가.
  - **Economic Accuracy:** 자금의 흐름(지급/지출/교환/파산)이 1원 단위 오차 없이 정확하게 계산되는가.
  - **Bankruptcy Logic:** 파산 조건 충족 시 게임이 즉시 종료되거나 해당 플레이어가 정확히 탈락 처리되는가.

### Qualitative Success Criteria

1. **"It's Blue Marble":** 플레이어가 원작 보드게임의 규칙을 그대로 느끼고, 위화감을 느끼지 않아야 합니다.
2. **"Fair Play":** 주사위 확률이나 AI의 행동이 공정하다고 느껴야 합니다. (억지스러운 상황 연출 금지)

---

## Out of Scope

### Included but Limited

- **Multiplayer:** 실시간 온라인 멀티플레이는 v1.0에서 제외하며, **Local Multiplayer (한 기기로 함께 하기)** 및 **Single vs AI** 모드에 집중합니다.

### Explicitly Excluded

- **Platform:** 콘솔(PlayStation, Xbox, Switch) 및 VR 버전.
- **Content:** 추가 맵 테마, 스토리 모드, 캐릭터 커스터마이징.
- **Microtransactions:** 인앱 결제(IAP) 및 광고 시스템.

### Deferred to Post-Launch

- **Online Multiplayer:** 서버 기반의 실시간 매칭 시스템.
- **Ranking System:** 글로벌 리더보드 및 티어 시스템.
- **Social Features:** 친구 추가, 채팅, 이모티콘 상점.

---

## Assumptions and Dependencies

### Key Assumptions

- **Technical:** 타겟 모바일 웹 브라우저에서도 3D 주사위 물리 엔진(Three.js/Matter.js 등)이 60fps로 구동 가능할 것이다.
- **Legal:** 본 프로젝트는 원작 '부루마블'의 팬 게임(비영리) 성격이거나, 저작권 이슈가 해결된 상태라고 가정한다.

### External Dependencies

- **Asset Library:** 고품질 2D/3D 무료 에셋 또는 유료 에셋 스토어 의존 가능성.
- **Device Support:** WebGL 2.0을 지원하는 모바일 브라우저.

### Risk Factors

- **Performance Risk:** 저사양 모바일 기기에서 3D 렌더링 발열/배터리 소모 이슈.
- **Scope Creep:** '특수 규칙' 구현 중 예외 케이스가 늘어나 개발 일정이 지연될 위험.

---

## Document Information

**Document:** Blue Marble - Game Design Document
**Version:** 1.0 (Draft)
**Created:** 2026-01-17
**Author:** User & AI Collaborator
**Status:** Complete

### Change Log

| Version | Date       | Changes                                 |
| ------- | ---------- | --------------------------------------- |
| 1.0     | 2026-01-17 | Initial GDD generated via BMAD Workflow |
