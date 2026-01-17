/**
 * Auction System Tests
 * @description Story 2.4 - 경매 시스템 (6 Land Rule) 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  buyLand,
  checkAuctionTrigger,
  startAuction,
  placeBid,
  passAuction,
  completeAuction,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';

describe('Auction System - Story 2.4', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: 6개 땅 규칙', () => {
    it('초기 phase는 EARLY여야 한다', () => {
      const state = store.getState().game;
      expect(state.phase).toBe('EARLY');
    });

    it('빈 땅이 6개 이하면 AUCTION 페이즈로 전환되어야 한다', () => {
      // 빈 도시 타일 확인
      const cityTiles = store.getState().game.tiles.filter(
        t => t.type === 'city' && t.ownerId === null
      );
      
      // 충분한 땅을 구매해서 6개 이하로 만듦
      const tilesToBuy = cityTiles.slice(0, cityTiles.length - 6);
      tilesToBuy.forEach(tile => {
        store.dispatch(buyLand({ playerId: 'p1', tileId: tile.id }));
      });

      store.dispatch(checkAuctionTrigger());
      
      expect(store.getState().game.phase).toBe('AUCTION');
    });
  });

  describe('AC2: 경매 시스템', () => {
    it('startAuction으로 경매를 시작할 수 있어야 한다', () => {
      store.dispatch(startAuction({ tileId: 1 }));

      const state = store.getState().game;
      expect(state.currentAuction).not.toBeNull();
      expect(state.currentAuction?.tileId).toBe(1);
    });

    it('placeBid로 입찰할 수 있어야 한다', () => {
      store.dispatch(startAuction({ tileId: 1 }));
      
      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      const startingBid = tile.landPrice ?? 0;

      store.dispatch(placeBid({ playerId: 'p1', bidAmount: startingBid + 1000 }));

      const auction = store.getState().game.currentAuction!;
      expect(auction.currentBid).toBe(startingBid + 1000);
      expect(auction.highestBidderId).toBe('p1');
    });

    it('현재 입찰가보다 낮은 입찰은 무시되어야 한다', () => {
      store.dispatch(startAuction({ tileId: 1 }));
      
      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      const startingBid = tile.landPrice ?? 0;

      store.dispatch(placeBid({ playerId: 'p1', bidAmount: startingBid + 1000 }));
      store.dispatch(placeBid({ playerId: 'p2', bidAmount: startingBid + 500 })); // 낮은 입찰

      const auction = store.getState().game.currentAuction!;
      expect(auction.highestBidderId).toBe('p1');
    });

    it('passAuction으로 패스할 수 있어야 한다', () => {
      store.dispatch(startAuction({ tileId: 1 }));
      store.dispatch(passAuction({ playerId: 'p1' }));

      const auction = store.getState().game.currentAuction!;
      expect(auction.passedPlayers).toContain('p1');
    });

    it('completeAuction으로 경매를 완료하고 낙찰자에게 소유권 이전해야 한다', () => {
      store.dispatch(startAuction({ tileId: 1 }));
      
      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      const bidAmount = (tile.landPrice ?? 0) + 1000;
      const p1Before = store.getState().game.players.find(p => p.id === 'p1')!.money;

      store.dispatch(placeBid({ playerId: 'p1', bidAmount }));
      store.dispatch(completeAuction());

      const state = store.getState().game;
      expect(state.currentAuction).toBeNull();
      
      const tileAfter = state.tiles.find(t => t.id === 1)!;
      expect(tileAfter.ownerId).toBe('p1');

      const p1After = state.players.find(p => p.id === 'p1')!;
      expect(p1After.money).toBe(p1Before - bidAmount);
    });
  });
});
