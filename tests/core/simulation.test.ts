/**
 * Simulation Runner Tests
 * @description Story 4.2 - Headless Simulation 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  runSimulation,
  runMultipleSimulations,
  aggregateResults,
} from '../../src/core/simulation/simulationRunner.js';

describe('Simulation Runner - Story 4.2', () => {
  describe('AC1: 기본 시뮬레이션', () => {
    it('시뮬레이션을 실행하고 결과를 반환해야 한다', () => {
      const result = runSimulation({
        maxTurns: 100,
        aiStrategy: 'PURCHASE_ALL',
        seed: 'TEST_SEED',
      });

      expect(result).toBeDefined();
      expect(result.totalTurns).toBeLessThanOrEqual(100);
      expect(result.playerStats).toHaveLength(2);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('Random 전략으로 시뮬레이션을 실행할 수 있어야 한다', () => {
      const result = runSimulation({
        maxTurns: 50,
        aiStrategy: 'RANDOM',
        seed: 'RANDOM_TEST',
      });

      expect(result).toBeDefined();
      expect(result.endReason).toBeDefined();
    });
  });

  describe('AC2: 성능 체크', () => {
    it('100턴 시뮬레이션이 1초 이내에 완료되어야 한다', () => {
      const result = runSimulation({
        maxTurns: 100,
        aiStrategy: 'PURCHASE_ALL',
        seed: 'PERF_TEST',
      });

      expect(result.durationMs).toBeLessThan(1000);
    });
  });

  describe('AC3: 다중 시뮬레이션', () => {
    it('여러 게임을 실행하고 통계를 집계할 수 있어야 한다', () => {
      const results = runMultipleSimulations(5, {
        maxTurns: 50,
        aiStrategy: 'PURCHASE_ALL',
      });

      expect(results).toHaveLength(5);

      const stats = aggregateResults(results);
      expect(stats.totalGames).toBe(5);
      expect(stats.ai1Wins + stats.ai2Wins + stats.draws).toBe(5);
    });
  });

  describe('AC4: 최종 통계 로깅', () => {
    it('플레이어 통계를 정확히 반환해야 한다', () => {
      const result = runSimulation({
        maxTurns: 50,
        aiStrategy: 'PURCHASE_ALL',
        seed: 'STATS_TEST',
      });

      expect(result.playerStats[0].id).toBe('ai1');
      expect(result.playerStats[1].id).toBe('ai2');
      expect(result.playerStats[0].money).toBeDefined();
      expect(result.playerStats[0].ownedTiles).toBeDefined();
    });
  });
});
