/**
 * 공유 타입 정의
 */

import {
  GameStatus,
  GamePhase,
  GameMode,
  PlayerColor,
  TileType,
  TransactionReason,

  CardEffectType,
  CardKeepPolicy,
  CardPhasePolicy,
  TurnPhase,
} from './enums.js';


// ───────────────────────────────────────────────────────────────
// 게임 상수
// ───────────────────────────────────────────────────────────────
export const GAME_CONSTANTS = {
  BOARD_SIZE: 40,
  MAX_PLAYERS: 4,
  INITIAL_MONEY: 2_930_000,
  INITIAL_MONEY_2P: 5_860_000,
  START_SALARY: 200_000,
  WELFARE_DONATION: 150_000,
  SPACE_TRAVEL_FEE: 200_000,
  ESCAPE_CARD_SELL_PRICE: 200_000,
  ISLAND_LOCK_TURNS: 3,
  DISCONNECT_TIMEOUT_MS: 180_000,
} as const;

// ───────────────────────────────────────────────────────────────
// 증서/부동산 스펙
// ───────────────────────────────────────────────────────────────
export interface PropertySpec {
  id: string;
  name: string;
  tileIndex: number;
  tileType: TileType;
  purchasePrice: number;
  canBuild: boolean;
  buildCost: {
    villa: number;
    building: number;
    hotel: number;
  } | null;
  toll: {
    land: number;
    villa: number;
    villa2: number;
    building: number;
    hotel: number;
  };
  colorGroup: string | null;
  isColumbia: boolean;
  isSeoul: boolean;
}

// ───────────────────────────────────────────────────────────────
// 부동산 상태 (런타임)
// ───────────────────────────────────────────────────────────────
export interface PropertyState {
  ownerPlayerId: string | null;
  // Building counts for precise toll calculation and UI
  buildingCounts: {
      villa: number; // 0-2 usually
      building: number; // 0-1
      hotel: number; // 0-1
  };
  // creating a derived level, but for state let's just store counts
}


// ───────────────────────────────────────────────────────────────
// 황금열쇠 카드
// ───────────────────────────────────────────────────────────────
export interface GoldenKeyCard {
  id: string;
  name: string;
  message: string;
  effectType: CardEffectType;
  keepPolicy: CardKeepPolicy;
  phasePolicy: CardPhasePolicy;
  value?: number;
  valuePerPlayer?: number;
  destinationIndex?: number;
  destinationName?: string;
  repairCost?: {
    villa: number;
    building: number;
    hotel: number;
  };
  moveSteps?: number;
}

// ───────────────────────────────────────────────────────────────
// 플레이어 상태
// ───────────────────────────────────────────────────────────────
export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;

  // Assets & Position
  position: number;
  money: number;
  ownedPropertyIds: string[];

  // Status Flags
  bankrupt: boolean;
  hasLoan: boolean;
  isConnected: boolean;

  disconnectedAt: number | null;

  // 턴 제어 필수 상태
  islandTurnsLeft: number;
  pendingSpaceChoice: boolean;
  doubleCount: number;

  // Held Cards
  freePassCardCount: number;
  escapeCardCount: number;
}

// ───────────────────────────────────────────────────────────────
// 게임 상태
// ───────────────────────────────────────────────────────────────
export interface GameState {
  id: string;
  roomCode: string;
  status: GameStatus;
  phase: GamePhase;
  mode: GameMode;

  // Players & Turn
  hostPlayerId: string;
  players: PlayerState[];
  currentTurnIndex: number;
  turnOrder: string[];
  turnPhase: TurnPhase;
  diceResult: [number, number] | null;

  // Property States
  propertyStates: Record<string, PropertyState>;

  // Global Pools
  welfarePot: number;
  goldenKeyDeck: string[];

  // Unsold Properties
  unsoldPropertyIds: string[];

  // Time & Turn Tracking
  createdAt: number;
  startedAt: number | null;
  turnsElapsed: number;
  gameEndByTimeLimit: boolean;
  timeLimitMinutes: number | null;

  // Logs for UI
  logs: string[];

  // Pending Debt for Bankruptcy Resolution (Phase 7)
  pendingDebt: {
      debtorId: string;
      creditorId: string | 'BANK'; // 'BANK' for tax/purchase/island, or PlayerId for toll
      amount: number;
  } | null;

  // Dev/Test Mode: Single tester can play all players
  devMode: boolean;
}





// ───────────────────────────────────────────────────────────────
// 보드 타일 (렌더링용)
// ───────────────────────────────────────────────────────────────
export interface BoardTile {
  index: number;
  name: string;
  type: TileType;
  propertyId: string | null;
}

// ───────────────────────────────────────────────────────────────
// 거래 기록
// ───────────────────────────────────────────────────────────────
export interface Transaction {
  id: string;
  timestamp: number;
  fromPlayerId: string | null;
  toPlayerId: string | null;
  amount: number;
  reason: TransactionReason;
  description?: string;
}

// ───────────────────────────────────────────────────────────────
// 게임 세션 결과
// ───────────────────────────────────────────────────────────────
export interface GameSessionResult {
  sessionId: string;
  roomCode: string;
  startedAt: number;
  endedAt: number;
  endReason: 'bankruptcy' | 'timeout' | 'allDisconnected';
  winnerId: string | null;
  rankings: Array<{
    playerId: string;
    rank: number;
    finalMoney: number;
    finalNetWorth: number;
  }>;
  totalTurns: number;
}

// ───────────────────────────────────────────────────────────────
// 게임 이벤트 로그
// ───────────────────────────────────────────────────────────────
export interface GameEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  turn: number;
  playerId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  decisionTimeMs?: number;
}

// ───────────────────────────────────────────────────────────────
// 턴 스냅샷
// ───────────────────────────────────────────────────────────────
export interface TurnSnapshot {
  sessionId: string;
  turn: number;
  timestamp: number;
  playerSnapshots: Array<{
    playerId: string;
    position: number;
    money: number;
    ownedPropertyIds: string[];
    totalNetWorth: number;
  }>;
}
