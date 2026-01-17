#!/usr/bin/env node
/**
 * AI 시뮬레이션 CLI
 * 사용법: npx tsx scripts/simulate.ts [게임수] [전략]
 * 예시: npx tsx scripts/simulate.ts 10 RANDOM
 */
import { runMultipleSimulations, aggregateResults } from '../src/core/simulation/simulationRunner.js';

const args = process.argv.slice(2);
const gameCount = parseInt(args[0]) || 10;
const strategy = (args[1]?.toUpperCase() as 'RANDOM' | 'PURCHASE_ALL') || 'RANDOM';

console.log(`\n🎲 부루마블 AI 시뮬레이션`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`게임 수: ${gameCount}`);
console.log(`전략: ${strategy}`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

const startTime = performance.now();
const results = runMultipleSimulations(gameCount, { maxTurns: 200, aiStrategy: strategy });
const endTime = performance.now();

const stats = aggregateResults(results);

console.log(`📊 결과`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`AI 1 승리: ${stats.ai1Wins}회 (${(stats.ai1Wins / stats.totalGames * 100).toFixed(1)}%)`);
console.log(`AI 2 승리: ${stats.ai2Wins}회 (${(stats.ai2Wins / stats.totalGames * 100).toFixed(1)}%)`);
console.log(`무승부: ${stats.draws}회`);
console.log(`평균 턴: ${stats.averageTurns}턴`);
console.log(`총 소요 시간: ${((endTime - startTime) / 1000).toFixed(2)}초`);
console.log(`게임당 평균: ${stats.averageDurationMs}ms`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
