/**
 * Complex Golden Keys Tests
 * @description Story 3.3 - 복잡한 황금열쇠 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  sendToIsland,
  giveCard,
  useCard,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';

describe('Complex Golden Keys - Story 3.3', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(startGame());
  });

  describe('AC1: 카드 보관', () => {
    it('giveCard로 무인도 탈출권을 지급받을 수 있어야 한다', () => {
      store.dispatch(giveCard({ playerId: 'p1', cardType: 'ISLAND_ESCAPE' }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.heldCards).toContain('ISLAND_ESCAPE');
    });

    it('여러 장의 카드를 보관할 수 있어야 한다', () => {
      store.dispatch(giveCard({ playerId: 'p1', cardType: 'ISLAND_ESCAPE' }));
      store.dispatch(giveCard({ playerId: 'p1', cardType: 'TOLL_DISCOUNT' }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.heldCards.length).toBe(2);
    });
  });

  describe('AC2: 카드 사용', () => {
    it('무인도에서 탈출권을 사용하면 즉시 탈출해야 한다', () => {
      store.dispatch(giveCard({ playerId: 'p1', cardType: 'ISLAND_ESCAPE' }));
      store.dispatch(sendToIsland({ playerId: 'p1' }));
      
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(playerBefore.jailTurnsRemaining).toBe(3);

      store.dispatch(useCard({ playerId: 'p1', cardType: 'ISLAND_ESCAPE' }));

      const playerAfter = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(playerAfter.jailTurnsRemaining).toBe(0);
      expect(playerAfter.heldCards).not.toContain('ISLAND_ESCAPE');
    });

    it('보유하지 않은 카드를 사용할 수 없어야 한다', () => {
      store.dispatch(sendToIsland({ playerId: 'p1' }));
      
      // 카드 없이 사용 시도
      store.dispatch(useCard({ playerId: 'p1', cardType: 'ISLAND_ESCAPE' }));

      const player = store.getState().game.players.find(p => p.id === 'p1')!;
      expect(player.jailTurnsRemaining).toBe(3); // 변화 없음
    });
  });
});
