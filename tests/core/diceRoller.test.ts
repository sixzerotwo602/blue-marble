/**
 * Dice Roller Tests
 * @description Story 1.3 - 결정론적 주사위 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  DiceRoller,
  rollDiceWithSeed,
  rollDiceRandom,
  DiceResult,
} from '../../src/core/logic/diceRoller.js';

describe('Dice Roller - Story 1.3', () => {
  describe('AC1: 동일한 시드로 동일한 결과 생성', () => {
    it('같은 시드로 생성한 DiceRoller는 같은 시퀀스를 반환해야 한다', () => {
      const roller1 = new DiceRoller('TEST_SEED_1');
      const roller2 = new DiceRoller('TEST_SEED_1');

      const results1: DiceResult[] = [];
      const results2: DiceResult[] = [];

      for (let i = 0; i < 10; i++) {
        results1.push(roller1.roll());
        results2.push(roller2.roll());
      }

      expect(results1).toEqual(results2);
    });

    it('다른 시드는 다른 결과를 생성해야 한다', () => {
      const roller1 = new DiceRoller('SEED_A');
      const roller2 = new DiceRoller('SEED_B');

      const result1 = roller1.roll();
      const result2 = roller2.roll();

      // 매우 낮은 확률로 같을 수 있으므로 여러 번 비교
      let hasDifference = false;
      for (let i = 0; i < 100; i++) {
        const r1 = roller1.roll();
        const r2 = roller2.roll();
        if (r1.dice1 !== r2.dice1 || r1.dice2 !== r2.dice2) {
          hasDifference = true;
          break;
        }
      }

      expect(hasDifference).toBe(true);
    });

    it('rollDiceWithSeed 함수는 특정 rollIndex의 결과를 반환해야 한다', () => {
      const roller = new DiceRoller('TEST_SEED_1');
      const results: DiceResult[] = [];
      for (let i = 0; i < 5; i++) {
        results.push(roller.roll());
      }

      // 각 인덱스에서 동일한 결과가 나오는지 확인
      for (let i = 0; i < 5; i++) {
        const result = rollDiceWithSeed('TEST_SEED_1', i);
        expect(result).toEqual(results[i]);
      }
    });
  });

  describe('AC2: 더블 플래그 검증', () => {
    it('두 주사위가 같으면 isDouble이 true여야 한다', () => {
      // 시드를 찾아서 더블이 나오는 경우 테스트
      const roller = new DiceRoller('DOUBLE_TEST_SEED');
      let foundDouble = false;

      for (let i = 0; i < 1000; i++) {
        const result = roller.roll();
        if (result.dice1 === result.dice2) {
          expect(result.isDouble).toBe(true);
          foundDouble = true;
          break;
        }
      }

      expect(foundDouble).toBe(true); // 최소한 한 번은 더블이 나와야 함
    });

    it('두 주사위가 다르면 isDouble이 false여야 한다', () => {
      const roller = new DiceRoller('NON_DOUBLE_SEED');
      let foundNonDouble = false;

      for (let i = 0; i < 1000; i++) {
        const result = roller.roll();
        if (result.dice1 !== result.dice2) {
          expect(result.isDouble).toBe(false);
          foundNonDouble = true;
          break;
        }
      }

      expect(foundNonDouble).toBe(true);
    });
  });

  describe('주사위 값 범위 검증', () => {
    it('주사위 값은 1-6 범위여야 한다', () => {
      const roller = new DiceRoller('RANGE_TEST_SEED');

      for (let i = 0; i < 100; i++) {
        const result = roller.roll();
        expect(result.dice1).toBeGreaterThanOrEqual(1);
        expect(result.dice1).toBeLessThanOrEqual(6);
        expect(result.dice2).toBeGreaterThanOrEqual(1);
        expect(result.dice2).toBeLessThanOrEqual(6);
      }
    });

    it('sum은 dice1 + dice2와 같아야 한다', () => {
      const roller = new DiceRoller('SUM_TEST_SEED');

      for (let i = 0; i < 50; i++) {
        const result = roller.roll();
        expect(result.sum).toBe(result.dice1 + result.dice2);
      }
    });

    it('sum 범위는 2-12여야 한다', () => {
      const roller = new DiceRoller('SUM_RANGE_SEED');

      for (let i = 0; i < 100; i++) {
        const result = roller.roll();
        expect(result.sum).toBeGreaterThanOrEqual(2);
        expect(result.sum).toBeLessThanOrEqual(12);
      }
    });
  });

  describe('DiceRoller 메서드 검증', () => {
    it('getRollCount는 굴린 횟수를 반환해야 한다', () => {
      const roller = new DiceRoller('COUNT_SEED');
      expect(roller.getRollCount()).toBe(0);

      roller.roll();
      expect(roller.getRollCount()).toBe(1);

      for (let i = 0; i < 5; i++) {
        roller.roll();
      }
      expect(roller.getRollCount()).toBe(6);
    });

    it('reset은 새 시드로 초기화해야 한다', () => {
      const roller = new DiceRoller('ORIGINAL_SEED');
      const originalResult = roller.roll();

      roller.reset('ORIGINAL_SEED');
      const resetResult = roller.roll();

      expect(resetResult).toEqual(originalResult);
      expect(roller.getRollCount()).toBe(1);
    });
  });

  describe('랜덤 주사위 (시드 없음)', () => {
    it('rollDiceRandom은 유효한 DiceResult를 반환해야 한다', () => {
      const result = rollDiceRandom();

      expect(result.dice1).toBeGreaterThanOrEqual(1);
      expect(result.dice1).toBeLessThanOrEqual(6);
      expect(result.dice2).toBeGreaterThanOrEqual(1);
      expect(result.dice2).toBeLessThanOrEqual(6);
      expect(result.sum).toBe(result.dice1 + result.dice2);
      expect(result.isDouble).toBe(result.dice1 === result.dice2);
    });
  });
});
