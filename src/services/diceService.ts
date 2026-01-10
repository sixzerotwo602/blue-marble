// 주사위 서비스

import { DiceResult } from '../types/index.js';

// ============================================================
// T020: 주사위 굴리기
// ============================================================

/** 1~6 사이의 랜덤 정수 */
function rollSingleDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** 주사위 2개 굴리기 */
export function rollDice(): DiceResult {
  const die1 = rollSingleDie();
  const die2 = rollSingleDie();
  
  return {
    die1,
    die2,
    total: die1 + die2,
    isDouble: die1 === die2,
  };
}
