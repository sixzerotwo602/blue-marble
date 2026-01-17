/**
 * Phase System Tests
 * @description Story 3.1 - 페이즈 시스템 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  buyLand,
  checkAuctionTrigger,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';

describe('Phase System - Story 3.1', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: Phase Transitions', () => {
    it('게임 시작 시 phase는 EARLY여야 한다', () => {
      expect(store.getState().game.phase).toBe('EARLY');
    });

    it('빈 땅이 6개 이하면 AUCTION으로 전환되어야 한다', () => {
      const cityTiles = store.getState().game.tiles.filter(
        t => t.type === 'city' && t.ownerId === null
      );
      
      // 6개만 남기고 모두 구매
      const tilesToBuy = cityTiles.slice(0, cityTiles.length - 6);
      tilesToBuy.forEach(tile => {
        store.dispatch(buyLand({ playerId: 'p1', tileId: tile.id }));
      });

      store.dispatch(checkAuctionTrigger());
      
      expect(store.getState().game.phase).toBe('AUCTION');
    });

    it('모든 땅이 판매되면 DEVELOPMENT로 전환되어야 한다', () => {
      const cityTiles = store.getState().game.tiles.filter(
        t => t.type === 'city' && t.ownerId === null
      );
      
      // 6개만 남기고 구매 → AUCTION 전환
      const tilesToBuyFirst = cityTiles.slice(0, cityTiles.length - 6);
      tilesToBuyFirst.forEach(tile => {
        store.dispatch(buyLand({ playerId: 'p1', tileId: tile.id }));
      });
      store.dispatch(checkAuctionTrigger());
      expect(store.getState().game.phase).toBe('AUCTION');
      
      // 나머지 6개 구매 → DEVELOPMENT 전환
      const remainingTiles = store.getState().game.tiles.filter(
        t => t.type === 'city' && t.ownerId === null
      );
      remainingTiles.forEach(tile => {
        store.dispatch(buyLand({ playerId: 'p2', tileId: tile.id }));
      });
      store.dispatch(checkAuctionTrigger());
      
      expect(store.getState().game.phase).toBe('DEVELOPMENT');
    });

    it('빈 땅이 7개 이상이면 EARLY 유지되어야 한다', () => {
      // 아무것도 구매하지 않음
      store.dispatch(checkAuctionTrigger());
      
      expect(store.getState().game.phase).toBe('EARLY');
    });
  });
});
