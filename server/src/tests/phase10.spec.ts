import { describe, it, expect, beforeEach } from 'vitest';
import { GameService } from '../services/game-service.js';
import { createGameState } from '../models/game-state.js';
import { createPlayer } from '../models/player.js';
import { GameStatus, SPECIAL_TILE_INDICES, PlayerColor } from '@blue-marble/shared';




describe('Phase 10: Special Tiles & Cards', () => {
  let game: any;
  let player1: any;
  let player2: any;

  beforeEach(() => {
    // Setup fresh game
    game = createGameState('test-room', 'p1');
    player1 = createPlayer('Player 1', PlayerColor.RED);
    player2 = createPlayer('Player 2', PlayerColor.BLUE);
    // Fix IDs to match 'p1', 'p2' if needed or let them be random and just assign.
    // createPlayer generates random ID. We might need stable IDs?
    // GameService usually depends on player.id.
    // If I want predictable IDs, I should mock createPlayer or just use the result.
    // Let's assume game.players = [player1, player2] is enough.
    game.players = [player1, player2];
    game.status = GameStatus.PLAYING;

    
    // Hack to access private method if needed, or use public movePlayer which calls handleLanding
    // But movePlayer adds steps.
    // If I want to land on specific tile, I can set position - 1 and move 1 step.
  });

  it('should handle Golden Key: Receive Money', () => {
    // Mock Deck to return 'nobel-prize'
    game.goldenKeyDeck = ['nobel-prize']; 
    const initialMoney = player1.money;

    (GameService as any).handleGoldenKey(game, player1);

    expect(player1.money).toBe(initialMoney + 300000);
    expect(game.logs[game.logs.length - 1]).toContain('노벨평화상');
  });


  it('should send player to Island', async () => {
    // Set position to near Island
    // Island is at index 10.
    player1.position = 9;
    
    // Move 1 step
    // GameService.movePlayer is technically public but not exposed as API directly, it's used by rollDice.
    // We can call (GameService as any).movePlayer(game, player1, 1);
    
    // However, handleLanding is what does the logic.
    // (GameService as any).handleLanding(game, player1);
    
    player1.position = SPECIAL_TILE_INDICES.ISLAND;
    (GameService as any).handleLanding(game, player1);

    expect(player1.islandTurnsLeft).toBe(3);
    expect(game.logs[game.logs.length - 1]).toContain('무인도에 갇혔습니다');
  });

  it('should handle Space Travel', async () => {
    player1.position = SPECIAL_TILE_INDICES.SPACE_TRAVEL;
    (GameService as any).handleLanding(game, player1);
    
    expect(player1.pendingSpaceChoice).toBe(true);
    expect(game.logs[game.logs.length - 1]).toContain('우주여행');
  });
});
