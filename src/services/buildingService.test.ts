// 건물 건설 서비스 테스트
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  canBuildVilla, 
  canBuildBuilding, 
  canBuildHotel,
  buildVilla,
  buildBuilding,
  buildHotel,
} from './buildingService.js';
import { initializeGame, handlePassStart } from './gameService.js';
import { purchaseProperty } from './propertyService.js';
import { Game, Player, BoardTileState } from '../types/index.js';

describe('buildingService', () => {
  let game: Game;
  let player: Player;
  let tileState: BoardTileState;

  beforeEach(() => {
    game = initializeGame(['Alice', 'Bob']);
    player = game.players[0];
    
    // 땅 구매
    purchaseProperty(game, player.id, 1); // 타이베이
    tileState = game.board[1];
  });

  describe('canBuildVilla', () => {
    it('전반전에는 건설 불가해야 함', () => {
      expect(player.isSecondHalf).toBe(false);
      expect(canBuildVilla(player, tileState, 1)).toBe(false);
    });

    it('후반전에는 건설 가능해야 함', () => {
      handlePassStart(game, player.id); // 후반전 진입
      
      expect(canBuildVilla(player, tileState, 1)).toBe(true);
    });

    it('별장 2개 이상은 건설 불가해야 함', () => {
      handlePassStart(game, player.id);
      tileState.buildings.villaCount = 2;
      
      expect(canBuildVilla(player, tileState, 1)).toBe(false);
    });

    it('잔고 부족 시 건설 불가해야 함', () => {
      handlePassStart(game, player.id);
      player.money = 1000; // 잔고 부족
      
      expect(canBuildVilla(player, tileState, 1)).toBe(false);
    });
  });

  describe('canBuildBuilding', () => {
    it('이미 빌딩이 있으면 건설 불가해야 함', () => {
      handlePassStart(game, player.id);
      tileState.buildings.hasBuilding = true;
      
      expect(canBuildBuilding(player, tileState, 1)).toBe(false);
    });
  });

  describe('canBuildHotel', () => {
    it('이미 호텔이 있으면 건설 불가해야 함', () => {
      handlePassStart(game, player.id);
      tileState.buildings.hasHotel = true;
      
      expect(canBuildHotel(player, tileState, 1)).toBe(false);
    });
  });

  describe('buildVilla', () => {
    it('별장 건설 시 villaCount가 증가해야 함', () => {
      handlePassStart(game, player.id);
      
      const result = buildVilla(game, player, 1);
      
      expect(result.success).toBe(true);
      expect(tileState.buildings.villaCount).toBe(1);
    });

    it('별장 건설 시 비용이 차감되어야 함', () => {
      handlePassStart(game, player.id);
      const initialMoney = player.money;
      
      buildVilla(game, player, 1); // 타이베이 별장 50,000원
      
      expect(player.money).toBe(initialMoney - 50000);
    });
  });

  describe('buildBuilding', () => {
    it('빌딩 건설 시 hasBuilding이 true가 되어야 함', () => {
      handlePassStart(game, player.id);
      
      const result = buildBuilding(game, player, 1);
      
      expect(result.success).toBe(true);
      expect(tileState.buildings.hasBuilding).toBe(true);
    });
  });

  describe('buildHotel', () => {
    it('호텔 건설 시 hasHotel이 true가 되어야 함', () => {
      handlePassStart(game, player.id);
      
      const result = buildHotel(game, player, 1);
      
      expect(result.success).toBe(true);
      expect(tileState.buildings.hasHotel).toBe(true);
    });
  });
});
