import { PlayerColor } from './enums';

export interface GameSession {
  id: string; // UUID
  roomCode: string;
  startedAt: Date;
  endedAt?: Date;
  winnerId?: string;
  totalTurns: number;
}

export interface GamePlayer {
  sessionId: string; // UUID
  playerId: string; // UUID
  visitorId: string;
  accountId?: string;
  name: string;
  color: PlayerColor;
  rank: number;
  finalAssets: number;
}

export enum GameEventType {
  DICE_ROLLED = 'DICE_ROLLED',
  MOVED = 'MOVED',
  QR_SCANNED = 'QR_SCANNED',
  LAND_PURCHASED = 'LAND_PURCHASED',
  BUILDING_CONSTRUCTED = 'BUILDING_CONSTRUCTED',
  RENT_PAID = 'RENT_PAID',
  GOLDEN_KEY_DRAWN = 'GOLDEN_KEY_DRAWN',
  GOLDEN_KEY_EXECUTED = 'GOLDEN_KEY_EXECUTED',
  ISLAND_TRAPPED = 'ISLAND_TRAPPED',
  ISLAND_ESCAPED = 'ISLAND_ESCAPED',
  SPACE_TRAVEL_FEE_PAID = 'SPACE_TRAVEL_FEE_PAID',
  SPACE_TRAVEL_MOVED = 'SPACE_TRAVEL_MOVED',
  TURN_ENDED = 'TURN_ENDED',
  BANKRUPTCY_DECLARED = 'BANKRUPTCY_DECLARED',
  GAME_PAUSED = 'GAME_PAUSED',
  GAME_RESUMED = 'GAME_RESUMED',
  GAME_ENDED = 'GAME_ENDED',
}

export interface GameEvent {
  id: string; // UUID
  sessionId: string; // UUID
  type: GameEventType;
  payload: any; // JSONB
  decisionDurationMs?: number;
  createdAt: Date;
}

export interface TurnSnapshot {
  id: string; // UUID
  sessionId: string; // UUID
  turnNumber: number;
  playerSnapshots: Record<string, { // Map<PlayerId, Snapshot>
    money: number;
    totalAssets: number;
    position: number;
    ownedTileIds: number[];
  }>;
  createdAt: Date;
}
