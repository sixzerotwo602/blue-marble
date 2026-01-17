/**
 * Input Controller Tests
 * @description Story 5.2 - Inquirer Controller 테스트
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
  getTurnStartOptions,
  getLandedOptions,
  getMenuOptions,
  mapOptionToAction,
  renderMenu,
} from '../../src/core/tui/inputController.js';

describe('Input Controller - Story 5.2', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: 메뉴 옵션 생성', () => {
    it('getTurnStartOptions가 주사위 굴리기 옵션을 반환해야 한다', () => {
      const player = store.getState().game.players[0];
      const options = getTurnStartOptions(player);

      expect(options.length).toBeGreaterThan(0);
      expect(options.some(o => o.value === 'ROLL_DICE')).toBe(true);
    });

    it('getMenuOptions가 현재 턴 페이즈에 맞는 옵션을 반환해야 한다', () => {
      const state = store.getState().game;
      const options = getMenuOptions(state);

      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('AC2: 옵션을 액션으로 변환', () => {
    it('BUY_LAND 옵션이 buyLand 액션으로 변환되어야 한다', () => {
      const action = mapOptionToAction('BUY_LAND', 'p1', 1);

      expect(action).not.toBeNull();
      expect(action!.type).toBe('game/buyLand');
      expect(action!.payload).toEqual({ playerId: 'p1', tileId: 1 });
    });

    it('END_TURN 옵션이 endTurn 액션으로 변환되어야 한다', () => {
      const action = mapOptionToAction('END_TURN', 'p1', 0);

      expect(action).not.toBeNull();
      expect(action!.type).toBe('game/endTurn');
    });

    it('SKIP_BUY 옵션이 null을 반환해야 한다', () => {
      const action = mapOptionToAction('SKIP_BUY', 'p1', 1);

      expect(action).toBeNull();
    });
  });

  describe('AC3: 메뉴 렌더링', () => {
    it('renderMenu가 메뉴 텍스트를 생성해야 한다', () => {
      const options = [
        { label: '🎲 주사위 굴리기', value: 'ROLL_DICE' },
        { label: '✅ 턴 종료', value: 'END_TURN' },
      ];
      const lines = renderMenu(options);

      expect(lines.length).toBe(2);
      expect(lines[0]).toContain('주사위 굴리기');
    });

    it('disabled 옵션에 자금 부족 표시가 있어야 한다', () => {
      const options = [
        { label: '🏠 구매', value: 'BUY_LAND', disabled: true },
      ];
      const lines = renderMenu(options);

      expect(lines[0]).toContain('자금 부족');
    });
  });
});
