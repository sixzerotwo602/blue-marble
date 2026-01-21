/**
 * Enums - 부루마블 게임 Enum 타입 정의 (V2.0)
 *
 * Feature: 001-core-game-engine
 * Date: 2026-01-21
 * Source: 부루마블 디지털 기획서 V1.0 (최종 확정본)
 */

/** 게임 진행 상태 */
export enum GameStatus {
  WAITING = 'waiting',      // 대기실
  PLAYING = 'playing',      // 게임 중
  PAUSED = 'paused',        // 일시 정지
  FINISHED = 'finished',    // 게임 종료 (승패 결정)
}

/** * 게임 페이즈 시스템 
 * 기획서 2.1 ~ 2.2 반영: 전반/후반 엄격 구분 및 경매 페이즈
 */
export enum GamePhase {
  FIRST_HALF = 'firstHalf',   // 전반전 (건설 불가, 대지 구매만 가능)
  AUCTION = 'auction',        // 경매 페이즈 (씨앗증서 6장 남았을 때 트리거)
  SECOND_HALF = 'secondHalf', // 후반전 (건설 해금, 건물 조합 자유)
}

/** 플레이어 색상 */
export enum PlayerColor {
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
  WHITE = 'white',
}

/** * 칸 타입 
 * 사회복지기금의 기부(DONATE)와 수령(RECEIVE)을 명확히 분리
 */
export enum TileType {
  START = 'start',              // 0번: 출발 (월급)
  PROPERTY = 'property',        // 도시 (건설 가능)
  VEHICLE = 'vehicle',          // 탈것 (콩코드 등)
  GOLDEN_KEY = 'goldenKey',     // 황금열쇠
  ISLAND = 'island',            // 10번: 무인도
  TRAVEL = 'travel',            // 30번: 우주여행
  FUND_RECEIVE = 'fundReceive', // 20번: 사회복지기금 접수처 (돈 받는 곳)
  FUND_DONATE = 'fundDonate',   // 38번: 사회복지기금 기부처 (돈 내는 곳)
}

/** 황금열쇠 카드 효과 타입 */
export enum CardEffectType {
  MOVE_TO = 'moveTo',           // 특정 위치로 이동
  MOVE_BACK = 'moveBack',       // 뒤로 이동 (이 경우 월급 미지급 로직 적용)
  WORLD_TOUR = 'worldTour',     // 세계일주
  RECEIVE = 'receive',          // 상금 수령
  PAY = 'pay',                  // 벌금/비용 지불
  COLLECT_FROM_ALL = 'collectFromAll', // 전체 징수
  BUILDING_FEE = 'buildingFee', // 건물 유지비
  FORCE_SELL = 'forceSell',     // 반액 대매출 (가장 비싼 자산 강제 매각)
  ISLAND_ESCAPE = 'islandEscape', // 무인도 탈출권 (보관)
  TOLL_EXEMPT = 'tollExempt',     // 우대권 (보관)
  TO_ISLAND = 'toIsland',       // 무인도 강제 이동
  SPECIAL = 'special',          // 기타
}

/** * 건물 타입 
 * 기획서 2.2 반영: "순서 제약 없이 원하는 조합으로 건설 가능"
 * 기존의 Level(0~4) 방식 대신, 개별 건물의 존재 여부를 체크하기 위한 타입
 */
export enum BuildingType {
  VILLA = 'villa',      // 별장 (최대 2개)
  BUILDING = 'building',// 빌딩 (최대 1개)
  HOTEL = 'hotel',      // 호텔 (최대 1개)
}

/** * 트랜잭션(거래) 사유 
 * 기획서의 경제 상호작용 및 파산 로직 반영
 */
export enum TransactionReason {
  INITIAL_FUND = 'initialFund',     // 초기 자금 지급
  SALARY = 'salary',                // 월급
  PURCHASE_LAND = 'purchaseLand',   // 대지 구매
  CONSTRUCTION = 'construction',    // 건물 건설 비용
  TOLL_FEE = 'tollFee',             // 통행료 지불

  // 경매 관련
  AUCTION_BID_DEPOSIT = 'auctionBid', // 입찰 보증금 (옵션)
  AUCTION_PAYMENT = 'auctionPayment', // 낙찰금 지불

  // 황금열쇠 & 특수지역
  GOLDEN_KEY_REWARD = 'goldenKeyReward', // 상금
  GOLDEN_KEY_FINE = 'goldenKeyFine',     // 벌금
  FUND_DONATION = 'fundDonation',        // 사회복지기금 기부 (-15만)
  FUND_PAYOUT = 'fundPayout',            // 사회복지기금 수령 (All)
  TRAVEL_FEE = 'travelFee',              // 우주여행 이용료

  // 매각 & 대출 & 파산
  ASSET_SELL_BACK = 'assetSellBack', // 자산 은행 매각 (건물 100% / 반액대매출 50%)
  LOAN_PRINCIPAL = 'loanPrincipal',  // 대출 원금 수령/상환
  ASSET_LIQUIDATION = 'assetLiquidation', // 파산 시 강제 청산 (은행 매각)
  LIQUIDATION_DISTRIBUTION = 'liquidationDistribution', // 청산 후 채권자에게 부분 변제
}

/** * 턴 진행 단계 
 * 경매 페이즈가 추가됨
 */
export enum TurnPhase {
  IDLE = 'idle',              // 턴 시작 전
  DICE_ROLL = 'diceRoll',     // 주사위 굴리기
  MOVING = 'moving',          // 말 이동 중
  LANDED_EVENT = 'landedEvent', // 도착한 칸의 이벤트 처리 (황금열쇠, 통행료 등)
  CONSTRUCTION = 'construction', // 건설/구매 팝업
  AUCTION_BIDDING = 'auctionBidding', // 경매 입찰 진행 중
  LOAN_REPAYMENT = 'loanRepayment',   // 대출 상환 처리
  TURN_END = 'turnEnd',       // 턴 종료 처리
}

/** * 무인도 탈출 방법 
 * 기획서 5.2 반영: "더블이 나오면 탈출", 비용 지불 언급 없음 -> PAY 삭제
 */
export enum IslandEscapeMethod {
  DOUBLE = 'double',        // 주사위 더블
  CARD = 'card',            // 탈출권 사용
  // PAY = 'pay',           // 기획서 미포함으로 삭제됨
}

/** * 경매 액션 
 * 기획서 2.1 반영: 라운드 로빈 방식 (Raise/Fold)
 */
export enum AuctionAction {
  BID = 'bid',    // 입찰 (직전가 + 최소단위 이상)
  FOLD = 'fold',  // 포기 (경매 이탈)
}

/**
 * 파산 원인
 * 기획서 파산 처리 로직 분기용
 */
export enum BankruptcyCause {
  TO_PLAYER = 'toPlayer', // 플레이어간 거래(통행료)로 파산 -> 부분 변제
  TO_BANK = 'toBank',     // 은행 거래(세금, 대출)로 파산 -> 자산 소멸
}