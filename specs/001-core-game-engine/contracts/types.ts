/**
 * 공유 타입 정의
 *
 * Feature: 001-core-game-engine
 * Date: 2026-01-09
 *
 * 하이브리드 개발 전략:
 * - 데이터 아키텍처: ChatGPT 기반 (PlayerState, PropertySpec, GameState)
 * - 턴 제어 상태 변수: ChatGPT 핵심 (islandTurnsLeft, pendingSpaceChoice, doubleCount)
 * - 카드 정책: ChatGPT 기반 (keepPolicy, phasePolicy)
 */

import {
  GameStatus,
  GamePhase,
  GameMode,
  PlayerColor,
  TileType,
  BuildingLevel,
  TransactionReason,
  CardEffectType,
  CardKeepPolicy,
  CardPhasePolicy,
  TurnPhase,
} from './enums';

// ───────────────────────────────────────────────────────────────
// 게임 상수 (ChatGPT 기반)
// ───────────────────────────────────────────────────────────────
export const GAME_CONSTANTS = {
  BOARD_SIZE: 40,
  MAX_PLAYERS: 4,
  INITIAL_MONEY: 2_930_000,       // 3~4인 기준 (권종별 합산)
  INITIAL_MONEY_2P: 5_860_000,    // 2인 플레이 시 (2배)
  START_SALARY: 200_000,
  WELFARE_DONATION: 150_000,
  SPACE_TRAVEL_FEE: 200_000,
  ESCAPE_CARD_SELL_PRICE: 200_000,
  ISLAND_LOCK_TURNS: 3,
  DISCONNECT_TIMEOUT_MS: 180_000,
} as const;

// ───────────────────────────────────────────────────────────────
// 증서/부동산 스펙 (부루마블 요소 정리.md 데이터 로딩)
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
  buildingCounts: {
    villa: number;
    building: number;
    hotel: number;
  };
}

// ───────────────────────────────────────────────────────────────
// 황금열쇠 카드 (부루마블 요소 정리.md 27종)
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
// 플레이어 상태 (ChatGPT 기반 - 턴 제어에 필수적인 상태 변수 포함)
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

  // ★ 턴 제어 필수 상태 (ChatGPT 핵심)
  islandTurnsLeft: number;       // >0이면 무인도 감금 상태
  pendingSpaceChoice: boolean;   // 우주여행 → "다음 턴에 목적지 선택" 상태
  doubleCount: number;           // 0~2 (3연속 더블 → 턴 종료)

  // Held Cards
  freePassCardCount: number;     // 우대권 보유 수 (0~2)
  escapeCardCount: number;       // 무인도 탈출권 보유 수
}

// ───────────────────────────────────────────────────────────────
// 게임 상태 (ChatGPT 기반)
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
  goldenKeyDeck: string[];       // 카드 ID 배열 (셔플된 덱)

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

  // Pending Debt for Bankruptcy Resolution
  pendingDebt: {
      debtorId: string;
      creditorId: string | 'BANK'; // 'BANK' for tax/purchase/island, or PlayerId for toll
      amount: number;
  } | null;

  // Dev/Test Mode
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
  fromPlayerId: string | null;    // null = 은행
  toPlayerId: string | null;      // null = 은행
  amount: number;
  reason: TransactionReason;
  description?: string;
}

// ───────────────────────────────────────────────────────────────
// 게임 세션 결과 (DB 저장용)
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
// 게임 이벤트 로그 (DB 저장용)
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
// 턴 스냅샷 (DB 저장용)
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
