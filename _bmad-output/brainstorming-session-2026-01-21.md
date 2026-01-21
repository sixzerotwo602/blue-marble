# 🎮 블루마블 TypeScript 게임 구현 계획서

**생성일:** 2026-01-21
**상태:** 브레인스토밍 완료 → Advanced Elicitation 진행 중

---

## 1. 프로젝트 개요

### 1.1 요구사항 정리

| 항목 | 최종 목표 | MVP (현재) |
|------|----------|-----------|
| **플랫폼** | 웹 기반 | 터미널(CLI) 기반 |
| **멀티플레이어** | 온라인 + AI 대전 | 1명이 모든 플레이어 조작 (테스트 모드) |
| **그래픽** | 2D 보드 스타일 | 텍스트 기반 |
| **구현 범위** | 전체 | **전체 규칙 구현** |

### 1.2 게임 개요

| 카테고리 | 핵심 내용 |
|---------|----------|
| **장르** | 디지털 보드게임 (경제/부동산 시뮬레이션) |
| **플레이어 수** | 2~4명 |
| **핵심 메카닉** | 주사위 이동, 자산 구매, 건설, 통행료 징수 |
| **게임 페이즈** | 전반전(씨앗증서 구매) → 경매 → 후반전(건설 해금) |
| **승리 조건** | 최후의 1인 생존 |

---

## 2. MDA 프레임워크 분석

### 2.1 Mechanics (메카닉)
- 2개 주사위 굴리기 + 더블 시스템
- 40칸 보드 이동
- 씨앗증서(부동산) 구매/매각
- 별장/빌딩/호텔 건설
- 통행료 지불/징수
- 대출 시스템 (1회, 100만원 한도)
- 황금열쇠 카드 시스템
- 경매 시스템 (라운드 로빈 방식)

### 2.2 Dynamics (다이내믹)
- 전반전 vs 후반전의 전략 변화
- 자산 포트폴리오 구성
- 현금 흐름 관리
- 협상 및 대물 변제

### 2.3 Aesthetics (심미적 경험)
- 재산 축적의 쾌감
- 주사위 굴림의 긴장감
- 상대방 몰락의 쾌감/공포
- 경매의 스릴

---

## 3. 프로젝트 아키텍처

```
blue-marble/
├── src/
│   ├── core/                    # 핵심 게임 로직 (플랫폼 독립)
│   │   ├── models/              # 도메인 모델
│   │   │   ├── Player.ts        # 플레이어 모델
│   │   │   ├── Tile.ts          # 타일 베이스 + 타일 타입들
│   │   │   ├── Board.ts         # 40칸 보드
│   │   │   ├── Deed.ts          # 씨앗증서 (29종)
│   │   │   ├── Building.ts      # 건물 (별장/빌딩/호텔)
│   │   │   ├── GoldenKey.ts     # 황금열쇠 카드
│   │   │   └── Loan.ts          # 대출 정보
│   │   │
│   │   ├── systems/             # 게임 시스템
│   │   │   ├── GameEngine.ts    # 메인 게임 엔진
│   │   │   ├── PhaseSystem.ts   # 전반전/후반전 관리
│   │   │   ├── TurnSystem.ts    # 턴 관리
│   │   │   ├── DiceSystem.ts    # 주사위 + 더블 로직
│   │   │   ├── MovementSystem.ts    # 이동 로직
│   │   │   ├── EconomySystem.ts     # 경제 (구매/매각/통행료)
│   │   │   ├── AuctionSystem.ts     # 경매 시스템
│   │   │   ├── BuildingSystem.ts    # 건설 시스템
│   │   │   ├── LoanSystem.ts        # 대출 시스템
│   │   │   ├── BankruptcySystem.ts  # 파산 처리
│   │   │   └── SpecialTileSystem.ts # 특수 타일 처리
│   │   │
│   │   ├── data/                # 게임 데이터
│   │   │   ├── boardData.ts     # 40칸 타일 정의
│   │   │   ├── deedData.ts      # 29종 씨앗증서 데이터
│   │   │   └── goldenKeyData.ts # 황금열쇠 카드 데이터
│   │   │
│   │   ├── events/              # 이벤트 시스템
│   │   │   ├── GameEvent.ts     # 이벤트 타입 정의
│   │   │   └── EventBus.ts      # 이벤트 버스
│   │   │
│   │   └── types/               # 타입 정의
│   │       └── index.ts         # 공통 타입/인터페이스
│   │
│   ├── cli/                     # MVP: 터미널 인터페이스
│   │   ├── CLIGame.ts           # CLI 게임 진입점
│   │   ├── CLIRenderer.ts       # 텍스트 렌더링
│   │   ├── CLIInput.ts          # 입력 처리
│   │   └── commands/            # CLI 명령어들
│   │
│   ├── web/                     # 향후: 웹 인터페이스
│   │   └── (추후 구현)
│   │
│   └── ai/                      # 향후: AI 시스템
│       └── (추후 구현)
│
├── tests/                       # 테스트
│   ├── unit/
│   └── integration/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## 4. 핵심 도메인 모델

### 4.1 Player (플레이어)

```typescript
interface Player {
  id: string;
  name: string;
  money: number;                    // 보유 현금
  position: number;                 // 현재 위치 (0-39)
  deeds: Deed[];                    // 보유 씨앗증서
  goldenKeys: GoldenKeyCard[];      // 보관형 황금열쇠
  loan: Loan | null;                // 대출 정보
  lapsCompleted: number;            // 완료한 바퀴 수
  isStranded: boolean;              // 무인도 갇힘 여부
  strandedTurnsLeft: number;        // 무인도 남은 턴
  isBankrupt: boolean;              // 파산 여부
}
```

### 4.2 Tile (타일)

```typescript
type TileType = 
  | 'start'          // 출발지
  | 'city'           // 도시 (건설 가능)
  | 'vehicle'        // 탈것/관광지 (건설 불가)
  | 'goldenKey'      // 황금열쇠
  | 'island'         // 무인도
  | 'spaceTravel'    // 우주여행
  | 'welfare'        // 사회복지기금 (기부/접수)
  | 'special';       // 기타 특수 타일

interface Tile {
  index: number;           // 0-39
  type: TileType;
  name: string;
  deed?: Deed;             // 씨앗증서 (city/vehicle만)
}
```

### 4.3 Deed (씨앗증서)

```typescript
interface Deed {
  id: string;
  name: string;
  tileIndex: number;
  price: number;                    // 구매가
  baseRent: number;                 // 기본 통행료
  buildingCosts: {                  // 건설 비용
    villa: number;
    building: number;
    hotel: number;
  };
  rentTable: {                      // 통행료 테이블
    base: number;
    villa1: number;
    villa2: number;
    building: number;
    hotel: number;
    full: number;                   // 별장2+빌딩+호텔
  };
  owner: Player | null;
  buildings: Building[];
  canBuild: boolean;                // city만 true
}
```

### 4.4 Building (건물)

```typescript
type BuildingType = 'villa' | 'building' | 'hotel';

interface Building {
  type: BuildingType;
  cost: number;
}

// 타일당 최대: 별장 2, 빌딩 1, 호텔 1
```

---

## 5. 게임 시스템 설계

### 5.1 게임 상태 머신

```
┌─────────────────────────────────────────────────────────┐
│                      GAME STATES                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [INIT] ──► [FIRST_HALF] ──► [AUCTION] ──► [SECOND_HALF]│
│                                                 │       │
│                                                 ▼       │
│                                           [GAME_OVER]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 턴 상태 머신

```
┌────────────────────────────────────────────────────────────────┐
│                        TURN STATES                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [ROLL_DICE] ──► [MOVE] ──► [LAND_ACTION] ──► [BUILD/SELL]    │
│       ▲              │              │              │           │
│       │              │              │              │           │
│       └──── DOUBLE ──┘              └──────────────┴──► [END]  │
│                                                                │
│  [STRANDED] ──► [ROLL_ESCAPE] ──► [ESCAPE/WAIT] ──► [END]     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.3 핵심 시스템 상세

#### PhaseSystem (페이즈 시스템)
```typescript
class PhaseSystem {
  phase: 'first_half' | 'auction' | 'second_half';
  remainingDeeds: number;  // 은행 보유 씨앗증서 수
  
  checkAuctionTrigger(): boolean;  // 남은 증서 6장 → 경매
  startAuction(): void;
  endAuction(): void;
}
```

#### AuctionSystem (경매 시스템)
```typescript
class AuctionSystem {
  // 라운드 로빈 경매
  currentDeed: Deed;
  currentBid: number;
  highestBidder: Player | null;
  activeBidders: Player[];
  minimumRaise: number = 10000;
  
  startAuction(deeds: Deed[]): void;  // 액면가 낮은 순 정렬
  placeBid(player: Player, amount: number): boolean;
  fold(player: Player): void;
  processRound(): AuctionResult;
}
```

#### SpecialTileSystem (특수 타일)
```typescript
class SpecialTileSystem {
  // 우주여행 (Index 30)
  handleSpaceTravel(player: Player): void;
  executeWarp(player: Player, targetIndex: number): void;
  
  // 무인도 (탈출 로직)
  handleIsland(player: Player): void;
  attemptEscape(player: Player, dice: DiceResult): EscapeResult;
  
  // 사회복지기금
  welfareFund: number;
  handleDonate(player: Player): void;     // Index 38
  handleReceive(player: Player): void;    // Index 20
  
  // 황금열쇠
  drawGoldenKey(player: Player): void;
  executeCard(player: Player, card: GoldenKeyCard): void;
}
```

---

## 6. MVP 구현 단계

### Phase 1: 기본 엔진 (Core)
1. ✅ 프로젝트 초기화 (TypeScript + Node.js)
2. 도메인 모델 구현 (Player, Tile, Deed, Building)
3. 보드 데이터 정의 (40칸 + 29종 씨앗증서)
4. DiceSystem 구현 (더블/트리플 더블)
5. MovementSystem 구현 (월급 지급 포함)
6. TurnSystem 구현

### Phase 2: 경제 시스템
7. EconomySystem 구현 (구매/매각/통행료)
8. PhaseSystem 구현 (전반전/후반전)
9. AuctionSystem 구현 (라운드 로빈)
10. BuildingSystem 구현 (별장/빌딩/호텔)
11. LoanSystem 구현 (대출/상환)
12. BankruptcySystem 구현 (파산/청산)

### Phase 3: 특수 타일
13. 우주여행 로직
14. 무인도 로직
15. 사회복지기금 로직
16. 황금열쇠 시스템 (카드 덱 + 효과)

### Phase 4: CLI 인터페이스
17. CLIRenderer (보드 시각화)
18. CLIInput (명령어 입력)
19. 게임 루프 통합
20. 테스트 모드 (1인 다역 조작)

### Phase 5: 테스트 & 밸런싱
21. 단위 테스트 작성
22. 통합 테스트
23. 전체 게임 플로우 검증

---

## 7. CLI 보드 렌더링 예시

```
╔═══════════════════════════════════════════════════════════════════╗
║  [30]우주   [31]부산   [32]황금   [33]제주   [34]황금   [35]콩코드 ║
║  여행🚀     🏠$$$      열쇠🔑     🏠$$$$    열쇠🔑     ✈️$$        ║
╠═══════════════════════════════════════════════════════════════════╣
║ [29]황금│                                            │[36]하와이  ║
║ 열쇠🔑  │         🎲 블루마블 🎲                      │🏝️$$$      ║
╠─────────┤                                            ├────────────╣
║ [28]런던│     [P1] 💰2,500,000  위치:15              │[37]황금    ║
║ 🏠$$$$  │     [P2] 💰1,800,000  위치:8               │열쇠🔑      ║
╠─────────┤     [P3] 💰2,100,000  위치:22              ├────────────╣
║ [27]황금│                                            │[38]기부처  ║
║ 열쇠🔑  │     📊 전반전 | 남은 증서: 12장             │💰-150,000 ║
╠─────────┤                                            ├────────────╣
║ ...     │                                            │[39]서울    ║
╠─────────┴────────────────────────────────────────────┴────────────╣
║  [10]무인   [9]황금   [8]홍콩   [7]마닐라  [6]황금   [5]타이페이  ║
║  도🏝️      열쇠🔑    🏠$$$     🏠$$       열쇠🔑    🏠$$         ║
╚═══════════════════════════════════════════════════════════════════╝

>> [P1] 차례입니다. 명령: (r)oll, (b)uild, (s)ell, (i)nfo, (q)uit
```

---

## 8. 기술 스택

| 영역 | 기술 |
|------|------|
| **언어** | TypeScript 5.x |
| **런타임** | Node.js 20+ |
| **패키지 관리** | npm / pnpm |
| **CLI** | Inquirer.js 또는 Commander.js |
| **테스트** | Vitest 또는 Jest |
| **빌드** | esbuild 또는 tsc |
| **린트** | ESLint + Prettier |

---

## 9. 기존 데이터 파일 활용

### ✅ 이미 정의된 데이터 파일

#### 9.1 보드 데이터 (`rulemd/board-data.ts`)
- **40칸 보드 완성**: 모든 타일 정의됨
- **29종 씨앗증서**: 가격, 건물비용, 통행료 테이블 포함
- **특수 타일 인덱스**: START(0), ISLAND(10), FUND_RECEIVE(20), TRAVEL(30), FUND_DONATE(38)
- **황금열쇠 위치**: [2, 5, 12, 16, 22, 32]
- **탈것 위치**: [15, 28, 33] (콩코드, 퀸엘리자베스, 컬럼비아)
- **건설 불가 부동산**: [6, 25, 39] (제주도, 부산, 서울)
- **상수 정의**: SALARY(200,000), FUND_DONATE_AMOUNT(150,000), TRAVEL_FEE(200,000)

#### 9.2 황금열쇠 카드 (`rulemd/golden-key-cards.ts`)
- **27종 카드**: 완전 정의됨
- **카드 분포**:
  - 지정 이동: 10종 (37%)
  - 상금: 5종 (18.5%)
  - 유지비: 3종 (11.1%)
  - 지출: 3종 (11.1%)
  - 후퇴: 2종 (2칸/3칸)
  - 반액대매출: 1종 (2장)
  - 탈출권/면제: 2종
- **보관 가능 카드**: 무인도 탈출권, 우대권
- **2장 존재 카드**: 반액대매출, 우대권, 뒤로2칸, 뒤로3칸

---

## 10. 테스트 모드 설계

### 10.1 모드 A: 수동 전환 모드 (Manual Turn Mode)

1명의 개발자가 모든 플레이어 역할을 순차적으로 테스트하는 모드입니다.

```typescript
interface ManualTestMode {
  type: 'manual';
  features: {
    turnByTurn: true;           // 턴마다 명시적 전환
    showAllPlayerInfo: true;    // 모든 플레이어 정보 표시
    confirmBeforeAction: true;  // 행동 전 확인
    undoSupport: true;          // 실행 취소 지원
    saveLoadState: true;        // 상태 저장/불러오기
  };
}
```

#### CLI 플로우 예시
```
══════════════════════════════════════════════════════════
🎲 블루마블 테스트 모드 - 수동 전환
══════════════════════════════════════════════════════════

[게임 상태] 전반전 | 남은 증서: 23장 | 턴: 5

┌─────────────────────────────────────────────────────────┐
│ 플레이어 현황                                           │
├─────────────────────────────────────────────────────────┤
│ P1 (테스터1) │ 💰 2,730,000 │ 📍 싱가포르(7)  │ 증서:2 │
│ P2 (테스터2) │ 💰 2,450,000 │ 📍 황금열쇠(12) │ 증서:1 │
│ P3 (테스터3) │ 💰 2,930,000 │ 📍 출발(0)      │ 증서:0 │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
현재 플레이어: [P1] 테스터1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

명령어:
  (r) 주사위 굴리기    (i) 상세 정보
  (b) 건물 건설        (s) 자산 매각
  (l) 대출 실행        (d) 디버그 메뉴
  (u) 실행 취소        (q) 종료

>> r
🎲 주사위 결과: [4, 3] = 7

P1이 싱가포르(7) → 스톡홀름(14)로 이동합니다.

스톡홀름 | 가격: 160,000원 | 소유자: 없음

이 땅을 구매하시겠습니까? (y/n/skip): 
```

#### 디버그 메뉴 기능
```
━━━━━━━━━━━━ 디버그 메뉴 ━━━━━━━━━━━━
(1) 플레이어 자금 수정
(2) 플레이어 위치 이동
(3) 증서 소유권 변경
(4) 건물 추가/제거
(5) 게임 페이즈 변경
(6) 경매 강제 시작
(7) 황금열쇠 특정 카드 뽑기
(8) 게임 상태 저장
(9) 게임 상태 불러오기
(0) 디버그 메뉴 종료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
>> 
```

---

### 10.2 AI 봇 자동 시뮬레이션 모드

AI 봇들이 자율적으로 여러 판을 플레이하여 게임 밸런스를 검증하는 모드입니다.

```typescript
interface AISimulationMode {
  type: 'ai_simulation';
  config: {
    numberOfGames: number;        // 시뮬레이션 게임 수
    playerCount: 2 | 3 | 4;       // 플레이어 수
    aiDifficulty: 'random' | 'basic' | 'smart';  // AI 수준
    speedMode: 'instant' | 'fast' | 'visual';    // 실행 속도
    collectStats: true;           // 통계 수집
    saveReplays: boolean;         // 리플레이 저장
  };
}

interface AIBotStrategy {
  // 구매 결정
  shouldBuyDeed(context: GameContext): boolean;
  
  // 건설 결정
  getBuildingDecision(context: GameContext): BuildDecision | null;
  
  // 경매 입찰
  getAuctionBid(context: AuctionContext): number | 'fold';
  
  // 대출 결정
  shouldTakeLoan(context: GameContext): LoanDecision | null;
  
  // 자산 매각 결정 (자금 부족 시)
  getAssetToSell(context: GameContext): Asset | null;
}
```

#### AI 난이도 레벨

| 레벨 | 설명 | 구매 전략 | 경매 전략 | 건설 전략 |
|------|------|----------|----------|----------|
| **random** | 무작위 결정 | 50% 확률 구매 | 랜덤 입찰/폴드 | 랜덤 건설 |
| **basic** | 기본 규칙 기반 | 자금 30% 이하면 구매 | 정가+20%까지 | 여유자금 있으면 건설 |
| **smart** | 전략적 AI | ROI/위치 분석 | 상대 자금 고려 | 컬러그룹 완성 우선 |

#### 시뮬레이션 CLI
```
══════════════════════════════════════════════════════════
🤖 AI 시뮬레이션 모드
══════════════════════════════════════════════════════════

설정:
  - 게임 수: 1000
  - 플레이어 수: 4
  - AI 레벨: smart
  - 속도: instant

시뮬레이션 진행 중... [████████████████████░░░░] 80% (800/1000)

━━━━━━━━━━━━ 중간 통계 ━━━━━━━━━━━━
평균 게임 턴 수: 87.3
평균 게임 시간 (가상): 2시간 15분

승리 분포:
  - P1 (시작 플레이어): 28.5%
  - P2: 24.2%
  - P3: 23.8%
  - P4: 23.5%

가장 수익성 높은 땅 TOP 5:
  1. 서울 (ROI: 340%)
  2. 부산 (ROI: 280%)
  3. 런던 (ROI: 245%)
  4. 뉴욕 (ROI: 240%)
  5. 도쿄 (ROI: 220%)

경매 통계:
  - 평균 낙찰가/정가 비율: 1.35x
  - 유찰률: 8.2%

파산 원인 분석:
  - 통행료 지불 불능: 67%
  - 대출 상환 실패: 23%
  - 건물 유지비: 10%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 시뮬레이션 결과 리포트
```typescript
interface SimulationReport {
  summary: {
    totalGames: number;
    averageTurns: number;
    averageDuration: number;  // 가상 시간 (분)
  };
  
  winDistribution: {
    byStartOrder: Record<number, number>;     // 시작 순서별 승률
    byStrategy: Record<string, number>;       // 전략별 승률
  };
  
  economyStats: {
    averageEndMoney: number;
    averageDeedsPerPlayer: number;
    mostProfitableTiles: TileROI[];
    auctionPriceRatio: number;
  };
  
  bankruptcyAnalysis: {
    averageBankruptcyTurn: number;
    causeDistribution: Record<string, number>;
  };
  
  phaseAnalysis: {
    averageFirstHalfTurns: number;
    auctionFrequency: number;
  };
}
```

---

## 11. 업데이트된 프로젝트 구조

```
blue-marble/
├── src/
│   ├── core/                    # 핵심 게임 로직
│   │   ├── models/
│   │   ├── systems/
│   │   ├── data/
│   │   │   ├── boardData.ts     # ← rulemd/board-data.ts 이전
│   │   │   └── goldenKeyData.ts # ← rulemd/golden-key-cards.ts 이전
│   │   ├── events/
│   │   └── types/
│   │
│   ├── cli/                     # 터미널 인터페이스
│   │   ├── CLIGame.ts
│   │   ├── CLIRenderer.ts
│   │   ├── CLIInput.ts
│   │   ├── modes/
│   │   │   ├── ManualTestMode.ts   # 수동 테스트 모드
│   │   │   └── DebugMenu.ts        # 디버그 메뉴
│   │   └── commands/
│   │
│   ├── ai/                      # AI 시스템
│   │   ├── AIPlayer.ts          # AI 플레이어 베이스
│   │   ├── strategies/
│   │   │   ├── RandomStrategy.ts   # 랜덤 AI
│   │   │   ├── BasicStrategy.ts    # 기본 규칙 AI
│   │   │   └── SmartStrategy.ts    # 전략적 AI
│   │   └── simulator/
│   │       ├── GameSimulator.ts    # 게임 시뮬레이터
│   │       ├── BatchRunner.ts      # 다중 게임 실행
│   │       └── StatsCollector.ts   # 통계 수집기
│   │
│   └── web/                     # (향후 웹 인터페이스)
│
├── rulemd/                      # 기존 규칙 데이터 (참조용)
│   ├── board-data.ts
│   └── golden-key-cards.ts
│
├── tests/
├── package.json
└── tsconfig.json
```

---

## 12. AI 전략 세부 로직

### 12.1 AI 결정 포인트

게임 진행 중 AI가 결정해야 하는 모든 상황:

| 결정 포인트 | 발생 시점 | 설명 |
|------------|----------|------|
| 구매 결정 | 빈 땅 도착 | 씨앗증서 구매 여부 |
| 건설 결정 | 후반전, 자기 땅 | 별장/빌딩/호텔 건설 |
| 경매 입찰 | 경매 페이즈 | 입찰 금액 또는 폴드 |
| 워프 목적지 | 우주여행 다음 턴 | 이동할 타일 선택 |
| 자산 매각 | 자금 부족 시 | 건물/증서 매각 순서 |
| 대출 결정 | 자금 부족 시 | 대출 여부 및 금액 |
| 카드 사용 | 보관 카드 보유 시 | 우대권/탈출권 사용 |

### 12.2 AI 전략 인터페이스

```typescript
interface IAIStrategy {
  readonly name: string;
  readonly difficulty: 'random' | 'basic' | 'smart';
  
  decidePurchase(context: PurchaseContext): boolean;
  decideBuild(context: BuildContext): BuildingType[];
  decideAuctionBid(context: AuctionContext): number | 'fold';
  decideWarpDestination(context: WarpContext): number;
  decideAssetToSell(context: SellContext): SellDecision | null;
  decideLoan(context: LoanContext): number | null;
  decideUseHeldCard(context: CardContext): boolean;
  decideForceSelTarget(context: ForceSellContext): Deed;
}
```

### 12.3 레벨별 전략 요약

| 상황 | Random | Basic | Smart |
|------|--------|-------|-------|
| **구매** | 50% 확률 | 자금 40% 이하 | ROI + 전략 분석 |
| **경매** | 50% 폴드 | 정가 120%까지 | 상대 분석 |
| **건설** | 0~3 랜덤 | 여유자금 시 풀빌드 | 컬러그룹 완성 우선 |
| **워프** | 완전 랜덤 | 빈 고가 땅/자기 땅 | 최적 가치 계산 |
| **매각** | 랜덤 선택 | 저가부터 순차 | 전략적 유지/포기 |

### 12.4 BasicStrategy 핵심 로직

```typescript
class BasicStrategy implements IAIStrategy {
  decidePurchase(ctx: PurchaseContext): boolean {
    const { player, deed } = ctx;
    
    // 규칙 1: 자금의 40% 이하 가격이면 구매
    if (deed.price <= player.money * 0.4) return true;
    
    // 규칙 2: 서울/부산/제주는 60%까지 투자
    if ([6, 25, 39].includes(deed.tileIndex)) {
      return deed.price <= player.money * 0.6;
    }
    
    // 규칙 3: 동일 컬러그룹 보유 시 50%까지
    const sameColorOwned = this.countSameColorDeeds(player, deed.colorGroup);
    if (sameColorOwned > 0) {
      return deed.price <= player.money * 0.5;
    }
    
    return false;
  }
  
  decideAuctionBid(ctx: AuctionContext): number | 'fold' {
    const { player, deed, currentBid, minRaise } = ctx;
    
    // 최대 입찰: 정가 120% 또는 자금 50% 중 낮은 값
    const maxBid = Math.min(deed.price * 1.2, player.money * 0.5);
    const nextBid = currentBid + minRaise;
    
    if (nextBid > maxBid) return 'fold';
    return nextBid;
  }
  
  decideWarpDestination(ctx: WarpContext): number {
    const { player, board, phase } = ctx;
    
    // 전반전: 빈 고가 땅
    if (phase === 'first_half') {
      const empty = board.tiles
        .filter(t => t.deed && !t.deed.owner)
        .sort((a, b) => b.deed!.price - a.deed!.price);
      if (empty.length > 0) return empty[0].index;
    }
    
    // 후반전: 건설 가능한 자기 땅
    const buildable = board.tiles.filter(
      t => t.deed?.owner?.id === player.id && 
           t.deed?.canBuild && 
           !t.deed?.isFullyBuilt
    );
    if (buildable.length > 0) return buildable[0].index;
    
    return 20; // 사회복지기금 접수
  }
}
```

### 12.5 SmartStrategy 핵심 로직

```typescript
class SmartStrategy implements IAIStrategy {
  decidePurchase(ctx: PurchaseContext): boolean {
    const { player, deed, opponents, gameProgress } = ctx;
    
    // ROI 분석
    const expectedROI = this.calculateExpectedROI(deed, gameProgress);
    
    // 전략적 가치 (상대 블록, 고빈도 칸)
    const strategicValue = this.analyzeStrategicValue(deed, opponents);
    
    // 컬러그룹 완성 점수
    const colorScore = this.getColorCompletionScore(deed, player);
    
    // 종합 점수 → 투자 비율 결정
    const score = expectedROI * 0.4 + strategicValue * 0.3 + colorScore * 0.3;
    const investmentRatio = 0.3 + (score * 0.4); // 30%~70%
    
    return deed.price <= player.money * investmentRatio;
  }
  
  decideAuctionBid(ctx: AuctionContext): number | 'fold' {
    const { player, deed, currentBid, minRaise, opponents, remainingDeeds } = ctx;
    
    // 상대방 최대 입찰 가능액 분석
    const opponentMax = Math.max(...opponents.map(o => o.money * 0.7));
    
    // 내 가치 평가
    const myValuation = this.calculateDeedValuation(deed, player);
    const nextBid = currentBid + minRaise;
    
    if (nextBid > myValuation) return 'fold';
    
    // 상대 압박 전략 (잔여 경매 고려)
    if (remainingDeeds.length <= 3) {
      return Math.min(nextBid + minRaise * 2, myValuation);
    }
    
    return nextBid;
  }
  
  decideWarpDestination(ctx: WarpContext): number {
    const { board, player, opponents, phase, welfareFund } = ctx;
    
    // 모든 타일 가치 계산 후 최고 선택
    return board.tiles
      .map(tile => ({
        index: tile.index,
        value: this.calculateWarpValue(tile, player, opponents, phase, welfareFund)
      }))
      .sort((a, b) => b.value - a.value)[0].index;
  }
  
  decideBuild(ctx: BuildContext): BuildingType[] {
    const { player, deed } = ctx;
    
    // 컬러그룹 완성 시에만 풀빌드
    if (this.isColorGroupComplete(deed, player)) {
      return this.buildMaximum(player, deed);
    }
    
    // 미완성: 보수적 (별장 1개만)
    if (deed.villaCount < 1 && player.money > deed.buildingCosts.villa + 300000) {
      return ['villa'];
    }
    
    return [];
  }
}
```

### 12.6 AI 컨텍스트 타입

```typescript
interface PurchaseContext {
  player: Player;
  deed: Deed;
  opponents: Player[];
  phase: 'first_half' | 'second_half';
  remainingBankDeeds: number;
  gameProgress: number; // 0.0 ~ 1.0
}

interface AuctionContext {
  player: Player;
  deed: Deed;
  currentBid: number;
  minRaise: number; // 10,000
  activeBidders: Player[];
  opponents: Player[];
  remainingDeeds: Deed[];
}

interface WarpContext {
  player: Player;
  board: Board;
  opponents: Player[];
  phase: 'first_half' | 'second_half';
  welfareFund: number;
}

interface BuildContext {
  player: Player;
  deed: Deed;
  phase: 'first_half' | 'second_half';
  allPlayerDeeds: Deed[];
}
```

---

## 13. MVP 구현 단계 (수정)

### Phase 1: 기본 엔진 (Core)
1. ✅ 프로젝트 초기화 (TypeScript + Node.js)
2. ✅ **기존 데이터 파일 복사 및 통합** (board-data.ts, golden-key-cards.ts)
3. 도메인 모델 구현 (Player, Tile, Deed, Building)
4. DiceSystem 구현 (더블/트리플 더블)
5. MovementSystem 구현 (월급 지급 포함)
6. TurnSystem 구현

### Phase 2: 경제 시스템
7. EconomySystem 구현 (구매/매각/통행료)
8. PhaseSystem 구현 (전반전/후반전)
9. AuctionSystem 구현 (라운드 로빈)
10. BuildingSystem 구현 (별장/빌딩/호텔)
11. LoanSystem 구현 (대출/상환)
12. BankruptcySystem 구현 (파산/청산)

### Phase 3: 특수 타일
13. 우주여행 로직
14. 무인도 로직
15. 사회복지기금 로직
16. 황금열쇠 시스템 (카드 덱 + 효과)

### Phase 4: CLI 인터페이스 + 테스트 모드
17. CLIRenderer (보드 시각화)
18. CLIInput (명령어 입력)
19. **ManualTestMode 구현** (수동 전환 모드)
20. **DebugMenu 구현** (상태 조작)
21. 게임 루프 통합

### Phase 5: AI 시스템 + 시뮬레이션
22. **AIPlayer 베이스 클래스**
23. **RandomStrategy 구현**
24. **BasicStrategy 구현**
25. **SmartStrategy 구현** (선택적)
26. **GameSimulator 구현** (단일 게임)
27. **BatchRunner 구현** (다중 게임)
28. **StatsCollector 구현** (통계 수집)

### Phase 6: 테스트 & 검증
29. 단위 테스트 작성
30. 통합 테스트
31. AI 시뮬레이션으로 밸런스 검증
32. 전체 게임 플로우 검증

---

*이 문서는 브레인스토밍 세션의 결과물입니다. 기존 데이터 파일(board-data.ts, golden-key-cards.ts) 활용 및 테스트 모드(수동 전환 + AI 시뮬레이션) 설계가 완료되었습니다.*
