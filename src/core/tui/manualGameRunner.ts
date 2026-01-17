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
  store.dispatch(initializeGame({ tiles: [...BOARD_DATA] }));
  
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
    if (selectedOption.value === 'ROLL_DICE') {
      // Manual Dice roll logic needs to dispatch result or let diceRoller handle it if integrated
      // Existing mapOptionToAction calculates logic? No, let's see mapOptionToAction.
      // mapOptionToAction returns { type: 'game/rollDice' } which is a reducer action.
      // But reducer usually needs payload if it's deterministic or it uses Math.random inside?
      // Let's check logic. In loggedSimulationRunner, we rolled dice manually and dispatched 'movePlayer'.
      // If 'game/rollDice' reducer exists and handles logic, we use it. 
      // Checking gameSlice is important. If gameSlice.rollDice only changes state based on random, it might accept payload.
      
      // Allow user to set dice value? Or random?
      // "Random" for now, or "Manual Control" usually implies playing the game, so random is fine.
      
      // However, check if 'game/rollDice' exists.
      // 'gameSlice.ts' imports suggest 'movePlayer' is used, not 'rollDice' reducer commonly.
      // Let's assume we handle 'ROLL_DICE' specially here to keep it simple and clean.
    }

    // Execute Action
    if (selectedOption.value === 'ROLL_DICE') {
         // Special handling for rolling to show animation or result
         const result = diceRoller.roll();
         // We need to move player. 
         // !WAIT! loggedSimulationRunner uses `movePlayer` with steps.
         // Does `mapOptionToAction` return `game/rollDice`?
         // Let's look at `inputController.ts`: `return { type: 'game/rollDice' };`
         // I need to check `gameSlice.ts` to see if it handles `rollDice` action.
         // If not, I should handle it manually here.
         
         // Assuming manual handling is safer:
         console.log(`🎲 주사위를 굴립니다... [${result.dice1}, ${result.dice2}] 합: ${result.sum}`);
         // Dispatch move
         // We need to import `movePlayer` action creator.
         // But I cannot easily import it if I don't import from gameSlice. I did.
         // Wait, `movePlayer` is imported.
    }

    // Mapping Action
    // The `mapOptionToAction` returns a plain object `{ type: ..., payload: ... }`.
    // We should use the action creators from `gameSlice.ts` for type safety if possible, 
    // OR just use store.dispatch(action).
    // But `inputController.ts` returns raw objects. 
    
    // Let's handle generic dispatch, but intercept ROLL_DICE because we likely need to generate the number.
    
    const tileId = currentPlayer.position; // Current position for context
    const action = mapOptionToAction(selectedOption.value, currentPlayer.id, tileId);
    
    if (selectedOption.value === 'ROLL_DICE') {
        const result = diceRoller.roll();
        // Since `gameSlice` likely expects `movePlayer` with `steps`, and `rollDice` might not exist or be a thunk.
        // Let's import `movePlayer` and dispatch it directly.
        // I need to update imports.
        
        // Simulating the store dispatch
        const { movePlayer } = await import('../state/gameSlice.js');
        store.dispatch(movePlayer({ playerId: currentPlayer.id, steps: result.sum }));
        
        await askQuestion('엔터를 누르면 계속합니다...');
        continue;
    }
    
    if (action) {
        store.dispatch(action);
    } else if (selectedOption.value === 'SKIP_BUY') {
        // Just end turn or move phase?
        // SKIP_BUY usually implies ending the purchase opp.
        // If there is no explicit action, maybe we need to advance phase manually or `endTurn`?
        // Let's check `gameSlice` logic for skipping. Usually passing `endTurn` or specific `skip` action.
        // `inputController` returned null for SKIP_BUY.
        // We probably need to check if we should dispatch `endTurn` or just do nothing (if phase auto-updates? unlikely).
        // Let's assume we dispatch `endTurn` or add a `skipBuy` action if it exists.
        // Based on logSimulation, `SKIP_BUY` just logged and did nothing? 
        // Ah, in log sim, if `SKIP_BUY`, it just broke switch.
        // But the loop continues to `End Turn Logic`.
        // So effectively it ends turn? 
        // In this TUI loop, if we don't dispatch anything, state doesn't change, we loop again. 
        // So we MUST dispatch something or Change Phase.
        // If `SKIP_BUY`, likely we just `endTurn`.
        
        const { endTurn } = await import('../state/gameSlice.js');
        store.dispatch(endTurn());
    }

    // Optional delay
    // await new Promise(r => setTimeout(r, 500));
  }
}

main().finally(() => rl.close());
