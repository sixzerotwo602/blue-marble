/**
 * TUI Dashboard Tests
 * @description Story 5.1 - Dashboard View 테스트
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
  renderBoard,
  renderPlayerPanel,
  renderDashboard,
} from '../../src/core/tui/dashboard.js';

describe('Dashboard View - Story 5.1', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(initializeGame({ seed: 'TEST_SEED', tiles: [...BOARD_DATA] }));
    store.dispatch(addPlayer({ id: 'p1', name: 'Player 1' }));
    store.dispatch(addPlayer({ id: 'p2', name: 'Player 2' }));
    store.dispatch(startGame());
  });

  describe('AC1: 보드 렌더링', () => {
    it('renderBoard가 40칸 보드를 렌더링해야 한다', () => {
      const state = store.getState().game;
      const lines = renderBoard(state);

      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toContain('┌'); // 상단 코너
    });

    it('보드에 박스 드로잉 문자가 포함되어야 한다', () => {
      const state = store.getState().game;
      const lines = renderBoard(state);
      const board = lines.join('\n');

      expect(board).toContain('│'); // 세로선
      expect(board).toContain('┌'); // 상단 좌측 코너
    });
  });

  describe('AC2: 플레이어 패널', () => {
    it('renderPlayerPanel이 플레이어 정보를 표시해야 한다', () => {
      const state = store.getState().game;
      const lines = renderPlayerPanel(state);
      const panel = lines.join('\n');

      expect(panel).toContain('Player 1');
      expect(panel).toContain('Player 2');
    });

    it('현재 플레이어를 표시해야 한다', () => {
      const state = store.getState().game;
      const lines = renderPlayerPanel(state);
      const panel = lines.join('\n');

      expect(panel).toContain('▶'); // 현재 플레이어 마커
    });

    it('게임 페이즈와 턴 번호를 표시해야 한다', () => {
      const state = store.getState().game;
      const lines = renderPlayerPanel(state);
      const panel = lines.join('\n');

      expect(panel).toContain('Turn');
      expect(panel).toContain('Phase');
    });
  });

  describe('AC3: 전체 대시보드', () => {
    it('renderDashboard가 보드와 패널을 함께 렌더링해야 한다', () => {
      const state = store.getState().game;
      const dashboard = renderDashboard(state);

      expect(dashboard).toContain('┌'); // 보드
      expect(dashboard).toContain('╔'); // 패널
    });
  });
});
