/**
 * Seeded Random Number Generator (Mulberry32)
 * @description 시드 기반 결정론적 난수 생성기
 */

/**
 * 시드로부터 32비트 해시 생성
 */
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4); h2 ^= h1; h3 ^= h1; h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/**
 * Mulberry32 PRNG
 */
function mulberry32(a: number): () => number {
  return function(): number {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * 주사위 결과 인터페이스
 */
export interface DiceResult {
  /** 첫 번째 주사위 (1-6) */
  dice1: number;
  /** 두 번째 주사위 (1-6) */
  dice2: number;
  /** 주사위 합계 (2-12) */
  sum: number;
  /** 더블 여부 */
  isDouble: boolean;
}

/**
 * 시드 기반 주사위 굴리기 클래스
 */
export class DiceRoller {
  private rng: () => number;
  private rollCount: number = 0;

  constructor(seed: string) {
    const seedArray = cyrb128(seed);
    this.rng = mulberry32(seedArray[0]);
  }

  /**
   * 주사위 두 개 굴리기
   * @returns DiceResult 객체
   */
  roll(): DiceResult {
    this.rollCount++;
    const dice1 = Math.floor(this.rng() * 6) + 1;
    const dice2 = Math.floor(this.rng() * 6) + 1;

    return {
      dice1,
      dice2,
      sum: dice1 + dice2,
      isDouble: dice1 === dice2,
    };
  }

  /**
   * 현재까지 굴린 횟수 반환
   */
  getRollCount(): number {
    return this.rollCount;
  }

  /**
   * 새 시드로 리셋
   */
  reset(seed: string): void {
    const seedArray = cyrb128(seed);
    this.rng = mulberry32(seedArray[0]);
    this.rollCount = 0;
  }
}

/**
 * 단일 주사위 굴리기 함수 (시드 기반)
 * @param seed 시드 문자열
 * @param rollIndex 몇 번째 굴림인지 (0부터 시작)
 * @returns DiceResult 객체
 */
export function rollDiceWithSeed(seed: string, rollIndex: number = 0): DiceResult {
  const roller = new DiceRoller(seed);
  
  // rollIndex까지 주사위 굴리기
  let result: DiceResult | null = null;
  for (let i = 0; i <= rollIndex; i++) {
    result = roller.roll();
  }

  return result!;
}

/**
 * 랜덤 주사위 굴리기 (시드 없음)
 */
export function rollDiceRandom(): DiceResult {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;

  return {
    dice1,
    dice2,
    sum: dice1 + dice2,
    isDouble: dice1 === dice2,
  };
}
