/**
 * AI Agent Tests
 * @description Story 4.1 - AI Interface & Decision Maker 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from '../../src/core/state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
} from '../../src/core/state/gameSlice.js';
import { BOARD_DATA } from '../../src/core/data/boardData.js';
import {
  createAIAgent,
  createAIContext,
  createRandomAgent,
  createPurchaseAllAgent,
} from '../../src/core/ai/aiAgent.js';

describe('AI Agent - Story 4.1', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'ai1', name: 'AI Player 1' }));
    store.dispatch(addPlayer({ id: 'ai2', name: 'AI Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: AI 에이전트 생성', () => {
    it('Random 전략 에이전트를 생성할 수 있어야 한다', () => {
      const agent = createAIAgent('RANDOM');
      expect(agent.strategy).toBe('RANDOM');
    });

    it('Purchase-All 전략 에이전트를 생성할 수 있어야 한다', () => {
      const agent = createAIAgent('PURCHASE_ALL');
      expect(agent.strategy).toBe('PURCHASE_ALL');
    });
  });

  describe('AC2: AI 컨텍스트 생성', () => {
    it('유효한 AI 컨텍스트를 생성할 수 있어야 한다', () => {
      const state = store.getState().game;
      const context = createAIContext(state, 'ai1');

      expect(context).not.toBeNull();
      expect(context!.player.id).toBe('ai1');
      expect(context!.currentTile).toBeDefined();
    });

    it('존재하지 않는 플레이어에 대해 null을 반환해야 한다', () => {
      const state = store.getState().game;
      const context = createAIContext(state, 'unknown');

      expect(context).toBeNull();
    });
  });

  describe('AC3: AI 의사결정', () => {
    it('Random 에이전트가 유효한 액션을 반환해야 한다', () => {
      const agent = createRandomAgent();
      const state = store.getState().game;
      const context = createAIContext(state, 'ai1');

      expect(context).not.toBeNull();
      const action = agent.decide(context!);

      expect(action).toBeDefined();
      expect(action.type).toBeDefined();
    });

    it('Purchase-All 에이전트가 유효한 액션을 반환해야 한다', () => {
      const agent = createPurchaseAllAgent();
      const state = store.getState().game;
      const context = createAIContext(state, 'ai1');

      expect(context).not.toBeNull();
      const action = agent.decide(context!);

      expect(action).toBeDefined();
      expect(action.type).toBeDefined();
    });

    it('TURN_START 상태에서 ROLL_DICE를 반환해야 한다', () => {
      const agent = createPurchaseAllAgent();
      const state = store.getState().game;
      const context = createAIContext(state, 'ai1');

      expect(context).not.toBeNull();
      const action = agent.decide(context!);

      expect(action.type).toBe('ROLL_DICE');
    });
  });
});
