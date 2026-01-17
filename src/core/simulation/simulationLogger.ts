/**
 * 시뮬레이션 로그 타입 정의
 */

/** 턴 로그 */
export interface TurnLog {
  gameId: number;
  turn: number;
  player: string;
  dice1: number;
  dice2: number;
  isDouble: boolean;
  fromPos: number;
  toPos: number;
  tileName: string;
  action: string;       // 'ROLL', 'BUY', 'BUILD', 'TOLL', 'BANKRUPT' 등
  amount: number;
  balance: number;
}

/** 소유권 변화 로그 */
export interface OwnershipLog {
  gameId: number;
  turn: number;
  player: string;
  tileIndex: number;
  tileName: string;
  action: string;       // 'BUY', 'BUILD_VILLA', 'BUILD_BUILDING', 'BUILD_HOTEL', 'SELL', 'TRANSFER'
  buildingLevel: string;
}

/** 게임 요약 */
export interface GameSummary {
  gameId: number;
  winner: string;
  totalTurns: number;
  durationMs: number;
  propertiesPurchased: number;
  buildingsBuilt: number;
  tollsPaid: number;
  totalTollAmount: number;
  player1FinalBalance: number;
  player2FinalBalance: number;
  player3FinalBalance?: number;
  player4FinalBalance?: number;
}

/** 전체 시뮬레이션 로그 */
export interface SimulationLogs {
  gameSummaries: GameSummary[];
  turns: TurnLog[];
  ownerships: OwnershipLog[];
}
