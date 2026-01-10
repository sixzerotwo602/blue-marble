/** 게임 상수 (spec.md 참조) */
export const GAME_CONSTANTS = {
  /** 초기 자금 */
  INITIAL_MONEY: 2_000_000,
  /** 최대 플레이어 수 */
  MAX_PLAYERS: 4,
  /** 최소 플레이어 수 */
  MIN_PLAYERS: 2,
  /** 보드판 총 칸 수 */
  BOARD_TILES: 40,
  /** 출발 통과 시 월급 */
  SALARY: 200_000,
  /** 독점 시 통행료 배수 */
  MONOPOLY_MULTIPLIER: 2,
  /** 땅 매각 시 환급률 */
  LAND_SELL_RATE: 0.5,
  /** 건물 매각 시 환급률 */
  BUILDING_SELL_RATE: 1.0,
} as const;
