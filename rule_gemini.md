제공해주신 『씨앗사 부루마불 매뉴얼』 PDF를 바탕으로, 디지털 게임 개발을 위해 필요한 **핵심 게임 로직(Game Logic)**을 정의해 드립니다. 단순한 규칙 요약이 아닌, 프로그래밍 구현을 위한 **알고리즘 및 상태(State) 정의** 형태입니다.

---

### 1. 게임 초기화 및 설정 (Initialization)

게임 시작 전 설정해야 할 상수와 변수입니다.

1.1. 플레이 모드 설정 (Game Mode Definition)

- **변수:** `GameMode` (ENUM: `Ordinary`, `Option`)
- **로직:**
- IF `GameMode` == `Ordinary`: 플레이어의 초기 자산만 지급하고 시작. 건물이 없는 상태로 시작.
- IF `GameMode` == `Option`: 플레이어에게 기본 자산 + 추가 100만 원 지급. 순서대로 씨앗증서(Deed)를 구매한 후 게임 시작.

  1.2. 초기 자산 지급 (Initial Fund Allocation)

- **상수:** `BASE_MONEY_SET` (50만x3, 10만x10, 5만x5, 2만x5, 1만x5, 5천x5, 1천x5) -> 총액 약 290만 원(권종별 합산 필요).
- **로직:**
- `PlayerCount` == 2: `Player.Money` = `BASE_MONEY_SET` \* 2
- `PlayerCount` >= 3: `Player.Money` = `BASE_MONEY_SET` \* 1

---

### 2. 메인 게임 루프 (Core Game Loop)

턴 기반 시스템의 핵심 흐름도입니다.

2.1. 턴 시작 및 주사위 굴리기 (Dice Roll)

- **함수:** `RollDice()`
- **로직:**

1. `Dice1`, `Dice2` = Random(1, 6)
2. `MoveDistance` = `Dice1` + `Dice2`
3. `IsDouble` = (`Dice1` == `Dice2`)
4. IF `Player.State` == `Trapped` (무인도): 무인도 탈출 로직 실행 (하단 4.2 참조)
5. ELSE: `MovePlayer(MoveDistance)` 실행.
6. IF `IsDouble` is TRUE: 해당 턴의 행동 종료 후 `RollDice()` 재실행 권한 부여 (One More Turn).

2.2. 플레이어 이동 (Movement)

- **함수:** `MovePlayer(amount)`
- **로직:**

1. `PreviousPosition` = `Player.Position`
2. `Player.Position` = (`Player.Position` + `amount`) % `BoardSize`
3. **월급 로직 (Pass Start Logic):**

- IF `Player.Position` < `PreviousPosition` (인덱스 순환 발생 시):
- `Bank.TransferTo(Player, 200000)` (월급 20만 원 지급).

- **예외:** 우주여행으로 인한 이동 시에는 출발지를 지나더라도 월급 로직이 적용되나, 규칙서의 '지정된 곳으로 이동' 로직에 따라 처리.

---

### 3. 타일 도착 및 행동 로직 (Tile Action)

플레이어가 특정 칸에 멈췄을 때 발생하는 이벤트입니다.

3.1. 전반전/후반전 구분 (Game Phase Logic)

- **상태변수:** `GamePhase` (ENUM: `FirstHalf`, `SecondHalf`)
- **전환 조건:** 플레이어들이 1회전을 마치거나, 증서가 일정량 이하로 남았을 때 등의 하우스 룰이 적용되나, 매뉴얼 상으로는 "전반전 끝, 후반전" 으로 명시됨.

- _구현 로직:_ `Player.HasCompletedLap` == TRUE가 되면 해당 플레이어는 `SecondHalf` 규칙(건물 건설 가능) 적용.

- **행동 제약:**
- `FirstHalf`: 씨앗증서(대지)만 구매 가능.

- `SecondHalf`: 증서 위에 건물(별장, 빌딩, 호텔) 건설 가능.

**3.2. 증서 구매 및 건설 (Purchase & Build)**

- **조건:** 현재 위치한 도시의 `Owner`가 `Null`이거나 `CurrentPlayer`일 때.
- **로직:**

1. **미소유 도시 도착 시:**

- `Cost` = 해당 타일의 대지료.
- IF `Player.Money` >= `Cost`: `Player.BuyDeed(Tile)` -> `Tile.Owner` = `Player`.

2.  **본인 소유 도시 도착 시 (후반전):**

- UI 표시: 건설 가능한 건물 목록 (별장, 빌딩, 호텔).
- 건설 비용 지불 -> `Tile.Buildings` 업데이트.
- _전략 팁 로직:_ 가진 돈을 모두 투자하여 짓는 것이 유리.

  3.3. 통행료 지불 (Pay Rent)

- **조건:** `Tile.Owner` != `CurrentPlayer` AND `Tile.Owner` != `Null`.
- **로직:**

1. `RentFee` = `CalculateRent(Tile.Buildings)` (증서 뒷면 요금표 참조).
2. IF `Player.HasCard("우대권")`:

- UI 팝업: "우대권을 사용하시겠습니까?"
- IF Yes: `RentFee` = 0, `RemoveCard("우대권")`.

3. `Player.TransferTo(Tile.Owner, RentFee)`.
4. **파산/매각 로직:**

- IF `Player.Money` < `RentFee`:
- 보유 건물 반액 매각 (`SellBuilding`) 혹은 증서 인계 처리.

- 증서 인계 시 차액은 면제됨 (외상 사절 원칙의 예외적 처리 혹은 파산).

---

### 4. 특수 칸 로직 (Special Tile Logic)

4.1. 황금열쇠 (Golden Key)

- **이벤트:** 덱의 최상단 카드를 뽑음 (`PopCard`).
- **카드 효과 처리:**
- 즉시 실행형 (이동, 지불 등) -> 실행 후 덱 최하단으로 반납.
- 보관형 (우대권, 무인도 탈출) -> `Player.Inventory`에 추가.

- 지속형 (정기종합소득세 등) -> 후반전부터 효력 발생.

  4.2. 무인도 (Desert Island)

- **상태변수:** `Player.IsTrapped` = TRUE, `Player.TrappedCount` = 0.
- **탈출 조건 (턴 시작 시 체크):**

1. `Player.Inventory`에 '무인도 탈출권' 사용.
2. 주사위 `Double` 발생: 즉시 탈출하여 이동.

3. `TrappedCount` >= 3: 3회 휴식 후 다음 턴 자동 해제 (혹은 3회 동안 갇혀 있음 ).

- _로직 명세:_ 3회 동안은 주사위를 굴려 더블이 아니면 턴 종료. 더블이면 탈출.

  4.3. 우주여행 (Space Travel)

- **도착 시 (Turn N):**
- `Columbia` 증서 소유자에게 20만 원 지불 (소유자 없으면 무료).

- 다음 턴(Turn N+1) 대기 상태로 변경.

- **행동 시 (Turn N+1):**
- 주사위 굴림 생략 (`SkipDiceRoll`).
- 원하는 타일 인덱스 선택 -> `MovePlayer(TargetIndex)`.
- 이동 경로 상에 출발지(Start)가 포함되면 월급 지급.

  4.4. 사회복지기금 (Welfare Fund)

- **전역 변수:** `Global.WelfareFundAmount` (누적 기금).
- **기부 칸 도착 시:** `Player`가 15만 원 지불 -> `Global.WelfareFundAmount`에 가산.

- **접수처 칸 도착 시:** `Global.WelfareFundAmount` 전체를 `Player`가 수령 -> `Global.WelfareFundAmount` = 0.

---

### 5. 경제 및 파산 시스템 (Economy System)

5.1. 건물 매각 (Selling Property)

- **조건:** 통행료 지불 능력이 부족할 때 또는 황금열쇠 '반액대매출' 시.
- **로직:**
- `SellPrice` = `PurchasePrice` \* 0.5 (반값).
- 건물부터 매각 후, 대지(증서) 매각 가능.

  5.2. 대출 (Loan)

- **조건:** 게임 중 단 1회 가능, 타 플레이어 동의 필요.
- **한도:** 100만 원 이내.
- **상환:** 3회전(3 Laps) 이내 상환 의무.

  5.3. 게임 종료 및 승리 (Victory Condition)

- **조건:**

1. 파산자가 발생하여 플레이어가 1명 남았을 때.
2. 미리 정한 시간(`TimeLimit`)이 종료되었을 때.

- **판정:** 총 자산(현금 + 건물 및 대지 가치)이 가장 높은 플레이어 승리.
