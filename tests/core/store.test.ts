/**
 * Redux Store Tests
 * @description Story 1.1 - 초기 상태 및 기본 액션 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  setTurnPhase,
  setDiceResult,
  endTurn,
} from '../../src/core/state/gameSlice.js';

describe('Redux Store - Story 1.1', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('AC1: 초기 상태 확인', () => {
    it('스토어가 생성되면 초기 게임 상태를 가져야 한다', () => {
      const state = store.getState().game;

      expect(state.players).toEqual([]);
      expect(state.tiles).toEqual([]);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.phase).toBe('EARLY');
      expect(state.turnPhase).toBe('TURN_START');
      expect(state.turnNumber).toBe(1);
      expect(state.isGameStarted).toBe(false);
    });
  });

  describe('AC2: GameState 인터페이스', () => {
    it('GameState는 players, tiles, currentPlayerIndex, phase를 포함해야 한다', () => {
      const state = store.getState().game;

      expect(state).toHaveProperty('players');
      expect(state).toHaveProperty('tiles');
      expect(state).toHaveProperty('currentPlayerIndex');
      expect(state).toHaveProperty('phase');
      expect(state).toHaveProperty('turnPhase');
      expect(state).toHaveProperty('turnNumber');
    });
  });

  describe('AC3: Redux Store 동작', () => {
    it('initializeGame 액션으로 게임을 초기화할 수 있어야 한다', () => {
      const mockTiles = [
        { id: 0, type: 'start', name: '시작', ownerId: null, buildings: { villa: 0, building: 0, hotel: 0 } },
      ];

      store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: mockTiles as any }));
      const state = store.getState().game;

      expect(state.seed).toBe('TEST_SEED');
      expect(state.tiles).toHaveLength(1);
      expect(state.tiles[0].name).toBe('시작');
    });

    it('addPlayer 액션으로 플레이어를 추가할 수 있어야 한다', () => {
      store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
      store.dispatch(addPlayer({ id: 'p2', name: 'Player 2', isAI: true }));

      const state = store.getState().game;

      expect(state.players).toHaveLength(2);
      expect(state.players[0].name).toBe('Player 1');
      expect(state.players[0].money).toBe(4000000);
      expect(state.players[0].position).toBe(0);
      expect(state.players[1].isAI).toBe(true);
    });

    it('startGame 액션으로 게임을 시작할 수 있어야 한다', () => {
      store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
      store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
      store.dispatch(startGame());

      const state = store.getState().game;

      expect(state.isGameStarted).toBe(true);
      expect(state.turnPhase).toBe('TURN_START');
    });

    it('2명 미만이면 게임이 시작되지 않아야 한다', () => {
      store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
      store.dispatch(startGame());

      const state = store.getState().game;

      expect(state.isGameStarted).toBe(false);
    });
  });

  describe('FSM States (AR8)', () => {
    it('setTurnPhase 액션으로 턴 상태를 변경할 수 있어야 한다', () => {
      store.dispatch(setTurnPhase('MOVING'));
      expect(store.getState().game.turnPhase).toBe('MOVING');

      store.dispatch(setTurnPhase('PURCHASE_DECISION'));
      expect(store.getState().game.turnPhase).toBe('PURCHASE_DECISION');
    });

    it('setDiceResult 액션으로 주사위 결과를 저장할 수 있어야 한다', () => {
      store.dispatch(setDiceResult({ dice1: 3, dice2: 4 }));
      const state = store.getState().game;

      expect(state.lastDiceResult?.dice1).toBe(3);
      expect(state.lastDiceResult?.dice2).toBe(4);
      expect(state.lastDiceResult?.isDouble).toBe(false);
    });

    it('더블이면 isDouble이 true여야 한다', () => {
      store.dispatch(setDiceResult({ dice1: 5, dice2: 5 }));
      const state = store.getState().game;

      expect(state.lastDiceResult?.isDouble).toBe(true);
    });
  });

  describe('Turn Management', () => {
    beforeEach(() => {
      store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
      store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
      store.dispatch(startGame());
    });

    it('endTurn 액션으로 다음 플레이어에게 턴이 넘어가야 한다', () => {
      expect(store.getState().game.currentPlayerIndex).toBe(0);

      store.dispatch(endTurn());

      expect(store.getState().game.currentPlayerIndex).toBe(1);
      expect(store.getState().game.turnPhase).toBe('TURN_START');
    });

    it('더블이면 같은 플레이어가 추가 턴을 가져야 한다', () => {
      store.dispatch(setDiceResult({ dice1: 3, dice2: 3 }));
      store.dispatch(endTurn());

      expect(store.getState().game.currentPlayerIndex).toBe(0);
    });
  });
});
