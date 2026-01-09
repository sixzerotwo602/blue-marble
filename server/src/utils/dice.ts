export class Dice {
  static roll(): [number, number] {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    return [d1, d2];
  }

  static isDouble(result: [number, number]): boolean {
    return result[0] === result[1];
  }
}
