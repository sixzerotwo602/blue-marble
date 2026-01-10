// 게임 시뮬레이션 테스트 - 100게임 자동 플레이
import { describe, it, expect } from 'vitest';
import { Game, GameStatus, TileType } from '../types/index.js';
import { 
  initializeGame, 
  getCurrentPlayer, 
  movePlayer, 
  handlePassStart,
  endTurn,
  checkGameEnd,
  getPlayerById,
} from './gameService.js';
import { rollDice } from './diceService.js';
import { canAffordPurchase, isPurchasableTile, purchaseProperty } from './propertyService.js';
import { canBuildVilla, canBuildBuilding, canBuildHotel, buildVilla, buildBuilding, buildHotel } from './buildingService.js';
import { calculateToll, checkMonopoly, payToll } from './tollCalculator.js';
import { canAfford, getSellableItems, sellBuilding, sellLand, declareBankruptcy } from './bankruptcyService.js';
import { getTileDataByIndex } from '../data/boardData.js';

// ============================================================
// 시뮬레이션 통계
// ============================================================

interface GameStats {
  gameId: number;
  winner: string;
  totalTurns: number;
  bankruptcies: number;
  propertiesPurchased: number;
  buildingsBuilt: number;
  tollsPaid: number;
  totalTollAmount: number;
  duration: number; // ms
}

interface SimulationReport {
  totalGames: number;
  completedGames: number;
  errorGames: number;
  avgTurns: number;
  minTurns: number;
  maxTurns: number;
  avgDuration: number;
  winnerDistribution: Record<string, number>;
  avgPropertiesPerGame: number;
  avgBuildingsPerGame: number;
  avgTollAmount: number;
  errors: string[];
}

// ============================================================
// AI 자동 결정 로직
// ============================================================

/** AI가 땅을 구매할지 결정 (잔고의 30% 이상 남으면 구매) */
function aiDecidePurchase(player: any, tileIndex: number): boolean {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.price) return false;
  
  const remainingAfterPurchase = player.money - tileData.price;
  return remainingAfterPurchase >= player.money * 0.3;
}

/** AI가 건물을 건설할지 결정 */
function aiDecideBuild(player: any, tileState: any, tileIndex: number): 'villa' | 'building' | 'hotel' | 'none' {
  if (!player.isSecondHalf) return 'none';
  
  // 잔고의 20% 이상이면 건설
  const minReserve = player.money * 0.2;
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.buildingPrices) return 'none';

  if (canBuildHotel(player, tileState, tileIndex) && player.money - tileData.buildingPrices.hotel >= minReserve) {
    return 'hotel';
  }
  if (canBuildBuilding(player, tileState, tileIndex) && player.money - tileData.buildingPrices.building >= minReserve) {
    return 'building';
  }
  if (canBuildVilla(player, tileState, tileIndex) && player.money - tileData.buildingPrices.villa >= minReserve) {
    return 'villa';
  }
  return 'none';
}

/** AI가 파산 시 매각할 자산 선택 (가장 싼 것부터) */
function aiDecideSell(sellableItems: any[]): any | null {
  if (sellableItems.length === 0) return null;
  
  // 가치가 가장 낮은 것부터 매각
  return sellableItems.reduce((min, item) => 
    item.value < min.value ? item : min
  );
}

// ============================================================
// 단일 게임 시뮬레이션
// ============================================================

function simulateGame(gameId: number, playerNames: string[]): GameStats {
  const startTime = Date.now();
  let propertiesPurchased = 0;
  let buildingsBuilt = 0;
  let tollsPaid = 0;
  let totalTollAmount = 0;
  let bankruptcies = 0;

  const game = initializeGame(playerNames);
  const MAX_TURNS = 1000; // 무한루프 방지
  let consecutiveDoubles = 0; // 연속 더블 카운트

  while (game.status === GameStatus.PLAYING && game.turnCount < MAX_TURNS) {
    const player = getCurrentPlayer(game);

    // 파산자 스킵
    if (player.isBankrupt) {
      game.lastDiceResult = undefined; // 더블 초기화
      endTurn(game);
      checkGameEnd(game);
      continue;
    }

    // 주사위 굴리기
    const diceResult = rollDice();
    game.lastDiceResult = diceResult;

    // 더블 카운트 (3회 연속 시 턴 종료)
    if (diceResult.isDouble) {
      consecutiveDoubles++;
      if (consecutiveDoubles >= 3) {
        // 3연속 더블 시 턴 강제 종료
        game.lastDiceResult = { ...diceResult, isDouble: false };
        consecutiveDoubles = 0;
      }
    } else {
      consecutiveDoubles = 0;
    }

    // 이동
    const moveResult = movePlayer(game, player.id, diceResult.total);

    // 출발점 통과 처리
    if (moveResult.passedStart) {
      handlePassStart(game, player.id);
    }

    // 도착 칸 처리
    const tileIndex = player.position;
    const tileData = getTileDataByIndex(tileIndex);
    const tileState = game.board[tileIndex];

    if (tileData && (tileData.type === TileType.PROPERTY || tileData.type === TileType.VEHICLE)) {
      if (!tileState.ownerId) {
        // 빈 땅 - AI 구매 결정
        if (isPurchasableTile(tileIndex) && canAffordPurchase(player, tileIndex)) {
          if (aiDecidePurchase(player, tileIndex)) {
            purchaseProperty(game, player.id, tileIndex);
            propertiesPurchased++;

            // 건설 결정
            if (tileData.canBuild) {
              const buildDecision = aiDecideBuild(player, tileState, tileIndex);
              if (buildDecision === 'villa') {
                buildVilla(game, player, tileIndex);
                buildingsBuilt++;
              } else if (buildDecision === 'building') {
                buildBuilding(game, player, tileIndex);
                buildingsBuilt++;
              } else if (buildDecision === 'hotel') {
                buildHotel(game, player, tileIndex);
                buildingsBuilt++;
              }
            }
          }
        }
      } else if (tileState.ownerId === player.id) {
        // 본인 땅 - 건설 결정
        if (tileData.canBuild) {
          const buildDecision = aiDecideBuild(player, tileState, tileIndex);
          if (buildDecision === 'villa') {
            buildVilla(game, player, tileIndex);
            buildingsBuilt++;
          } else if (buildDecision === 'building') {
            buildBuilding(game, player, tileIndex);
            buildingsBuilt++;
          } else if (buildDecision === 'hotel') {
            buildHotel(game, player, tileIndex);
            buildingsBuilt++;
          }
        }
      } else {
        // 타인 땅 - 통행료 지불
        const owner = getPlayerById(game, tileState.ownerId);
        if (owner && !owner.isBankrupt) {
          const isMonopoly = checkMonopoly(game, tileState.ownerId, tileIndex);
          const tollResult = calculateToll(tileIndex, tileState, isMonopoly);

          if (tollResult.total > 0) {
            tollsPaid++;
            totalTollAmount += tollResult.total;

            // 잔고 체크
            if (!canAfford(player, tollResult.total)) {
              // 파산 처리 루프 (최대 50회 시도)
              let sellAttempts = 0;
              while (player.money < tollResult.total && !player.isBankrupt && sellAttempts < 50) {
                sellAttempts++;
                const sellableItems = getSellableItems(game, player.id);
                if (sellableItems.length === 0) {
                  declareBankruptcy(game, player.id);
                  bankruptcies++;
                  break;
                }

                const itemToSell = aiDecideSell(sellableItems);
                if (itemToSell) {
                  if (itemToSell.type === 'building') {
                    sellBuilding(game, player, itemToSell);
                  } else {
                    sellLand(game, player, itemToSell);
                  }
                } else {
                  declareBankruptcy(game, player.id);
                  bankruptcies++;
                  break;
                }
              }
              
              // 50회 시도 후에도 부족하면 파산
              if (player.money < tollResult.total && !player.isBankrupt) {
                declareBankruptcy(game, player.id);
                bankruptcies++;
              }
            }

            // 아직 파산하지 않았으면 지불
            if (!player.isBankrupt && player.money >= tollResult.total) {
              payToll(game, player.id, tileState.ownerId, tollResult.total);
            }
          }
        }
      }
    }

    // 게임 종료 체크
    const endResult = checkGameEnd(game);
    if (endResult.isEnded) {
      break;
    }

    // 턴 종료
    endTurn(game);
  }

  const winner = game.players.find(p => !p.isBankrupt);
  const duration = Date.now() - startTime;

  return {
    gameId,
    winner: winner?.name ?? 'N/A',
    totalTurns: game.turnCount,
    bankruptcies,
    propertiesPurchased,
    buildingsBuilt,
    tollsPaid,
    totalTollAmount,
    duration,
  };
}

// ============================================================
// 시뮬레이션 실행
// ============================================================

function runSimulation(numGames: number, playerNames: string[]): SimulationReport {
  const allStats: GameStats[] = [];
  const errors: string[] = [];
  let errorGames = 0;

  for (let i = 0; i < numGames; i++) {
    try {
      const stats = simulateGame(i + 1, playerNames);
      allStats.push(stats);
    } catch (error) {
      errorGames++;
      errors.push(`Game ${i + 1}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const completedGames = allStats.length;
  const winnerDistribution: Record<string, number> = {};

  allStats.forEach(s => {
    winnerDistribution[s.winner] = (winnerDistribution[s.winner] || 0) + 1;
  });

  const avgTurns = completedGames > 0 
    ? allStats.reduce((sum, s) => sum + s.totalTurns, 0) / completedGames 
    : 0;
  const minTurns = completedGames > 0 
    ? Math.min(...allStats.map(s => s.totalTurns)) 
    : 0;
  const maxTurns = completedGames > 0 
    ? Math.max(...allStats.map(s => s.totalTurns)) 
    : 0;
  const avgDuration = completedGames > 0 
    ? allStats.reduce((sum, s) => sum + s.duration, 0) / completedGames 
    : 0;
  const avgPropertiesPerGame = completedGames > 0 
    ? allStats.reduce((sum, s) => sum + s.propertiesPurchased, 0) / completedGames 
    : 0;
  const avgBuildingsPerGame = completedGames > 0 
    ? allStats.reduce((sum, s) => sum + s.buildingsBuilt, 0) / completedGames 
    : 0;
  const avgTollAmount = completedGames > 0 
    ? allStats.reduce((sum, s) => sum + s.totalTollAmount, 0) / completedGames 
    : 0;

  return {
    totalGames: numGames,
    completedGames,
    errorGames,
    avgTurns,
    minTurns,
    maxTurns,
    avgDuration,
    winnerDistribution,
    avgPropertiesPerGame,
    avgBuildingsPerGame,
    avgTollAmount,
    errors,
  };
}

// ============================================================
// Vitest 테스트
// ============================================================

describe('게임 시뮬레이션', () => {
  it('2인 게임 100회 시뮬레이션', () => {
    const report = runSimulation(100, ['AI_1', 'AI_2']);
    
    console.log('\n========================================');
    console.log('📊 2인 게임 100회 시뮬레이션 결과');
    console.log('========================================');
    console.log(`완료된 게임: ${report.completedGames}/${report.totalGames}`);
    console.log(`에러 게임: ${report.errorGames}`);
    console.log(`평균 턴 수: ${report.avgTurns.toFixed(1)}`);
    console.log(`최소/최대 턴: ${report.minTurns} / ${report.maxTurns}`);
    console.log(`평균 게임 시간: ${report.avgDuration.toFixed(1)}ms`);
    console.log(`평균 구매 땅: ${report.avgPropertiesPerGame.toFixed(1)}개`);
    console.log(`평균 건물 건설: ${report.avgBuildingsPerGame.toFixed(1)}개`);
    console.log(`평균 총 통행료: ₩${report.avgTollAmount.toLocaleString()}`);
    console.log('\n승자 분포:');
    Object.entries(report.winnerDistribution).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}승 (${(count / report.completedGames * 100).toFixed(1)}%)`);
    });

    if (report.errors.length > 0) {
      console.log('\n❌ 에러 목록:');
      report.errors.slice(0, 5).forEach(e => console.log(`  ${e}`));
      if (report.errors.length > 5) {
        console.log(`  ... 외 ${report.errors.length - 5}개`);
      }
    }
    console.log('========================================\n');

    // 검증
    expect(report.completedGames).toBe(report.totalGames);
    expect(report.errorGames).toBe(0);
    expect(report.avgTurns).toBeGreaterThan(0);
  });

  it('4인 게임 50회 시뮬레이션', () => {
    const report = runSimulation(50, ['AI_1', 'AI_2', 'AI_3', 'AI_4']);
    
    console.log('\n========================================');
    console.log('📊 4인 게임 50회 시뮬레이션 결과');
    console.log('========================================');
    console.log(`완료된 게임: ${report.completedGames}/${report.totalGames}`);
    console.log(`에러 게임: ${report.errorGames}`);
    console.log(`평균 턴 수: ${report.avgTurns.toFixed(1)}`);
    console.log(`최소/최대 턴: ${report.minTurns} / ${report.maxTurns}`);
    console.log(`평균 게임 시간: ${report.avgDuration.toFixed(1)}ms`);
    console.log(`평균 구매 땅: ${report.avgPropertiesPerGame.toFixed(1)}개`);
    console.log(`평균 건물 건설: ${report.avgBuildingsPerGame.toFixed(1)}개`);
    console.log(`평균 총 통행료: ₩${report.avgTollAmount.toLocaleString()}`);
    console.log('\n승자 분포:');
    Object.entries(report.winnerDistribution).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}승 (${(count / report.completedGames * 100).toFixed(1)}%)`);
    });
    console.log('========================================\n');

    expect(report.completedGames).toBe(report.totalGames);
    expect(report.errorGames).toBe(0);
  });
});
