// 게임 서비스 테스트
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  initializeGame, 
  getCurrentPlayer, 
  movePlayer, 
  handlePassStart,
  endTurn,
  checkGameEnd,
  getPlayerById,
} from './gameService.js';
import { Game } from '../types/index.js';
import { GAME_CONSTANTS } from '../data/constants.js';

describe('gameService', () => {
  let game: Game;

  beforeEach(() => {
    game = initializeGame(['Alice', 'Bob']);
  });

  describe('initializeGame', () => {
    it('2명 플레이어로 게임을 초기화해야 함', () => {
      expect(game.players).toHaveLength(2);
      expect(game.status).toBe('playing');
      expect(game.turnCount).toBe(1);
    });

    it('모든 플레이어가 초기 자금을 가져야 함', () => {
      game.players.forEach(player => {
        expect(player.money).toBe(GAME_CONSTANTS.INITIAL_MONEY);
      });
    });

    it('모든 플레이어가 0번 위치에서 시작해야 함', () => {
      game.players.forEach(player => {
        expect(player.position).toBe(0);
      });
    });

    it('40개의 보드 타일 상태가 있어야 함', () => {
      expect(game.board).toHaveLength(40);
    });

    it('모든 타일이 소유자 없이 시작해야 함', () => {
      game.board.forEach(tile => {
        expect(tile.ownerId).toBeFalsy();
      });
    });
  });

  describe('getCurrentPlayer', () => {
    it('현재 턴의 플레이어를 반환해야 함', () => {
      const player = getCurrentPlayer(game);
      expect(player.id).toBe(game.turnOrder[game.currentPlayerIndex]);
    });
  });

  describe('movePlayer', () => {
    it('플레이어를 지정된 칸 수만큼 이동해야 함', () => {
      const playerId = game.players[0].id;
      const result = movePlayer(game, playerId, 5);
      
      expect(result.newPosition).toBe(5);
      expect(game.players[0].position).toBe(5);
    });

    it('보드를 순환해야 함 (40칸 초과)', () => {
      const playerId = game.players[0].id;
      game.players[0].position = 38;
      
      const result = movePlayer(game, playerId, 5);
      
      expect(result.newPosition).toBe(3); // 38 + 5 = 43 -> 3
      expect(result.passedStart).toBe(true);
    });

    it('출발점 통과 시 passedStart가 true여야 함', () => {
      const playerId = game.players[0].id;
      game.players[0].position = 35;
      
      const result = movePlayer(game, playerId, 10);
      
      expect(result.passedStart).toBe(true);
    });

    it('출발점 미통과 시 passedStart가 false여야 함', () => {
      const playerId = game.players[0].id;
      
      const result = movePlayer(game, playerId, 5);
      
      expect(result.passedStart).toBe(false);
    });
  });

  describe('handlePassStart', () => {
    it('월급을 지급해야 함', () => {
      const playerId = game.players[0].id;
      const initialMoney = game.players[0].money;
      
      handlePassStart(game, playerId);
      
      expect(game.players[0].money).toBe(initialMoney + GAME_CONSTANTS.SALARY);
    });

    it('isSecondHalf를 true로 설정해야 함', () => {
      const playerId = game.players[0].id;
      
      expect(game.players[0].isSecondHalf).toBe(false);
      handlePassStart(game, playerId);
      expect(game.players[0].isSecondHalf).toBe(true);
    });
  });

  describe('endTurn', () => {
    it('다음 플레이어로 넘어가야 함', () => {
      const result = endTurn(game);
      
      expect(game.currentPlayerIndex).toBe(1);
      expect(result.nextPlayerId).toBe(game.turnOrder[1]);
    });

    it('마지막 플레이어 후 첫 플레이어로 순환해야 함', () => {
      game.currentPlayerIndex = 1;
      
      const result = endTurn(game);
      
      expect(game.currentPlayerIndex).toBe(0);
      expect(game.turnCount).toBe(2);
    });

    it('더블일 때 같은 플레이어가 유지되어야 함', () => {
      game.lastDiceResult = { die1: 3, die2: 3, total: 6, isDouble: true };
      
      const result = endTurn(game);
      
      expect(result.isExtraTurn).toBe(true);
      expect(game.currentPlayerIndex).toBe(0);
    });
  });

  describe('checkGameEnd', () => {
    it('2명 이상 생존 시 게임이 계속되어야 함', () => {
      const result = checkGameEnd(game);
      
      expect(result.isEnded).toBe(false);
    });

    it('1명만 생존 시 게임이 종료되어야 함', () => {
      game.players[0].isBankrupt = true;
      
      const result = checkGameEnd(game);
      
      expect(result.isEnded).toBe(true);
      expect(result.winnerId).toBe(game.players[1].id);
    });
  });
});
