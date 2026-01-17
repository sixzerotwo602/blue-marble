/**
 * Toll Payment Tests
 * @description Story 2.1 - 통행료 지불 시스템 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  buyLand,
  payToll,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';

describe('Toll Payment - Story 2.1', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: 타인 땅 도착 시 통행료 지불', () => {
    it('상대방 소유 땅에 도착하면 통행료가 차감되어야 한다', () => {
      // p1이 타이베이(id:1) 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));

      const p2Before = store.getState().game.players.find(p => p.id === 'p2')!;
      const moneyBefore = p2Before.money;

      // p2가 타이베이(id:1)에서 통행료 지불
      store.dispatch(payToll({ payerId: 'p2', tileId: 1 }));

      const p2After = store.getState().game.players.find(p => p.id === 'p2')!;
      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      const expectedToll = tile.baseToll ?? 0;

      expect(p2After.money).toBe(moneyBefore - expectedToll);
    });

    it('소유자의 현금이 통행료만큼 증가해야 한다', () => {
      // p1이 타이베이(id:1) 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));

      const p1Before = store.getState().game.players.find(p => p.id === 'p1')!;
      const moneyBefore = p1Before.money;
      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      const expectedToll = tile.baseToll ?? 0;

      // p2가 타이베이(id:1)에서 통행료 지불
      store.dispatch(payToll({ payerId: 'p2', tileId: 1 }));

      const p1After = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(p1After.money).toBe(moneyBefore + expectedToll);
    });
  });

  describe('자기 땅 또는 무소유 땅', () => {
    it('자기 소유 땅에서는 통행료가 차감되지 않아야 한다', () => {
      // p1이 타이베이 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));

      const p1Before = store.getState().game.players.find(p => p.id === 'p1')!;
      const moneyBefore = p1Before.money;

      // p1이 자기 땅에서 통행료 지불 시도
      store.dispatch(payToll({ payerId: 'p1', tileId: 1 }));

      const p1After = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(p1After.money).toBe(moneyBefore); // 변화 없음
    });

    it('무소유 땅에서는 통행료가 차감되지 않아야 한다', () => {
      const p1Before = store.getState().game.players.find(p => p.id === 'p1')!;
      const moneyBefore = p1Before.money;

      // 무소유 땅에서 통행료 지불 시도
      store.dispatch(payToll({ payerId: 'p1', tileId: 1 }));

      const p1After = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(p1After.money).toBe(moneyBefore); // 변화 없음
    });
  });

  describe('통행료 계산', () => {
    it('기본 통행료(baseToll)가 적용되어야 한다', () => {
      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      expect(tile.baseToll).toBeGreaterThan(0);
    });

    it('turnPhase가 TOLL_PAYMENT로 변경되어야 한다', () => {
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));
      store.dispatch(payToll({ payerId: 'p2', tileId: 1 }));

      expect(store.getState().game.turnPhase).toBe('TOLL_PAYMENT');
    });
  });
});
