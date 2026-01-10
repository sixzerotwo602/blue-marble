// CLI 출력 포매터

import { Game, Player, BoardTileState, DiceResult } from '../types/index.js';
import { BOARD_TILES, getTileDataByIndex } from '../data/boardData.js';
import { GAME_CONSTANTS } from '../data/constants.js';

// ============================================================
// 포맷팅 유틸리티
// ============================================================

/** 금액 포맷 */
export function formatMoney(amount: number): string {
  return `₩${amount.toLocaleString()}`;
}

/** 구분선 */
export function printSeparator(): void {
  console.log('========================================');
}

// ============================================================
// T015: 메인 메뉴
// ============================================================

/** 메인 메뉴 표시 */
export function displayMainMenu(): void {
  console.log('');
  console.log('=== 부루마블 테스트 모드 ===');
  console.log('1. 새 게임 시작');
  console.log('2. 종료');
  console.log('');
}

// ============================================================
// T018: 게임 시작 표시
// ============================================================

/** 게임 시작 메시지 */
export function displayGameStart(playerNames: string[]): void {
  console.log('');
  console.log('게임을 시작합니다!');
  console.log(`턴 순서: ${playerNames.join(' → ')}`);
  console.log('');
}

// ============================================================
// T023: 턴 정보 표시
// ============================================================

/** 턴 정보 표시 */
export function displayTurnInfo(game: Game, player: Player): void {
  const tileData = getTileDataByIndex(player.position);
  const tileName = tileData?.name ?? '???';

  printSeparator();
  console.log(`[턴 ${game.turnCount}] ${player.name}의 차례 (현재 위치: ${tileName})`);
  console.log(`잔고: ${formatMoney(player.money)} | 소유 땅: ${player.ownedTileIds.length}개`);

  if (!player.isSecondHalf) {
    console.log('📋 전반전입니다 (출발점 통과 후 건설 가능)');
  }

  printSeparator();
}

// ============================================================
// T024: 주사위 결과 표시
// ============================================================

/** 주사위 결과 표시 */
export function displayDiceResult(result: DiceResult): void {
  console.log('');
  console.log(`주사위: [${result.die1}] + [${result.die2}] = ${result.total}`);
  if (result.isDouble) {
    console.log('🎲 더블! 추가 턴을 얻었습니다.');
  }
}

// ============================================================
// T025: 이동 표시
// ============================================================

/** 이동 표시 */
export function displayMovement(
  oldPosition: number,
  newPosition: number,
  passedStart: boolean
): void {
  const oldTile = getTileDataByIndex(oldPosition);
  const newTile = getTileDataByIndex(newPosition);

  console.log(`이동: ${oldTile?.name}(${oldPosition}) → ${newTile?.name}(${newPosition})`);

  if (passedStart) {
    console.log(`💵 출발점 통과! 월급 ${formatMoney(GAME_CONSTANTS.SALARY)} 지급`);
  }
  console.log('');
}

// ============================================================
// T029: 타일 정보 표시
// ============================================================

/** 타일 정보 표시 */
export function displayTileInfo(
  tileIndex: number,
  tileState: BoardTileState | undefined,
  ownerName?: string
): void {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData) return;

  console.log(`--- ${tileData.name} ---`);

  if (tileData.price) {
    const ownerText = ownerName ? ownerName : '없음';
    console.log(`소유자: ${ownerText} | 가격: ${formatMoney(tileData.price)}`);

    if (tileState && ownerName) {
      const buildings = tileState.buildings;
      const buildingParts: string[] = [];
      if (buildings.villaCount > 0) buildingParts.push(`별장 ${buildings.villaCount}개`);
      if (buildings.hasBuilding) buildingParts.push('빌딩');
      if (buildings.hasHotel) buildingParts.push('호텔');

      if (buildingParts.length > 0) {
        console.log(`건물: ${buildingParts.join(' + ')}`);
      }
    }
  }
}

// ============================================================
// T034: 건설 메뉴 표시
// ============================================================

/** 건설 메뉴 표시 */
export function displayBuildingMenu(
  tileIndex: number,
  tileState: BoardTileState,
  player: Player,
  canBuildVilla: boolean,
  canBuildBuilding: boolean,
  canBuildHotel: boolean
): void {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.buildingPrices) return;

  console.log('');
  console.log(`--- ${tileData.name} (본인 소유) ---`);

  const buildings = tileState.buildings;
  const buildingParts: string[] = [];
  if (buildings.villaCount > 0) buildingParts.push(`별장 ${buildings.villaCount}개`);
  if (buildings.hasBuilding) buildingParts.push('빌딩');
  if (buildings.hasHotel) buildingParts.push('호텔');

  if (buildingParts.length > 0) {
    console.log(`현재 건물: ${buildingParts.join(' + ')}`);
  } else {
    console.log('현재 건물: 없음');
  }

  if (!player.isSecondHalf) {
    console.log('');
    console.log('⚠️ 전반전입니다. 건설할 수 없습니다.');
    console.log('');
    return;
  }

  console.log(`건설 가격: 별장 ${formatMoney(tileData.buildingPrices.villa)} | 빌딩 ${formatMoney(tileData.buildingPrices.building)} | 호텔 ${formatMoney(tileData.buildingPrices.hotel)}`);
  console.log('');

  if (canBuildVilla) {
    console.log(`1. 별장 건설 (${formatMoney(tileData.buildingPrices.villa)})`);
  }
  if (canBuildBuilding) {
    console.log(`2. 빌딩 건설 (${formatMoney(tileData.buildingPrices.building)})`);
  }
  if (canBuildHotel) {
    console.log(`3. 호텔 건설 (${formatMoney(tileData.buildingPrices.hotel)})`);
  }
  console.log('0. 건설 안함');
}

// ============================================================
// T040: 통행료 지불 표시
// ============================================================

/** 통행료 지불 표시 */
export function displayTollPayment(
  payerName: string,
  ownerName: string,
  tollAmount: number,
  tollDetails: string,
  newBalance: number
): void {
  console.log('');
  console.log(`--- ${ownerName} 소유 ---`);
  console.log(`통행료: ${tollDetails} = ${formatMoney(tollAmount)}`);
  console.log('');
  console.log(`${formatMoney(tollAmount)}를 ${ownerName}에게 지불합니다.`);
  console.log(`${payerName} 잔고: ${formatMoney(newBalance)}`);
}

// ============================================================
// T046: 자산 매각 메뉴 표시
// ============================================================

/** 자산 매각 메뉴 표시 */
export function displaySellMenu(
  neededAmount: number,
  currentBalance: number,
  sellableItems: Array<{ index: number; type: 'building' | 'land'; name: string; value: number }>
): void {
  console.log('');
  console.log(`⚠️ 잔고 부족! 필요: ${formatMoney(neededAmount)}, 현재 잔고: ${formatMoney(currentBalance)}`);
  console.log('');
  console.log('자산 매각 메뉴:');

  sellableItems.forEach((item, idx) => {
    const typeText = item.type === 'building' ? '[건물]' : '[땅]';
    console.log(`${idx + 1}. ${typeText} ${item.name} 매각 (${formatMoney(item.value)})`);
  });

  console.log(`${sellableItems.length + 1}. 파산 선언`);
}

// ============================================================
// T051: 다음 턴 표시
// ============================================================

/** 다음 턴 표시 */
export function displayNextTurn(playerName: string, isExtraTurn: boolean): void {
  console.log('');
  if (isExtraTurn) {
    console.log(`🎲 더블로 추가 턴! ${playerName}님이 다시 진행합니다.`);
  } else {
    console.log(`다음: ${playerName}의 차례`);
  }
}

// ============================================================
// T052: 게임 종료 표시
// ============================================================

/** 게임 종료 표시 */
export function displayGameEnd(game: Game, winnerId: string | undefined): void {
  const winner = game.players.find(p => p.id === winnerId);
  
  printSeparator();
  console.log(`🎉 게임 종료! 승자: ${winner?.name ?? '없음'}`);
  printSeparator();

  console.log('최종 순위:');
  const sortedPlayers = [...game.players].sort((a, b) => {
    if (a.isBankrupt && !b.isBankrupt) return 1;
    if (!a.isBankrupt && b.isBankrupt) return -1;
    return b.money - a.money;
  });

  sortedPlayers.forEach((player, index) => {
    const status = player.isBankrupt ? '(파산)' : formatMoney(player.money);
    console.log(`${index + 1}위: ${player.name} ${status}`);
  });
}

// ============================================================
// T057: 전체 보드 맵 표시
// ============================================================

/** 전체 보드 맵 표시 */
export function displayBoard(game: Game): void {
  console.log('');
  printSeparator();
  console.log('🗺️  전체 보드 맵');
  printSeparator();

  // 플레이어 위치 맵
  const playerPositions: Record<number, string[]> = {};
  game.players.forEach(p => {
    if (!p.isBankrupt) {
      if (!playerPositions[p.position]) playerPositions[p.position] = [];
      playerPositions[p.position].push(p.name.substring(0, 3));
    }
  });

  // 칸별 출력
  for (let i = 0; i < 40; i++) {
    const tileData = BOARD_TILES[i];
    const tileState = game.board[i];
    const owner = tileState.ownerId 
      ? game.players.find(p => p.id === tileState.ownerId)?.name.substring(0, 4)
      : '';

    // 위치 표시
    const posStr = `${i}`.padStart(2, '0');
    
    // 소유자 표시
    const ownerStr = owner ? `[${owner}]` : '      ';

    // 건물 표시
    let buildStr = '';
    if (tileState.buildings.villaCount > 0) buildStr += `V${tileState.buildings.villaCount}`;
    if (tileState.buildings.hasBuilding) buildStr += 'B';
    if (tileState.buildings.hasHotel) buildStr += 'H';
    buildStr = buildStr.padEnd(4, ' ');

    // 플레이어 위치 표시
    const playersHere = playerPositions[i]?.join(',') ?? '';
    const playerStr = playersHere ? `◆${playersHere}` : '';

    // 구역 구분
    let zone = '';
    if (i === 0) zone = '🏁';
    else if (i === 10) zone = '🏝️';
    else if (i === 20) zone = '💰';
    else if (i === 30) zone = '🚀';
    else if (i >= 1 && i <= 9) zone = '①';
    else if (i >= 11 && i <= 19) zone = '②';
    else if (i >= 21 && i <= 29) zone = '③';
    else if (i >= 31 && i <= 39) zone = '④';

    console.log(`${zone} ${posStr} ${tileData.name.padEnd(12, ' ')} ${ownerStr} ${buildStr} ${playerStr}`);
  }

  console.log('');
  console.log('범례: V=별장, B=빌딩, H=호텔, ◆=플레이어 위치');
  printSeparator();
}

