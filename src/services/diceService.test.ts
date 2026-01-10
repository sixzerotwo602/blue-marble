// 주사위 서비스 테스트
import { describe, it, expect } from 'vitest';
import { rollDice } from './diceService.js';

describe('diceService', () => {
  describe('rollDice', () => {
    it('주사위 2개의 합은 2~12 사이여야 함', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDice();
        expect(result.total).toBeGreaterThanOrEqual(2);
        expect(result.total).toBeLessThanOrEqual(12);
      }
    });

    it('각 주사위는 1~6 사이여야 함', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDice();
        expect(result.die1).toBeGreaterThanOrEqual(1);
        expect(result.die1).toBeLessThanOrEqual(6);
        expect(result.die2).toBeGreaterThanOrEqual(1);
        expect(result.die2).toBeLessThanOrEqual(6);
      }
    });

    it('더블 여부가 올바르게 판정되어야 함', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDice();
        expect(result.isDouble).toBe(result.die1 === result.die2);
      }
    });

    it('total은 die1 + die2와 같아야 함', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDice();
        expect(result.total).toBe(result.die1 + result.die2);
      }
    });
  });
});
