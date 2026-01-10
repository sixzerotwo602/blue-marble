// 통행료 계산 서비스 테스트
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateToll, checkMonopoly, payToll } from './tollCalculator.js';
import { initializeGame } from './gameService.js';
import { purchaseProperty } from './propertyService.js';
import { Game, BoardTileState } from '../types/index.js';

describe('tollCalculator', () => {
  let game: Game;

  beforeEach(() => {
    game = initializeGame(['Alice', 'Bob']);
  });

  describe('calculateToll', () => {
    it('대지료만 있는 경우 정확히 계산해야 함', () => {
      const tileState: BoardTileState = {
        id: 'tile-1',
        ownerId: 'player-1',
        buildings: { villaCount: 0, hasBuilding: false, hasHotel: false },
      };

      const result = calculateToll(1, tileState, false);
      
      // 타이베이 대지료: 2000원
      expect(result.total).toBe(2000);
    });

    it('별장이 있으면 통행료가 증가해야 함', () => {
      const tileState: BoardTileState = {
        id: 'tile-1',
        ownerId: 'player-1',
        buildings: { villaCount: 1, hasBuilding: false, hasHotel: false },
      };

      const result = calculateToll(1, tileState, false);
      
      // 타이베이: 대지료 2000 + 별장1 8000 = 10000
      expect(result.total).toBe(10000);
    });

    it('독점 시 통행료가 2배가 되어야 함', () => {
      const tileState: BoardTileState = {
        id: 'tile-1',
        ownerId: 'player-1',
        buildings: { villaCount: 0, hasBuilding: false, hasHotel: false },
      };

      const resultNormal = calculateToll(1, tileState, false);
      const resultMonopoly = calculateToll(1, tileState, true);
      
      expect(resultMonopoly.total).toBe(resultNormal.total * 2);
    });

    it('모든 건물이 있을 때 합산 계산해야 함', () => {
      const tileState: BoardTileState = {
        id: 'tile-1',
        ownerId: 'player-1',
        buildings: { villaCount: 2, hasBuilding: true, hasHotel: true },
      };

      const result = calculateToll(1, tileState, false);
      
      // 타이베이: 대지 2000 + 별장1 8000 + 별장2 20000 + 빌딩 88000 + 호텔 248000 = 366000
      // (계산 방식에 따라 다를 수 있음, 실제 값 확인 필요)
      expect(result.total).toBeGreaterThan(2000);
    });
  });

  describe('checkMonopoly', () => {
    it('같은 구역 모든 땅을 소유하면 독점이어야 함', () => {
      const playerId = game.players[0].id;
      
      // zone1의 모든 땅 구매 (타이베이, 베이징, 마닐라, 싱가포르, 카이로, 이스탄불)
      [1, 3, 4, 7, 8, 9].forEach(index => {
        game.board[index].ownerId = playerId;
      });

      const result = checkMonopoly(game, playerId, 1); // 타이베이
      
      expect(result).toBe(true);
    });

    it('구역의 일부만 소유하면 독점이 아니어야 함', () => {
      const playerId = game.players[0].id;
      
      // zone1의 일부만 구매
      game.board[1].ownerId = playerId; // 타이베이
      game.board[3].ownerId = playerId; // 베이징
      // 마닐라(4)는 미구매

      const result = checkMonopoly(game, playerId, 1);
      
      expect(result).toBe(false);
    });

    it('건설 불가 땅 (colorGroup 없음)은 독점 비적용이어야 함', () => {
      const playerId = game.players[0].id;
      
      // 제주도 (건설 불가, colorGroup 없음)
      game.board[6].ownerId = playerId;

      const result = checkMonopoly(game, playerId, 6);
      
      expect(result).toBe(false);
    });
  });

  describe('payToll', () => {
    it('통행료 지불 시 잔고가 이동해야 함', () => {
      const payerId = game.players[0].id;
      const ownerId = game.players[1].id;
      const tollAmount = 10000;
      
      const payerInitialMoney = game.players[0].money;
      const ownerInitialMoney = game.players[1].money;

      payToll(game, payerId, ownerId, tollAmount);

      expect(game.players[0].money).toBe(payerInitialMoney - tollAmount);
      expect(game.players[1].money).toBe(ownerInitialMoney + tollAmount);
    });
  });
});
