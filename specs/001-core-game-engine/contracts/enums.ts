/**
 * Enums - 부루마블 게임 Enum 타입 정의
 *
 * Feature: 001-core-game-engine
 * Date: 2026-01-04
 * Source: Notion 부루마블 요소 정리 문서
 *
 * 이 파일은 contracts 디렉토리에서 참조하는 Enum 타입을 정의합니다.
 * 실제 구현 시 server/src/models/enums.ts로 복사됩니다.
 */

/** 게임 상태 */
export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

/** 플레이어 색상 (비행기 모양 말) */
export enum PlayerColor {
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green',
}

/** 칸 타입 */
export enum TileType {
  START = 'start',              // 출발
  PROPERTY = 'property',        // 도시 (부동산)
  VEHICLE = 'vehicle',          // 탈것 (콩코드, 퀸엘리자베스, 컬럼비아)
  GOLDEN_KEY = 'goldenKey',     // 황금열쇠
  ISLAND = 'island',            // 무인도
  TRAVEL = 'travel',            // 우주여행
  FUND_RECEIVE = 'fundReceive', // 사회복지기금 접수 (수령처, 코너)
  FUND_DONATE = 'fundDonate',   // 사회복지기금 기부 (모금 칸)
}

/** 황금열쇠 카드 효과 타입 */
export enum CardEffectType {
  // 이동 관련
  MOVE_TO = 'moveTo',           // 특정 위치로 이동
  MOVE_BACK = 'moveBack',       // 뒤로 N칸 이동
  WORLD_TOUR = 'worldTour',     // 세계일주 (한 바퀴)

  // 금전 관련
  RECEIVE = 'receive',          // 돈 받기 (상금)
  PAY = 'pay',                  // 돈 지불 (지출)
  COLLECT_FROM_ALL = 'collectFromAll', // 모든 플레이어에게 받기

  // 건물 관련 유지비
  BUILDING_FEE = 'buildingFee', // 건물 유지비/수리비/방범비

  // 강제 매각
  FORCE_SELL = 'forceSell',     // 가장 비싼 땅 반값 매각

  // 특수 카드
  ISLAND_ESCAPE = 'islandEscape', // 무인도 탈출권 (보관 가능)
  TOLL_EXEMPT = 'tollExempt',     // 통행료 면제권 (보관 가능)

  // 무인도 이동
  TO_ISLAND = 'toIsland',       // 무인도로 이동

  // 기타
  SPECIAL = 'special',          // 특수 효과 (장기자랑 등)
}

/** 건물 레벨 */
export enum BuildingLevel {
  LAND = 0,       // 대지만
  VILLA = 1,      // 빌라
  VILLA2 = 2,     // 빌라 2개
  BUILDING = 3,   // 건물
  HOTEL = 4,      // 호텔
}

/** 트랜잭션 사유 */
export enum TransactionReason {
  RENT = 'rent',                    // 통행료
  PURCHASE = 'purchase',            // 땅 구매
  BUILD = 'build',                  // 건물 건설
  GOLDEN_KEY = 'goldenKey',         // 황금열쇠 효과
  SALARY = 'salary',                // 월급 (출발 통과)
  MORTGAGE = 'mortgage',            // 담보 설정
  MORTGAGE_RELEASE = 'mortgageRelease', // 담보 해제
  BANKRUPTCY = 'bankruptcy',        // 파산 자산 이전
  FUND_DONATE = 'fundDonate',       // 사회복지기금 기부
  FUND_RECEIVE = 'fundReceive',     // 사회복지기금 수령
  TRAVEL_FEE = 'travelFee',         // 우주여행 이용료
  ISLAND_ESCAPE = 'islandEscape',   // 무인도 탈출 비용
  FORCE_SELL = 'forceSell',         // 강제 매각
}

/** 턴 단계 */
export enum TurnPhase {
  IDLE = 'idle',
  DICE_INPUT = 'diceInput',
  MOVING = 'moving',
  LANDED = 'landed',
  ACTION_PHASE = 'actionPhase',
  TURN_END = 'turnEnd',
}

/** 무인도 탈출 방법 */
export enum IslandEscapeMethod {
  DOUBLE = 'double',        // 더블 굴리기
  PAY = 'pay',              // 비용 지불
  CARD = 'card',            // 탈출권 사용
  WAIT = 'wait',            // 3턴 대기 후 자동 탈출
}
