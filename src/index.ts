// 부루마블 MVP 핵심 엔진 (CLI 테스트 모드)
// 엔트리 포인트

import { gameLoop } from './cli/gameLoop.js';

async function main(): Promise<void> {
  try {
    await gameLoop();
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
    process.exit(1);
  }
}

main();
