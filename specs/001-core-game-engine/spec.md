# Feature Specification: 부루마블 핵심 게임 엔진

**Feature Branch**: `001-core-game-engine`  
**Created**: 2026-01-04  
**Status**: Draft  
**Input**: Notion 문서 "부루마블(블루마블) 요소 정리" 기반

## Clarifications

### Session 2026-01-09 (하이브리드 개발 전략)

> **배경**: rule_CLAUDE.md, rule_gemini.md, rule_chatgpt.md 세 파일의 장점을 취합한 하이브리드 개발 전략 적용.

- **Step 1 - 데이터 아키텍처 (ChatGPT 기반)**: `PlayerState`, `PropertySpec`, `GameState` 구조체를 ChatGPT 버전으로 설계. 특히 `pendingSpaceChoice`, `islandTurnsLeft`, `doubleCount` 같은 턴 제어 상태 변수 채택.
- **Step 2 - 보드 데이터/가격 (부루마블 요소 정리.md)**: 도시 이름, 가격, 통행료 등 실제 데이터는 `부루마블(블루마블) 요소 정리.md` 파일 기준으로 40칸, 29개 증서, 27종 황금열쇠 카드 정의.
- **Step 3 - 게임 루프 (Gemini 기반)**: Ordinary vs Option 모드 설정, 전반전(FIRST_HALF)/후반전(SECOND_HALF) 전환 흐름 등 Gemini의 직관적인 게임 진행 구조 채택.
- **Step 4 - 함수 구현 (Claude + ChatGPT 혼합)**: 구체적인 함수 내부 로직은 Claude의 모듈화 방식 활용, 예외 처리(파산 방어 로직)는 ChatGPT의 `settleShortage` 함수 채택.

**변경된 파일**:

- `spec.md`: Game Logic Specification 섹션 추가
- `contracts/enums.ts`: `GamePhase`, `GameMode`, `CardKeepPolicy`, `CardPhasePolicy` 등 추가
- `contracts/types.ts`: ChatGPT 기반 데이터 모델로 전면 개편
- `contracts/board-data.ts`: 부루마블 요소 정리.md 기준 40칸 보드 데이터
- `contracts/golden-key-cards.ts`: 27종 황금열쇠 카드 데이터

### Session 2026-01-04

- Q: 서버 아키텍처 및 실시간 통신 방식? → A: NestJS 10 + WebSocket/Socket.IO 기반, In-Memory 상태 관리
- Q: MVP Out-of-Scope 범위? → A: 핵심 가치(Bankless, Math-free, Sync) 기반 최소 기능만 In-Scope
- Q: 호스트와 일반 플레이어의 권한 차이? → A: 호스트는 게임 시작만 담당 (중도 종료/일시 정지 없음)
- Q: 담보 설정 시 자산 가치 산정 기준? → A: **MVP Out-of-Scope** (담보 기능 제외)
- Q: 초기 플레이어 자금? → A: 3~4인: 293만원 / 2인: 586만원 (공식 부루마블 규칙 - 권종별 합산)
- Q: 우주여행 특수 칸 이동 가능 범위? → A: 보드판 40칸 중 어디든 이동 가능 (원본 규칙, QR 스캔 검증 필수)
- Q: 올림픽 개최 특수 칸 효과? → A: 황금열쇠 카드에 해당 효과 없음, MVP에서 제외 (Edge Case에서 삭제)
- Q: 주사위 더블 3회 연속 시 무인도 직행? → A: MVP에서 제외 (공식 규칙 아님, Edge Case에서 삭제)
- Q: 사회복지기금 칸 효과? → A: 2칸 + 적립 시스템 (원본 규칙). 서울-뉴욕 사이에 모금 칸(150,000원 적립), 코너 3번이 수령처(적립금 전액 수령)
- Q: 사회복지기금 기부 시 현금 부족? → A: 자산 매각을 통해 납부해야 하며, 불가능 시 파산 처리 (Option A)
- Q: 컬럼비아호(우주여행 출발지) 규칙? → A: 탈것(증서 확인). 주인 있으면 통행료 20만원 지불, 없으면 무료. 탑승 후 **다음 턴**에 원하는 곳으로 이동(출발지 경유 시 월급 지급).
- Q: 우주여행 이동 시점? → A: 도착 턴은 종료(Wait), **다음 턴**에 주사위 없이 이동할 곳 선택 (Option A).
- Q: 반액 대매출 대상 기준? → A: (토지+건물) 총 가치가 가장 높은 곳. 동점일 경우 플레이어가 선택 (Option A).
- Q: 보관 카드(우대권, 탈출권) 거래 여부? → A: 플레이어 간 거래 불가(MVP). 단, **무인도 탈출권**은 은행에 200,000원에 매각 가능.
- Q: 주사위 더블 규칙? → A: 더블 시 재투척 가능. 단, 3회 연속 더블 시 즉시 턴 종료 (무인도 이동 없음). (Option C)
- Q: 건물 건설 제약? → A: 순차 제약 없음. 자금만 충분하다면 한 턴에 별장~호텔까지 한 번에 건설 가능 (Option A).
- Q: 독점(Monopoly) 룰 적용 여부? → A: 독점 배수 규칙 없음. 우대권 사용 시 단순 무료 통행 처리.
- Q: 황금열쇠 이동 시 월급 지급? → A: 출발지를 지나가는 경로라면 월급(20만원) 지급 (Option A).
- Q: 파산/지불 부족 시 자산 처분 방식? → A: 사용자가 직접 매각 대상을 선택하여 부족분 충당 (Option A).
- Q: 무인도 3턴 경과 후 탈출 비용? → A: 3턴 대기 시 비용 없이 무료 자동 탈출 (Option A).
- Q: 무인도 체류 중 통행료 수금? → A: 위치와 무관하게 소유권은 유효하므로 정상적으로 통행료 수취 (Option A).
- Q: 건물 분할 매각/다운그레이드? → A: 건물 개별 매각 가능하나, **다운그레이드 없음** (호텔 매각 시 호텔 소멸).
- Q: 더블 시 행동 시점? → A: 주사위 → 이동 → 액션(구매/지불) 완료 후 다시 주사위 굴림 (Option A).
- Q: 파산 시 건물 처리? → A: 건물 철거 없이 상태 그대로 채권자에게 소유권 이전 (Option A).

### Session 2026-01-06 (용어 통일 및 명확화)

- Q: 세금 칸이 별도로 존재하는가? → A: **세금 칸은 존재하지 않음**. "세금"이라는 용어가 사용될 경우 이는 사회복지기금 기부(150,000원)를 의미함. 씨앗사 부루마블 클래식(세계여행) 보드판에는 별도의 세금 칸이 존재하지 않으며, 은행에 납부하는 금액은 사회복지기금 기부가 유일함.
- Q: 컴럼비아호와 우주여행의 관계? → A: **별개의 칸임**. 컴럼비아호(33번 칸)는 탈것 증서로서 통행료가 발생하며, 우주여행(30번 칸)은 별도의 특수 칸으로서 이용료를 내고 원하는 곳으로 이동하는 기능임. 컴럼비아호에 도착한다고 자동으로 우주여행이 되는 것은 아님.
- Q: 무인도/감옥 용어 통일? → A: "무인도"로 통일. 무인도는 모노폴리의 감옥과 동일한 개념으로, 일정 턴 동안 이동할 수 없는 상태를 나타냄.
- Q: 건물 명칭 통일? → A: "빌라/건물/호텔"로 통일. (v1.3 기준)
- Q: 플레이어 말 색상? → A: "빨강/파랑/노랑/초록"으로 통일. (구버전 흰색에서 초록으로 변경)

### Session 2026-01-06 (Observability & Clarify)

- Q: 에러 로깅 및 모니터링 수준? → A: **전체 분산 추적** (OpenTelemetry + 모든 이벤트 trace). 게임 플레이 경향 분석을 위해 모든 이벤트를 추적 가능하게 구성.
- Q: 로딩 상태 UI 표시 방식? → A: **버튼 비활성화 + 인라인 스피너** (해당 액션만 차단). 전체 화면 오버레이 없이 현재 진행 중인 액션만 시각적으로 표시.
- Q: QR 검증 보안 수준? → A: **서버측 위치 검증 + Rate Limiting**. 이동 거리 검증(주사위 결과 vs 스캔 위치)과 연속 스캔 제한으로 스푸핑 방지.
- Q: Board Data 제목의 "32 Tiles" 오류? → A: **40칸으로 수정**. 씨앗사 부루마블 클래식(세계여행) 보드판은 40칸임.
- Q: 네트워크 자동 재연결 시도 횟수? → A: **3회 재시도 (3초 간격)** 후 수동 재연결 유도.

### Session 2026-01-06 (Edge Cases)

- Q: 동시에 여러 플레이어가 서버에 요청 시? → A: **턴 소유자만 액션 허용**. 다른 플레이어 요청은 NOT_YOUR_TURN 에러 반환.
- Q: 황금열쇠로 이동한 곳이 또 황금열쇠 칸인 경우? → A: **연쇄 실행** (이동 후 새 황금열쇠 카드 룰음).
- Q: 호스트가 먼저 파산/이탈 시 호스트 권한? → A: **다음 순서 플레이어에게 자동 이전**.
- Q: 모든 플레이어 연결 끊김 시 게임 상태? → A: **30분간 유지 후 자동 종료**. 종료 시 게임 로그 적절히 작성 후 데이터 보관 (endReason: timeout).

### Session 2026-01-06 (Edge Cases 2차)

- Q: 사회복지기금 적립금 0원일 때 수령 칸 도착? → A: **아무것도 지급 안 함** (0원 수령, 메시지만 표시).
- Q: 더블 주사위 후 황금열쇠 강제 이동 시 재굴림 권한? → A: **더블 재굴림 권한 유지** (강제 이동 후 다시 주사위).
- Q: 건물 건설 시 잔고 부족 옵션 처리? → A: **버튼 비활성화** (잔고 부족 건물은 선택 불가).
- Q: 통행료 지불 중 파산 처리 순서? → A: **즉시 파산** (보유 자산 전부 채권자에게 이전).
- Q: 게임 시작 최소 인원? → A: **2명 이상** (호스트가 시작 결정).
- Q: 우주여행 목적지 선택 방식? → A: **별도 팝업 없이 아무 QR이나 스캔하면 해당 위치로 이동** (Option B).
- Q: 탈것(콩코드/퀸엘리자베스/콜롬비아) 칸 도착 시 이용(이동) 가능한가? → A: **불가능**. 일반 도착(주사위) 시에는 구매하거나 통행료만 지불함. 이동은 황금열쇠 등 강제된 상황에서만 발생.
- Q: 콜롬비아호(증서)와 우주여행(코너) 요금 차이? → A: **콜롬비아호 증서 칸** = 통행료 40만원 (이동 없음). **우주여행 코너** = 이용료 20만원 (콜롬비아 소유주에게 지불, 없으면 무료) + 우주정류장 이동.
- Q: 황금열쇠로 탈것 이동 시 규칙? → A: **콩코드→타이베이**, **퀸엘리자베스→베이징** 강제 이동 후 소유주에게 탑승료 지불.

## UI Reference _(mandatory)_

프론트엔드 구현 시 반드시 참조해야 할 UI 레퍼런스 코드입니다.

### Reference Implementation

**파일 경로**: `references/BlueMarbleUI.tsx`

이 파일은 `contracts/types.ts` 및 `contracts/enums.ts`와 완전히 연동되는 React 컴포넌트입니다.

### 주요 컴포넌트

| 컴포넌트               | 설명                                | 관련 타입                              |
| ---------------------- | ----------------------------------- | -------------------------------------- |
| **보드 레이아웃**      | 40칸 11x11 CSS Grid                 | `BoardTile`, `TileType`                |
| **주사위 롤러**        | 애니메이션 포함, 서버 RNG 결과 표시 | `diceState: { die1, die2, isRolling }` |
| **플레이어 토큰**      | 위치 기반 렌더링, 색상 매핑         | `PlayerState`, `PlayerColor`           |
| **플레이어 정보 패널** | 현금, 증서 수, 특수 상태 표시       | `PlayerState`                          |
| **게임 로그**          | 실시간 이벤트 로그                  | `string[]`                             |
| **구매 모달**          | 땅 구매/패스 선택                   | `purchaseModal`                        |
| **게임 종료 모달**     | 승자 표시, 재시작 버튼              | `GameStatus.FINISHED`                  |

### Props Interface

```typescript
interface BlueMarbleUIProps {
  tiles: BoardTile[]; // 40칸 타일 배열
  players: PlayerState[]; // 플레이어 상태 배열
  currentTurnIndex: number; // 현재 턴 인덱스
  diceState: { die1: number; die2: number; isRolling: boolean };
  gameStatus: GameStatus; // GameStatus enum
  turnPhase: TurnPhase; // TurnPhase enum
  gameLog: string[]; // 게임 로그
  purchaseModal: {
    isOpen: boolean;
    tile: BoardTile | null;
    price: number;
  } | null;
  welfarePot: number; // 사회복지기금 누적액

  // Event Handlers
  onRollDice: () => void;
  onBuyProperty: (tileIndex: number) => void;
  onPassProperty: () => void;
  onEndTurn: () => void;
  onRestart: () => void;
}
```

### 색상 매핑

| PlayerColor | CSS 클래스      |
| ----------- | --------------- |
| `RED`       | `bg-red-500`    |
| `BLUE`      | `bg-blue-500`   |
| `YELLOW`    | `bg-yellow-500` |
| `GREEN`     | `bg-green-500`  |

### 보드 그리드 좌표

40칸 보드는 11x11 CSS Grid로 구현됩니다:

- **Index 0~10**: 하단 행 (우→좌)
- **Index 11~19**: 좌측 열 (하→상)
- **Index 20~30**: 상단 행 (좌→우)
- **Index 31~39**: 우측 열 (상→하)

> **Note**: UI 구현 시 이 레퍼런스를 기반으로 하되, 실제 서버 상태는 `contracts/types.ts`의 `GameState`를 따릅니다.

## Scope _(mandatory)_

### User Roles

| Role       | Description          | Permissions                      |
| ---------- | -------------------- | -------------------------------- |
| **Host**   | 방을 생성한 플레이어 | 게임 시작 버튼 활성화            |
| **Player** | 방에 입장한 플레이어 | 턴 진행, 구매, 건설 등 게임 액션 |

> **Note**: 호스트도 게임 중에는 일반 플레이어와 동일한 권한을 가짐. 중도 종료/일시 정지/강퇴 기능 없음.

### Core Values

- **Bankless**: 현금 없이 앱이 모든 금전 거래 처리
- **Math-free**: 계산 없이 자동 임대료/통행료 산정
- **Sync**: 모든 플레이어가 실시간으로 동일한 상태 공유

### In-Scope (MVP)

| #   | Feature                | Priority |
| --- | ---------------------- | -------- |
| 1   | 방 생성/참가           | P1       |
| 2   | QR 스캔 → 위치 확인    | P1       |
| 3   | 부동산 구매            | P1       |
| 4   | 임대료 자동 계산/지불  | P1       |
| 5   | 건설 (빌라/건물/호텔)  | P1       |
| 6   | 턴 관리                | P1       |
| 7   | 파산 처리 (단순화)     | P2       |
| 8   | 황금열쇠 (기본 효과만) | P2       |
| 9   | 실시간 동기화          | P1       |

### Out-of-Scope (MVP)

- 플레이어 간 거래 협상 (땅/건물 매매)
- 관전 모드
- 배팅/베팅 시스템
- 게임 리플레이 기능
- 리더보드/랭킹 시스템
- 경매 시스템 (누군가 땅 구매를 포기하면 즉시 전원 경매 발동하는 기능, 추후 확장 가능)
- 방장 강퇴/설정 변경 기능 (추후 확장 가능)
- 계정 시스템 (MVP에서는 visitorId로 익명 식별, 추후 accountId 연동 예정)

### Game Constants

| Constant             | Value       | Description                                  |
| -------------------- | ----------- | -------------------------------------------- |
| `INITIAL_MONEY`      | 2,930,000원 | 게임 시작 시 플레이어 초기 자금 (3~4인 기준) |
| `INITIAL_MONEY_2P`   | 5,860,000원 | 2인 플레이 시 초기 자금 (2배)                |
| `MAX_PLAYERS`        | 4           | 방당 최대 플레이어 수                        |
| `BOARD_TILES`        | 40          | 보드판 총 칸 수                              |
| `TOTAL_DEEDS`        | 29          | 증서 칸 수 (도시 26 + 탈것 3)                |
| `GOLDEN_KEY_TILES`   | 6           | 황금열쇠 칸 수                               |
| `GOLDEN_KEY_CARDS`   | 27종        | 황금열쇠 카드 종류 수                        |
| `SALARY`             | 200,000원   | 출발 통과 시 월급                            |
| `FUND_DONATE_AMOUNT` | 150,000원   | 사회복지기금 기부 금액                       |
| `TRAVEL_FEE`         | 200,000원   | 우주여행 이용료                              |
| `ISLAND_ESCAPE_FEE`  | 50,000원    | 무인도 탈출 비용                             |
| `DISCONNECT_TIMEOUT` | 180초       | 연결 끊김 후 이탈 처리 시간                  |

## Technical Architecture _(mandatory)_

### Technology Stack

| Layer                | Technology             | Notes                                      |
| -------------------- | ---------------------- | ------------------------------------------ |
| **Server**           | Fastify + TypeScript   | REST API (방 생성) + WebSocket (게임 액션) |
| **Client**           | React 18 + Vite        | 웹 기반 UI (디지털 MVP)                    |
| **State Management** | Zustand                | 클라이언트 상태 관리                       |
| **Database**         | PostgreSQL 18          | 게임 데이터 축적 및 분석용                 |
| **ORM**              | Prisma 5               | 타입 안전 DB 접근                          |
| **Cache**            | In-Memory (Node.js 힙) | 실시간 게임 세션 상태                      |
| **Real-time**        | Socket.IO              | 0.2~0.5초 내 실시간 반영                   |
| **Validation**       | Zod                    | 런타임 타입 검증                           |
| **Testing**          | Vitest + Playwright    | 단위/E2E 테스트                            |

### Architecture Overview

```
Client (React + Vite) ⇄ Server (Fastify) ⇄ In-Memory GameState (실시간)
                                              ⇆ PostgreSQL (영구 저장)
```

- **SSOT (Single Source of Truth)**: 서버가 유일한 게임 상태 관리 주체
- **REST API**: 방 생성 등 비실시간 작업에만 사용
- **WebSocket**: 모든 게임 액션 처리 및 상태 브로드캐스트

### Communication Flow

1. 사용자 QR 스캔 → Client가 WebSocket으로 `scan-qr` 이벤트 전송
2. Server가 유효성 검증 후 통행료 계산 및 자산 차감
3. Server가 변경된 전체 GameState를 `state-updated` 이벤트로 브로드캐스트
4. Client가 수신된 State로 Zustand Store 갱신 → UI 리렌더링

### Network Resilience

- 네트워크 끊김 시 → Pause 상태
- 재접속 시 → Resume 및 상태 복구
- 모든 행동 이벤트 로그 기록

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 게임방 생성 및 입장 (Priority: P1)

플레이어가 새로운 게임방을 생성하거나 기존 방에 입장하여 다른 플레이어들과 함께 게임을 시작할 수 있다. 방에 입장한 순서대로 캐릭터(말 색상)가 자동으로 배정되며, 전원 입장 후 호스트가 게임을 시작할 수 있다.

**Why this priority**: 게임의 가장 기본적인 진입점이며, 이 기능 없이는 다른 모든 기능이 작동하지 않음.

**Independent Test**: 4명의 사용자가 각자의 기기에서 앱을 통해 같은 방에 입장하고, 각각 다른 색상의 말이 배정되는 것을 확인.

**Acceptance Scenarios**:

1. **Given** 앱이 설치된 상태, **When** 사용자가 "새 게임 만들기"를 선택, **Then** 고유한 방 코드가 생성되고 해당 방에 호스트로 입장
2. **Given** 방 코드가 있는 상태, **When** 사용자가 방 코드를 입력하고 입장, **Then** 입장 순서에 따라 캐릭터(말 색상)가 자동 배정
3. **Given** 4명이 모두 입장한 상태, **When** 호스트가 "게임 시작"을 누름, **Then** 서버가 순서를 랜덤으로 결정하고 모든 플레이어에게 순서 공지

---

### User Story 2 - 주사위 굴리기 및 이동 (Priority: P1)

자신의 턴에 플레이어가 실물 주사위를 굴린 후 결과를 앱에 입력하고, 도착지의 QR 코드를 스캔하여 이동을 완료한다. 서버는 QR 스캔을 통해 올바른 위치로 이동했는지 검증한다.

**Why this priority**: 게임 진행의 핵심 메커니즘으로, 턴마다 반복되는 가장 빈번한 액션.

**Independent Test**: 플레이어가 주사위 결과 "7"을 입력하고 7칸 떨어진 도착지 QR을 스캔하면 위치가 업데이트되고, 잘못된 QR 스캔 시 에러 메시지가 표시됨.

**Acceptance Scenarios**:

1. **Given** 자신의 턴인 상태, **When** 주사위 결과(예: 7)를 입력, **Then** 앱에 이동해야 할 목적지가 표시됨
2. **Given** 주사위 결과 입력 후, **When** 올바른 도착지 QR 스캔, **Then** 서버가 위치를 업데이트하고 도착지 이벤트 활성화
3. **Given** 주사위 결과 입력 후, **When** 잘못된 QR 스캔, **Then** "여기가 아닙니다" 에러 메시지 표시 및 재스캔 요청

---

### User Story 3 - 땅 구매 및 건물 건설 (Priority: P1)

플레이어가 빈 땅에 도착했을 때 해당 땅을 구매하고, 이미 소유한 땅에서 건물(빌라, 건물, 호텔)을 건설하여 자산을 확장할 수 있다.

**Why this priority**: 부루마블의 핵심 전략 요소이며, 자산 축적과 승리 조건에 직결.

**Independent Test**: 빈 땅 도착 시 구매 버튼이 활성화되고, 구매 후 해당 땅이 플레이어 소유로 표시되며, 재방문 시 건물 건설 옵션이 제공됨.

**Acceptance Scenarios**:

1. **Given** 빈 땅에 도착한 상태, **When** "구매" 버튼 클릭, **Then** 해당 가격만큼 차감되고 땅 소유권 획득
1. **Given** 본인 소유 땅에 도착한 상태, **When** "건물 건설" 클릭, **Then** 건물 종류 선택(빌라/건물/호텔) 후 비용 차감 및 건물 추가
1. **Given** 잔고가 부족한 상태, **When** 구매 또는 건설 시도, **Then** "잔고 부족" 알림 및 액션 불가

---

### User Story 4 - 통행료 지불 (Priority: P1)

플레이어가 다른 플레이어 소유의 땅에 도착했을 때 통행료가 자동으로 계산되어 지불된다. 잔고 부족 시 담보/매각 옵션이 제공된다.

**Why this priority**: 플레이어 간 경제적 상호작용의 핵심이며, 파산 메커니즘과 연결.

**Independent Test**: 타인 소유 땅 도착 시 통행료 팝업이 표시되고, 확인 시 자동으로 금액이 이체됨.

**Acceptance Scenarios**:

1. **Given** 타인 소유 땅(건물 있음)에 도착, **When** 통행료 팝업 확인, **Then** 건물 수준에 따른 통행료가 자동 차감되고 소유주에게 이체
2. **Given** 잔고가 통행료보다 적은 상태, **When** 통행료 팝업 표시, **Then** "담보 설정" 또는 "자산 매각" 옵션 제공

---

### User Story 5 - 황금열쇠 이벤트 처리 (Priority: P2)

플레이어가 황금열쇠 칸에 도착하면 무작위 카드가 뽑히고, 카드 내용에 따른 효과가 적용된다. 강제 이동 카드의 경우 지정된 칸의 QR을 스캔해야 턴이 진행된다.

**Why this priority**: 게임의 재미와 랜덤성을 제공하는 중요 요소이나, 기본 이동/거래 후 구현 가능.

**Independent Test**: 황금열쇠 칸 도착 시 카드가 표시되고, 금전 카드는 즉시 적용, 이동 카드는 QR 스캔 후 적용됨.

**Acceptance Scenarios**:

1. **Given** 황금열쇠 칸 도착, **When** 카드 뽑기, **Then** 27종 카드 중 하나가 랜덤 표시
2. **Given** "부산으로 이동" 카드, **When** 부산 QR 스캔, **Then** 위치가 부산으로 업데이트되고 부산 이벤트 발생
3. **Given** "은행에서 10만원 받기" 카드, **When** 카드 확인, **Then** 즉시 10만원 지급

---

### User Story 6 - 무인도 처리 (Priority: P2)

플레이어가 무인도에 갇혔을 때 더블 탈출, 비용 지불 탈출, 또는 대기를 선택할 수 있다. 3턴 대기 후 자동 탈출된다. (참고: 무인도는 모노폴리의 감옥과 동일한 개념)

**Why this priority**: 게임 진행에 변화를 주는 특수 칸이나, 핵심 이동 로직 후 구현 가능.

**Independent Test**: 무인도 도착 시 탈출 옵션이 표시되고, 선택에 따라 올바르게 처리됨.

**Acceptance Scenarios**:

1. **Given** 무인도에 갇힌 상태(턴 시작), **When** 더블 굴림 성공 선택, **Then** 즉시 탈출하여 일반 턴 진행
2. **Given** 무인도에 갇힌 상태, **When** 비용 지불 탈출 선택, **Then** 탈출 비용 차감 후 일반 턴 진행
3. **Given** 무인도에서 3턴 대기 완료, **When** 다음 턴 시작, **Then** 자동 탈출 및 일반 이동

---

### User Story 7 - 파산 처리 (Priority: P2)

플레이어가 지불 능력을 상실했을 때 파산이 선언되고, 자산이 채권자 또는 은행에 귀속된다.

**Why this priority**: 게임 종료 조건과 연결된 중요 기능이나, 기본 거래 후 구현.

**Independent Test**: 지불 불가 상태에서 파산 선언 시 모든 자산이 올바르게 이전됨.

**Acceptance Scenarios**:

1. **Given** 통행료 지불 불가(담보/매각 후에도 부족), **When** 파산 선언, **Then** 모든 자산이 채권자에게 승계
2. **Given** 세금 등 은행 지불 불가, **When** 파산 선언, **Then** 모든 자산이 "소유주 없음" 상태로 초기화
3. **Given** 파산 발생 후, **When** 1명만 남음, **Then** 해당 플레이어 승리 및 게임 종료

---

### User Story 8 - 턴 관리 및 연결 복원 (Priority: P3)

플레이어가 모든 행동을 완료한 후 명시적으로 턴을 종료하고, 네트워크 연결 끊김 시 게임이 일시 정지된다.

**Why this priority**: 게임 흐름 제어 및 안정성 기능으로, 핵심 기능 후 폴리싱 단계.

**Independent Test**: 턴 종료 버튼 클릭 시 다음 플레이어에게 권한이 이동하고, 연결 끊김 시 모든 플레이어에게 일시 정지 알림.

**Acceptance Scenarios**:

1. **Given** 모든 행동 완료 상태, **When** "턴 종료" 클릭, **Then** 다음 순서 플레이어에게 턴 권한 이동
2. **Given** 플레이어 연결 끊김, **When** 3분 경과, **Then** 해당 플레이어 이탈 처리 및 자동 파산(은행 귀속)
3. **Given** 연결 끊김 후, **When** 3분 내 재연결, **Then** 게임 상태 복구 및 정상 진행

---

### Edge Cases

- 동시에 같은 방 코드로 5명 이상 입장 시도 시 4명까지만 허용하고 이후 거부
- 우주여행(특수 칸) 도착 시 40칸 중 원하는 칸으로 이동 가능 (QR 스캔 검증 필수)
- 동일 턴에 여러 거래(구매+건설) 시 순차적 처리
- **동시 액션 요청**: 턴 소유자만 액션 허용, 다른 플레이어의 요청은 NOT_YOUR_TURN 에러로 거부
- **황금열쇠 연쇄**: 황금열쇠로 이동한 곳이 또 황금열쇠 칸이면 연쇄 실행 (새 카드 룰음)
- **호스트 이탈**: 호스트 파산/이탈 시 다음 순서 플레이어에게 호스트 권한 자동 이전
- **전원 연결 끊김**: 모든 플레이어 연결 끊김 시 30분간 게임 상태 유지, 이후 미접속 시 로그 작성 후 데이터 보관 (endReason: timeout)
- **사회복지기금 0원**: 적립금이 0원일 때 수령 칸 도착 시 아무것도 지급 안 함 ("적립금이 없습니다" 메시지 표시)
- **더블+강제이동**: 더블 주사위 후 황금열쇠로 강제 이동 시 더블 재굴림 권한 유지 (강제 이동 후 다시 주사위)
- **건설 잔고부족**: 건물 건설 시 잔고가 부족한 옵션은 버튼 비활성화 (선택 불가)
- **통행료 파산**: 통행료 지불 시 잔고+자산 매각으로도 부족하면 즉시 파산, 보유 자산 전부 채권자에게 이전
- **최소 인원**: 2명 이상이면 호스트가 게임 시작 가능 (4명 필수 아님)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: 시스템은 고유한 방 코드를 생성하여 최대 4명의 플레이어가 입장할 수 있어야 한다
- **FR-002**: 시스템은 입장 순서대로 4가지 색상(빨강, 파랑, 노랑, 초록) 중 하나를 자동 배정해야 한다
- **FR-003**: 시스템은 게임 시작 시 플레이어 순서를 랜덤으로 결정해야 한다
- **FR-004**: 시스템은 1~12 범위의 주사위 결과(두 주사위 합)를 입력받아야 한다
- **FR-005**: 시스템은 QR 스캔을 통해 플레이어 위치를 검증해야 한다
- **FR-006**: 시스템은 잘못된 QR 스캔 시 명확한 에러 메시지를 표시해야 한다
- **FR-007**: 시스템은 씨앗사 부루마블 클래식(세계여행) 보드판의 40개 칸 데이터를 관리해야 한다
- **FR-008**: 시스템은 각 칸의 가격, 임대료(건물 수준별)를 정확히 계산해야 한다
- **FR-009**: 시스템은 27종 황금열쇠 카드를 무작위로 뽑아 효과를 적용해야 한다
- **FR-010**: 시스템은 강제 이동 시 목적지 QR 스캔이 완료될 때까지 턴 진행을 잠금해야 한다
- **FR-011**: 시스템은 플레이어 간 파산 시 모든 자산(현금, 땅, 건물)을 채권자에게 승계해야 한다
- **FR-012**: 시스템은 은행 파산 시 모든 자산을 "소유주 없음" 상태로 초기화해야 한다
- **FR-013**: 시스템은 턴 종료 버튼을 통해서만 다음 플레이어에게 권한을 이동해야 한다
- **FR-014**: 시스템은 네트워크 연결 끊김 시 모든 클라이언트에 일시 정지를 알려야 한다
- **FR-015**: 시스템은 3분(설정 가능) 내 미복귀 시 해당 플레이어를 이탈 처리해야 한다
- **FR-016**: 시스템은 우주여행 칸 이용 시 이용료(20만원)를 차감하고, 다음 턴에 별도 UI 선택 없이 스캔된 QR 위치로 즉시 이동 처리해야 한다
- **FR-017**: 시스템은 사회복지기금 기부 칸 도착 시 기부금(15만원)을 차감하고 적립금(fundPool)에 누적해야 한다
- **FR-022**: 시스템은 사회복지기금 접수(수령처) 도착 시 적립금 전액을 해당 플레이어에게 지급해야 한다
- **FR-023**: 시스템은 탈것(콩코드, 퀸엘리자베스, 콜롬비아) 증서 칸 도착 시 이동 없이 통행료(예: 콜롬비아 40만원)만 징수해야 한다
- **FR-033**: 시스템은 우주여행(코너) 도착 시 20만원을 콜롬비아호 소유주에게(없으면 무료) 지불하고 우주정류장으로 이동 처리해야 한다
- **FR-024**: 시스템은 동일한 플레이어가 중복으로 로그인하는 것을 차단해야 한다
- **FR-025**: 시스템은 주사위 결과와 QR 스캔 위치 간의 이동 거리가 일치하는지 검증해야 한다
- **FR-026**: 시스템은 통행료 지불 발생 시 토지 소유자에게 입금 대기 알림을 표시해야 한다
- **FR-027**: 시스템은 플레이어들의 총 자산(현금 + 부동산 가치 + 건물 가치)을 기준으로 실시간 순위를 계산하여 표시해야 한다
- **FR-028**: 시스템은 비정상 이동 거리 감지 시 경고 후 재스캔을 요구해야 한다
- **FR-029**: 시스템은 모든 게임 이벤트(주사위, 이동, 구매, 건설, 통행료 등)를 PostgreSQL에 로깅해야 한다
- **FR-030**: 시스템은 매 턴 시작 시 각 플레이어의 상태(현금, 부동산, 건물, 위치)를 스냅샷으로 저장해야 한다
- **FR-031**: 시스템은 게임 종료 시 최종 결과(승자, 순위, 총 턴 수)를 저장해야 한다
- **FR-032**: 시스템은 의사결정에 소요된 시간(밀리초)을 이벤트와 함께 기록해야 한다

### Key Entities

- **GameRoom**: 게임방 정보 (방 코드, 상태, 생성 시간, 호스트)
- **Player**: 플레이어 정보 (닉네임, 색상, 현재 위치, 현금, 소유 자산, 연결 상태)
- **BoardTile**: 보드판 칸 정보 (위치, 이름, 종류, 가격, 임대료 테이블, 소유자, 건물 수준)
- **GoldenKeyCard**: 황금열쇠 카드 (ID, 내용, 효과 종류, 금액/목적지)
- **GameState**: 게임 상태 (현재 턴, 턴 순서, 게임 진행 상태, 일시 정지 여부)
- **Transaction**: 거래 기록 (시간, 발신자, 수신자, 금액, 사유)
- **GameSession**: [DB] 게임 세션 메타데이터 (시작/종료 시간, 승자, 총 턴 수)
- **GamePlayer**: [DB] 참여 플레이어 정보 (visitorId, accountId, 최종 결과)
- **GameEvent**: [DB] 게임 이벤트 로그 (이벤트 타입, JSONB 데이터, 의사결정 시간)
- **TurnSnapshot**: [DB] 턴별 상태 스냅샷 (현금, 부동산, 건물, 총 자산)

## Game Logic Specification _(mandatory)_

> **하이브리드 개발 전략**: 본 섹션은 ChatGPT의 데이터 아키텍처, Gemini의 게임 루프, Claude+ChatGPT의 함수 구현을 통합한 게임 로직 명세입니다.

### 1. 핵심 상수 및 열거형 정의 (ChatGPT 기반)

```pseudo
// ───────────────────────────────────────────────────────────────
// 게임 상수 (Constants)
// ───────────────────────────────────────────────────────────────
CONST START_SALARY = 200_000          // 출발지 통과/도착 시 월급
CONST WELFARE_DONATION = 150_000      // 사회복지기금 기부액
CONST SPACE_TRAVEL_FEE = 200_000      // 우주여행 이용료 (콜롬비아호 소유주에게)
CONST ESCAPE_CARD_SELL_PRICE = 200_000// 무인도 탈출권 은행 매각가
CONST ISLAND_LOCK_TURNS = 3           // 무인도 기본 감금 턴 수
CONST LOAN_MAX = 1_000_000            // 대출 최대액 (MVP Out-of-Scope)
CONST LOAN_DEADLINE_LAPS = 3          // 대출 상환 기한 (MVP Out-of-Scope)
CONST DISCONNECT_TIMEOUT_MS = 180_000 // 연결 끊김 → 이탈 처리 시간

// ───────────────────────────────────────────────────────────────
// 게임 단계 열거형 (Gemini 기반)
// ───────────────────────────────────────────────────────────────
ENUM Phase { SETUP, FIRST_HALF, SECOND_HALF, END }

// ───────────────────────────────────────────────────────────────
// 타일 유형 (부루마블 요소 정리.md 기반)
// ───────────────────────────────────────────────────────────────
ENUM TileType {
  START,                // 출발 (코너)
  CITY_PROPERTY,        // 도시 (건물 건설 가능)
  NO_BUILD_PROPERTY,    // 건설 불가 부동산 (제주도, 부산, 서울)
  VEHICLE,              // 탈것 (콩코드, 퀸엘리자베스, 콜롬비아)
  GOLDEN_KEY,           // 황금열쇠
  SPACE_TRAVEL,         // 우주여행 (코너)
  ISLAND,               // 무인도 (코너)
  WELFARE_DONATION,     // 사회복지기금 기부 칸
  WELFARE_PAYOUT        // 사회복지기금 접수처 (코너)
}

ENUM BuildingLevel { NONE=0, VILLA=1, BUILDING=2, HOTEL=3 }
ENUM CardKeepPolicy { DISCARD_BOTTOM, KEEP_UNTIL_USE }
ENUM CardPhasePolicy { ANYTIME, SECOND_HALF_ONLY }
```

### 2. 데이터 모델 정의 (ChatGPT 기반)

> **설계 원칙**: 게임 상태 관리의 핵심인 `PlayerState`, `PropertySpec`, `GameState` 구조체를 ChatGPT 버전 기준으로 정의합니다.

```pseudo
// ───────────────────────────────────────────────────────────────
// 증서/부동산 스펙 (부루마블 요소 정리.md 데이터 로딩)
// ───────────────────────────────────────────────────────────────
STRUCT PropertySpec {
  id: string
  name: string
  tileIndex: int
  tileType: TileType                // CITY_PROPERTY, NO_BUILD_PROPERTY, VEHICLE
  purchasePrice: int                // 매입가 (대지료)
  canBuild: bool                    // 건설 가능 여부
  buildCost: { VILLA: int, BUILDING: int, HOTEL: int }
  toll: { LAND: int, VILLA: int, VILLA2: int, BUILDING: int, HOTEL: int }
  fixedTollIfNoBuild: int           // NO_BUILD_PROPERTY용 고정 통행료
  isColumbia: bool                  // 우주여행 수수료 수취 대상
  isSeoul: bool                     // 옵션게임 경매 대상
}

// ───────────────────────────────────────────────────────────────
// 부동산 상태 (런타임)
// ───────────────────────────────────────────────────────────────
STRUCT PropertyState {
  ownerPlayerId: string | null      // null = 미소유 (은행)
  buildingLevel: BuildingLevel      // 0~3
}

// ───────────────────────────────────────────────────────────────
// 황금열쇠 카드 (부루마블 요소 정리.md 27종)
// ───────────────────────────────────────────────────────────────
STRUCT GoldenKeyCard {
  id: string
  message: string
  keepPolicy: CardKeepPolicy        // 우대권/무인도탈출권은 KEEP
  phasePolicy: CardPhasePolicy      // 유지비 카드는 SECOND_HALF_ONLY
  effect: Effect                    // Effect 연산 조합
}

// ───────────────────────────────────────────────────────────────
// 플레이어 상태 (ChatGPT 기반 - 턴 제어에 필수적인 상태 변수 포함)
// ───────────────────────────────────────────────────────────────
STRUCT PlayerState {
  id: string
  name: string
  color: PlayerColor

  // Assets & Position
  position: int                     // 0~39
  cash: int                         // 현금
  bankrupt: bool                    // 파산 여부

  // ★ 턴 제어 필수 상태 (ChatGPT 핵심)
  islandTurnsLeft: int              // >0이면 무인도 감금 상태
  pendingSpaceChoice: bool          // 우주여행 → "다음 턴에 목적지 선택" 상태
  doubleCount: int                  // 0~2 (3연속 더블 → 턴 종료)

  // Owned Assets
  ownedProperties: set<PropertyId>

  // Held Cards
  hasFreePassCard: int              // 우대권 보유 수 (0/1/2)
  hasIslandEscapeCard: int          // 무인도 탈출권 보유 수

  // Network
  isConnected: bool
  disconnectedAt: timestamp | null
}

// ───────────────────────────────────────────────────────────────
// 게임 상태 (ChatGPT 기반)
// ───────────────────────────────────────────────────────────────
STRUCT GameState {
  phase: Phase
  players: list<PlayerState>
  currentTurnIndex: int
  turnOrder: list<string>           // playerId 순서

  // Board
  board: list<TileType>             // 40칸 타일 유형
  propSpecByTile: map<int, PropertySpec>
  propStateById: map<PropertyId, PropertyState>

  // Global Pools
  welfarePot: int                   // 사회복지기금 적립금
  goldenKeyDeck: deque<GoldenKeyCard>

  // Special Indices
  startTileIndex: int = 0
  islandTileIndex: int = 10
  welfareDonateIndex: int = 38
  welfarePayoutIndex: int = 20
  spaceTravelIndex: int = 30

  // Unsold Properties
  unsoldPropertyIds: set<PropertyId>

  // Time & Turn Tracking
  gameEndByTimeLimit: bool
  timeLimitTurns: int
  turnsElapsed: int
}
```

### 3. 게임 플로우 (Gemini 기반)

> **Gemini의 직관적인 Ordinary vs Option 모드 구조를 따릅니다.**

#### 3.1 게임 모드 설정

```pseudo
ENUM GameMode { ORDINARY, OPTION }

FUNCTION setupGame(playerCount: int, mode: GameMode):
  state.phase = SETUP
  shuffle(state.goldenKeyDeck)

  FOR each player:
    player.position = state.startTileIndex
    player.cash = INITIAL_MONEY       // 2,000,000원 (MVP 설정)
    player.bankrupt = false
    player.islandTurnsLeft = 0
    player.pendingSpaceChoice = false
    player.doubleCount = 0
    player.ownedProperties = {}
    player.hasFreePassCard = 0
    player.hasIslandEscapeCard = 0
    player.isConnected = true

  determineTurnOrder()                 // 랜덤 순서 결정
  placeTokensOnStart()

  IF mode == ORDINARY:
    state.phase = FIRST_HALF           // 전반전 시작 (증서 구매만)
  ELSE IF mode == OPTION:
    grantOptionModeBonus()             // 추가 100만원 지급
    runDraftPurchaseAllProperties()    // 증서 선택 구매
    auctionSeoul()                     // 서울 경매
    state.phase = SECOND_HALF          // 바로 후반전
```

#### 3.2 전반전 → 후반전 전환 조건

```pseudo
// Gemini 기반: 증서 5~6장 남았을 때 경매 후 후반전 전환
FUNCTION checkAndTransitionToSecondHalf():
  IF size(unsoldPropertyIds) IN [5, 6]:
    runAuctionForRemainingProperties()

  IF size(unsoldPropertyIds) == 0:
    state.phase = SECOND_HALF
```

### 4. 턴 진행 로직 (Claude + ChatGPT 혼합)

> **Claude의 모듈화된 함수 구조 + ChatGPT의 상태 변수 활용**

#### 4.1 메인 턴 처리

```pseudo
FUNCTION processTurn(player: PlayerState):
  IF player.bankrupt: return

  // ─────────────────────────────────────────────────
  // 1. 특수 상태 우선 처리 (ChatGPT 상태 변수 활용)
  // ─────────────────────────────────────────────────
  IF player.islandTurnsLeft > 0:
    handleIslandTurn(player)
    return

  IF player.pendingSpaceChoice:
    handleSpaceChoiceTurn(player)
    return

  // ─────────────────────────────────────────────────
  // 2. 주사위 굴리기 (Claude 모듈화)
  // ─────────────────────────────────────────────────
  (d1, d2) = inputDiceResult()         // 실물 주사위 결과 입력
  steps = d1 + d2
  isDouble = (d1 == d2)

  // ─────────────────────────────────────────────────
  // 3. 이동 및 월급 처리
  // ─────────────────────────────────────────────────
  movePlayerWithSalary(player, steps)

  // ─────────────────────────────────────────────────
  // 4. 착지 효과 처리 (Phase별 분기)
  // ─────────────────────────────────────────────────
  IF state.phase == FIRST_HALF:
    resolveLanding_FirstHalf(player)
  ELSE:
    resolveLanding_SecondHalf(player)

  // ─────────────────────────────────────────────────
  // 5. 더블 처리 (3연속 제한)
  // ─────────────────────────────────────────────────
  IF isDouble:
    player.doubleCount += 1
    IF player.doubleCount >= 3:
      player.doubleCount = 0           // 턴 종료 (무인도 이동 없음 - Clarification)
      return

    IF NOT player.bankrupt AND player.islandTurnsLeft == 0 AND NOT player.pendingSpaceChoice:
      processTurn(player)              // 재귀 호출 (추가 턴)
  ELSE:
    player.doubleCount = 0
```

#### 4.2 이동 및 월급 처리 (Claude 모듈화)

```pseudo
FUNCTION movePlayerWithSalary(player: PlayerState, steps: int):
  oldPosition = player.position
  newPosition = (oldPosition + steps) % BOARD_SIZE

  // 출발지 통과 판정
  IF crossedStart(oldPosition, newPosition):
    player.cash += START_SALARY        // 월급 20만원
    checkLoanRepayment(player)         // 대출 상환 체크 (MVP Out-of-Scope)

  player.position = newPosition

FUNCTION crossedStart(oldPos: int, newPos: int) -> bool:
  RETURN oldPos > newPos               // 한 바퀴 돌았음
```

### 5. 타일 착지 효과 (Phase별)

#### 5.1 전반전 착지 (Gemini 흐름 + Claude 모듈화)

```pseudo
FUNCTION resolveLanding_FirstHalf(player: PlayerState):
  tile = board[player.position]

  SWITCH tile.type:
    CASE CITY_PROPERTY, NO_BUILD_PROPERTY, VEHICLE:
      prop = propSpecByTile[player.position]
      pstate = propStateById[prop.id]

      IF pstate.ownerPlayerId == null:
        // 미소유 → 구매 선택
        IF playerWantsToBuy(player, prop):
          requirePay(player, prop.purchasePrice, recipient=BANK)
          IF NOT player.bankrupt:
            setOwner(player, prop.id)
      ELSE IF pstate.ownerPlayerId != player.id:
        // 전반전: 통행료 규칙 적용 여부 (Gemini 참조)
        applyRentPolicy_FirstHalf(player, prop, pstate)

    CASE GOLDEN_KEY:
      drawAndResolveGoldenKey(player)

    CASE SPACE_TRAVEL:
      handleSpaceTravelLanding(player)

    CASE ISLAND:
      sendToIsland(player)

    CASE WELFARE_DONATION:
      requirePay(player, WELFARE_DONATION, recipient=WELFARE_POT)

    CASE WELFARE_PAYOUT:
      IF state.welfarePot > 0:
        player.cash += state.welfarePot
        state.welfarePot = 0
```

#### 5.2 후반전 착지 (통행료 + 건물)

```pseudo
FUNCTION resolveLanding_SecondHalf(player: PlayerState):
  tile = board[player.position]

  SWITCH tile.type:
    CASE CITY_PROPERTY:
      prop = propSpecByTile[player.position]
      pstate = propStateById[prop.id]

      IF pstate.ownerPlayerId == null:
        IF playerWantsToBuy(player, prop):
          requirePay(player, prop.purchasePrice, recipient=BANK)
          IF NOT player.bankrupt:
            setOwner(player, prop.id)

      ELSE IF pstate.ownerPlayerId != player.id:
        // ★ 통행료 계산 (Claude 함수)
        rent = calculateRent(prop, pstate)

        // 우대권 사용 체크
        IF player.hasFreePassCard > 0 AND playerWantsToUseFreePass():
          player.hasFreePassCard -= 1
          rent = 0

        IF rent > 0:
          requirePay(player, rent, recipient=PLAYER(pstate.ownerPlayerId))

      ELSE:
        // 자기 땅 → 건물 건설 옵션
        offerBuildingOptions(player, prop, pstate)

    CASE NO_BUILD_PROPERTY, VEHICLE:
      // 후반전부터 통행료 수취 가능
      handleFixedTollProperty(player)

    // ... 나머지 동일
```

### 6. 결제 및 파산 처리 (ChatGPT 기반 settleShortage)

> **ChatGPT의 `settleShortage` 함수가 파산 방어 로직에서 가장 안정적입니다.**

```pseudo
// ───────────────────────────────────────────────────────────────
// 결제 공통 규칙: 전액 결제 (외상/부분납부 금지)
// ───────────────────────────────────────────────────────────────
FUNCTION requirePay(payer: PlayerState, amount: int, recipient: Recipient):
  IF amount <= 0 OR payer.bankrupt: return

  // 1) 현금 즉시 결제 가능
  IF payer.cash >= amount:
    payer.cash -= amount
    creditRecipient(recipient, amount)
    return

  // 2) 부족 → 정산 절차 (ChatGPT settleShortage)
  settleShortage(payer, amount, recipient)

  // 3) 정산 후에도 불가능하면 파산
  IF payer.cash < amount:
    declareBankruptcy(payer, recipient)
    return

  // 4) 가능해졌으면 결제
  payer.cash -= amount
  creditRecipient(recipient, amount)

// ───────────────────────────────────────────────────────────────
// ★ ChatGPT settleShortage - 파산 방어 핵심 로직
// ───────────────────────────────────────────────────────────────
FUNCTION settleShortage(payer: PlayerState, amount: int, recipient: Recipient):
  // A) 건물 매각으로 현금 확보 (자산 선택 UI 제공)
  WHILE payer.cash < amount AND existsSellableBuilding(payer):
    propId = playerChooseBuildingToSell(payer)  // 사용자 선택
    sellOneLevelBuildingToBank(payer, propId)

  // B) 상대에게 낼 돈인 경우 → 증서 인계 가능
  IF recipient.type == PLAYER:
    creditorId = recipient.playerId
    WHILE payer.cash < amount AND payer.ownedProperties.size > 0:
      propId = playerChoosePropertyToTransfer(payer)
      v = propertyLiquidationValue(propId)
      transferProperty(payer, creditorId, propId)

      // "차액이 발생해도 돌려받지 못함" → amount 차감
      amount = max(0, amount - v)
      IF amount == 0: break

  // (참고: 담보 기능은 MVP Out-of-Scope)
```

### 7. 특수 칸 로직

#### 7.1 무인도 (ChatGPT 상태 변수 활용)

```pseudo
FUNCTION sendToIsland(player: PlayerState):
  player.position = state.islandTileIndex
  player.islandTurnsLeft = ISLAND_LOCK_TURNS  // 3턴

FUNCTION handleIslandTurn(player: PlayerState):
  // A) 탈출권 사용
  IF player.hasIslandEscapeCard > 0 AND playerWantsToUseEscapeCard():
    player.hasIslandEscapeCard -= 1
    player.islandTurnsLeft = 0
    takeTurn_AfterIslandEscape(player)
    return

  // B) 더블 탈출 시도
  (d1, d2) = inputDiceResult()
  IF d1 == d2:
    player.islandTurnsLeft = 0
    takeTurn_AfterIslandEscape(player)
    return

  // C) 턴 소비
  player.islandTurnsLeft -= 1
  // 3턴 완료 시 다음 턴 자동 탈출 (비용 없음 - Clarification)
```

#### 7.2 우주여행 (ChatGPT pendingSpaceChoice 활용)

```pseudo
FUNCTION handleSpaceTravelLanding(player: PlayerState):
  // 1) 콜롬비아호 소유주에게 이용료 지불
  columbiaOwner = findPropertyOwner("columbia")
  IF columbiaOwner != null AND columbiaOwner != player.id:
    requirePay(player, SPACE_TRAVEL_FEE, recipient=PLAYER(columbiaOwner))

  // 2) 다음 턴 대기 상태 설정
  player.pendingSpaceChoice = true
  // 현재 턴 종료 (다음 턴에 목적지 선택)

FUNCTION handleSpaceChoiceTurn(player: PlayerState):
  // 주사위 없이 QR 스캔으로 목적지 선택
  destIndex = waitForQRScan()

  // 출발지 경유 시 월급 지급
  IF willCrossStart(player.position, destIndex):
    player.cash += START_SALARY

  player.position = destIndex
  player.pendingSpaceChoice = false

  // 착지 효과 처리
  IF state.phase == FIRST_HALF:
    resolveLanding_FirstHalf(player)
  ELSE:
    resolveLanding_SecondHalf(player)
```

### 8. 통행료 계산 (Claude 모듈화)

```pseudo
FUNCTION calculateRent(prop: PropertySpec, pstate: PropertyState) -> int:
  // 담보 상태와 무관하게 통행료 정상 징수 (Clarification 결정)

  // 건설 불가 부동산
  IF prop.tileType == NO_BUILD_PROPERTY OR prop.tileType == VEHICLE:
    RETURN prop.fixedTollIfNoBuild

  // 건물 수준별 통행료
  SWITCH pstate.buildingLevel:
    CASE NONE:    RETURN prop.toll.LAND
    CASE VILLA:   RETURN prop.toll.VILLA
    CASE BUILDING: RETURN prop.toll.BUILDING
    CASE HOTEL:   RETURN prop.toll.HOTEL

FUNCTION calculateBuildCost(prop: PropertySpec, targetLevel: BuildingLevel) -> int:
  SWITCH targetLevel:
    CASE VILLA:   RETURN prop.buildCost.VILLA
    CASE BUILDING: RETURN prop.buildCost.BUILDING
    CASE HOTEL:   RETURN prop.buildCost.HOTEL
```

### 9. 황금열쇠 처리 (ChatGPT 카드 정책 활용)

```pseudo
FUNCTION drawAndResolveGoldenKey(player: PlayerState):
  card = popFront(state.goldenKeyDeck)

  // 1) 후반전 전용 카드: 전반전에는 무효
  IF state.phase == FIRST_HALF AND card.phasePolicy == SECOND_HALF_ONLY:
    pushBack(state.goldenKeyDeck, card)
    return

  // 2) 보관형 카드 (우대권/탈출권)
  IF card.keepPolicy == KEEP_UNTIL_USE:
    applyKeepEffect(player, card)
    return                             // 덱에 반환하지 않음

  // 3) 즉시 효과 카드
  resolveCardEffect(player, card.effect)
  pushBack(state.goldenKeyDeck, card)  // 맨 밑으로 반환
```

### 10. 게임 종료 조건

```pseudo
FUNCTION checkGameEnd():
  alive = [p for p in players if NOT p.bankrupt]

  // 조건 1: 1명만 생존
  IF len(alive) == 1:
    state.phase = END
    winner = alive[0]
    return

  // 조건 2: 시간 제한 종료
  IF state.gameEndByTimeLimit AND state.turnsElapsed >= state.timeLimitTurns:
    state.phase = END
    winner = argmax(computeNetWorth(p) for p in alive)

FUNCTION computeNetWorth(player: PlayerState) -> int:
  IF player.bankrupt: RETURN 0
  worth = player.cash
  FOR propId in player.ownedProperties:
    worth += propertyLiquidationValue(propId)
  RETURN worth
```

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 4명의 플레이어가 30초 이내에 방에 입장하고 게임을 시작할 수 있다
- **SC-002**: 주사위 입력부터 QR 스캔 완료까지 전체 턴 처리가 10초 이내에 완료된다
- **SC-003**: 1시간 게임 세션 동안 동기화 오류 없이 모든 플레이어 자산 상태가 일치한다
- **SC-004**: 잘못된 QR 스캔 시 100% 확률로 에러 메시지가 표시되고 진행이 차단된다
- **SC-005**: 네트워크 재연결 시 5초 이내에 게임 상태가 복구된다
- **SC-006**: 기존 아날로그 게임 대비 전체 게임 진행 속도가 30% 이상 향상된다
- **SC-007**: 파산 발생 시 자산 이전이 3초 이내에 완료된다
- **SC-008**: 황금열쇠 27종 카드가 균등한 확률로 분포된다

## Assumptions

- 모든 플레이어는 QR 스캔이 가능한 스마트폰을 소유하고 있다
- 실물 보드판에는 각 칸에 고유한 QR 코드가 부착되어 있다
- 플레이어들은 같은 물리적 공간에서 게임을 진행한다
- 실물 주사위 결과는 플레이어가 정직하게 입력한다 (Honor System)
- 인터넷 연결이 안정적으로 유지된다 (간헐적 끊김은 복구 가능)

## Additional Specifications Required

### 1. Data Model Specification

다음 엔티티들의 상세 필드, 타입, 관계를 정의해주세요.

**Required Entities**:

| Entity        | Required Fields                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| GameRoom      | id, roomCode, status (waiting/playing/finished), hostPlayerId, players[], currentTurnIndex, turnOrder[], createdAt                 |
| Player        | id, name, color (red/blue/yellow/green), position (0-39), money, ownedTileIds[], isConnected, isBankrupt, islandTurnsLeft          |
| BoardTile     | id, index (0-39), name, type (property/goldenKey/special/start), colorGroup?, price?, rentLevels[]?, ownerId?, buildingLevel (0-3) |
| GoldenKeyCard | id, message, effectType (move/receive/pay/toIsland/repair), value?, destinationIndex?                                              |
| Transaction   | id, timestamp, fromPlayerId?, toPlayerId?, amount, reason (rent/purchase/build/tax/goldenKey/salary)                               |

**Relationships**:

- GameRoom 1:N Player
- GameRoom 1:N BoardTile (게임별 상태)
- Player 1:N BoardTile (소유권)
- Player 1:N Transaction

**Output Format**: TypeScript interface 형식으로 작성

---

### 2. WebSocket Event Specification

서버-클라이언트 간 실시간 통신 이벤트를 정의해주세요.

**Client → Server Events**:

| Event                | Payload                                           | Description           |
| -------------------- | ------------------------------------------------- | --------------------- |
| `create-room`        | { playerName }                                    | 새 방 생성            |
| `join-room`          | { roomCode, playerName }                          | 방 입장               |
| `start-game`         | { roomId }                                        | 게임 시작 (호스트만)  |
| `roll-dice`          | { roomId, playerId, diceResult: 1-12 }            | 주사위 결과 입력      |
| `scan-qr`            | { roomId, playerId, tileIndex }                   | QR 스캔으로 위치 확인 |
| `buy-property`       | { roomId, playerId, tileIndex }                   | 땅 구매               |
| `build`              | { roomId, playerId, tileIndex, buildingLevel }    | 건물 건설             |
| `pay-rent`           | { roomId, payerId, ownerId, amount }              | 통행료 지불           |
| `island-action`      | { roomId, playerId, action: 'roll'/'pay'/'wait' } | 무인도 탈출 시도      |
| `end-turn`           | { roomId, playerId }                              | 턴 종료               |
| `declare-bankruptcy` | { roomId, playerId, creditorId? }                 | 파산 선언             |

**Server → Client Events**:

| Event               | Payload                               | Description      |
| ------------------- | ------------------------------------- | ---------------- |
| `room-created`      | { roomId, roomCode }                  | 방 생성 완료     |
| `player-joined`     | { player, players[] }                 | 플레이어 입장    |
| `game-started`      | { turnOrder[], currentTurnPlayerId }  | 게임 시작        |
| `state-updated`     | { gameState: GameRoom }               | 전체 상태 동기화 |
| `turn-changed`      | { previousPlayerId, currentPlayerId } | 턴 변경          |
| `golden-key-drawn`  | { card: GoldenKeyCard }               | 황금열쇠 뽑음    |
| `player-bankrupted` | { playerId, creditorId?, assets }     | 파산 처리        |
| `game-paused`       | { reason, disconnectedPlayerId }      | 게임 일시정지    |
| `game-resumed`      | { }                                   | 게임 재개        |
| `game-ended`        | { winnerId, rankings[] }              | 게임 종료        |
| `error`             | { code, message }                     | 에러 발생        |

**Output Format**: TypeScript type 정의 포함

---

### 3. Board Data (40 Tiles)

씨앗사 부루마블 클래식(세계여행) 보드판 40칸 데이터를 정의해주세요.

**Tile Types**:

- `start`: 출발 (1개)
- `property`: 도시/부동산 (26개) - colorGroup 포함
- `vehicle`: 탈것 (3개) - 콩코드, 퀄엘리자베스, 컴럼비아
- `goldenKey`: 황금열쇠 (6개)
- `island`: 무인도 (1개)
- `travel`: 우주여행 (1개)
- `fundReceive`: 사회복지기금 접수 (1개)
- `fundDonate`: 사회복지기금 기부 (1개)

**Property Color Groups** (독점 판정용):

- 각 그룹당 2~3개 도시
- 같은 색상 그룹 전체 소유 시 통행료 2배

**Required Data per Property Tile**:

```typescript
{
  index: number,           // 0-39
  name: string,            // "타이베이", "서울" 등
  type: "property",
  colorGroup: string,      // "brown", "sky", "pink", "orange", "red", "yellow", "green", "blue"
  price: number,           // 구매가
  rentLevels: [number, number, number, number]  // [땅, 빌라, 건물, 호텔]
}
```

**Output Format**: JSON 배열 또는 TypeScript const 객체

---

### 4. Golden Key Cards (27 Types)

황금열쇠 카드 27종의 상세 데이터를 정의해주세요.

**Effect Types**:

| Type             | Description               | Required Fields                 |
| ---------------- | ------------------------- | ------------------------------- |
| `move`           | 특정 칸으로 이동          | destinationIndex                |
| `receive`        | 은행에서 돈 받기          | value                           |
| `pay`            | 은행에 돈 지불            | value                           |
| `toIsland`       | 무인도로 이동             | -                               |
| `repair`         | 건물 수리비 (건물당 비용) | villaFee, buildingFee, hotelFee |
| `collectFromAll` | 모든 플레이어에게 받기    | valuePerPlayer                  |
| `payToAll`       | 모든 플레이어에게 지불    | valuePerPlayer                  |

**Sample Cards** (참고용):

- "출발점으로 이동하세요" (move, index: 0)
- "은행에서 20만원을 받으세요" (receive, 200000)
- "병원비 10만원을 지불하세요" (pay, 100000)
- "무인도로 이동하세요" (toIsland)
- "건물 수리비: 빌라 3만, 건물 7만, 호텔 15만" (repair)

**Output Format**: JSON 배열 with TypeScript type

---

### 5. Game State Machine

게임 상태 전이 다이어그램을 정의해주세요.

**Game-Level States**:

```
waiting → playing → finished
              ↓↑
           paused
```

**Turn-Level States**:

```
idle → dice_input → moving → landed → action_phase → turn_end
                                ↓
                         [special handling]
                         - property_decision (구매/패스)
                         - rent_payment (통행료)
                         - golden_key (카드 효과)
                         - island (무인도 처리)
```

**Required Definitions**:

- 각 상태에서 가능한 액션 목록
- 상태 전이 조건
- 에러 상태 처리

**Output Format**: Mermaid 다이어그램 + TypeScript enum/type

---

### 6. Error Codes

에러 코드와 메시지를 정의해주세요.

**Categories**:

- `ROOM_*`: 방 관련 에러
- `PLAYER_*`: 플레이어 관련 에러
- `GAME_*`: 게임 진행 관련 에러
- `NETWORK_*`: 네트워크 관련 에러

**Required Errors**:

| Code               | Message                | When                  |
| ------------------ | ---------------------- | --------------------- |
| ROOM_NOT_FOUND     | 존재하지 않는 방입니다 | 잘못된 roomCode       |
| ROOM_FULL          | 방이 가득 찼습니다     | 5번째 입장 시도       |
| NOT_YOUR_TURN      | 당신의 턴이 아닙니다   | 턴 아닌 플레이어 액션 |
| INVALID_QR         | 잘못된 위치입니다      | QR 스캔 불일치        |
| INSUFFICIENT_FUNDS | 잔고가 부족합니다      | 금액 부족             |
| ALREADY_OWNED      | 이미 소유된 땅입니다   | 타인 땅 구매 시도     |
| CANNOT_BUILD       | 건설할 수 없습니다     | 건설 조건 불충족      |

**Output Format**: TypeScript enum + 메시지 매핑 객체
