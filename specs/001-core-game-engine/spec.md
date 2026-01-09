# Feature Specification: 부루마블 핵심 게임 엔진

**Feature Branch**: `001-core-game-engine`  
**Created**: 2026-01-09  
**Status**: Draft  
**Input**: User description: "완벽한 디지털 부루마블 구현 - Claude, Gemini, ChatGPT 하이브리드 전략"

---

## 개요

본 명세서는 씨앗사 부루마블 보드게임의 디지털 버전을 구현하기 위한 핵심 게임 엔진에 대한 기능 요구사항을 정의합니다. 다음 하이브리드 전략을 따릅니다:

1. **데이터 아키텍처**: ChatGPT 버전의 `PlayerState`, `PropertySpec`, `GameState` 구조체 기반
2. **보드 데이터/가격**: `부루마블 요소 정리.md` 참조 (40칸 보드, 29개 증서)
3. **게임 루프(Flow)**: Gemini 버전의 직관적인 흐름 (Ordinary vs Option 모드, 전반전/후반전)
4. **함수 구현**: Claude의 모듈화 방식 + ChatGPT의 `settleShortage` 파산 방어 로직

---

## Clarifications

### Session 2026-01-09

- Q: 게임의 플레이 환경은? → A: 웹 브라우저 기반 (HTML/CSS/JS)
- Q: 멀티플레이어 동기화 방식은? → A: 온라인 실시간 (WebSocket 서버 필요)
- Q: 플레이어 연결 끊김 시 처리 방식은? → A: 일정 시간 재접속 대기 후 AI로 대체
- Q: 시간 제한 게임 옵션은? → A: 30/60/90분 선택 + 무제한 옵션
- Q: 턴 당 제한 시간은? → A: 턴 제한 없음 (연결 끊김 감지로 대체)
- Q: 연속 더블 페널티(3연속 시 무인도행)는? → A: 미적용 (씨앗사 공식 규칙 준수)
- Q: AI 플레이어의 대출 동의 정책은? → A: AI는 항상 대출 동의
- Q: Option 게임 모드 포함 여부는? → A: MVP 범위에서 제외 (Ordinary 모드만 구현)
- Q: 게임 중 호스트 이탈 시 처리는? → A: 자동으로 다른 플레이어에게 호스트 권한 이전
- Q: 건물 건설 방식은? → A: 별장(2)/빌딩(1)/호텔(1) 개별 건설 및 통행료 합산 방식 (업그레이드 아님)

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 게임 초기화 및 설정 (Priority: P1)

플레이어는 게임을 시작하기 전에 플레이어 수(2~4명)와 시간 제한(30/60/90분 또는 무제한)을 선택할 수 있다. 선택 후 각 플레이어에게 초기 자금이 분배되고, 게임 보드가 초기화된다.

**Why this priority**: 게임이 시작되기 위한 가장 기본적인 기능으로, 이 기능 없이는 다른 어떤 기능도 동작하지 않음.

**Independent Test**: 게임 설정 화면에서 플레이어 수와 시간 제한을 선택하고 "게임 시작" 버튼을 클릭하면, 모든 플레이어가 올바른 초기 자금을 가지고 출발 칸에 위치하는지 확인.

**Acceptance Scenarios**:

1. **Given** 게임이 초기화되지 않은 상태, **When** 4인 게임을 선택하고 게임 시작, **Then** 각 플레이어에게 2,930,000원(50만×3 + 10만×10 + 5만×5 + 2만×5 + 1만×5 + 5천×5 + 1천×5)이 분배되고 모든 말이 출발 칸에 위치함
2. **Given** 게임이 초기화되지 않은 상태, **When** 2인 게임을 선택하고 게임 시작, **Then** 각 플레이어에게 5,860,000원(기본 자금 ×2)이 분배됨
3. **Given** 게임 설정 화면, **When** 시간 제한 60분을 선택하고 게임 시작, **Then** 60분 타이머가 시작되고 시간 종료 시 자산 판정으로 승자 결정

---

### User Story 2 - 기본 턴 진행 (주사위 굴리기 & 이동) (Priority: P1)

플레이어는 자신의 턴에 주사위를 굴리고, 굴린 숫자만큼 보드 위를 시계방향으로 이동한다. 더블이 나오면 현재 턴의 행동 완료 후 추가 턴을 부여받는다.

**Why this priority**: 턴 기반 보드게임의 핵심 메커니즘으로, 이동 없이는 게임이 진행되지 않음.

**Independent Test**: 플레이어가 주사위를 굴리면 두 개의 주사위 값(1~6)이 표시되고, 합산 값만큼 말이 이동하는지 확인.

**Acceptance Scenarios**:

1. **Given** 플레이어가 출발 칸(인덱스 0)에 있는 상태, **When** 주사위 합이 7이 나옴, **Then** 플레이어 말이 인덱스 7 칸으로 이동함
2. **Given** 플레이어가 인덱스 38에 있는 상태, **When** 주사위 합이 5가 나옴, **Then** 플레이어 말이 인덱스 3으로 이동하고 출발 칸 통과로 월급 200,000원을 수령함
3. **Given** 플레이어가 정상 상태(무인도/우주정류장 대기 아님), **When** 더블이 나옴, **Then** 현재 칸 효과 처리 후 추가 턴이 부여됨

---

### User Story 3 - 도시 칸 도착 및 증서 구매 (Priority: P1)

플레이어가 미소유 도시 칸에 도착하면 해당 증서를 구매할 수 있다. 구매 시 은행에 대지료를 지불하고 증서를 획득한다.

**Why this priority**: 부동산 매매는 부루마블의 핵심 전략 요소로, 이 기능이 없으면 게임의 목적이 사라짐.

**Independent Test**: 미소유 도시 칸에 도착했을 때 구매 버튼이 표시되고, 구매 후 해당 증서가 플레이어 소유로 전환되는지 확인.

**Acceptance Scenarios**:

1. **Given** 타이베이(매입가 50,000원)가 미소유 상태이고 플레이어 잔고가 100,000원, **When** 플레이어가 타이베이에 도착하고 구매를 선택, **Then** 플레이어 잔고가 50,000원 감소하고 타이베이 증서의 소유자가 해당 플레이어로 변경됨
2. **Given** 서울(매입가 1,000,000원)이 미소유 상태이고 플레이어 잔고가 500,000원, **When** 플레이어가 서울에 도착, **Then** 자금 부족으로 구매 버튼이 비활성화(또는 구매 불가 안내)됨
3. **Given** 타이베이가 미소유 상태, **When** 플레이어가 도착 후 구매를 거절, **Then** 증서는 미소유 상태로 유지되고 다음 도착자가 구매 기회를 가짐

---

### User Story 4 - 건물 건설 (후반전) (Priority: P2)

후반전에 플레이어는 자신이 소유한 건설 가능 도시에 별장(최대 2채), 빌딩(최대 1채), 호텔(최대 1채)을 자금이 허용하는 한 자유롭게 건설할 수 있다. 건물은 턴 시작 시 또는 자신의 땅에 도착했을 때 건설할 수 있다.

**Why this priority**: 통행료 수입을 증가시키는 핵심 전략으로, 후반전 게임 플레이에 필수적임.

**Independent Test**: 후반전에서 자신 소유 도시에 건물 건설 옵션이 표시되고(별장/빌딩/호텔 각각), 건설 후 해당 건물의 수가 증가하는지 확인.

**Acceptance Scenarios**:

1. **Given** 후반전이고 플레이어가 타이베이(건설 가능, 건물 없음)를 소유, **When** 별장 1채와 호텔 1채 건설 선택, **Then** 플레이어 잔고가 감소(별장비+호텔비)하고 타이베이에 별장 1, 호텔 1이 건설됨
2. **Given** 타이베이에 별장 2채가 이미 건설된 상태, **When** 별장 추가 건설 요청, **Then** 별장 최대 개수(2) 도달로 건설 불가
3. **Given** 타이베이에 호텔 1채 건설된 상태, **When** 호텔 추가 건설 요청, **Then** 호텔 최대 개수(1) 도달로 건설 불가
4. **Given** 전반전 상태, **When** 자신 소유 도시에 도착, **Then** 건물 건설 옵션이 표시되지 않음

---

### User Story 5 - 통행료 지불 (Priority: P1)

타인 소유 도시에 도착하면 통행료를 지불해야 한다. 통행료는 **대지 통행료 + (지어진 각 건물의 통행료 합계)** 로 계산된다. 우대권 카드로 면제받을 수 있다.

**Why this priority**: 플레이어 간 자금 이동의 핵심 메커니즘으로, 게임 진행과 파산 판정에 필수적임.

**Independent Test**: 타인 소유 도시에 도착했을 때 건물 현황에 따른 정확한 통행료가 계산되어 자동으로 차감되는지 확인.

**Acceptance Scenarios**:

1. **Given** 후반전이고 타이베이가 다른 플레이어 소유(건물 없음), **When** 플레이어가 도착, **Then** 대지 통행료 2,000원이 차감되고 소유자에게 지급됨
2. **Given** 타이베이에 별장 1채, 호텔 1채가 건설된 상태, **When** 플레이어가 도착, **Then** (대지료 + 별장료 + 호텔료) 합계 금액이 차감됨
3. **Given** 플레이어가 우대권 카드를 보유한 상태에서 타인 소유 도시에 도착, **When** 우대권 사용을 선택, **Then** 통행료 없이 통과하고 우대권 카드가 황금열쇠 덱 맨 아래로 반납됨
4. **Given** 전반전이고 건설 불가 증서(제주도, 부산, 서울, 탈것)가 타인 소유, **When** 플레이어가 도착, **Then** 통행료가 발생하지 않음 (후반전부터 통행료 발생)

---

### User Story 6 - 자금 부족 시 정산 처리 (Priority: P1)

플레이어가 통행료, 세금 등을 지불할 자금이 부족할 경우, 건물 매각, 증서 인계, 또는 대출을 통해 자금을 확보해야 한다. 모든 수단을 동원해도 지불 불가능하면 파산한다.

**Why this priority**: 외상/부분납부 금지 원칙에 따른 파산 방어 로직으로, 게임 종료 조건 판정에 필수적임.

**Independent Test**: 자금 부족 상황에서 건물 매각, 증서 인계 옵션이 제공되고, 정산 후에도 부족하면 파산 처리되는지 확인.

**Acceptance Scenarios**:

1. **Given** 플레이어 잔고 50,000원, 통행료 100,000원, 별장 1개 소유, **When** 통행료 지불 요구, **Then** 별장 매각(50,000원 환급) 후 잔고 100,000원으로 통행료 지불 가능
2. **Given** 플레이어 잔고 50,000원, 통행료 200,000원, 건물 없고 증서 1개(매입가 100,000원) 소유, **When** 상대 플레이어에게 통행료 지불 요구, **Then** 증서를 상대에게 인계하고 차액(50,000원) 면제됨
3. **Given** 자금 부족 상태에서 대출 미사용 + 다른 플레이어 동의, **When** 대출(최대 1,000,000원) 요청, **Then** 대출금 지급 및 3바퀴 내 상환 의무 발생
4. **Given** 모든 자산 처분 후에도 지불 불가능, **When** 정산 완료, **Then** 플레이어 파산 선언 및 모든 자산 은행 귀속

---

### User Story 7 - 황금열쇠 카드 처리 (Priority: P2)

황금열쇠 칸에 도착하면 덱에서 카드 1장을 뽑아 효과를 적용한다. 카드 종류에 따라 즉시 실행, 보관, 또는 조건부 효과가 적용된다.

**Why this priority**: 게임의 불확실성과 재미 요소를 제공하는 핵심 메커니즘.

**Independent Test**: 황금열쇠 칸 도착 시 카드가 뽑히고 해당 효과가 올바르게 적용되는지 확인.

**Acceptance Scenarios**:

1. **Given** 황금열쇠 칸에 도착, **When** "노벨평화상(+30만)" 카드 획득, **Then** 플레이어 잔고 +300,000원 후 카드 덱 맨 아래로 반납
2. **Given** 황금열쇠 칸에 도착, **When** "우대권" 카드 획득, **Then** 카드가 플레이어 인벤토리에 보관됨 (덱에 반납하지 않음)
3. **Given** 황금열쇠 칸에 도착, **When** "무인도 탈출권" 카드 획득, **Then** 카드가 플레이어 인벤토리에 보관되거나 은행에 200,000원 매각 가능
4. **Given** 전반전이고 "정기종합소득세" 카드 획득, **When** 카드 효과 판정, **Then** 전반전에는 효력 없음(무효 처리) 후 덱 맨 아래로 반납
5. **Given** "반액대매출" 카드 획득, **When** 카드 효과 실행, **Then** 가장 비싼 재산(건물 포함)을 반값에 은행에 매각

---

### User Story 8 - 무인도 감금 및 탈출 (Priority: P2)

무인도 칸에 도착하면 3턴 동안 감금된다. 더블을 굴리거나 무인도 탈출권을 사용하면 즉시 탈출할 수 있다.

**Why this priority**: 게임의 페널티 메커니즘으로, 전략적 판단(탈출권 보관/사용)에 영향을 미침.

**Independent Test**: 무인도 도착 시 감금 상태가 되고, 더블 또는 탈출권으로 탈출 가능한지 확인.

**Acceptance Scenarios**:

1. **Given** 플레이어가 무인도 칸에 도착, **When** 착지 처리, **Then** 감금 상태(islandTurnsLeft = 3)로 전환되고 턴 종료
2. **Given** 감금 상태(islandTurnsLeft = 2), **When** 주사위 더블 발생, **Then** 즉시 탈출하고 추가 주사위로 이동
3. **Given** 감금 상태(islandTurnsLeft = 1), **When** 더블이 아닌 주사위, **Then** 감금 해제(islandTurnsLeft = 0)되나 해당 턴에는 이동 없음
4. **Given** 감금 상태이고 무인도 탈출권 보유, **When** 탈출권 사용 선택, **Then** 즉시 탈출하고 정상 턴 진행(주사위 굴려 이동)

---

### User Story 9 - 우주여행 (Priority: P2)

우주여행 칸에 도착하면 컬럼비아호 탑승료(소유자가 있는 경우 200,000원)를 지불하고 우주정류장으로 이동한다. 다음 턴에 주사위 없이 원하는 칸으로 이동할 수 있다.

**Why this priority**: 전략적 이동 옵션을 제공하는 특수 메커니즘.

**Independent Test**: 우주여행 칸 도착 → 우주정류장 대기 → 다음 턴 목적지 선택 흐름이 올바르게 동작하는지 확인.

**Acceptance Scenarios**:

1. **Given** 우주여행 칸 도착, 컬럼비아호 타인 소유, **When** 착지 처리, **Then** 200,000원 지불 후 우주정류장으로 이동, 대기 상태(pendingSpaceChoice = true)
2. **Given** 우주정류장 대기 상태, **When** 다음 턴 시작, **Then** 주사위 굴리기 없이 목적지 선택 UI 제공
3. **Given** 목적지로 인덱스 5 선택, 현재 위치 인덱스 30, **When** 이동 처리, **Then** 출발 칸(인덱스 0) 통과로 월급 200,000원 수령 후 인덱스 5 착지

---

### User Story 10 - 사회복지기금 (Priority: P3)

사회복지기금 기부 칸에 도착하면 150,000원을 기금에 기부한다. 사회복지기금 접수 칸(모서리)에 도착하면 누적 기금 전액을 수령한다.

**Why this priority**: 보조적인 자금 메커니즘으로, 핵심 게임 플레이에 큰 영향을 미치지 않음.

**Independent Test**: 기부 칸에서 기금이 누적되고, 접수 칸에서 전액 수령되는지 확인.

**Acceptance Scenarios**:

1. **Given** 사회복지기금 기부 칸 도착, **When** 착지 처리, **Then** 플레이어 잔고 -150,000원, 기금 풀(welfarePot) +150,000원
2. **Given** 사회복지기금 접수 칸 도착, 기금 풀 = 300,000원, **When** 착지 처리, **Then** 플레이어 잔고 +300,000원, 기금 풀 = 0
3. **Given** 사회복지기금 접수 칸 도착, 기금 풀 = 0, **When** 착지 처리, **Then** 아무 효과 없음

---

### User Story 11 - 전반전 → 후반전 전환 (Priority: P2)

미판매 증서가 5~6장 이하가 되면 잔여 증서 경매를 진행하고 후반전으로 전환된다. 후반전부터 건물 건설, 건설 불가 증서 통행료가 활성화된다.

**Why this priority**: 게임 진행의 중요한 페이즈 전환으로, 후반전 기능들의 전제조건.

**Independent Test**: 미판매 증서가 5장 이하가 되었을 때 경매 UI가 표시되고 후반전으로 전환되는지 확인.

**Acceptance Scenarios**:

1. **Given** 미판매 증서 6장 남음, **When** 플레이어가 증서 구매로 5장이 됨, **Then** 잔여 증서 경매 시작
2. **Given** 경매 중 특정 증서에 2명 이상 희망, **When** 희망자 확정, **Then** 주사위 굴려 높은 숫자가 우선권 획득
3. **Given** 모든 증서 분배 완료, **When** 경매 종료, **Then** gamePhase = SECOND_HALF로 전환

---

### User Story 12 - 게임 종료 및 승리 판정 (Priority: P1)

1명을 제외한 모든 플레이어가 파산하거나, 시간제한 게임에서 제한 시간이 종료되면 게임이 끝난다. 생존자가 1명이면 해당 플레이어 승리, 시간제한 종료 시 총 자산이 가장 많은 플레이어가 승리한다.

**Why this priority**: 게임의 목적과 종료 조건을 정의하는 필수 기능.

**Independent Test**: 파산으로 1명 남았을 때 게임 종료 및 승자 발표가 이루어지는지 확인.

**Acceptance Scenarios**:

1. **Given** 4인 게임에서 3명 파산, **When** 마지막 파산 처리 완료, **Then** 생존자 1명이 승자로 선언되고 게임 종료
2. **Given** 시간제한 60분 게임, **When** 60분 경과, **Then** 생존자 중 총 자산(현금 + 증서 매입가 + 건물 건설비) 최고인 플레이어 승리
3. **Given** 시간제한 게임에서 자산 동점, **When** 판정, **Then** 현금 보유액으로 2차 판정 (또는 공동 승리)

---

### Edge Cases

- **파산 시 증서 인계 차액**: 증서 가치가 채무보다 클 경우 차액을 돌려받지 못함 (일방적 손해)
- **무인도에서 탈출권 판매 불가**: 무인도 감금 상태에서는 탈출권을 은행에 매각할 수 없음
- **우주여행 목적지 선택 후 특수 칸**: 목적지가 무인도인 경우 무인도 감금 처리, 황금열쇠인 경우 카드 뽑기 등 정상 착지 처리
- **더블로 무인도 도착**: 더블이어도 무인도 감금 시 추가 턴 없음
- **대출 후 3바퀴 미상환**: 출발 통과 시마다 상환 기회, 3바퀴 경과 시 강제 전액 상환 요구
- **황금열쇠 "세계일주 초대권"**: 현재 위치에서 한 바퀴 돌아 같은 칸에 도착, 출발 통과로 월급 + 사회복지기금 접수 통과 시 기금 수령
- **플레이어 연결 끊김**: 타임아웃(재접속 대기) 후에도 복귀하지 않으면 AI가 해당 플레이어를 대신 조종
- **연속 더블 무제한**: 더블 3연속 페널티(무인도행) 미적용, 더블이 나올 때마다 추가 턴 부여
- **AI 플레이어 대출 동의**: AI로 대체된 플레이어는 다른 플레이어의 대출 요청에 항상 동의함
- **호스트 이탈**: 게임 중 호스트가 이탈하면 자동으로 다른 플레이어에게 호스트 권한이 이전됨

---

## Requirements _(mandatory)_

### Functional Requirements

#### 핵심 상수 정의

- **FR-001**: 시스템은 월급(`START_SALARY = 200,000`), 사회복지기금 기부액(`WELFARE_DONATION = 150,000`), 우주여행료(`SPACE_TRAVEL_FEE = 200,000`), 무인도 감금 턴(`ISLAND_LOCK_TURNS = 3`), 대출 한도(`LOAN_MAX = 1,000,000`), 대출 상환 기한(`LOAN_DEADLINE_LAPS = 3`)을 상수로 정의해야 한다.

#### 데이터 모델 (ChatGPT 구조체 기반)

- **FR-002**: 시스템은 `PropertySpec` 엔티티를 통해 각 도시/탈것의 이름, 매입가, 건설비(별장/빌딩/호텔), 통행료(대지/별장/빌딩/호텔), 건설 가능 여부를 관리해야 한다.
- **FR-003**: 시스템은 `PropertyState` 엔티티를 통해 각 증서의 현재 소유자와 건물 레벨을 관리해야 한다.
- **FR-004**: 시스템은 `PlayerState` 엔티티를 통해 플레이어의 위치, 현금, 파산 여부, 무인도 감금 상태(`islandTurnsLeft`), 우주여행 대기 상태(`pendingSpaceChoice`), 보유 증서, 보유 카드(우대권/탈출권), 대출 정보를 관리해야 한다.
- **FR-005**: 시스템은 `GameState` 엔티티를 통해 게임 페이즈(SETUP/FIRST_HALF/SECOND_HALF/END), 현재 턴 플레이어, 사회복지기금 풀, 황금열쇠 덱, 미판매 증서 목록을 관리해야 한다.

#### 보드 데이터 (부루마블 요소 정리.md 기반)

- **FR-006**: 시스템은 40칸 보드(정사각형, 시계방향)를 지원해야 하며, 모서리 4개(출발/무인도/사회복지기금 접수/우주여행) + 각 변 9개씩 구성되어야 한다.
- **FR-007**: 시스템은 29개 증서 데이터(23개 건설 가능 도시, 3개 건설 불가 도시, 3개 탈것)를 외부 데이터(JSON 등)로 관리하고 게임 로드 시 불러와야 한다.
- **FR-008**: 시스템은 27종 황금열쇠 카드 데이터(지정이동 10종, 상금 5종, 유지비 3종, 지출 3종, 후퇴 2종, 탈출권 1종, 면제 2종, 반액매출 2종, 기타 2종)를 관리해야 한다.

#### 게임 루프 (Gemini 흐름 기반)

- **FR-009**: 시스템은 전반전(증서 구매만 가능) → 후반전(건물 건설 + 통행료 징수) 흐름을 지원해야 한다.

#### 턴 처리 (Claude 모듈화 + ChatGPT settleShortage)

- **FR-012**: 시스템은 `rollDice()` 함수로 1~6 랜덤 값 2개를 반환하고 합계 및 더블 여부를 판정해야 한다.
- **FR-013**: 시스템은 `movePlayer(steps)` 함수로 플레이어를 이동시키고, 출발 칸 통과 시 월급을 지급해야 한다.
- **FR-014**: 시스템은 `processTileAction(tile)` 함수로 도착 칸 유형에 따라 적절한 처리(구매/통행료/카드/특수효과)를 실행해야 한다.
- **FR-015**: 시스템은 `requirePay(amount, recipient)` 함수로 지불 처리하고, 현금 부족 시 `settleShortage()` 함수를 호출해야 한다.
- **FR-016**: 시스템은 `settleShortage()` 함수에서 건물 매각 → 증서 인계 → 대출 순서로 자금 확보를 시도하고, 모두 실패 시 파산 처리해야 한다.
- **FR-017**: 시스템은 `declareBankruptcy(player)` 함수로 플레이어의 모든 자산을 은행에 귀속시키고 게임 종료 조건을 확인해야 한다.

#### 특수 칸 처리

- **FR-018**: 시스템은 황금열쇠 카드의 `keepPolicy(DISCARD_BOTTOM/KEEP_UNTIL_USE)` 및 `phasePolicy(ANYTIME/SECOND_HALF_ONLY)`에 따라 처리를 분기해야 한다.
- **FR-019**: 시스템은 무인도 감금 상태에서 턴 시작 시 더블 판정 또는 탈출권 사용 UI를 제공해야 한다.
- **FR-020**: 시스템은 우주여행 대기 상태에서 목적지 선택 UI를 제공하고, 이동 경로상 출발 칸 통과 시 월급을 지급해야 한다.

---

### Key Entities

- **PlayerState**: 플레이어의 게임 상태 (위치, 자금, 보유 자산, 특수 상태)
- **PropertySpec**: 증서의 정적 정보 (이름, 가격, 통행료, 건설비)
- **PropertyState**: 증서의 동적 정보 (소유자, 건물 레벨)
- **GameState**: 게임 전체 상태 (페이즈, 턴 순서, 공용 자원)
- **GoldenKeyCard**: 황금열쇠 카드 정보 (효과, 보관 정책, 페이즈 정책)

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 2~4인 플레이어 게임을 완료(파산 또는 시간제한)까지 진행할 수 있어야 한다.
- **SC-002**: 모든 40개 칸의 착지 효과가 정상 동작해야 한다.
- **SC-003**: 모든 27종 황금열쇠 카드 효과가 정상 동작해야 한다.
- **SC-004**: 전반전 → 후반전 전환이 증서 5~6장 이하 조건에서 자동으로 트리거되어야 한다.
- **SC-005**: 자금 부족 시 건물 매각 → 증서 인계 → 대출 → 파산 정산 흐름이 누락 없이 동작해야 한다.
- **SC-006**: 무인도 감금/탈출, 우주여행 목적지 선택 등 특수 상태 처리가 정확히 동작해야 한다.
- **SC-007**: 게임 종료 시 승자 판정(생존자 1명 또는 총 자산)이 정확히 이루어져야 한다.

---

## Assumptions

1. 보드 데이터(40칸 구성, 29개 증서 가격/통행료)는 `부루마블 요소 정리.md` 기준을 따른다.
2. 황금열쇠 카드 덱은 게임 시작 시 셔플되며, 사용 후 덱 맨 아래로 반납된다.
3. 2인 플레이 시 기본 자금의 2배를 지급한다.
4. 건물 매각 시 은행에 구매가 그대로 환급받는다 (반값 아님, 반액대매출 카드는 예외).
5. 증서 인계 시 차액은 돌려받지 못한다 (일방적 손해).
6. 대출은 게임 중 1회만 가능하며, 다른 플레이어 1명 이상의 동의가 필요하다.
7. 플랫폼은 웹 브라우저 기반(HTML/CSS/JS)으로 구현하며, 추가 설치 없이 접근 가능하다.
8. 멀티플레이어는 온라인 실시간 방식으로, WebSocket 서버를 통해 게임 상태를 동기화한다.
9. 시간 제한 게임은 30/60/90분 또는 무제한 중 선택 가능하다.
10. 턴 당 제한 시간은 없으며, 연결 끊김 감지로 AFK 플레이어를 처리한다.

---

## Appendix A: UI Reference Implementation (Mandatory)

본 UI 코드는 `spec.md`의 일부로서, 프론트엔드 구현 시 반드시 따라야 할 레이아웃과 스타일 가이드입니다. 40칸 보드(11x11 Grid) 로직이 적용되어 있습니다.

**Reference File**: [BlueMarbleUI.tsx](./references/BlueMarbleUI.tsx)

```tsx
import React from "react";
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Building2,
  MapPin,
  Plane,
  AlertCircle,
  Coins,
  User,
} from "lucide-react";

// --- 유틸리티 (UI 표시용) ---
const DiceIcon = ({ value, rolling }: { value: number; rolling: boolean }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return (
    <Icon
      size={48}
      className={`text-indigo-600 ${rolling ? "animate-spin" : ""}`}
    />
  );
};

const formatMoney = (amount: number) => {
  return (
    new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" })
      .format(amount)
      .replace("₩", "") + "원"
  );
};

// 보드 그리드 스타일 계산 함수 (40칸, 11x11 그리드)
// Spec: 11x11 Grid for 40 tiles (10 per side + corners sharing)
// Index 0: Start (Bottom Right usually, but based on reference logic flow)
const getGridStyle = (index: number) => {
  // 0~10: 하단 (우->좌) - Bottom Row
  if (index >= 0 && index <= 10) return { gridRow: 11, gridColumn: 11 - index };
  // 10~20: 좌측 (하->상) - Left Column
  if (index > 10 && index <= 20)
    return { gridRow: 11 - (index - 10), gridColumn: 1 };
  // 20~30: 상단 (좌->우) - Top Row
  if (index > 20 && index <= 30)
    return { gridRow: 1, gridColumn: 1 + (index - 20) };
  // 30~39: 우측 (상->하) - Right Column
  if (index > 30 && index <= 39)
    return { gridRow: 1 + (index - 30), gridColumn: 11 };
  return {};
};

/**
 * BlueMarbleUI Component (Reference Implementation)
 * Adapted for 40-tile board (Spec FR-006)
 */
export default function BlueMarbleUI({
  cells = [],
  players = [],
  currentTurnIndex = 0,
  diceState = { d1: 1, d2: 1, isRolling: false },
  gameState = "WAITING",
  gameLog = [],
  modalState = null,
  onRollDice = () => console.log("Roll Dice Clicked"),
  onBuyLand = () => console.log("Buy Land Clicked"),
  onPassLand = () => console.log("Pass Land Clicked"),
  onRestart = () => console.log("Restart Clicked"),
}: any) {
  const currentPlayer = players[currentTurnIndex] || players[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-[1400px] w-full flex flex-col lg:flex-row gap-6">
        {/* --- 왼쪽: 게임 보드 (11x11 Grid for 40 tiles) --- */}
        <div className="flex-1 bg-white p-2 rounded-xl shadow-2xl overflow-hidden">
          {/* 11x11 Grid Container */}
          <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] grid-rows-[repeat(11,minmax(0,1fr))] gap-0.5 w-full aspect-square bg-slate-200 border-4 border-slate-300 p-1 relative">
            {/* 센터 영역 (로고 및 주사위 - Inner 9x9) */}
            <div className="col-start-2 col-end-[11] row-start-2 row-end-[11] bg-slate-50 flex flex-col items-center justify-center rounded-lg p-6 relative">
              <h1 className="text-4xl font-extrabold text-indigo-600 mb-2 tracking-tighter">
                BLUE MARBLE
              </h1>
              <p className="text-slate-400 mb-8 font-medium">
                Core Game Engine v1.0
              </p>

              {/* 주사위 컨트롤 */}
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <DiceIcon
                    value={diceState.d1}
                    rolling={diceState.isRolling}
                  />
                  <DiceIcon
                    value={diceState.d2}
                    rolling={diceState.isRolling}
                  />
                </div>

                {/* 상태에 따른 버튼 표시 */}
                {gameState === "WAITING" && !currentPlayer?.bankrupt && (
                  <button
                    onClick={onRollDice}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg transform transition active:scale-95 animate-pulse"
                  >
                    주사위 굴리기
                  </button>
                )}

                {gameState !== "WAITING" && (
                  <div className="text-slate-500 font-medium animate-bounce">
                    {gameState === "ROLLING"
                      ? "굴리는 중..."
                      : gameState === "MOVING"
                      ? "이동 중..."
                      : gameState === "ACTION"
                      ? "선택 대기 중..."
                      : ""}
                  </div>
                )}
              </div>

              {/* 턴 표시기 */}
              <div className="absolute top-4 left-4">
                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  Current Turn: {players[currentTurnIndex]?.name}
                </span>
              </div>
            </div>

            {/* 보드 칸 렌더링 */}
            {cells.map((cell: any) => (
              <div
                key={cell.id}
                style={getGridStyle(cell.id)}
                className={`
                        relative border border-slate-300 flex flex-col justify-between p-0.5 select-none transition-colors duration-300 text-[10px]
                        ${
                          cell.type === "START" ||
                          cell.type === "ISLAND" ||
                          cell.type === "SPACE" ||
                          cell.type === "WELFARE"
                            ? "bg-slate-200"
                            : "bg-white"
                        }
                        ${cell.color ? cell.color : ""}
                        ${
                          modalState?.cell?.id === cell.id
                            ? "ring-4 ring-yellow-400 z-10"
                            : ""
                        }
                    `}
              >
                {/* 상단: 이름 */}
                <div className="font-bold text-center leading-tight pt-0.5 break-keep line-clamp-2">
                  {cell.name}
                </div>

                {/* 중앙: 아이콘 */}
                <div className="flex justify-center items-center opacity-30 my-auto">
                  {cell.type === "START" && <MapPin size={16} />}
                  {cell.type === "ISLAND" && <AlertCircle size={16} />}
                  {cell.type === "SPACE" && <Plane size={16} />}
                  {cell.type === "WELFARE" && <Coins size={16} />}
                  {cell.type === "LAND" && <Building2 size={16} />}
                </div>

                {/* 하단: 가격 */}
                {cell.type === "LAND" && (
                  <div className="text-[8px] text-center font-medium text-slate-600">
                    {formatMoney(cell.price).replace("원", "")}
                  </div>
                )}

                {/* 플레이어 토큰 (위치 기반 렌더링) */}
                <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none flex-wrap p-1">
                  {players.map(
                    (p: any, idx: number) =>
                      p.position === cell.id &&
                      !p.bankrupt && (
                        <div
                          key={idx}
                          className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border border-white shadow-lg flex items-center justify-center text-white text-[8px] font-bold z-20 transform transition-all ${
                            p.color
                          } ${
                            currentTurnIndex === idx
                              ? "scale-110 ring-2 ring-yellow-400"
                              : "opacity-80"
                          }`}
                        >
                          P{idx + 1}
                        </div>
                      )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- 오른쪽: 정보 패널 --- */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* 현재 턴 정보 */}
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-indigo-500">
            <h2 className="text-gray-500 text-sm font-bold uppercase mb-1">
              Current Turn
            </h2>
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${currentPlayer?.color}`}
              ></div>
              <span className="text-2xl font-bold text-gray-800">
                {currentPlayer?.name}
              </span>
            </div>
            {currentPlayer?.jailed > 0 && (
              <span className="text-red-500 text-sm">
                무인도 수감 중 ({currentPlayer.jailed})
              </span>
            )}
          </div>

          {/* 플레이어 목록 및 자산 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 min-h-[300px]">
            <div className="bg-slate-50 p-3 border-b border-slate-100 font-bold text-slate-700">
              플레이어 현황
            </div>
            <div className="divide-y divide-slate-100">
              {players.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 flex items-center justify-between ${
                    currentTurnIndex === idx ? "bg-indigo-50" : ""
                  } ${p.bankrupt ? "opacity-50 grayscale" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${p.color}`}
                    >
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.bankrupt ? "파산" : "경기 중"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-indigo-600">
                    {formatMoney(p.money)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 게임 로그 */}
          <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg h-48 overflow-y-auto text-sm font-mono leading-relaxed">
            <div className="text-xs text-slate-400 mb-2 border-b border-slate-600 pb-1">
              GAME LOG
            </div>
            {gameLog.map((log: string, idx: number) => (
              <div key={idx} className="mb-1 opacity-90 animate-fade-in">
                {idx === 0 ? (
                  <span className="text-yellow-400 mr-2">➤</span>
                ) : (
                  <span className="text-slate-500 mr-2">•</span>
                )}
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- 모달: 땅 구매 --- */}
      {modalState && modalState.type === "BUY" && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {modalState.cell.name} 구매?
              </h3>
              <p className="text-gray-500">
                이 땅의 주인은 없습니다.
                <br />
                구매하시겠습니까?
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">가격</span>
                <span className="font-bold text-slate-900">
                  {formatMoney(modalState.cell.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">내 자산</span>
                <span className="font-bold text-indigo-600">
                  {formatMoney(currentPlayer?.money || 0)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onPassLand}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                안 살래요
              </button>
              <button
                onClick={() => onBuyLand(modalState.cell)}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
              >
                구매하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 모달: 게임 종료 --- */}
      {gameState === "END" && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
            <h2 className="text-3xl font-black text-indigo-800 mb-4">
              GAME OVER
            </h2>
            <div className="text-xl mb-8">
              승리자는{" "}
              <span className="font-bold text-indigo-600">
                {players.find((p: any) => !p.bankrupt)?.name || "없음"}
              </span>{" "}
              입니다!
            </div>
            <button
              onClick={onRestart}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition"
            >
              다시 하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```
