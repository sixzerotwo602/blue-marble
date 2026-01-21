# 부루마블 디지털 게임 로직 정의

## 1. 게임 초기화 (Game Initialization)

### 1.1 게임 보드 정의
```
BOARD_SIZE = 32 (총 칸 수)
STARTING_POSITION = 0 (출발 칸)

TILE_TYPES = {
    CITY,           // 도시 (증서 구매 가능)
    GOLDEN_KEY,     // 황금열쇠
    SPACE_TRAVEL,   // 우주여행
    DESERTED_ISLAND,// 무인도
    WELFARE_FUND,   // 사회복지기금
    START           // 출발
}
```

### 1.2 플레이어 초기 자금
```
INITIAL_MONEY_DISTRIBUTION = {
    IF (player_count == 2):
        multiply_all_by(2)
    ELSE (player_count == 3 OR player_count == 4):
        500000원권: 3장
        100000원권: 10장
        50000원권: 5장
        20000원권: 5장
        10000원권: 5장
        5000원권: 5장
        1000원권: 5장
}

TOTAL_INITIAL_MONEY = (500000 * 3) + (100000 * 10) + (50000 * 5) + (20000 * 5) + (10000 * 5) + (5000 * 5) + (1000 * 5)
                    = 1500000 + 1000000 + 250000 + 100000 + 50000 + 25000 + 5000
                    = 2,930,000원
```

### 1.3 게임 단계 정의
```
GAME_PHASE = {
    FIRST_HALF,    // 전반전: 증서 구매만 가능
    SECOND_HALF    // 후반전: 건물 건설 + 통행료 징수
}

TRANSITION_CONDITION:
    remaining_certificates <= 5~6장 → 경매 진행 후 SECOND_HALF 전환
```

---

## 2. 턴 진행 로직 (Turn Logic)

### 2.1 주사위 굴리기
```
FUNCTION rollDice():
    die1 = random(1, 6)
    die2 = random(1, 6)
    total = die1 + die2
    isDouble = (die1 == die2)
    RETURN {total, isDouble}

FUNCTION processTurn(player):
    result = rollDice()
    movePlayer(player, result.total)
    processTileAction(player, getCurrentTile(player))
    
    IF result.isDouble AND NOT player.isOnDesertedIsland:
        // 더블: 추가 턴 부여
        player.hasExtraTurn = TRUE
```

### 2.2 이동 처리
```
FUNCTION movePlayer(player, steps):
    oldPosition = player.position
    newPosition = (oldPosition + steps) % BOARD_SIZE
    
    // 출발지 통과 체크
    IF crossedStart(oldPosition, newPosition):
        player.money += SALARY (200,000원)
    
    player.position = newPosition
```

### 2.3 출발지 통과 판정
```
FUNCTION crossedStart(oldPos, newPos):
    IF oldPos > newPos:  // 한 바퀴 돌았음
        RETURN TRUE
    RETURN FALSE
```

---

## 3. 타일별 액션 로직 (Tile Actions)

### 3.1 도시 타일 (City Tile)
```
FUNCTION processCityTile(player, tile):
    IF tile.owner == NULL:
        IF gamePhase == FIRST_HALF:
            // 구매 선택권 제공
            IF player.money >= tile.price:
                IF player.chooseToBy():
                    purchaseCertificate(player, tile)
                ELSE:
                    tile.availableForNextVisitor = TRUE
            ELSE:
                tile.availableForNextVisitor = TRUE
        ELSE IF gamePhase == SECOND_HALF:
            // 후반전에는 이미 모든 증서가 분배됨
            PASS
            
    ELSE IF tile.owner == player:
        IF gamePhase == SECOND_HALF:
            // 자기 땅: 건물 추가 건설/매각 가능
            offerBuildingOptions(player, tile)
            
    ELSE:  // 다른 플레이어 소유
        IF gamePhase == SECOND_HALF:
            payToll(player, tile)
        ELSE IF gamePhase == FIRST_HALF AND tile.buildings.count == 0:
            // 전반전에는 건물이 없는 곳은 통행료 없음
            // 단, 건물 지을 필요 없는 곳(컬럼비아호 등)은 후반전부터 통행료 발생
            IF tile.requiresBuilding == FALSE:
                PASS  // 전반전에는 무료
```

### 3.2 증서 구매
```
FUNCTION purchaseCertificate(player, tile):
    IF player.money >= tile.price:
        player.money -= tile.price
        bank.money += tile.price
        tile.owner = player
        player.certificates.add(tile.certificate)
```

### 3.3 건물 건설 (후반전)
```
BUILDING_COSTS = {
    VILLA: 50,000원,
    BUILDING: 150,000원,
    HOTEL: 250,000원
}

BUILDING_HIERARCHY = [VILLA, BUILDING, HOTEL]  // 순차 건설 필요

FUNCTION buildOnTile(player, tile, buildingType):
    IF tile.owner != player:
        RETURN ERROR("소유하지 않은 땅")
    
    IF NOT canBuild(tile, buildingType):
        RETURN ERROR("건설 조건 미충족")
    
    cost = BUILDING_COSTS[buildingType]
    IF player.money < cost:
        RETURN ERROR("자금 부족")
    
    player.money -= cost
    bank.money += cost
    tile.building = buildingType

FUNCTION canBuild(tile, buildingType):
    currentBuilding = tile.building
    IF currentBuilding == NULL:
        RETURN buildingType == VILLA
    IF currentBuilding == VILLA:
        RETURN buildingType == BUILDING
    IF currentBuilding == BUILDING:
        RETURN buildingType == HOTEL
    RETURN FALSE  // 이미 호텔이면 더 건설 불가
```

### 3.4 통행료 계산 및 지불
```
TOLL_TABLE = {
    // 각 도시별 증서 뒷면에 정의된 통행료
    // 구조: {대지료, 별장, 빌딩, 호텔}
}

FUNCTION calculateToll(tile):
    IF tile.building == NULL:
        RETURN tile.landFee  // 대지료만 (4,000원 등)
    ELSE IF tile.building == VILLA:
        RETURN tile.tollWithVilla
    ELSE IF tile.building == BUILDING:
        RETURN tile.tollWithBuilding
    ELSE IF tile.building == HOTEL:
        RETURN tile.tollWithHotel

FUNCTION payToll(payer, tile):
    toll = calculateToll(tile)
    owner = tile.owner
    
    IF payer.money >= toll:
        payer.money -= toll
        owner.money += toll
    ELSE:
        // 자금 부족 시 처리
        handleInsufficientFunds(payer, toll, owner)
```

### 3.5 자금 부족 처리
```
FUNCTION handleInsufficientFunds(player, requiredAmount, creditor):
    deficit = requiredAmount - player.money
    
    WHILE deficit > 0 AND player.hasAssets():
        option = player.chooseOption([
            "SELL_BUILDING_TO_BANK",
            "TRANSFER_CERTIFICATE_TO_CREDITOR"
        ])
        
        IF option == "SELL_BUILDING_TO_BANK":
            building = player.selectBuildingToSell()
            salePrice = BUILDING_COSTS[building.type]  // 구매가 그대로 환급
            player.money += salePrice
            building.tile.building = downgradeBuilding(building.type)
            
        ELSE IF option == "TRANSFER_CERTIFICATE_TO_CREDITOR":
            certificate = player.selectCertificateToTransfer()
            // 차액 발생해도 상대방에게 받을 수 없음
            certificate.owner = creditor
            player.certificates.remove(certificate)
            // 증서 가치는 통행료 상쇄에 사용되지 않음 (단순 인계)
            
        deficit = requiredAmount - player.money
    
    IF deficit > 0:
        declareBankruptcy(player)
        
FUNCTION downgradeBuilding(currentType):
    IF currentType == HOTEL:
        RETURN BUILDING
    IF currentType == BUILDING:
        RETURN VILLA
    IF currentType == VILLA:
        RETURN NULL
```

---

## 4. 특수 타일 로직 (Special Tiles)

### 4.1 황금열쇠 (Golden Key)
```
GOLDEN_KEY_CARDS = [
    {type: "PREFERENTIAL_PASS", effect: "무료통과권 - 보관 가능"},
    {type: "INCOME_TAX", effect: "정기종합소득세 납부", amount: variable, phase: SECOND_HALF},
    {type: "SECURITY_FEE", effect: "방범비 납부", amount: variable, phase: SECOND_HALF},
    {type: "REPAIR_FEE", effect: "건물수리비 납부", amount: variable, phase: SECOND_HALF},
    {type: "HALF_PRICE_SALE", effect: "가장 비싼 재산 반값 매각", phase: BOTH},
    {type: "ISLAND_ESCAPE", effect: "무인도 탈출권 - 보관/판매 가능"},
    // ... 기타 카드들
]

FUNCTION processGoldenKey(player):
    card = goldenKeyDeck.drawFromTop()
    
    IF card.type == "PREFERENTIAL_PASS":
        player.inventory.add(card)
        // 덱에 반환하지 않음 (사용 후 반환)
        
    ELSE IF card.type == "ISLAND_ESCAPE":
        player.inventory.add(card)
        // 보관 또는 은행에 200,000원에 판매 가능
        
    ELSE IF card.type IN ["INCOME_TAX", "SECURITY_FEE", "REPAIR_FEE"]:
        IF gamePhase == SECOND_HALF:
            player.money -= card.amount
            bank.money += card.amount
        goldenKeyDeck.returnToBottom(card)
        
    ELSE IF card.type == "HALF_PRICE_SALE":
        mostExpensiveAsset = findMostExpensiveAsset(player)
        IF gamePhase == SECOND_HALF:
            // 건물 포함하여 계산
            salePrice = mostExpensiveAsset.totalValue / 2
        ELSE:
            // 전반전: 증서 가격만
            salePrice = mostExpensiveAsset.certificatePrice / 2
        bank.money -= salePrice
        player.money += salePrice
        removeAsset(player, mostExpensiveAsset)
        goldenKeyDeck.returnToBottom(card)
        
    ELSE:
        executeCardEffect(card, player)
        goldenKeyDeck.returnToBottom(card)
        
    // 카드 이행 중 출발지 통과 시 월급 수령
    IF player.crossedStartDuringCardExecution:
        player.money += SALARY
```

### 4.2 우주여행 (Space Travel)
```
SPACE_STATION_POSITION = // 우주정류장 칸 인덱스
COLUMBIA_CERTIFICATE = // 컬럼비아호 증서

FUNCTION processSpaceTravel(player):
    // 컬럼비아호 탑승
    columbiaToll = 200,000원
    
    IF COLUMBIA_CERTIFICATE.owner != NULL AND COLUMBIA_CERTIFICATE.owner != player:
        player.money -= columbiaToll
        COLUMBIA_CERTIFICATE.owner.money += columbiaToll
    // 주인이 없거나 본인 소유면 무료
    
    // 우주정류장으로 이동
    player.position = SPACE_STATION_POSITION
    player.isAtSpaceStation = TRUE

FUNCTION processSpaceStationTurn(player):
    // 다음 턴에 주사위 없이 원하는 곳으로 이동
    destination = player.chooseDestination(0, BOARD_SIZE - 1)
    
    // 출발지 통과 체크
    IF willCrossStart(player.position, destination):
        player.money += SALARY
    
    player.position = destination
    player.isAtSpaceStation = FALSE
    processTileAction(player, getCurrentTile(player))
```

### 4.3 무인도 (Deserted Island)
```
FUNCTION processDesertedIsland(player):
    player.isOnDesertedIsland = TRUE
    player.islandTurnsRemaining = 3

FUNCTION processIslandTurn(player):
    IF player.hasCard("ISLAND_ESCAPE"):
        IF player.chooseToUseEscapeCard():
            useEscapeCard(player)
            RETURN
    
    result = rollDice()
    
    IF result.isDouble:
        // 탈출 성공
        player.isOnDesertedIsland = FALSE
        player.islandTurnsRemaining = 0
        
        // 더블 후 추가 주사위로 이동
        moveResult = rollDice()
        movePlayer(player, moveResult.total)
        processTileAction(player, getCurrentTile(player))
        
        // 탈출 후 더블이어도 추가 턴 없음 (이미 이동함)
    ELSE:
        player.islandTurnsRemaining -= 1
        IF player.islandTurnsRemaining <= 0:
            // 3회 실패 시 자동 탈출 (선택적 규칙)
            player.isOnDesertedIsland = FALSE
        // 턴 종료, 다음 플레이어에게 넘김

FUNCTION useEscapeCard(player):
    card = player.inventory.remove("ISLAND_ESCAPE")
    goldenKeyDeck.returnToBottom(card)
    player.isOnDesertedIsland = FALSE
    // 일반 턴 진행
    result = rollDice()
    movePlayer(player, result.total)
    processTileAction(player, getCurrentTile(player))
```

### 4.4 사회복지기금 (Welfare Fund)
```
welfareFundPool = 0  // 누적 기금

FUNCTION processWelfareFundDeposit(player):
    // 기부 칸 도착
    depositAmount = 150,000원
    player.money -= depositAmount
    welfareFundPool += depositAmount

FUNCTION processWelfareFundCollection(player):
    // 접수처 칸 도착
    IF welfareFundPool > 0:
        player.money += welfareFundPool
        welfareFundPool = 0
    // 기금이 없으면 아무것도 받지 못함
```

---

## 5. 경매 시스템 (Auction System)

### 5.1 잔여 증서 경매 (전반전 → 후반전 전환 시)
```
FUNCTION conductCertificateAuction(remainingCertificates):
    FOR EACH certificate IN remainingCertificates:
        interestedPlayers = getInterestedPlayers(certificate)
        
        IF interestedPlayers.count == 0:
            CONTINUE  // 아무도 원하지 않으면 은행 보유
            
        ELSE IF interestedPlayers.count == 1:
            winner = interestedPlayers[0]
            
        ELSE:
            // 다수 희망자: 주사위로 우선권 결정
            highestRoll = 0
            winner = NULL
            FOR EACH player IN interestedPlayers:
                roll = rollDice().total
                IF roll > highestRoll:
                    highestRoll = roll
                    winner = player
        
        // 낙찰자가 은행에 지불하고 구매
        IF winner.money >= certificate.price:
            purchaseCertificate(winner, certificate.tile)
```

### 5.2 서울 증서 특별 경매 (옵션 게임)
```
FUNCTION auctionSeoulCertificate():
    // 서울 증서는 모든 증서 분배 후 마지막에 경매
    bids = []
    FOR EACH player IN players:
        bid = player.submitBid()  // 희망 가격 제출
        bids.add({player, bid})
    
    highestBid = MAX(bids, by: bid)
    winner = highestBid.player
    
    IF winner.money >= highestBid.bid:
        winner.money -= highestBid.bid
        bank.money += highestBid.bid
        SEOUL_CERTIFICATE.owner = winner
```

---

## 6. 대출 시스템 (Loan System)
```
LOAN_LIMIT = 1,000,000원
LOAN_REPAYMENT_TURNS = 3 * BOARD_SIZE  // 3바퀴 이내 상환

FUNCTION requestLoan(player, amount):
    IF player.hasUsedLoan:
        RETURN ERROR("대출은 게임 중 1회만 가능")
    
    IF amount > LOAN_LIMIT:
        RETURN ERROR("대출 한도 초과")
    
    // 다른 플레이어 동의 필요
    approvals = 0
    FOR EACH otherPlayer IN players WHERE otherPlayer != player:
        IF otherPlayer.approvesLoan():
            approvals += 1
    
    IF approvals >= 1:
        player.money += amount
        player.loanAmount = amount
        player.loanTurnsRemaining = LOAN_REPAYMENT_TURNS
        player.hasUsedLoan = TRUE
    ELSE:
        RETURN ERROR("동의 부족")

FUNCTION processLoanRepayment(player):
    IF player.loanAmount > 0:
        player.loanTurnsRemaining -= 1
        
        // 분할 또는 일시 상환 선택 가능
        IF player.choosesToRepay():
            repaymentAmount = player.selectRepaymentAmount()
            IF repaymentAmount <= player.money AND repaymentAmount <= player.loanAmount:
                player.money -= repaymentAmount
                bank.money += repaymentAmount
                player.loanAmount -= repaymentAmount
        
        IF player.loanTurnsRemaining <= 0 AND player.loanAmount > 0:
            // 기한 내 미상환 시 처리 (강제 상환 또는 파산)
            forceRepayment(player)
```

---

## 7. 게임 종료 및 승리 조건 (Victory Conditions)
```
FUNCTION checkGameEnd():
    // 조건 1: 1명 제외 모두 파산
    activePlayers = players.filter(p => !p.isBankrupt)
    IF activePlayers.count == 1:
        RETURN {ended: TRUE, winner: activePlayers[0]}
    
    // 조건 2: 시간제한 게임
    IF gameTimeLimit != NULL AND currentTime >= gameTimeLimit:
        RETURN {ended: TRUE, winner: calculateWealthiestPlayer()}
    
    RETURN {ended: FALSE}

FUNCTION calculateTotalWealth(player):
    total = player.money
    
    FOR EACH certificate IN player.certificates:
        total += certificate.price  // 증서 가격
        IF certificate.tile.building != NULL:
            total += BUILDING_COSTS[certificate.tile.building]  // 건물 가격
    
    RETURN total

FUNCTION calculateWealthiestPlayer():
    maxWealth = 0
    winner = NULL
    
    FOR EACH player IN players WHERE !player.isBankrupt:
        wealth = calculateTotalWealth(player)
        IF wealth > maxWealth:
            maxWealth = wealth
            winner = player
    
    RETURN winner

FUNCTION declareBankruptcy(player):
    player.isBankrupt = TRUE
    
    // 모든 자산 은행에 반환
    FOR EACH certificate IN player.certificates:
        certificate.owner = NULL
        certificate.tile.building = NULL
    player.certificates.clear()
    player.money = 0
```

---

## 8. 옵션 게임 모드 (Option Game Mode)

### 8.1 초기화
```
FUNCTION initializeOptionGame(playerCount):
    // 추가 자금 지급
    FOR EACH player IN players:
        player.money += 1,000,000원
    
    // 증서 분배 (서울 제외)
    certificates = ALL_CERTIFICATES.exclude(SEOUL)
    distributeCertificates(certificates, playerCount)
    
    // 서울 경매
    auctionSeoulCertificate()
    
    // 바로 후반전 시작
    gamePhase = SECOND_HALF

FUNCTION distributeCertificates(certificates, playerCount):
    // 4인 플레이 기준 분배 예시
    // 각 플레이어가 순서대로 1장씩 선택하여 구매
    
    WHILE certificates.count > 0:
        FOR EACH player IN players:
            IF certificates.count == 0:
                BREAK
            selectedCert = player.selectCertificate(certificates)
            IF player.money >= selectedCert.price:
                purchaseCertificate(player, selectedCert.tile)
                certificates.remove(selectedCert)
```

---

## 9. 보조 함수들 (Utility Functions)
```
FUNCTION getCurrentTile(player):
    RETURN board.tiles[player.position]

FUNCTION findMostExpensiveAsset(player):
    maxValue = 0
    mostExpensive = NULL
    
    FOR EACH cert IN player.certificates:
        value = cert.price
        IF gamePhase == SECOND_HALF AND cert.tile.building != NULL:
            value += BUILDING_COSTS[cert.tile.building]
        IF value > maxValue:
            maxValue = value
            mostExpensive = cert
    
    RETURN mostExpensive

FUNCTION willCrossStart(currentPos, destinationPos):
    IF destinationPos < currentPos:
        RETURN TRUE  // 보드를 한 바퀴 돌아감
    RETURN FALSE
```

---

## 10. 우대권 (Preferential Pass) 사용 로직
```
FUNCTION usePreferentialPass(player, tile):
    IF NOT player.inventory.contains("PREFERENTIAL_PASS"):
        RETURN ERROR("우대권 없음")
    
    IF tile.owner == NULL OR tile.owner == player:
        RETURN ERROR("사용 불필요")
    
    // 통행료 면제
    card = player.inventory.remove("PREFERENTIAL_PASS")
    goldenKeyDeck.returnToBottom(card)
    
    // 통행료 지불 없이 통과
    RETURN SUCCESS

// 턴 중 사용 시점
FUNCTION processTileWithPassOption(player, tile):
    IF tile.owner != NULL AND tile.owner != player:
        IF player.inventory.contains("PREFERENTIAL_PASS"):
            IF player.chooseToUsePass():
                usePreferentialPass(player, tile)
                RETURN
        payToll(player, tile)
```

---

## 11. 무인도 탈출권 판매 로직
```
ISLAND_ESCAPE_SELL_PRICE = 200,000원

FUNCTION sellIslandEscapeCard(player):
    IF NOT player.inventory.contains("ISLAND_ESCAPE"):
        RETURN ERROR("카드 없음")
    
    IF player.isOnDesertedIsland:
        RETURN ERROR("무인도에서는 판매 불가")  // 선택적 규칙
    
    card = player.inventory.remove("ISLAND_ESCAPE")
    player.money += ISLAND_ESCAPE_SELL_PRICE
    goldenKeyDeck.returnToBottom(card)
```

---

이 로직 정의서는 부루마블 디지털 게임 구현에 필요한 핵심 규칙을 프로그래밍 가능한 형태로 정리한 것입니다. 실제 구현 시 각 도시별 가격표, 통행료표, 황금열쇠 카드 전체 목록 등의 데이터 테이블이 추가로 필요합니다.