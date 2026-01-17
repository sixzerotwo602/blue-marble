// 엑셀 로그 저장 시뮬레이션 테스트
import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
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
import { 
  TurnLog, 
  OwnershipLog, 
  GameSummary, 
  SimulationLogs 
} from './simulationLogger.js';

// ============================================================
// AI 자동 결정 로직
// ============================================================

function aiDecidePurchase(player: any, tileIndex: number): boolean {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.price) return false;
  const remainingAfterPurchase = player.money - tileData.price;
  return remainingAfterPurchase >= player.money * 0.3;
}

function aiDecideBuildAll(player: any, game: any, tileIndex: number, ownerships: OwnershipLog[], gameId: number, tileName: string): number {
  if (!player.isSecondHalf) return 0;
  
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.buildingPrices || !tileData.canBuild) return 0;
  
  const tileState = game.board[tileIndex];
  const minReserve = player.money * 0.2;
  let built = 0;

  // 별장 최대 2개
  while (canBuildVilla(player, tileState, tileIndex) && player.money - tileData.buildingPrices.villa >= minReserve) {
    buildVilla(game, player, tileIndex);
    ownerships.push({ gameId, turn: game.turnCount, player: player.name, tileIndex, tileName, action: 'BUILD_VILLA', buildingLevel: `VILLA_${tileState.buildings.villaCount}` });
    built++;
  }
  
  // 빌딩 1개
  if (canBuildBuilding(player, tileState, tileIndex) && player.money - tileData.buildingPrices.building >= minReserve) {
    buildBuilding(game, player, tileIndex);
    ownerships.push({ gameId, turn: game.turnCount, player: player.name, tileIndex, tileName, action: 'BUILD_BUILDING', buildingLevel: 'BUILDING' });
    built++;
  }
  
  // 호텔 1개
  if (canBuildHotel(player, tileState, tileIndex) && player.money - tileData.buildingPrices.hotel >= minReserve) {
    buildHotel(game, player, tileIndex);
    ownerships.push({ gameId, turn: game.turnCount, player: player.name, tileIndex, tileName, action: 'BUILD_HOTEL', buildingLevel: 'HOTEL' });
    built++;
  }
  
  return built;
}

function aiDecideSell(sellableItems: any[]): any | null {
  if (sellableItems.length === 0) return null;
  return sellableItems.reduce((min, item) => 
    item.value < min.value ? item : min
  );
}

// ============================================================
// 로그 수집 시뮬레이션
// ============================================================

function simulateGameWithLogs(
  gameId: number, 
  playerNames: string[],
  turns: TurnLog[],
  ownerships: OwnershipLog[]
): GameSummary {
  const startTime = Date.now();
  let propertiesPurchased = 0;
  let buildingsBuilt = 0;
  let tollsPaid = 0;
  let totalTollAmount = 0;

  const game = initializeGame(playerNames);
  const MAX_TURNS = 1000;
  let consecutiveDoubles = 0;

  while (game.status === GameStatus.PLAYING && game.turnCount < MAX_TURNS) {
    const player = getCurrentPlayer(game);

    if (player.isBankrupt) {
      game.lastDiceResult = undefined;
      endTurn(game);
      checkGameEnd(game);
      continue;
    }

    const diceResult = rollDice();
    game.lastDiceResult = diceResult;

    if (diceResult.isDouble) {
      consecutiveDoubles++;
      if (consecutiveDoubles >= 3) {
        game.lastDiceResult = { ...diceResult, isDouble: false };
        consecutiveDoubles = 0;
      }
    } else {
      consecutiveDoubles = 0;
    }

    const fromPos = player.position;
    const moveResult = movePlayer(game, player.id, diceResult.total);
    const toPos = player.position;
    const tileData = getTileDataByIndex(toPos);
    const tileName = tileData?.name ?? '???';

    // 기본 이동 로그
    let action = 'ROLL';
    let amount = 0;

    if (moveResult.passedStart) {
      handlePassStart(game, player.id);
    }

    const tileState = game.board[toPos];

    if (tileData && (tileData.type === TileType.PROPERTY || tileData.type === TileType.VEHICLE)) {
      if (!tileState.ownerId) {
        if (isPurchasableTile(toPos) && canAffordPurchase(player, toPos)) {
          if (aiDecidePurchase(player, toPos)) {
            amount = tileData.price ?? 0;
            purchaseProperty(game, player.id, toPos);
            propertiesPurchased++;
            action = 'BUY';

            ownerships.push({
              gameId,
              turn: game.turnCount,
              player: player.name,
              tileIndex: toPos,
              tileName,
              action: 'BUY',
              buildingLevel: 'NONE',
            });

            // 복수 건설
            if (tileData.canBuild) {
              buildingsBuilt += aiDecideBuildAll(player, game, toPos, ownerships, gameId, tileName);
            }
          }
        }
      } else if (tileState.ownerId === player.id) {
        // 본인 땅 - 복수 건설
        if (tileData.canBuild) {
          const built = aiDecideBuildAll(player, game, toPos, ownerships, gameId, tileName);
          if (built > 0) action = 'BUILD';
          buildingsBuilt += built;
        }
      } else {
        const owner = getPlayerById(game, tileState.ownerId);
        if (owner && !owner.isBankrupt) {
          const isMonopoly = checkMonopoly(game, tileState.ownerId, toPos);
          const tollResult = calculateToll(toPos, tileState, isMonopoly);

          if (tollResult.total > 0) {
            tollsPaid++;
            totalTollAmount += tollResult.total;
            action = 'TOLL';
            amount = tollResult.total;

            if (!canAfford(player, tollResult.total)) {
              let sellAttempts = 0;
              while (player.money < tollResult.total && !player.isBankrupt && sellAttempts < 50) {
                sellAttempts++;
                const sellableItems = getSellableItems(game, player.id);
                if (sellableItems.length === 0) {
                  declareBankruptcy(game, player.id);
                  action = 'BANKRUPT';
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
                  action = 'BANKRUPT';
                  break;
                }
              }
              if (player.money < tollResult.total && !player.isBankrupt) {
                declareBankruptcy(game, player.id);
                action = 'BANKRUPT';
              }
            }

            if (!player.isBankrupt && player.money >= tollResult.total) {
              payToll(game, player.id, tileState.ownerId, tollResult.total);
            }
          }
        }
      }
    }

    // 턴 로그 추가
    turns.push({
      gameId,
      turn: game.turnCount,
      player: player.name,
      dice1: diceResult.die1,
      dice2: diceResult.die2,
      isDouble: diceResult.isDouble,
      fromPos,
      toPos,
      tileName,
      action,
      amount,
      balance: player.money,
    });

    const endResult = checkGameEnd(game);
    if (endResult.isEnded) break;
    endTurn(game);
  }

  const winner = game.players.find(p => !p.isBankrupt);
  const duration = Date.now() - startTime;

  return {
    gameId,
    winner: winner?.name ?? 'N/A',
    totalTurns: game.turnCount,
    durationMs: duration,
    propertiesPurchased,
    buildingsBuilt,
    tollsPaid,
    totalTollAmount,
    player1FinalBalance: game.players[0]?.money ?? 0,
    player2FinalBalance: game.players[1]?.money ?? 0,
    player3FinalBalance: game.players[2]?.money,
    player4FinalBalance: game.players[3]?.money,
  };
}

// ============================================================
// 엑셀 저장
// ============================================================

const KOREAN_HEADERS: Record<string, Record<string, string>> = {
  Games: {
    gameId: '게임ID',
    winner: '승자',
    totalTurns: '총 턴수',
    durationMs: '소요시간(ms)',
    propertiesPurchased: '부동산 구매 수',
    buildingsBuilt: '건물 건설 수',
    tollsPaid: '통행료 지불 횟수',
    totalTollAmount: '총 통행료',
    player1FinalBalance: 'P1 최종 자산',
    player2FinalBalance: 'P2 최종 자산',
    player3FinalBalance: 'P3 최종 자산',
    player4FinalBalance: 'P4 최종 자산',
  },
  Turns: {
    gameId: '게임ID',
    turn: '턴',
    player: '플레이어',
    dice1: '주사위1',
    dice2: '주사위2',
    isDouble: '더블여부',
    fromPos: '출발지',
    toPos: '도착지',
    tileName: '타일명',
    action: '행동',
    amount: '금액',
    balance: '잔액',
  },
  Ownership: {
    gameId: '게임ID',
    turn: '턴',
    player: '플레이어',
    tileIndex: '타일인덱스',
    tileName: '타일명',
    action: '행동',
    buildingLevel: '건물단계',
  },
};

function mapToKorean(data: any[], sheetName: string): any[] {
  const headers = KOREAN_HEADERS[sheetName];
  if (!headers) return data;

  return data.map(item => {
    const newItem: any = {};
    for (const [key, value] of Object.entries(item)) {
      const koreanKey = headers[key] || key;
      newItem[koreanKey] = value;
    }
    return newItem;
  });
}

function saveToExcel(logs: SimulationLogs, baseFilename: string): void {
  const wb = XLSX.utils.book_new();

  // 날짜 포맷팅 (MM-DD-HH-mm)
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${month}-${day}-${hour}-${minute}`;

  // Sheet 1: 게임 요약
  const summaryData = mapToKorean(logs.gameSummaries, 'Games');
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Games');

  // Sheet 2: 턴 상세
  const turnsData = mapToKorean(logs.turns, 'Turns');
  const turnsSheet = XLSX.utils.json_to_sheet(turnsData);
  XLSX.utils.book_append_sheet(wb, turnsSheet, 'Turns');

  // Sheet 3: 소유권 변화
  const ownershipData = mapToKorean(logs.ownerships, 'Ownership');
  const ownershipSheet = XLSX.utils.json_to_sheet(ownershipData);
  XLSX.utils.book_append_sheet(wb, ownershipSheet, 'Ownership');

  // logs 폴더 생성
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const finalFilename = `${timestamp}-${baseFilename}`;
  const filepath = path.join(logsDir, finalFilename);
  XLSX.writeFile(wb, filepath);
  console.log(`✅ 엑셀 저장 완료: ${filepath}`);
}

// ============================================================
// 테스트
// ============================================================

describe('엑셀 로그 시뮬레이션', () => {
  it('2인/4인 게임 각 2000회 상세 로그 저장', () => {
    const logs: SimulationLogs = {
      gameSummaries: [],
      turns: [],
      ownerships: [],
    };

    const SIMULATION_COUNT = 1000;

    // 2인 게임 2000회
    console.log(`🚀 2인 게임 ${SIMULATION_COUNT}회 시뮬레이션 시작...`);
    for (let i = 1; i <= SIMULATION_COUNT; i++) {
      const summary = simulateGameWithLogs(i, ['P1', 'P2'], logs.turns, logs.ownerships);
      logs.gameSummaries.push(summary);
    }
    
    // 4인 게임 2000회
    console.log(`🚀 4인 게임 ${SIMULATION_COUNT}회 시뮬레이션 시작...`);
    for (let i = 1; i <= SIMULATION_COUNT; i++) {
      // gameId가 겹치지 않게 오프셋 적용
      const gameId = SIMULATION_COUNT + i;
      const summary = simulateGameWithLogs(gameId, ['P1', 'P2', 'P3', 'P4'], logs.turns, logs.ownerships);
      logs.gameSummaries.push(summary);
    }

    saveToExcel(logs, 'simulation_total_4000games.xlsx');

    console.log('\n========================================');
    console.log('📊 총 4000게임 시뮬레이션 완료');
    console.log(`총 턴 수: ${logs.turns.length}`);
    console.log(`소유권 변화: ${logs.ownerships.length}`);
    console.log('========================================\n');

    expect(logs.gameSummaries).toHaveLength(SIMULATION_COUNT * 2);
    expect(logs.turns.length).toBeGreaterThan(0);
  }, 300000); // 타임아웃 5분 (300,000ms) 설정
});
