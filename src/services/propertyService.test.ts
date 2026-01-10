// 땅 구매 서비스 테스트
import { describe, it, expect, beforeEach } from 'vitest';
import { canAffordPurchase, isPurchasableTile, purchaseProperty } from './propertyService.js';
import { initializeGame } from './gameService.js';
import { Game } from '../types/index.js';

describe('propertyService', () => {
  let game: Game;

  beforeEach(() => {
    game = initializeGame(['Alice', 'Bob']);
  });

  describe('isPurchasableTile', () => {
    it('일반 땅은 구매 가능해야 함', () => {
      expect(isPurchasableTile(1)).toBe(true);  // 타이베이
      expect(isPurchasableTile(3)).toBe(true);  // 베이징
    });

    it('특수 칸은 구매 불가해야 함', () => {
      expect(isPurchasableTile(0)).toBe(false);  // 출발
      expect(isPurchasableTile(10)).toBe(false); // 무인도
      expect(isPurchasableTile(2)).toBe(false);  // 황금열쇠
    });

    it('탈것(VEHICLE)은 구매 가능해야 함', () => {
      expect(isPurchasableTile(15)).toBe(true); // 콩코드여객기
      expect(isPurchasableTile(28)).toBe(true); // 퀸엘리자베스호
    });
  });

  describe('canAffordPurchase', () => {
    it('잔고가 충분하면 true를 반환해야 함', () => {
      const player = game.players[0];
      
      expect(canAffordPurchase(player, 1)).toBe(true); // 타이베이 50,000원
    });

    it('잔고가 부족하면 false를 반환해야 함', () => {
      const player = game.players[0];
      player.money = 10000; // 잔고 부족하게 설정
      
      expect(canAffordPurchase(player, 1)).toBe(false); // 타이베이 50,000원
    });
  });

  describe('purchaseProperty', () => {
    it('구매 성공 시 소유권이 이전되어야 함', () => {
      const playerId = game.players[0].id;
      
      const result = purchaseProperty(game, playerId, 1);
      
      expect(result.success).toBe(true);
      expect(game.board[1].ownerId).toBe(playerId);
    });

    it('구매 시 잔고가 차감되어야 함', () => {
      const player = game.players[0];
      const initialMoney = player.money;
      
      purchaseProperty(game, player.id, 1); // 타이베이 50,000원
      
      expect(player.money).toBe(initialMoney - 50000);
    });

    it('구매 시 ownedTileIds에 추가되어야 함', () => {
      const player = game.players[0];
      
      purchaseProperty(game, player.id, 1);
      
      expect(player.ownedTileIds).toContain('tile-1');
    });

    it('이미 소유된 땅은 구매 실패해야 함', () => {
      const player1Id = game.players[0].id;
      const player2Id = game.players[1].id;
      
      purchaseProperty(game, player1Id, 1);
      const result = purchaseProperty(game, player2Id, 1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
