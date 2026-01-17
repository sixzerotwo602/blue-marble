# Blue Marble - Development Epics

## Epic Overview

| #   | Epic Name                       | Scope                             | Dependencies | Est. Stories |
| --- | ------------------------------- | --------------------------------- | ------------ | ------------ |
| 1   | **Core Skeleton (Engine)**      | 게임 루프, 이동, 보드 데이터 로드 | None         | 5            |
| 2   | **Basic Economy (Trade)**       | 토지 구매, 통행료, 파산           | Epic 1       | 6            |
| 3   | **Advanced Rules (Game Logic)** | 경매, 건설(후반전), 특수 지역     | Epic 2       | 7            |
| 4   | **Single Player (AI)**          | AI 플레이어 로직                  | Epic 3       | 4            |
| 5   | **Polish (UX/FX)**              | 애니메이션, 사운드, 연출          | Epic 4       | 5            |

---

## Epic 1: Core Skeleton (Engine)

### Goal

게임의 물리적/논리적 기반을 구축하여, '순서대로 주사위를 굴리고 말이 이동하는' 기본 루프를 완성합니다.

### Scope

**Includes:**

- 프로젝트 세팅 및 보드 데이터(`board-data.ts`) 렌더링.
- 주사위 굴리기 로직 (랜덤, 더블 처리).
- 플레이어 턴 관리 (FSM: Turn Start -> Roll -> Move -> End).
- 말(Token) 이동 애니메이션 및 위치 동기화.

**Excludes:**

- 돈 계산, 토지 구매, 건물 건설, 특수 지역 효과.

### Dependencies

- None

### Deliverable

- 40칸 보드 위에서 주사위를 굴려 말을 이동시키고, 턴을 넘기는 것이 가능한 빌드.

### Stories

- As a player, I can see the 40-tile board layout.
- As a player, I can click a button to roll two dice and see the result.
- As a player, I can see my token move to the correct tile based on the dice sum.
- As a system, I enforce double rules (roll again) and turn order.
- As a system, I track which tile each player is currently on.

---

## Epic 2: Basic Economy (Trade)

### Goal

'자산'과 '화폐'의 개념을 도입하여 가장 기본적인 토지 거래와 경제 활동이 가능하게 합니다.

### Scope

**Includes:**

- 초기 자금 지급 및 UI 표시.
- 빈 땅 도착 시 구매 팝업 및 처리.
- 타인 땅 도착 시 통행료 자동 지불.
- 자금 부족 시 파산(게임 오버) 처리(단순 버전).

**Excludes:**

- 경매, 건물 건설, 매각, 황금열쇠.

### Dependencies

- Epic 1: Core Skeleton

### Deliverable

- 플레이어들이 땅을 사고 통행료를 내며, 누군가 파산할 때까지 진행 가능한 기본 게임.

### Stories

- As a player, I can buy a vacant land when I land on it.
- As a player, I can see my current cash balance update in real-time.
- As a player, I pay rent automatically when landing on an opponent's land.
- As a system, I declare a player bankrupt if they cannot pay the rent.
- As a player, I can see who owns which land on the board visually.

---

## Epic 3: Advanced Rules (Game Logic)

### Goal

부루마블의 고유한 재미 요소이자 심화 규칙들을 구현하여 게임의 완성도를 높입니다.

### Scope

**Includes:**

- **경매 시스템:** 6개 남았을 때 강제 발동 로직.
- **건설 단계:** 후반전 진입 및 건물(별장/빌딩/호텔) 건설/매각.
- **특수 지역:** 우주여행, 무인도(3턴/더블 탈출), 사회복지기금.
- **황금열쇠:** 카드 덱 셔플 및 효과 적용.

**Excludes:**

- 복잡한 AI, 화려한 이펙트.

### Dependencies

- Epic 2: Basic Economy

### Deliverable

- 부루마블의 모든 공식 규칙이 적용된 완전한 기능의 게임.

### Stories

- As a system, I trigger an auction when only 6 unclaimed lands remain.
- As a player, I can build structures on my land during the Development phase.
- As a player, I can use the Space Travel tile to move to any location.
- As a player, I am stuck on the Desert Island until I roll a double or wait 3 turns.
- As a player, I draw and execute a Golden Key card effects.

---

## Epic 4: Single Player (AI)

### Goal

혼자서도 테스트 및 플레이가 가능하도록 인공지능 상대를 구현합니다.

### Scope

**Includes:**

- AI 턴 자동 진행.
- 성향별 결정 로직 (Aggressive/Safe/Random) - 구매/건설/탈출 여부 판단.

**Excludes:**

- 멀티플레이 동기화, 채팅.

### Dependencies

- Epic 3: Advanced Rules

### Deliverable

- 사람 vs AI 대전이 가능한 싱글 플레이 모드.

### Stories

- As a player, I can play against 1-3 AI components.
- As an AI, I make purchase decisions based on my personality profile.
- As a system, I skipping AI animation delays (optional) for fast testing.

---

## Epic 5: Polish (UX/FX)

### Goal

시각적, 청각적 피드백을 강화하여 '게임다운' 경험을 제공합니다.

### Scope

**Includes:**

- 주사위 물리 애니메이션 퀄리티 업.
- 건물 건설/매각 시각 효과.
- BGM 및 효과음(SFX) 적용.
- 모바일 가로/세로 반응형 UI 최적화.

**Excludes:**

- 새로운 기능 추가.

### Dependencies

- Epic 4: Single Player

### Deliverable

- 출시 가능한 수준의 최종 폴리싱 버전.

### Stories

- As a player, I feel satisfaction through sound effects when earning money.
- As a player, I see smooth animations for game events (Auction, Travel).
- As a player, I can play comfortably on a mobile screen with optimized UI.
