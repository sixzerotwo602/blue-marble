아래는 **씨앗사 부루마불 매뉴얼 기준**으로 디지털 게임을 만들 때, 반드시 코드로 옮길 수 있게 **규칙을 “로직(상태/조건/전이)”으로 정의**한 명세입니다. (근거: 매뉴얼 전반 )

---

## 1) 핵심 상수/열거형 정의 (p2, p3, p4, p6, p7)

```pseudo
CONST START_SALARY = 200_000          // 출발지 통과(또는 도착 포함) 월급
CONST WELFARE_DONATION = 150_000      // 사회복지기금 기부액
CONST SPACE_TRAVEL_FEE = 200_000      // 우주여행 시 콜럼비아호 사용료
CONST ESCAPE_CARD_SELL_PRICE = 200_000// 무인도 탈출용 카드 은행 매각가
CONST ISLAND_LOCK_TURNS = 3           // 무인도 기본 감금 턴 수
CONST LOAN_MAX = 1_000_000            // 대출 최대액
CONST LOAN_DEADLINE_LAPS = 3          // 대출 상환 기한(출발지 3회 통과 이내)

ENUM Phase { SETUP, FIRST_HALF, SECOND_HALF, END }
ENUM TileType {
  START,
  CITY_PROPERTY,              // 건물(별장/빌딩/호텔) 가능한 일반 도시
  NO_BUILD_PROPERTY,          // 건물 불가(통행료는 후반전부터) - 매뉴얼 표현 그대로 일반화
  GOLDEN_KEY,
  SPACE_TRAVEL,               // 우주여행 칸(즉시 우주정류장으로)
  SPACE_STATION,              // 우주정류장(도착 전용 상태/칸)
  ISLAND,                     // 무인도
  WELFARE_DONATION,           // 사회복지기금 기부 칸
  WELFARE_PAYOUT              // 사회복지기금 수령(접수처) 칸
}

ENUM BuildingLevel { NONE=0, VILLA=1, BUILDING=2, HOTEL=3 }
ENUM CardKeepPolicy { DISCARD_BOTTOM, KEEP_UNTIL_USE }
ENUM CardPhasePolicy { ANYTIME, SECOND_HALF_ONLY }
```

---

## 2) 데이터 모델 정의 (증서/자산/카드/게임 상태)

> 매뉴얼은 “증서에 적힌 금액/통행료”를 사용하므로, **도시별 숫자(가격/건물비/통행료)** 는 데이터로 분리해 로딩하는 구조가 필수입니다. (p3, p4)

```pseudo
STRUCT PropertySpec {
  id: string
  name: string
  tileIndex: int
  tileType: TileType               // CITY_PROPERTY or NO_BUILD_PROPERTY
  purchasePrice: int               // 알판(보드)에 쓰인 금액
  canBuild: bool                   // CITY_PROPERTY면 true
  buildCost[VILLA|BUILDING|HOTEL]: int
  toll[LAND|VILLA|BUILDING|HOTEL]: int
  fixedTollIfNoBuild: int          // NO_BUILD_PROPERTY용(있다면)
  isColumbia: bool                 // 우주여행 수수료 수취 대상
  isSeoul: bool                    // 옵션게임: 마지막 경매 대상
}

STRUCT PropertyState {
  ownerPlayerId: string?           // null이면 미소유
  buildingLevel: BuildingLevel     // 0~3
}

STRUCT GoldenKeyCard {
  id: string
  keepPolicy: CardKeepPolicy       // 우대권/무인도탈출용은 KEEP
  phasePolicy: CardPhasePolicy     // 세금/방법비/건물수리비는 SECOND_HALF_ONLY
  effect: Effect                   // 아래 Effect 연산들의 조합으로 구현
}

ENUM EffectOpType {
  MOVE_TO_TILE, MOVE_STEPS,        // 이동(이동 과정 월급 처리 포함)
  GIVE_SALARY_IF_PASS_START,        // 이동 엔진 내부에서 자동 처리
  PAY_BANK, PAY_PLAYER, PAY_WELFARE_POT,
  GRANT_FREE_PASS,                 // 우대권 지급
  GRANT_ISLAND_ESCAPE_CARD,         // 무인도 탈출용 지급
  FORCE_SELL_MOST_EXPENSIVE_HALF,   // 반액대매출
  SEND_TO_ISLAND,                  // (카드로 갈 수도 있으니 일반화)
  NOOP                             // 조건 불일치 시 무효 처리
}

STRUCT PlayerState {
  id: string
  position: int
  cash: int
  bankrupt: bool

  islandTurnsLeft: int             // >0이면 무인도 감금 상태
  pendingSpaceChoice: bool         // 우주여행 후 “다음 턴에 목적지 선택” 상태

  ownedProperties: set<PropertyId>

  hasFreePassCard: int             // 우대권 보유 수(보통 0/1)
  hasIslandEscapeCard: int         // 무인도 탈출용 카드 보유 수

  loanTaken: bool
  loanOutstanding: int
  loanLapsRemaining: int           // 출발지 통과할 때마다 감소 (3회 이내 상환)
}

STRUCT GameState {
  phase: Phase
  players: list<PlayerState>
  currentTurnIndex: int
  board: list<TileType>
  propSpecByTile: map<int, PropertySpec>
  propStateById: map<PropertyId, PropertyState>

  welfarePot: int
  goldenKeyDeck: deque<GoldenKeyCard>

  startTileIndex: int
  spaceStationTileIndex: int

  unsoldPropertyIds: set<PropertyId> // 아직 은행 소유(미판매)
  gameEndByTimeLimit: bool
  timeLimitTurns: int
  turnsElapsed: int
}
```

---

## 3) 게임 준비 로직 (p2)

```pseudo
FUNCTION setupGame(playerCount, mode):
  state.phase = SETUP
  shuffle(state.goldenKeyDeck)
  FOR each player:
    player.position = state.startTileIndex
    player.bankrupt = false
    player.islandTurnsLeft = 0
    player.pendingSpaceChoice = false
    player.ownedProperties = {}
    player.hasFreePassCard = 0
    player.hasIslandEscapeCard = 0
    player.loanTaken = false
    player.loanOutstanding = 0
    player.loanLapsRemaining = 0

    // 초기 자금 분배 (3-4인 1인당 / 2인은 2배)
    base = [ (500_000,3), (100_000,10), (50_000,5), (20_000,5), (10_000,5), (5_000,5), (1_000,5) ]
    cash = SUM(value*count for each tuple in base)
    IF playerCount == 2: cash *= 2
    player.cash = cash

  determineTurnOrder() // 선 정하고 시계방향(디지털에선 주사위/랜덤 등)
  placeTokensOnStart()
  state.phase = (mode==ORDINARY ? FIRST_HALF : SECOND_HALF_PREPURCHASE)
```

---

## 4) 오디너리(정식) 게임의 “전반전” 턴 로직 (p3)

### 4-1. 전반전: 기본 턴 흐름 + 더블 추가턴

```pseudo
FUNCTION takeTurn_FIRST_HALF(player):
  IF player.bankrupt: return

  // 무인도 감금 상태면 감금 규칙을 우선 적용 (무인도 섹션 참조)
  IF player.islandTurnsLeft > 0:
    handleIslandTurn(player)
    return

  // 우주여행 목적지 선택 대기면, 주사위 없이 이동 처리 (우주여행 섹션 참조)
  IF player.pendingSpaceChoice:
    handleSpaceChoiceTurn(player)
    return

  (d1, d2) = rollTwoDice()
  steps = d1 + d2
  wasDouble = (d1 == d2)

  movePlayerWithSalary(player, steps)   // 이동 중 출발지 통과/도착 시 월급 처리

  resolveLanding_FIRST_HALF(player)     // 칸 효과(구매/카드/특수칸)

  // 더블이면 “한 번 더” (단, 착지 결과로 무인도 감금/우주여행 대기 상태가 되면 종료)
  IF wasDouble AND player.bankrupt==false AND player.islandTurnsLeft==0 AND player.pendingSpaceChoice==false:
    takeTurn_FIRST_HALF(player)         // 같은 플레이어 연속 턴
```

### 4-2. 전반전: 도시(증서) 구매/미구매 처리 (p3-4)

```pseudo
FUNCTION resolveLanding_FIRST_HALF(player):
  tile = board[player.position]

  SWITCH tile:
    CASE CITY_PROPERTY or NO_BUILD_PROPERTY:
      prop = propSpecByTile[player.position]
      pstate = propStateById[prop.id]

      IF pstate.ownerPlayerId == null:
        // “도착한 곳이 싱가포르면… 은행에 지불하고 증서 획득” 형태
        IF playerWantsToBuy(player, prop):
          requirePay(player, prop.purchasePrice, recipient=BANK)  // 부족하면 결제 처리(파산 포함)
          IF player.bankrupt==false:
            pstate.ownerPlayerId = player.id
            player.ownedProperties.add(prop.id)
            unsoldPropertyIds.remove(prop.id)
        ELSE:
          // “먼저 도착한 사람이 안 샀으면, 나중 도착자가 살 수 있음”
          doNothing()
      ELSE IF pstate.ownerPlayerId != player.id:
        // 전반전에는 통행료 규칙이 명시적으로 ‘후반전’ 중심이므로,
        // NO_BUILD_PROPERTY는 후반전부터 통행료 수취(후반전 규칙에 따라)
        // CITY_PROPERTY는 전반전에는 ‘구매’ 중심(매뉴얼은 통행료 수취를 후반전 섹션에서 정의)
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
      payout = state.welfarePot
      IF payout > 0:
        state.welfarePot = 0
        player.cash += payout

    CASE START:
      // 월급은 movePlayerWithSalary에서 처리 (통과/도착)
      doNothing()

    DEFAULT:
      doNothing()
```

---

## 5) “전반전 종료 → 후반전 시작” 전이 조건 (p3의 ‘증서 5~6장 남았을 때 경매’)

```pseudo
FUNCTION checkAndTransitionToSecondHalf():
  // 남은 증서가 5~6장일 때: 플레이어 합의 후 경매 처리
  IF size(unsoldPropertyIds) IN [5,6]:
    runAuctionForRemainingProperties()

  // (디지털에선 합의 없이 자동 진행 가능)
  IF size(unsoldPropertyIds) == 0:
    state.phase = SECOND_HALF
    // 후반전 시작: 이제부터 건물 건설/매각 및 통행료 수취가 활성화됨
```

```pseudo
FUNCTION runAuctionForRemainingProperties():
  FOR each propId in unsoldPropertyIds:
    prop = getProp(propId)

    interested = collectInterestedPlayers(propId)  // “희망자”
    IF len(interested) == 0:
      continue  // 아무도 원치 않으면 그대로 남김(다음 기회) 또는 자동 패스 정책
    IF len(interested) == 1:
      winner = interested[0]
    ELSE:
      // “여러 사람이 희망하면 주사위 굴려 큰 숫자 우선권”
      winner = argmax(rollTwoDiceSum(p) for p in interested)

    requirePay(winner, prop.purchasePrice, recipient=BANK)
    IF winner.bankrupt==false:
      propStateById[propId].ownerPlayerId = winner.id
      winner.ownedProperties.add(propId)

  // 경매로 팔린 것은 unsold에서 제거
  unsoldPropertyIds = {id | propStateById[id].owner==null}
```

---

## 6) 후반전(건물/통행료/대출/파산) 핵심 로직 (p4)

### 6-1. 후반전: “턴 시작 시 건물 추가/매각 가능” + 기본 이동

```pseudo
FUNCTION takeTurn_SECOND_HALF(player):
  IF player.bankrupt: return

  // (A) 턴 시작: 건물 추가/매각(자기 증서에 대해)
  allowBuildOrSellActions(player)    // 아래 6-2

  // (B) 무인도/우주여행 대기 상태 우선 처리
  IF player.islandTurnsLeft > 0:
    handleIslandTurn(player)
    return

  IF player.pendingSpaceChoice:
    handleSpaceChoiceTurn(player)
    return

  // (C) 주사위 이동
  (d1, d2) = rollTwoDice()
  steps = d1 + d2
  wasDouble = (d1 == d2)

  movePlayerWithSalary(player, steps)
  resolveLanding_SECOND_HALF(player)

  IF wasDouble AND player.bankrupt==false AND player.islandTurnsLeft==0 AND player.pendingSpaceChoice==false:
    takeTurn_SECOND_HALF(player)
```

### 6-2. 건물 규칙(추가/매각) (p4)

```pseudo
FUNCTION allowBuildOrSellActions(player):
  LOOP:
    action = playerChoose({BUILD, SELL, DONE})
    IF action == DONE: break

    IF action == BUILD:
      propId = playerChooseOwnedBuildableProperty(player)
      level = propStateById[propId].buildingLevel
      nextLevel = level + 1
      IF nextLevel > HOTEL: continue
      cost = propSpecById[propId].buildCost[nextLevel]
      requirePay(player, cost, recipient=BANK)
      IF player.bankrupt: return
      propStateById[propId].buildingLevel = nextLevel

    IF action == SELL:
      propId = playerChooseOwnedBuildableProperty(player)
      level = propStateById[propId].buildingLevel
      IF level == NONE: continue
      refund = propSpecById[propId].buildCost[level]
      // “은행에 건물을 팔 경우, 구매 금액을 은행에서 받는다”
      player.cash += refund
      propStateById[propId].buildingLevel = level - 1
```

### 6-3. 후반전 통행료(건물 있는 경우/없는 경우) (p4)

```pseudo
FUNCTION resolveLanding_SECOND_HALF(player):
  tile = board[player.position]

  SWITCH tile:
    CASE CITY_PROPERTY:
      prop = propSpecByTile[player.position]
      owner = propStateById[prop.id].ownerPlayerId

      IF owner == null:
        IF playerWantsToBuy(player, prop):
          requirePay(player, prop.purchasePrice, recipient=BANK)
          IF player.bankrupt==false:
            setOwner(player, prop.id)
      ELSE IF owner != player.id:
        lvl = propStateById[prop.id].buildingLevel
        rent = (lvl==NONE ? prop.toll[LAND] : prop.toll[lvl])
        requirePay(player, rent, recipient=PLAYER(owner))   // 부족하면 정산 로직(6-5)
      ELSE:
        doNothing()

    CASE NO_BUILD_PROPERTY:
      // “건물을 지을 필요가 없는 곳은 통행요금을 후반전부터 받을 수 있음”
      prop = propSpecByTile[player.position]
      owner = propStateById[prop.id].ownerPlayerId
      IF owner == null:
        IF playerWantsToBuy(player, prop):
          requirePay(player, prop.purchasePrice, recipient=BANK)
          IF player.bankrupt==false:
            setOwner(player, prop.id)
      ELSE IF owner != player.id:
        rent = prop.fixedTollIfNoBuild
        requirePay(player, rent, recipient=PLAYER(owner))
      ELSE:
        doNothing()

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

    CASE START:
      doNothing()
```

---

## 6-4) 결제 공통 규칙: “전액 결제(외상/부분납부 금지)” (p5 기타요령 2)

```pseudo
FUNCTION requirePay(payer, amount, recipient):
  IF amount <= 0 OR payer.bankrupt: return

  // 1) 현금으로 즉시 결제 가능
  IF payer.cash >= amount:
    payer.cash -= amount
    creditRecipient(recipient, amount)
    return

  // 2) 외상/부분납부 금지 => 부족분을 반드시 ‘정산 절차’로 해결
  settleShortage(payer, amount, recipient)

  // 3) 정산 후에도 불가능하면 파산 처리
  IF payer.cash < amount:
    declareBankruptcy(payer, recipient)
    return

  // 4) 가능해졌으면 결제
  payer.cash -= amount
  creditRecipient(recipient, amount)
```

---

## 6-5) 부족금 정산 로직: 건물 매각/증서 인계/대출/파산 (p4-6)

```pseudo
FUNCTION settleShortage(payer, amount, recipient):
  // A) (항상 가능) 건물 매각으로 현금 확보
  WHILE payer.cash < amount AND existsSellableBuilding(payer):
    propId = chooseBuildingToSell(payer)
    sellOneLevelBuildingToBank(payer, propId)  // 6-2 SELL 동일

  // B) (상대에게 낼 돈인 경우) 증서 인계로 정산 가능
  IF recipient is PLAYER:
    creditorId = recipient.playerId
    WHILE payer.cash < amount AND payer.ownedProperties not empty:
      propId = choosePropertyToTransfer(payer)
      v = propertyLiquidationValue(propId) // purchasePrice + 이미 지은 건물 구매가 합
      transferProperty(payer, creditorId, propId)

      // “차액이 발생해도 돌려받지 못함” => amount에서 v를 차감하되 0 미만은 0으로 절삭
      amount = max(0, amount - v)
      IF amount == 0: break

  // C) (단 1회) 대출 시도: 은행 결제/상대 결제 모두에서 ‘현금’이 필요하면 사용 가능
  IF payer.cash < amount AND payer.loanTaken == false:
    IF getConsentFromAtLeastOneOtherPlayer():
      loanAmt = min(LOAN_MAX, amount - payer.cash)
      payer.loanTaken = true
      payer.loanOutstanding += loanAmt
      payer.loanLapsRemaining = LOAN_DEADLINE_LAPS
      payer.cash += loanAmt

  // 이후에도 payer.cash < amount이면 requirePay에서 파산 처리
```

```pseudo
FUNCTION propertyLiquidationValue(propId):
  spec = propSpecById[propId]
  lvl = propStateById[propId].buildingLevel
  invested = spec.purchasePrice
  IF lvl >= VILLA: invested += spec.buildCost[VILLA]
  IF lvl >= BUILDING: invested += spec.buildCost[BUILDING]
  IF lvl >= HOTEL: invested += spec.buildCost[HOTEL]
  return invested
```

---

## 7) 대출 상환 로직 (p4-6)

```pseudo
FUNCTION onPassStart(player):
  // movePlayerWithSalary 내부에서 호출되는 훅
  player.cash += START_SALARY

  IF player.loanOutstanding > 0:
    player.loanLapsRemaining -= 1
    // 분할/일시 상환 허용
    repay = playerChooseRepayAmount(0..min(player.cash, player.loanOutstanding))
    player.cash -= repay
    player.loanOutstanding -= repay

    // 3회 통과 시점(남은 lap이 0이 되었는데도 미상환) => 즉시 전액 상환 요구
    IF player.loanLapsRemaining == 0 AND player.loanOutstanding > 0:
      requirePay(player, player.loanOutstanding, recipient=BANK) // 부족하면 정산/파산
      IF player.bankrupt==false:
        player.loanOutstanding = 0
```

---

## 8) 황금열쇠(카드) 로직 (p6)

```pseudo
FUNCTION drawAndResolveGoldenKey(player):
  card = popFront(state.goldenKeyDeck)

  // (1) SECOND_HALF_ONLY 카드: 전반전이면 무효 처리(효력 없음) + 맨 밑으로
  IF state.phase == FIRST_HALF AND card.phasePolicy == SECOND_HALF_ONLY:
    pushBack(state.goldenKeyDeck, card)
    return

  // (2) KEEP 카드(우대권/무인도탈출용): 보관
  IF card.keepPolicy == KEEP_UNTIL_USE:
    applyKeepEffect(player, card)     // 보유 카운트 증가 등
    // 사용 전까지 덱으로 돌아가지 않음
    return

  // (3) 즉시 효과 카드: 실행 후 맨 밑으로
  resolveCardEffect(player, card.effect)
  pushBack(state.goldenKeyDeck, card)
```

### 8-1) 우대권 사용 트리거 (p6-2)

```pseudo
FUNCTION maybeUseFreePassCard(player, payableToOpponentAmount):
  IF player.hasFreePassCard > 0 AND playerWantsToUseFreePass():
    player.hasFreePassCard -= 1
    // “무료 통과” => 통행료 0 처리
    payableToOpponentAmount = 0
    return 0
  return payableToOpponentAmount
```

### 8-2) 반액대매출(가장 비싼 재산 반값 매각) (p6-4)

```pseudo
FUNCTION forceSellMostExpensiveHalf(player):
  // “가진 재산 중 가장 비싼 곳” (후반전은 건물 포함)
  bestProp = argmax(propertyLiquidationValue(id) for id in player.ownedProperties)
  v = propertyLiquidationValue(bestProp)
  salePrice = floor(v * 0.5)

  // 은행에 매각: 소유권 제거 + 건물 제거(레벨 NONE)
  removeOwnership(player, bestProp)
  propStateById[bestProp].ownerPlayerId = null
  propStateById[bestProp].buildingLevel = NONE
  unsoldPropertyIds.add(bestProp)

  player.cash += salePrice
```

---

## 9) 우주여행 로직 (p6 우주여행)

```pseudo
FUNCTION handleSpaceTravelLanding(player):
  // 1) 즉시 “우주정류장”으로 이동
  columbiaOwner = findColumbiaOwner()  // 콜럼비아호 증서 소유자
  IF columbiaOwner != null AND columbiaOwner != player.id:
    requirePay(player, SPACE_TRAVEL_FEE, recipient=PLAYER(columbiaOwner))
  // 주인이 없으면 무료

  player.position = state.spaceStationTileIndex
  player.pendingSpaceChoice = true
  // 현재 턴은 여기서 종료(다음 자기 차례에 목적지 선택)
```

```pseudo
FUNCTION handleSpaceChoiceTurn(player):
  // 2) 다음 턴: 주사위 없이 원하는 곳으로 이동, 출발지 지나가면 월급
  destIndex = playerChooseAnyBoardIndex()
  movePlayerToIndexWithSalary(player, destIndex) // 경로상 출발지 통과 처리
  player.pendingSpaceChoice = false

  // 목적지 착지 처리(후반전/전반전 phase에 맞춰 호출)
  IF state.phase == FIRST_HALF: resolveLanding_FIRST_HALF(player)
  ELSE: resolveLanding_SECOND_HALF(player)
```

---

## 10) 무인도 로직 (p7)

```pseudo
FUNCTION sendToIsland(player):
  player.position = indexOf(ISLAND)
  player.islandTurnsLeft = ISLAND_LOCK_TURNS
  // 즉시 턴 종료
```

```pseudo
FUNCTION handleIslandTurn(player):
  // (A) 탈출카드가 있으면 사용 가능
  IF player.hasIslandEscapeCard > 0 AND playerWantsToUseIslandEscapeCard():
    player.hasIslandEscapeCard -= 1
    player.islandTurnsLeft = 0
    // 탈출 후 정상 이동(주사위 굴림)
    takeTurn_AfterIslandEscape(player)
    return

  // (B) 더블이면 즉시 탈출 + 주사위 한 번 더 굴려 이동
  (d1, d2) = rollTwoDice()
  IF d1 == d2:
    player.islandTurnsLeft = 0
    takeTurn_AfterIslandEscape(player)   // “주사위를 한 번 더 던져 이동”
    return

  // (C) 더블 아니면 턴 소비 + 감금 턴 감소
  player.islandTurnsLeft -= 1
  // 감금이 끝나도 이 턴엔 이동 없음(다음 턴부터 정상)
```

```pseudo
FUNCTION takeTurn_AfterIslandEscape(player):
  (a,b) = rollTwoDice()
  steps = a+b
  wasDouble = (a==b)

  movePlayerWithSalary(player, steps)
  IF state.phase == FIRST_HALF: resolveLanding_FIRST_HALF(player)
  ELSE: resolveLanding_SECOND_HALF(player)

  // 이동용 주사위의 더블은 일반 규칙대로 추가턴 허용
  IF wasDouble AND player.bankrupt==false AND player.islandTurnsLeft==0 AND player.pendingSpaceChoice==false:
    IF state.phase == FIRST_HALF: takeTurn_FIRST_HALF(player)
    ELSE: takeTurn_SECOND_HALF(player)
```

---

## 11) 사회복지기금 로직 (p7)

```pseudo
FUNCTION onLand_WelfareDonation(player):
  requirePay(player, WELFARE_DONATION, recipient=WELFARE_POT)
  // recipient=WELFARE_POT이면 creditRecipient가 state.welfarePot += amount

FUNCTION onLand_WelfarePayout(player):
  IF state.welfarePot > 0:
    player.cash += state.welfarePot
    state.welfarePot = 0
  ELSE:
    doNothing() // “기부금이 없을 경우 받을 수 없음”
```

---

## 12) 승리/종료 판정 (p4-8 + p5 요령 1)

```pseudo
FUNCTION computeNetWorth(player):
  IF player.bankrupt: return 0
  worth = player.cash
  FOR propId in player.ownedProperties:
    worth += propertyLiquidationValue(propId) // 구매가+건물구매가 기준(데이터화 가능)
  return worth

FUNCTION checkGameEnd():
  alive = [p | p.bankrupt==false]
  IF len(alive) == 1:
    state.phase = END
    winner = alive[0]
    return

  IF state.gameEndByTimeLimit AND state.turnsElapsed >= state.timeLimitTurns:
    state.phase = END
    winner = argmax(computeNetWorth(p) for p in alive)
```

---

## 13) 옵션게임(선택게임) 로직 (p5)

```pseudo
FUNCTION setupOptionGame():
  // 1) 각 플레이어 추가 100만원 지급
  FOR p in players: p.cash += 1_000_000

  // 2) 씨앗증서 “선택 구매” 단계: 플레이어가 한 장씩 선택해 은행에 지불하고 구매
  //    (공정성: 스네이크 드래프트 1→N, N→1 반복을 기본 정책으로)
  runDraftPurchaseAllPropertiesExceptSeoul()

  // 3) 서울증서는 모든 증서 구입 후 마지막에 경매로 구입
  auctionSeoul()

  // 4) 이후 “오디너리 게임의 후반전과 같은 방법”으로 진행 => 바로 SECOND_HALF 룰로 시작
  state.phase = SECOND_HALF
```

---

### 근거 파일

씨앗사 부루마불 매뉴얼:
