// 메인 게임 루프

import { Game, TileType } from '../types/index.js';
import { BOARD_TILES, getTileDataByIndex } from '../data/boardData.js';
import {
  initializeGame,
  getCurrentPlayer,
  movePlayer,
  handlePassStart,
  endTurn,
  checkGameEnd,
  getPlayerNamesInOrder,
  getPlayerById,
} from '../services/gameService.js';
import { rollDice } from '../services/diceService.js';
import { canAffordPurchase, isPurchasableTile, purchaseProperty } from '../services/propertyService.js';
import { canBuildVilla, canBuildBuilding, canBuildHotel, buildVilla, buildBuilding, buildHotel } from '../services/buildingService.js';
import { calculateToll, checkMonopoly, payToll } from '../services/tollCalculator.js';
import { canAfford, getSellableItems, sellBuilding, sellLand, declareBankruptcy } from '../services/bankruptcyService.js';
import {
  prompt,
  promptNumber,
  promptYesNo,
  promptEnter,
  closeReadline,
} from './prompts.js';
import {
  displayMainMenu,
  displayGameStart,
  displayTurnInfo,
  displayDiceResult,
  displayMovement,
  displayTileInfo,
  displayBuildingMenu,
  displayTollPayment,
  displaySellMenu,
  displayNextTurn,
  displayGameEnd,
  displayBoard,
  formatMoney,
} from './display.js';
import { GAME_CONSTANTS } from '../data/constants.js';

// ============================================================
// 메인 게임 루프
// ============================================================

export async function gameLoop(): Promise<void> {
  displayMainMenu();
  const choice = await promptNumber('선택: ', 1, 2);

  if (choice === 2) {
    console.log('게임을 종료합니다.');
    closeReadline();
    return;
  }

  // 게임 설정
  const playerCount = await promptNumber(
    `플레이어 수를 입력하세요 (${GAME_CONSTANTS.MIN_PLAYERS}-${GAME_CONSTANTS.MAX_PLAYERS}): `,
    GAME_CONSTANTS.MIN_PLAYERS,
    GAME_CONSTANTS.MAX_PLAYERS
  );

  const playerNames: string[] = [];
  for (let i = 1; i <= playerCount; i++) {
    const name = await prompt(`플레이어 ${i} 이름: `);
    playerNames.push(name || `플레이어${i}`);
  }

  // 게임 초기화
  const game = initializeGame(playerNames);
  const orderedNames = getPlayerNamesInOrder(game);
  displayGameStart(orderedNames);

  // 메인 루프
  while (game.status === 'playing') {
    const player = getCurrentPlayer(game);

    // 파산자 스킵
    if (player.isBankrupt) {
      const result = endTurn(game);
      checkGameEnd(game);
      continue;
    }

    displayTurnInfo(game, player);

    // 턴 액션 선택
    let action = '';
    while (action !== 'r') {
      console.log('[Enter/r] 주사위 굴리기 | [m] 맵 보기');
      action = (await prompt('> ')).toLowerCase() || 'r';
      
      if (action === 'm' || action === 'map') {
        displayBoard(game);
      }
    }

    // 주사위 굴리기
    const diceResult = rollDice();
    game.lastDiceResult = diceResult;
    displayDiceResult(diceResult);

    // 이동
    const oldPosition = player.position;
    const moveResult = movePlayer(game, player.id, diceResult.total);
    displayMovement(oldPosition, moveResult.newPosition, moveResult.passedStart);

    if (moveResult.passedStart) {
      handlePassStart(game, player.id);
    }

    // 도착 칸 처리
    await handleLanding(game, player.id, player.position);

    // 게임 종료 체크
    const endResult = checkGameEnd(game);
    if (endResult.isEnded) {
      displayGameEnd(game, endResult.winnerId);
      break;
    }

    // 턴 종료
    await promptEnter('[Enter] 턴 종료');
    const turnResult = endTurn(game);
    const nextPlayer = getPlayerById(game, turnResult.nextPlayerId);
    if (nextPlayer) {
      displayNextTurn(nextPlayer.name, turnResult.isExtraTurn);
    }
  }

  // 다시 하기
  const playAgain = await promptYesNo('다시 하시겠습니까? (Y/N): ');
  if (playAgain) {
    await gameLoop();
  } else {
    console.log('게임을 종료합니다.');
    closeReadline();
  }
}

// ============================================================
// 도착 칸 처리
// ============================================================

async function handleLanding(game: Game, playerId: string, tileIndex: number): Promise<void> {
  const tileData = getTileDataByIndex(tileIndex);
  const tileState = game.board[tileIndex];
  const player = getPlayerById(game, playerId);

  if (!tileData || !tileState || !player) return;

  // 타일 정보 표시
  const owner = tileState.ownerId ? getPlayerById(game, tileState.ownerId) : undefined;
  displayTileInfo(tileIndex, tileState, owner?.name);

  // 타일 타입별 처리
  switch (tileData.type) {
    case TileType.PROPERTY:
    case TileType.VEHICLE:
      if (!tileState.ownerId) {
        // 빈 땅 - 구매 옵션
        await handleEmptyTile(game, player, tileIndex);
      } else if (tileState.ownerId === playerId) {
        // 본인 땅 - 건설 옵션
        await handleOwnedTile(game, player, tileIndex);
      } else {
        // 타인 땅 - 통행료 지불
        await handleOpponentTile(game, player, tileIndex, tileState.ownerId);
      }
      break;

    case TileType.START:
      console.log('출발점에 도착했습니다.');
      break;

    case TileType.GOLDEN_KEY:
      console.log('황금열쇠! (MVP에서 미구현)');
      break;

    case TileType.ISLAND:
      console.log('무인도에 도착했습니다. (MVP에서 미구현)');
      break;

    default:
      console.log(`${tileData.name}에 도착했습니다.`);
      break;
  }
}

// ============================================================
// T031: 빈 땅 처리
// ============================================================

async function handleEmptyTile(game: Game, player: any, tileIndex: number): Promise<void> {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.price) return;

  if (!isPurchasableTile(tileIndex)) {
    console.log('구매할 수 없는 칸입니다.');
    return;
  }

  if (!canAffordPurchase(player, tileIndex)) {
    console.log(`잔고 부족! 가격: ${formatMoney(tileData.price)}, 잔고: ${formatMoney(player.money)}`);
    return;
  }

  const wantBuy = await promptYesNo('구매하시겠습니까? (Y/N): ');
  if (wantBuy) {
    const result = purchaseProperty(game, player.id, tileIndex);
    if (result.success) {
      console.log(`✓ ${tileData.name} 구매 완료!`);
      console.log(`잔고: ${formatMoney(player.money)}`);

      // 구매 직후 건설 가능 (후반전이면)
      if (player.isSecondHalf && tileData.canBuild) {
        await handleBuildingMenu(game, player, tileIndex);
      }
    } else {
      console.log(`구매 실패: ${result.error}`);
    }
  } else {
    console.log('구매를 패스했습니다.');
  }
}

// ============================================================
// T036: 본인 땅 처리
// ============================================================

async function handleOwnedTile(game: Game, player: any, tileIndex: number): Promise<void> {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.canBuild) {
    console.log('건설할 수 없는 땅입니다.');
    return;
  }

  await handleBuildingMenu(game, player, tileIndex);
}

async function handleBuildingMenu(game: Game, player: any, tileIndex: number): Promise<void> {
  const tileState = game.board[tileIndex];
  const tileData = getTileDataByIndex(tileIndex);

  if (!tileData?.buildingPrices) return;

  // 반복문으로 여러 건물 건설 가능
  while (true) {
    const canVilla = canBuildVilla(player, tileState, tileIndex);
    const canBuilding = canBuildBuilding(player, tileState, tileIndex);
    const canHotel = canBuildHotel(player, tileState, tileIndex);

    if (!canVilla && !canBuilding && !canHotel) {
      if (!player.isSecondHalf) {
        console.log('⚠️ 전반전입니다. 건설할 수 없습니다.');
      } else {
        console.log('더 이상 건설할 수 있는 건물이 없습니다.');
      }
      break;
    }

    displayBuildingMenu(tileIndex, tileState, player, canVilla, canBuilding, canHotel);

    const maxChoice = 3;
    const choice = await promptNumber('선택: ', 0, maxChoice);

    if (choice === 0) {
      console.log('건설을 종료합니다.');
      break;
    }

    switch (choice) {
      case 1:
        if (canVilla) {
          const result = buildVilla(game, player, tileIndex);
          if (result.success) {
            console.log(`✓ 별장 건설 완료! 잔고: ${formatMoney(player.money)}`);
          }
        }
        break;
      case 2:
        if (canBuilding) {
          const result = buildBuilding(game, player, tileIndex);
          if (result.success) {
            console.log(`✓ 빌딩 건설 완료! 잔고: ${formatMoney(player.money)}`);
          }
        }
        break;
      case 3:
        if (canHotel) {
          const result = buildHotel(game, player, tileIndex);
          if (result.success) {
            console.log(`✓ 호텔 건설 완료! 잔고: ${formatMoney(player.money)}`);
          }
        }
        break;
    }
  }
}

// ============================================================
// T041: 타인 땅 처리 (통행료)
// ============================================================

async function handleOpponentTile(
  game: Game,
  player: any,
  tileIndex: number,
  ownerId: string
): Promise<void> {
  const owner = getPlayerById(game, ownerId);
  if (!owner || owner.isBankrupt) {
    console.log('소유자가 파산하여 통행료가 면제됩니다.');
    return;
  }

  const tileState = game.board[tileIndex];
  const isMonopoly = checkMonopoly(game, ownerId, tileIndex);
  const tollResult = calculateToll(tileIndex, tileState, isMonopoly);

  if (tollResult.total === 0) {
    console.log('통행료가 없습니다.');
    return;
  }

  // 잔고 체크
  if (!canAfford(player, tollResult.total)) {
    // 파산 처리 플로우
    await handleBankruptcyFlow(game, player, owner, tollResult.total);
  } else {
    // 정상 지불
    payToll(game, player.id, ownerId, tollResult.total);
    displayTollPayment(player.name, owner.name, tollResult.total, tollResult.details, player.money);
  }
}

// ============================================================
// T048: 파산 처리 플로우
// ============================================================

async function handleBankruptcyFlow(
  game: Game,
  player: any,
  owner: any,
  neededAmount: number
): Promise<void> {
  while (player.money < neededAmount && !player.isBankrupt) {
    const sellableItems = getSellableItems(game, player.id);

    if (sellableItems.length === 0) {
      // 매각할 자산이 없으면 파산
      console.log(`${player.name}님이 파산했습니다!`);
      declareBankruptcy(game, player.id);
      return;
    }

    displaySellMenu(neededAmount, player.money, sellableItems.map(item => ({
      index: item.index,
      type: item.type,
      name: item.type === 'building' ? item.tileName : item.tileName,
      value: item.value,
    })));

    const maxChoice = sellableItems.length + 1;
    const choice = await promptNumber('선택: ', 1, maxChoice);

    if (choice === maxChoice) {
      // 파산 선언
      console.log(`${player.name}님이 파산을 선언했습니다!`);
      declareBankruptcy(game, player.id);
      return;
    }

    // 매각
    const selectedItem = sellableItems[choice - 1];
    if (selectedItem.type === 'building') {
      sellBuilding(game, player, selectedItem);
      console.log(`${selectedItem.tileName} 매각 완료! +${formatMoney(selectedItem.value)}`);
    } else {
      sellLand(game, player, selectedItem);
      console.log(`${selectedItem.tileName} 매각 완료! +${formatMoney(selectedItem.value)}`);
    }

    console.log(`현재 잔고: ${formatMoney(player.money)}`);
  }

  // 충분한 돈이 모였으면 지불
  if (player.money >= neededAmount) {
    payToll(game, player.id, owner.id, neededAmount);
    console.log(`${formatMoney(neededAmount)}를 ${owner.name}에게 지불했습니다.`);
    console.log(`잔고: ${formatMoney(player.money)}`);
  }
}
