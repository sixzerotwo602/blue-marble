/**
 * Manual Game Runner (Dev Test Mode)
 * @description Allows a single developer to control 2-4 players for testing purposes.
 */
import * as readline from 'readline';
import { createTestStore } from '../state/store.js';
import { 
  initializeGame, 
  addPlayer, 
  startGame, 
  movePlayer,
  payToll,
  declareBankruptcy,
  endTurn
} from '../state/gameSlice.js';
import { BOARD_DATA } from '../data/boardData.js';
import { printDashboard, clearConsole } from './dashboard.js';
import { getMenuOptions, renderMenu, mapOptionToAction } from './inputController.js';
import { DiceRoller } from '../logic/diceRoller.js';

// Redux Store
const store = createTestStore();
const diceRoller = new DiceRoller('MANUAL_GAME_SEED');

// Readline Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  clearConsole();
  console.log('🎮 Blue Marble Manual Test Mode');
  console.log('===============================');

  // 1. Player Setup
  let playerCount = 0;
  while (true) {
    const input = await askQuestion('플레이어 수를 입력하세요 (2-4): ');
    const count = parseInt(input.trim());
    if (count >= 2 && count <= 4) {
      playerCount = count;
      break;
    }
    console.log('❌ 2에서 4 사이의 숫자를 입력해주세요.');
  }

  // Initialize
  store.dispatch(initializeGame({ seed: 'MANUAL_TEST', tiles: [...BOARD_DATA] }));
  
  for (let i = 1; i <= playerCount; i++) {
    store.dispatch(addPlayer({ id: `p${i}`, name: `Player ${i}` }));
  }
  
  store.dispatch(startGame());

  // Game Loop
  while (true) {
    const state = store.getState().game;

    // Check Game Over
    if (state.winnerId || state.turnPhase === 'GAME_OVER') {
      printDashboard(state);
      console.log(`\n🎉 게임 종료! 승자: ${state.winnerId ? state.players.find(p => p.id === state.winnerId)?.name : 'N/A'}`);
      break;
    }

    // Render
    printDashboard(state);

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.isBankrupt) {
       // Should not happen if endTurn handles it, but just in case
       console.log(`💀 ${currentPlayer.name}은(는) 파산했습니다.`);
       // Logic to skip or handle is inside game logic/actions usually
    }

    // Get Options
    const options = getMenuOptions(state);
    const menuLines = renderMenu(options);

    console.log(`\n👉 ${currentPlayer.name}의 차례 (${state.turnPhase})`);
    console.log('--------------------------------');
    menuLines.forEach(line => console.log(line));
    console.log('--------------------------------');

    // Get Input
    let selectedOptionIndex = -1;
    while (true) {
      const input = await askQuestion('선택할 작업 번호를 입력하세요: ');
      const index = parseInt(input.trim()) - 1;
      
      if (index >= 0 && index < options.length && !options[index].disabled) {
        selectedOptionIndex = index;
        break;
      }
      console.log('❌ 유효하지 않은 선택입니다.');
    }

    const selectedOption = options[selectedOptionIndex];
    
    // Action Logic
    const tileId = currentPlayer.position;
    const action = mapOptionToAction(selectedOption.value, currentPlayer.id, tileId);
    
    if (selectedOption.value === 'ROLL_DICE') {
        const result = diceRoller.roll();
        console.log(`\n🎲 주사위 굴리기: [${result.dice1}, ${result.dice2}] (합: ${result.sum})`);
        
        store.dispatch(movePlayer({ playerId: currentPlayer.id, steps: result.sum }));

        // Post-Move Logic (Toll & Bankruptcy)
        const stateAfterMove = store.getState().game;
        const movedPlayer = stateAfterMove.players.find(p => p.id === currentPlayer.id);
        
        if (movedPlayer) {
          const currentTile = stateAfterMove.tiles.find(t => t.id === movedPlayer.position);
          
          // Toll Check
          if (currentTile && currentTile.ownerId && currentTile.ownerId !== movedPlayer.id) {
             const owner = stateAfterMove.players.find(p => p.id === currentTile.ownerId);
             if (owner && !owner.isBankrupt) {
               // Capture money before to show exact toll paid
               const moneyBefore = movedPlayer.money;
               store.dispatch(payToll({ payerId: movedPlayer.id, tileId: currentTile.id }));
               const moneyAfter = store.getState().game.players.find(p => p.id === movedPlayer.id)?.money ?? 0;
               const paidAmount = moneyBefore - moneyAfter;

               if (paidAmount > 0) {
                   console.log(`💸 ${currentTile.name} 도착: ${owner.name}에게 통행료 ${paidAmount}원을 지불했습니다.`);
               }

               // Bankruptcy Check
               if (moneyAfter < 0) {
                  console.log(`💀 자금 부족으로 파산 처리됩니다.`);
                  store.dispatch(declareBankruptcy({ playerId: movedPlayer.id, creditorId: owner.id }));
               }
             }
          }
        }
        
        await askQuestion('엔터를 누르면 계속합니다...');
        continue;
    }
    
    if (action) {
        store.dispatch(action);
    } else if (selectedOption.value === 'SKIP_BUY') {
        store.dispatch(endTurn());
    }

    // Optional delay
    // await new Promise(r => setTimeout(r, 500));
  }
}

main().finally(() => rl.close());
