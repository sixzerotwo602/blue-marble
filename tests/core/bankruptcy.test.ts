/**
 * Bankruptcy Tests
 * @description Story 2.2 - 파산 로직 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  buyLand,
  updatePlayerMoney,
  declareBankruptcy,
  checkPaymentAbility,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';

describe('Bankruptcy Logic - Story 2.2', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: 파산 선언', () => {
    it('파산 시 isBankrupt가 true로 설정되어야 한다', () => {
      store.dispatch(declareBankruptcy({ playerId: 'p1' }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.isBankrupt).toBe(true);
    });

    it('파산 시 현금이 0이 되어야 한다', () => {
      store.dispatch(declareBankruptcy({ playerId: 'p1' }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.money).toBe(0);
    });

    it('이미 파산한 플레이어는 다시 파산할 수 없어야 한다', () => {
      store.dispatch(declareBankruptcy({ playerId: 'p1' }));
      const beforeState = store.getState().game;

      store.dispatch(declareBankruptcy({ playerId: 'p1' }));
      const afterState = store.getState().game;

      // 상태가 동일해야 함 (변경 없음)
      expect(beforeState.players).toEqual(afterState.players);
    });
  });

  describe('AC2: 자산 양도 (채권자에게)', () => {
    it('채권자에게 현금이 양도되어야 한다', () => {
      // p1에게 100만원 설정
      store.dispatch(updatePlayerMoney({ playerId: 'p1', amount: 1000000 }));
      const p1Money = store.getState().game.players.find(p => p.id === 'p1')!.money;
      const p2Before = store.getState().game.players.find(p => p.id === 'p2')!.money;

      // p1이 p2에게 파산 (채권자 = p2)
      store.dispatch(declareBankruptcy({ playerId: 'p1', creditorId: 'p2' }));

      const p2After = store.getState().game.players.find(p => p.id === 'p2')!.money;
      expect(p2After).toBe(p2Before + p1Money);
    });

    it('채권자에게 소유 타일이 양도되어야 한다', () => {
      // p1이 땅 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));

      // p1이 p2에게 파산
      store.dispatch(declareBankruptcy({ playerId: 'p1', creditorId: 'p2' }));

      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      expect(tile.ownerId).toBe('p2');
    });
  });

  describe('AC3: 자산 양도 (은행에)', () => {
    it('채권자 없으면 타일이 무주지로 전환되어야 한다', () => {
      // p1이 땅 구매
      store.dispatch(buyLand({ playerId: 'p1', tileId: 1 }));

      // p1이 은행에 파산 (채권자 없음)
      store.dispatch(declareBankruptcy({ playerId: 'p1' }));

      const tile = store.getState().game.tiles.find(t => t.id === 1)!;
      expect(tile.ownerId).toBeNull();
    });
  });

  describe('AC4: 게임 종료 조건', () => {
    it('한 명만 남으면 게임 종료되어야 한다', () => {
      store.dispatch(declareBankruptcy({ playerId: 'p1' }));

      const state = store.getState().game;
      expect(state.turnPhase).toBe('GAME_OVER');
      expect(state.winnerId).toBe('p2');
    });
  });

  describe('지불 능력 확인', () => {
    it('현금이 충분하면 TURN_START로 전환되어야 한다', () => {
      store.dispatch(checkPaymentAbility({ playerId: 'p1', amount: 10000 }));

      expect(store.getState().game.turnPhase).toBe('TURN_START');
    });

    it('현금 부족 + 자산 없으면 GAME_OVER로 전환되어야 한다', () => {
      // 현금을 0으로
      store.dispatch(updatePlayerMoney({ playerId: 'p1', amount: -4000000 }));

      store.dispatch(checkPaymentAbility({ playerId: 'p1', amount: 1000000 }));

      expect(store.getState().game.turnPhase).toBe('GAME_OVER');
    });
  });
});
