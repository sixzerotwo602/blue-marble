import { GameStatus } from './enums';
import { GameRoom, Player, BoardTile, GoldenKeyCard } from '../data-model'; // Assuming these referenced from data-model.md context, but strictly they should be imported from types if defined. For now, interfaces.

// Client -> Server Events
export interface ClientEvents {
  'create-room': { playerName: string };
  'join-room': { roomCode: string; playerName: string };
  'start-game': { roomId: string };
  'roll-dice': { roomId: string; playerId: string; diceResult: number }; // 2-12
  'scan-qr': { roomId: string; playerId: string; tileIndex: number };
  'buy-property': { roomId: string; playerId: string; tileIndex: number };
  'build': { roomId: string; playerId: string; tileIndex: number; buildingLevel: number };
  'set-mortgage': { roomId: string; playerId: string; tileIndex: number };
  'release-mortgage': { roomId: string; playerId: string; tileIndex: number };
  'pay-rent': { roomId: string; payerId: string; ownerId: string; amount: number };
  'island-action': { roomId: string; playerId: string; action: 'roll' | 'pay' | 'wait' };
  'end-turn': { roomId: string; playerId: string };
  'declare-bankruptcy': { roomId: string; playerId: string; creditorId?: string };
}

// Server -> Client Events
export interface ServerEvents {
  'room-created': { roomId: string; roomCode: string };
  'player-joined': { player: Player; players: Player[] };
  'game-started': { turnOrder: string[]; currentTurnPlayerId: string };
  'state-updated': { gameState: GameRoom }; // Full sync
  'turn-changed': { previousPlayerId: string; currentPlayerId: string };
  'golden-key-drawn': { card: GoldenKeyCard };
  'player-bankrupted': { playerId: string; creditorId?: string; assetsTransferred: number };
  'game-paused': { reason: string; disconnectedPlayerId?: string };
  'game-resumed': {};
  'game-ended': { winnerId: string; rankings: Player[] };
  'error': { code: string; message: string };
}
