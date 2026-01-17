/**
 * Asset Liquidation Tests
 * @description Story 2.3 - 자산 매각 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  buyLand,
  sellBuilding,
  sellLand,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';

describe('Asset Liquidation System - Story 2.3', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: 건물 매각 (100% 환불)', () => {
    it('건물이 없으면 sellBuilding 효과가 없어야 한다', () => {
      // p1이 타이베이 구매 (건물 없음)
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));
      
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1')!;

      // 건물이 없으므로 매각 시도해도 변화 없음
      store.dispatch(sellBuilding({ playerId: 'p1', tileId: 1, buildingType: 'villa' }));

      const playerAfter = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(playerAfter.money).toBe(playerBefore.money);
    });

    it('타인 땅의 건물은 매각할 수 없어야 한다', () => {
      // p1이 땅 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));
      
      const p2Before = store.getState().game.players.find(p => p.id === 'p2')!.money;

      // p2가 p1 땅의 건물 매각 시도
      store.dispatch(sellBuilding({ playerId: 'p2', tileId: 1, buildingType: 'villa' }));

      // 변화 없어야 함
      const p2After = store.getState().game.players.find(p => p.id === 'p2')!.money;
      expect(p2After).toBe(p2Before);
    });
  });

  describe('AC2: 땅 매각 (50% 환불)', () => {
    it('땅 매각 시 50% 환불되어야 한다', () => {
      // p1이 타이베이 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));

      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      const landPrice = tile.landPrice ?? 0;
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1')!;

      // 땅 매각
      store.dispatch(sellLand({ playerId: 'p1', tileId: 1 }));

      const playerAfter = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(playerAfter.money).toBe(playerBefore.money + landPrice * 0.5);
    });

    it('땅 매각 시 타일 소유자가 null이 되어야 한다', () => {
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));
      store.dispatch(sellLand({ playerId: 'p1', tileId: 1 }));

      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      expect(tile.ownerId).toBeNull();
    });

    it('땅 매각 시 ownedTileIds에서 제거되어야 한다', () => {
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));
      store.dispatch(sellLand({ playerId: 'p1', tileId: 1 }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.ownedTileIds).not.toContain(1);
    });

    it('타인 땅은 매각할 수 없어야 한다', () => {
      // p1이 땅 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));

      const p2Before = store.getState().game.players.find(p => p.id === 'p2')!.money;

      // p2가 p1 땅 매각 시도
      store.dispatch(sellLand({ playerId: 'p2', tileId: 1 }));

      // 변화 없어야 함
      const p2After = store.getState().game.players.find(p => p.id === 'p2')!.money;
      expect(p2After).toBe(p2Before);

      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      expect(tile.ownerId).toBe('p1');
    });
  });
});
