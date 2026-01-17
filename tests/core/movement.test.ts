/**
 * Movement Tests
 * @description Story 1.4 - 플레이어 이동 시스템 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  addPlayer,
  startGame,
  movePlayer,
} from '../../src/core/state/gameSlice.js';
import {
  calculateMove,
  calculateDistance,
  SALARY_AMOUNT,
} from '../../src/core/logic/movement.js';

describe('Movement System - Story 1.4', () => {
  describe('calculateMove 함수', () => {
    it('위치 0에서 5칸 이동하면 위치 5가 되어야 한다', () => {
      const result = calculateMove(0, 5);
      expect(result.newPosition).toBe(5);
      expect(result.passedStart).toBe(false);
      expect(result.salaryEarned).toBe(0);
    });

    it('위치 35에서 10칸 이동하면 위치 5가 되어야 한다 (modulo 40)', () => {
      const result = calculateMove(35, 10);
      expect(result.newPosition).toBe(5);
      expect(result.passedStart).toBe(true);
      expect(result.salaryEarned).toBe(SALARY_AMOUNT);
    });

    it('위치 38에서 5칸 이동하면 위치 3이 되어야 한다', () => {
      const result = calculateMove(38, 5);
      expect(result.newPosition).toBe(3);
      expect(result.passedStart).toBe(true);
    });

    it('출발지를 통과하면 월급이 지급되어야 한다', () => {
      const result = calculateMove(39, 2);
      expect(result.newPosition).toBe(1);
      expect(result.passedStart).toBe(true);
      expect(result.salaryEarned).toBe(200000);
    });
  });

  describe('calculateDistance 함수', () => {
    it('위치 5에서 10까지 거리는 5이어야 한다', () => {
      expect(calculateDistance(5, 10)).toBe(5);
    });

    it('위치 35에서 5까지 거리는 10이어야 한다 (순환)', () => {
      expect(calculateDistance(35, 5)).toBe(10);
    });
  });

  describe('movePlayer 리듀서', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
      store = createTestStore();
      store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
      store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
      store.dispatch(startGame());
    });

    it('플레이어가 위치 0에서 5칸 이동하면 위치 5가 되어야 한다', () => {
      store.dispatch(movePlayer({ playerId: 'p1', steps: 5 }));
      const player = store.getState().game.players.find(p => p.id === 'p1');
      expect(player?.position).toBe(5);
    });

    it('출발지를 통과하면 월급(200,000원)이 지급되어야 한다', () => {
      // 먼저 위치 35로 이동
      store.dispatch(movePlayer({ playerId: 'p1', steps: 35 }));
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1');
      const moneyBefore = playerBefore?.money ?? 0;

      // 10칸 이동하여 출발지 통과 (35 + 10 = 45 -> 5)
      store.dispatch(movePlayer({ playerId: 'p1', steps: 10 }));
      const playerAfter = store.getState().game.players.find(p => p.id === 'p1');

      expect(playerAfter?.position).toBe(5);
      expect(playerAfter?.money).toBe(moneyBefore + SALARY_AMOUNT);
    });

    it('출발지를 통과하지 않으면 월급이 지급되지 않아야 한다', () => {
      const playerBefore = store.getState().game.players.find(p => p.id === 'p1');
      const moneyBefore = playerBefore?.money ?? 0;

      store.dispatch(movePlayer({ playerId: 'p1', steps: 5 }));
      const playerAfter = store.getState().game.players.find(p => p.id === 'p1');

      expect(playerAfter?.money).toBe(moneyBefore);
    });

    it('위치가 39를 초과하면 0부터 순환해야 한다', () => {
      store.dispatch(movePlayer({ playerId: 'p1', steps: 42 }));
      const player = store.getState().game.players.find(p => p.id === 'p1');
      expect(player?.position).toBe(2);
    });

    it('이동 후 turnPhase가 MOVING으로 변경되어야 한다', () => {
      store.dispatch(movePlayer({ playerId: 'p1', steps: 5 }));
      expect(store.getState().game.turnPhase).toBe('MOVING');
    });
  });
});
