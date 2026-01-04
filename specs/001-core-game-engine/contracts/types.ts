/**
 * Shared Type Definitions
 * 
 * Feature: 001-core-game-engine
 * Date: 2026-01-04
 */

import { GameStatus, PlayerColor, TileType, BuildingLevel, TransactionReason, CardEffectType, TurnPhase } from './enums';

export interface GameRoom {
  id: string;
  roomCode: string;
  status: GameStatus;
  hostPlayerId: string;
  players: Player[];
  
  // Game State
  currentTurnIndex: number;
  turnOrder: string[];
  turnPhase: TurnPhase;
  diceResult: [number, number] | null;
  
  createdAt: number;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  
  // Assets & Position
  money: number;
  position: number;
  ownedTileIds: number[];
  
  // Status Flags
  isConnected: boolean;
  isBankrupt: boolean;
  
  // Edge Case States
  islandTurnsLeft: number;      // 0: 탈출/미방문, 1~3: 잔여 턴
  doubleCount: number;          // 0~2: 진행 중, 3: 턴 종료
  isSpaceTravelPending: boolean; // true: 우주여행 탑승 중 (다음 턴 이동)
  
  // Held Items
  hasIslandEscapeCard: boolean;
  hasTollExemptCard: boolean;
}

export interface BoardTile {
  index: number;
  name: string;
  type: TileType;
  
  // Property Attributes
  colorGroup?: string;
  price?: number;
  rentLevels?: number[]; // [Land, Villa, Villa2, Building, Hotel]
  mortgageValue?: number;
  
  // State
  ownerId: string | null;
  buildingLevel: BuildingLevel;
  isMortgaged: boolean;
}

export interface GoldenKeyCard {
  id: string;
  message: string;
  effectType: CardEffectType;
  value?: number;
  destinationIndex?: number;
  target?: string; // For special target if needed
}

export interface Transaction {
  id: string;
  timestamp: number;
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  reason: TransactionReason;
}
