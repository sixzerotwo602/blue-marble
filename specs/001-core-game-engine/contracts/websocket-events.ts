/**
 * WebSocket Event Contracts
 * 
 * Feature: 001-core-game-engine
 * Date: 2026-01-04
 * 
 * 서버-클라이언트 간 WebSocket 이벤트 정의
 */

import { GameRoom, Player, GoldenKeyCard } from './types';

// We should move ErrorCode to types or similar if we want to avoid circular, but simplified:
// Just import specific types from './types'

// ============================================================================
// Client → Server Events
// ============================================================================

export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface StartGamePayload {
  roomId: string;
}

export interface RollDicePayload {
  roomId: string;
  playerId: string;
  /** 두 주사위 합 (1-12) */
  diceResult: number;
}

export interface ScanQrPayload {
  roomId: string;
  playerId: string;
  /** QR 코드에서 읽은 칸 인덱스 (0-39, 40칸 보드판) */
  tileIndex: number;
}

export interface BuyPropertyPayload {
  roomId: string;
  playerId: string;
  tileIndex: number;
}

export interface BuildPayload {
  roomId: string;
  playerId: string;
  tileIndex: number;
  /** 목표 건물 레벨 (1=별장, 2=별장2, 3=빌딩, 4=호텔) */
  buildingLevel: 1 | 2 | 3 | 4;
}

export interface SetMortgagePayload {
  roomId: string;
  playerId: string;
  tileIndex: number;
}

export interface ReleaseMortgagePayload {
  roomId: string;
  playerId: string;
  tileIndex: number;
}

export interface PayRentPayload {
  roomId: string;
  payerId: string;
  ownerId: string;
  amount: number;
}

export interface IslandActionPayload {
  roomId: string;
  playerId: string;
  /** 무인도 탈출 액션 */
  action: 'double' | 'pay' | 'card' | 'wait';
}

export interface EndTurnPayload {
  roomId: string;
  playerId: string;
}

export interface DeclareBankruptcyPayload {
  roomId: string;
  playerId: string;
  /** 채권자 ID (null이면 은행 파산) */
  creditorId?: string;
}

export interface UseTravelPayload {
  roomId: string;
  playerId: string;
  /** 우주여행에서 이동할 목적지 칸 인덱스 (0-39) */
  destinationIndex: number;
}

export interface UseHoldableCardPayload {
  roomId: string;
  playerId: string;
  /** 사용할 보관 카드 ID (탈출권 또는 우대권) */
  cardId: string;
}

// ============================================================================
// Server → Client Events
// ============================================================================

export interface RoomCreatedPayload {
  roomId: string;
  roomCode: string;
}

export interface PlayerJoinedPayload {
  player: Player;
  players: Player[];
}

export interface GameStartedPayload {
  turnOrder: string[];
  currentTurnPlayerId: string;
}

export interface StateUpdatedPayload {
  gameState: GameRoom;
}

export interface TurnChangedPayload {
  previousPlayerId: string;
  currentPlayerId: string;
}

export interface GoldenKeyDrawnPayload {
  card: GoldenKeyCard;
}

export interface PlayerBankruptedPayload {
  playerId: string;
  creditorId?: string;
  assets: {
    money: number;
    tileIds: number[];
  };
}

export interface GamePausedPayload {
  reason: 'disconnect' | 'manual';
  disconnectedPlayerId?: string;
}

export interface GameResumedPayload {
  resumedPlayerId?: string;
}

export interface GameEndedPayload {
  winnerId: string;
  rankings: Array<{
    playerId: string;
    rank: number;
    finalMoney: number;
  }>;
}

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
}

// ============================================================================
// Error Codes
// ============================================================================

export enum ErrorCode {
  // Room errors
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  ROOM_ALREADY_STARTED = 'ROOM_ALREADY_STARTED',
  
  // Player errors
  PLAYER_NOT_FOUND = 'PLAYER_NOT_FOUND',
  NOT_HOST = 'NOT_HOST',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  PLAYER_BANKRUPT = 'PLAYER_BANKRUPT',
  PLAYER_ON_ISLAND = 'PLAYER_ON_ISLAND',
  
  // Game errors
  GAME_NOT_STARTED = 'GAME_NOT_STARTED',
  GAME_PAUSED = 'GAME_PAUSED',
  GAME_FINISHED = 'GAME_FINISHED',
  INVALID_QR = 'INVALID_QR',
  INVALID_DICE = 'INVALID_DICE',
  
  // Transaction errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ALREADY_OWNED = 'ALREADY_OWNED',
  NOT_OWNER = 'NOT_OWNER',
  CANNOT_BUILD = 'CANNOT_BUILD',
  TILE_MORTGAGED = 'TILE_MORTGAGED',
  NOT_PROPERTY = 'NOT_PROPERTY',
  
  // Network errors
  CONNECTION_LOST = 'CONNECTION_LOST',
  TIMEOUT = 'TIMEOUT',
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.ROOM_NOT_FOUND]: '존재하지 않는 방입니다',
  [ErrorCode.ROOM_FULL]: '방이 가득 찼습니다',
  [ErrorCode.ROOM_ALREADY_STARTED]: '이미 시작된 게임입니다',
  
  [ErrorCode.PLAYER_NOT_FOUND]: '플레이어를 찾을 수 없습니다',
  [ErrorCode.NOT_HOST]: '호스트만 게임을 시작할 수 있습니다',
  [ErrorCode.NOT_YOUR_TURN]: '당신의 턴이 아닙니다',
  [ErrorCode.PLAYER_BANKRUPT]: '파산한 플레이어입니다',
  [ErrorCode.PLAYER_ON_ISLAND]: '무인도에 갇혀 있습니다',
  
  [ErrorCode.GAME_NOT_STARTED]: '게임이 시작되지 않았습니다',
  [ErrorCode.GAME_PAUSED]: '게임이 일시 정지 상태입니다',
  [ErrorCode.GAME_FINISHED]: '이미 종료된 게임입니다',
  [ErrorCode.INVALID_QR]: '잘못된 위치입니다',
  [ErrorCode.INVALID_DICE]: '유효하지 않은 주사위 값입니다 (1-12)',
  
  [ErrorCode.INSUFFICIENT_FUNDS]: '잔고가 부족합니다',
  [ErrorCode.ALREADY_OWNED]: '이미 소유된 땅입니다',
  [ErrorCode.NOT_OWNER]: '소유자가 아닙니다',
  [ErrorCode.CANNOT_BUILD]: '건설할 수 없습니다',
  [ErrorCode.TILE_MORTGAGED]: '담보 상태의 땅입니다',
  [ErrorCode.NOT_PROPERTY]: '부동산이 아닙니다',
  
  [ErrorCode.CONNECTION_LOST]: '연결이 끊어졌습니다',
  [ErrorCode.TIMEOUT]: '응답 시간이 초과되었습니다',
};

// ============================================================================
// Event Names (Type-Safe)
// ============================================================================

export const ClientEvents = {
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  START_GAME: 'start-game',
  ROLL_DICE: 'roll-dice',
  SCAN_QR: 'scan-qr',
  BUY_PROPERTY: 'buy-property',
  BUILD: 'build',
  SET_MORTGAGE: 'set-mortgage',
  RELEASE_MORTGAGE: 'release-mortgage',
  PAY_RENT: 'pay-rent',
  ISLAND_ACTION: 'island-action',
  END_TURN: 'end-turn',
  DECLARE_BANKRUPTCY: 'declare-bankruptcy',
  USE_TRAVEL: 'use-travel',
  USE_HOLDABLE_CARD: 'use-holdable-card',
} as const;

export const ServerEvents = {
  ROOM_CREATED: 'room-created',
  PLAYER_JOINED: 'player-joined',
  GAME_STARTED: 'game-started',
  STATE_UPDATED: 'state-updated',
  TURN_CHANGED: 'turn-changed',
  GOLDEN_KEY_DRAWN: 'golden-key-drawn',
  PLAYER_BANKRUPTED: 'player-bankrupted',
  GAME_PAUSED: 'game-paused',
  GAME_RESUMED: 'game-resumed',
  GAME_ENDED: 'game-ended',
  ERROR: 'error',
} as const;

export type ClientEventName = typeof ClientEvents[keyof typeof ClientEvents];
export type ServerEventName = typeof ServerEvents[keyof typeof ServerEvents];

