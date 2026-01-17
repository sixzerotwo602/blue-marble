/**
 * Turn Management Tests
 * @description Story 1.6 - 턴 관리 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  addPlayer,
  startGame,
  setDiceResult,
  endTurn,
} from '../../src/core/state/gameSlice.js';

describe('Turn Management - Story 1.6', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(addPlayer({ id: 'p3', name: 'Player 3' }));
    store.dispatch(startGame());
  });

  describe('AC1: 플레이어 행동 완료 후 다음 플레이어로 전환', () => {
    it('endTurn 시 현재 플레이어 인덱스가 다음 플레이어로 변경되어야 한다', () => {
      expect(store.getState().game.currentPlayerIndex).toBe(0);

      // 더블이 아닌 주사위 결과 설정
      store.dispatch(setDiceResult({ dice1: 3, dice2: 5 }));
      store.dispatch(endTurn());

      expect(store.getState().game.currentPlayerIndex).toBe(1);
    });

    it('마지막 플레이어 턴 종료 후 첫 번째 플레이어로 돌아가야 한다', () => {
      // p1 -> p2
      store.dispatch(setDiceResult({ dice1: 1, dice2: 2 }));
      store.dispatch(endTurn());
      expect(store.getState().game.currentPlayerIndex).toBe(1);

      // p2 -> p3
      store.dispatch(setDiceResult({ dice1: 1, dice2: 2 }));
      store.dispatch(endTurn());
      expect(store.getState().game.currentPlayerIndex).toBe(2);

      // p3 -> p1 (순환)
      store.dispatch(setDiceResult({ dice1: 1, dice2: 2 }));
      store.dispatch(endTurn());
      expect(store.getState().game.currentPlayerIndex).toBe(0);
    });

    it('턴 종료 시 turnNumber가 증가해야 한다', () => {
      expect(store.getState().game.turnNumber).toBe(1);

      store.dispatch(setDiceResult({ dice1: 1, dice2: 2 }));
      store.dispatch(endTurn());

      expect(store.getState().game.turnNumber).toBe(2);
    });
  });

  describe('AC2: 더블 시 추가 턴', () => {
    it('더블을 굴린 경우 같은 플레이어가 추가 턴을 가져야 한다', () => {
      expect(store.getState().game.currentPlayerIndex).toBe(0);

      // 더블: dice1 === dice2
      store.dispatch(setDiceResult({ dice1: 4, dice2: 4 }));
      store.dispatch(endTurn());

      // 여전히 플레이어 0
      expect(store.getState().game.currentPlayerIndex).toBe(0);
    });

    it('더블 시 turnNumber가 증가하지 않아야 한다', () => {
      expect(store.getState().game.turnNumber).toBe(1);

      store.dispatch(setDiceResult({ dice1: 6, dice2: 6 }));
      store.dispatch(endTurn());

      expect(store.getState().game.turnNumber).toBe(1); // 변화 없음
    });

    it('더블이 아닌 경우 다음 플레이어로 넘어가야 한다', () => {
      store.dispatch(setDiceResult({ dice1: 1, dice2: 6 }));
      store.dispatch(endTurn());

      expect(store.getState().game.currentPlayerIndex).toBe(1);
    });
  });

  describe('턴 종료 후 상태 초기화', () => {
    it('턴 종료 후 lastDiceResult가 null로 초기화되어야 한다', () => {
      store.dispatch(setDiceResult({ dice1: 3, dice2: 4 }));
      expect(store.getState().game.lastDiceResult).not.toBeNull();

      store.dispatch(endTurn());

      expect(store.getState().game.lastDiceResult).toBeNull();
    });

    it('턴 종료 후 turnPhase가 TURN_START로 변경되어야 한다', () => {
      store.dispatch(setDiceResult({ dice1: 3, dice2: 4 }));
      store.dispatch(endTurn());

      expect(store.getState().game.turnPhase).toBe('TURN_START');
    });
  });

  describe('게임 종료 조건', () => {
    // Note: isBankrupt 상태는 Redux 리듀서를 통해서만 변경 가능
    // 실제 파산 로직은 Story에서 별도 구현 필요
    it('endTurn은 TURN_START 상태로 복귀해야 한다', () => {
      store.dispatch(setDiceResult({ dice1: 2, dice2: 3 }));
      store.dispatch(endTurn());
      expect(store.getState().game.turnPhase).toBe('TURN_START');
    });
  });
});
