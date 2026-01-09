/**
 * 공유 열거형 정의
 */

// ───────────────────────────────────────────────────────────────
// 타일 유형
// ───────────────────────────────────────────────────────────────
export enum TileType {
  START = 'start', // 출발 (코너)
  CITY_PROPERTY = 'cityProperty', // 도시 - 건물 건설 가능
  NO_BUILD_PROPERTY = 'noBuildProperty', // 건설 불가 부동산 (제주도, 부산, 서울)
  VEHICLE = 'vehicle', // 탈것 (콩코드, 퀸엘리자베스, 콜롬비아)
  GOLDEN_KEY = 'goldenKey', // 황금열쇠
  SPACE_TRAVEL = 'spaceTravel', // 우주여행 (코너)
  ISLAND = 'island', // 무인도 (코너)
  WELFARE_DONATION = 'welfareDonation', // 사회복지기금 기부 칸
  WELFARE_PAYOUT = 'welfarePayout', // 사회복지기금 접수처 (코너)
}

// ───────────────────────────────────────────────────────────────
// 건물 수준 (0~3)
// ───────────────────────────────────────────────────────────────
export enum BuildingLevel {
  NONE = 0,
  VILLA = 1,
  BUILDING = 2,
  HOTEL = 3,
}

// ───────────────────────────────────────────────────────────────
// 플레이어 색상
// ───────────────────────────────────────────────────────────────
export enum PlayerColor {
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green',
}

// ───────────────────────────────────────────────────────────────
// 게임 상태
// ───────────────────────────────────────────────────────────────
export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

// ───────────────────────────────────────────────────────────────
// 게임 단계
// ───────────────────────────────────────────────────────────────
export enum GamePhase {
  SETUP = 'setup',
  FIRST_HALF = 'firstHalf', // 전반전: 증서 구매만 가능
  SECOND_HALF = 'secondHalf', // 후반전: 건물 건설 + 통행료 징수
  END = 'end',
}

// ───────────────────────────────────────────────────────────────
// 게임 모드
// ───────────────────────────────────────────────────────────────
export enum GameMode {
  ORDINARY = 'ordinary', // 정식 게임: 전반전 → 후반전
  OPTION = 'option', // 옵션 게임: 증서 분배 후 바로 후반전
}

// ───────────────────────────────────────────────────────────────
// 턴 단계
// ───────────────────────────────────────────────────────────────
export enum TurnPhase {
  IDLE = 'idle',
  DICE_INPUT = 'diceInput',
  MOVING = 'moving',
  LANDED = 'landed',
  ACTION_PHASE = 'actionPhase',
  DEBT_RESOLUTION = 'debtResolution', // 자금 부족 해결 단계
  TURN_END = 'turnEnd',
}


// ───────────────────────────────────────────────────────────────
// 거래 사유
// ───────────────────────────────────────────────────────────────
export enum TransactionReason {
  PURCHASE = 'purchase',
  BUILD = 'build',
  SELL_BUILDING = 'sellBuilding',
  RENT = 'rent',
  VEHICLE_FEE = 'vehicleFee',
  SPACE_TRAVEL_FEE = 'spaceTravelFee',
  FUND_DONATE = 'fundDonate',
  FUND_RECEIVE = 'fundReceive',
  GOLDEN_KEY = 'goldenKey',
  SALARY = 'salary',
  START_BONUS = 'startBonus',
  BANKRUPTCY_TRANSFER = 'bankruptcyTransfer',
}

// ───────────────────────────────────────────────────────────────
// 황금열쇠 카드 효과 유형
// ───────────────────────────────────────────────────────────────
export enum CardEffectType {
  MOVE_TO_TILE = 'moveToTile', // 특정 칸으로 이동
  MOVE_STEPS = 'moveSteps', // N칸 이동 (뒤로 2~3칸)
  PAY_BANK = 'payBank', // 은행에 지불
  RECEIVE_FROM_BANK = 'receiveFromBank', // 은행에서 받기
  PAY_WELFARE = 'payWelfare', // 사회복지기금에 지불
  RECEIVE_WELFARE = 'receiveWelfare', // 사회복지기금에서 받기
  PAY_ALL_PLAYERS = 'payAllPlayers', // 모든 플레이어에게 지불
  RECEIVE_FROM_ALL = 'receiveFromAll', // 모든 플레이어에게 받기
  REPAIR_FEE = 'repairFee', // 건물 수리비 (건물당 비용)
  MAINTENANCE_FEE = 'maintenanceFee', // 유지비 (정기종합소득세, 방범비)
  FORCE_SELL_HALF = 'forceSellHalf', // 반액 대매출
  SEND_TO_ISLAND = 'sendToIsland', // 무인도 이동
  GRANT_FREE_PASS = 'grantFreePass', // 우대권 지급
  GRANT_ESCAPE_CARD = 'grantEscapeCard', // 무인도 탈출권 지급
  WORLD_TOUR = 'worldTour', // 세계일주 (한 바퀴)
  SPACE_TRAVEL_FREE = 'spaceTravelFree', // 우주여행 무료 이용
}

// ───────────────────────────────────────────────────────────────
// 황금열쇠 카드 보관 정책
// ───────────────────────────────────────────────────────────────
export enum CardKeepPolicy {
  DISCARD_BOTTOM = 'discardBottom', // 즉시 효과 후 덱 맨 밑으로
  KEEP_UNTIL_USE = 'keepUntilUse', // 보관 가능 (우대권, 탈출권)
}

// ───────────────────────────────────────────────────────────────
// 황금열쇠 카드 단계 정책
// ───────────────────────────────────────────────────────────────
export enum CardPhasePolicy {
  ANYTIME = 'anytime', // 전반전/후반전 모두 적용
  SECOND_HALF_ONLY = 'secondHalfOnly', // 후반전에만 적용 (유지비 카드)
}

// ───────────────────────────────────────────────────────────────
// 에러 코드
// ───────────────────────────────────────────────────────────────
export enum ErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  INVALID_QR = 'INVALID_QR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ALREADY_OWNED = 'ALREADY_OWNED',
  CANNOT_BUILD = 'CANNOT_BUILD',
  ALREADY_BANKRUPT = 'ALREADY_BANKRUPT',
  INVALID_ACTION = 'INVALID_ACTION',
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  GAME_NOT_STARTED = 'GAME_NOT_STARTED',
  GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
  DUPLICATE_LOGIN = 'DUPLICATE_LOGIN',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
}
