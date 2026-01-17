/**
 * Logged Simulation Runner Module
 * @description Supports detailed logging and Excel export for analysis
 */
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { createTestStore } from '../state/store.js';
import {
  initializeGame,
  addPlayer,
  startGame,
  movePlayer,
  buyLand,
  endTurn,
  payToll,
  declareBankruptcy,
  checkAuctionTrigger,
  buildBuilding,
} from '../state/gameSlice.js';
import { BOARD_DATA } from '../data/boardData.js';
import { createAIAgent, createAIContext } from '../ai/aiAgent.js';
import { DiceRoller } from '../logic/diceRoller.js';
import type { AIStrategy, AIAction } from '../ai/aiAgent.js';
import type { SimulationLogs, TurnLog, OwnershipLog, GameSummary } from './simulationLogger.js';

export interface LoggedSimulationOptions {
  maxTurns: number;
  aiStrategy: AIStrategy;
  seed: string;
}

/**
 * 단일 게임 시뮬레이션 (로그 포함)
 */
export function simulateGameWithLogs(
  gameId: number,
  playerNames: string[],
  options: LoggedSimulationOptions,
  logs: SimulationLogs
): GameSummary {
  const startTime = performance.now();
  const { maxTurns, aiStrategy, seed } = options;

  // Initialize
  const store = createTestStore();
  store.dispatch(initializeGame({ seed, tiles: [...BOARD_DATA] }));
  playerNames.forEach((name, idx) => {
    store.dispatch(addPlayer({ id: `ai${idx + 1}`, name }));
  });
  store.dispatch(startGame());

  const agent = createAIAgent(aiStrategy);
  const diceRoller = new DiceRoller(seed);

  let turnCount = 0;
  let propertiesPurchased = 0;
  let buildingsBuilt = 0;
  let tollsPaid = 0;
  let totalTollAmount = 0;

  // Game Loop
  while (turnCount < maxTurns) {
    const state = store.getState().game;
    
    // Check Game End
    if (state.winnerId || state.turnPhase === 'GAME_OVER') break;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isBankrupt) {
      store.dispatch(endTurn());
      continue;
    }

    // Capture Pre-Action State
    const fromPos = currentPlayer.position;
    const preMoney = currentPlayer.money;

    // Decision
    const context = createAIContext(state, currentPlayer.id);
    if (!context) {
      store.dispatch(endTurn());
      continue;
    }

    const action = agent.decide(context);
    
    // Execute & Log
    let logAction = 'WAIT';
    let logAmount = 0;

    switch (action.type) {
      case 'ROLL_DICE': {
        const rollResult = diceRoller.roll();
        store.dispatch(movePlayer({ playerId: currentPlayer.id, steps: rollResult.sum }));
        logAction = 'ROLL';
        
        // Toll Logic
        const newState = store.getState().game;
        const player = newState.players.find(p => p.id === currentPlayer.id);
        if (player) {
          const tile = newState.tiles.find(t => t.id === player.position);
          if (tile && tile.ownerId && tile.ownerId !== currentPlayer.id) {
            // Calculate Toll (Simple approx for log, real logic in reducer)
            const toll = tile.baseToll ?? 0; 
             // Note: Reducer calculates actual toll. We capture the money difference for log.
            const moneyBeforeToll = player.money;
            store.dispatch(payToll({ payerId: currentPlayer.id, tileId: tile.id }));
            
            // Re-fetch to see actual money spent
            const afterToll = store.getState().game;
            const payer = afterToll.players.find(p => p.id === currentPlayer.id);
            const actualTollPaid = moneyBeforeToll - (payer?.money ?? 0);
            
            if (actualTollPaid > 0) {
              tollsPaid++;
              totalTollAmount += actualTollPaid;
              logAction = 'TOLL';
              logAmount = actualTollPaid;
            }

            // Bankruptcy Check
             if (payer && payer.money < 0) {
              store.dispatch(declareBankruptcy({ playerId: currentPlayer.id, creditorId: tile.ownerId }));
              logAction = 'BANKRUPT';
            }
          }
        }
        break;
      }
      case 'BUY_LAND': {
        const tile = state.tiles.find(t => t.id === action.tileId);
        const price = tile?.landPrice ?? 0;
        store.dispatch(buyLand({ playerId: currentPlayer.id, tileId: action.tileId }));
        propertiesPurchased++;
        logAction = 'BUY';
        logAmount = price;
        
        logs.ownerships.push({
          gameId,
          turn: turnCount,
          player: currentPlayer.name,
          tileIndex: tile?.id ?? -1,
          tileName: tile?.name ?? 'Unknown',
          action: 'BUY',
          buildingLevel: 'NONE'
        });
        break;
      }
      case 'BUILD': {
        store.dispatch(buildBuilding({
          playerId: currentPlayer.id,
          tileId: action.tileId,
          buildingType: action.buildingType,
        }));
        buildingsBuilt++;
        logAction = `BUILD_${action.buildingType.toUpperCase()}`;
        
        const tile = state.tiles.find(t => t.id === action.tileId);
        logs.ownerships.push({
            gameId,
            turn: turnCount,
            player: currentPlayer.name,
            tileIndex: tile?.id ?? -1,
            tileName: tile?.name ?? 'Unknown',
            action: logAction,
            buildingLevel: action.buildingType.toUpperCase()
        });
        break;
      }
      case 'SKIP_BUY':
        logAction = 'SKIP_BUY';
        break;
      case 'END_TURN':
        // Handle in loop end
        break;
      case 'PLACE_BID':
        // Auction logic would go here if fully supported in logs
        logAction = 'BID';
        break;
      case 'PASS_AUCTION':
        logAction = 'PASS';
        break;
    }

    // Turn Log
    const postState = store.getState().game;
    const finalPlayer = postState.players.find(p => p.id === currentPlayer.id);
    
    // Only log significant actions or Rolls
    if (logAction !== 'WAIT') {
        logs.turns.push({
            gameId,
            turn: turnCount,
            player: currentPlayer.name,
            dice1: diceRoller.getLastRoll()?.dice1 ?? 0,
            dice2: diceRoller.getLastRoll()?.dice2 ?? 0,
            isDouble: diceRoller.getLastRoll()?.isDouble ?? false,
            fromPos,
            toPos: finalPlayer?.position ?? 0,
            tileName: postState.tiles.find(t => t.id === (finalPlayer?.position ?? 0))?.name ?? '',
            action: logAction,
            amount: logAmount,
            balance: finalPlayer?.money ?? 0
        });
    }

    // End Turn Logic
    const newState = store.getState().game;
    if (newState.turnPhase === 'TURN_END' || action.type === 'END_TURN') {
      store.dispatch(checkAuctionTrigger());
      store.dispatch(endTurn());
      turnCount++;
    }
  }

  const duration = performance.now() - startTime;
  const finalState = store.getState().game;

  return {
    gameId,
    winner: finalState.players.find(p => p.id === finalState.winnerId)?.name ?? 'N/A',
    totalTurns: turnCount,
    durationMs: Math.round(duration),
    propertiesPurchased,
    buildingsBuilt,
    tollsPaid,
    totalTollAmount,
    player1FinalBalance: finalState.players[0]?.money ?? 0,
    player2FinalBalance: finalState.players[1]?.money ?? 0,
    player3FinalBalance: finalState.players[2]?.money,
    player4FinalBalance: finalState.players[3]?.money,
  };
}

/**
 * 다중 게임 시뮬레이션 및 로그 집계
 */
export function runLoggedSimulation(
  count: number,
  playerNames: string[],
  options: Omit<LoggedSimulationOptions, 'seed'>
): SimulationLogs {
  const logs: SimulationLogs = {
    gameSummaries: [],
    turns: [],
    ownerships: [],
  };

  for (let i = 0; i < count; i++) {
    const seed = `LOGGED_SIM_${i}_${Date.now()}`;
    const summary = simulateGameWithLogs(
      i + 1,
      playerNames,
      { ...options, seed },
      logs
    );
    logs.gameSummaries.push(summary);
  }

  return logs;
}

/**
 * 엑셀 저장
 */
export function saveToExcel(logs: SimulationLogs, baseFilename: string): void {
  const wb = XLSX.utils.book_new();

  // Summary Sheet
  const summarySheet = XLSX.utils.json_to_sheet(logs.gameSummaries);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Games');

  // Turns Sheet
  const turnsSheet = XLSX.utils.json_to_sheet(logs.turns);
  XLSX.utils.book_append_sheet(wb, turnsSheet, 'Turns');

  // Ownership Sheet
  const ownershipSheet = XLSX.utils.json_to_sheet(logs.ownerships);
  XLSX.utils.book_append_sheet(wb, ownershipSheet, 'Ownership');

  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filepath = path.join(logsDir, `${timestamp}-${baseFilename}`);
  
  XLSX.writeFile(wb, filepath);
  console.log(`✅ Excel saved: ${filepath}`);
}
