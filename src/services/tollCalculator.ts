// 통행료 계산 서비스

import { Game, Player, BoardTileState } from '../types/index.js';
import { getTileDataByIndex, getTilesByColorGroup } from '../data/boardData.js';
import { GAME_CONSTANTS } from '../data/constants.js';

// ============================================================
// T037: 통행료 계산 (합산 방식)
// ============================================================

/** 통행료 계산 (합산 방식) */
export function calculateToll(
  tileIndex: number,
  tileState: BoardTileState,
  isMonopoly: boolean
): { total: number; details: string } {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.rentTable) {
    return { total: 0, details: '통행료 없음' };
  }

  const { rentTable } = tileData;
  const { buildings } = tileState;

  // 합산 계산
  let total = rentTable.land;
  const parts: string[] = [`대지료 ${rentTable.land.toLocaleString()}`];

  if (buildings.villaCount >= 1) {
    total += rentTable.villa1;
    parts.push(`별장1 ${rentTable.villa1.toLocaleString()}`);
  }
  if (buildings.villaCount >= 2) {
    total += rentTable.villa2;
    parts.push(`별장2 ${rentTable.villa2.toLocaleString()}`);
  }
  if (buildings.hasBuilding) {
    total += rentTable.building;
    parts.push(`빌딩 ${rentTable.building.toLocaleString()}`);
  }
  if (buildings.hasHotel) {
    total += rentTable.hotel;
    parts.push(`호텔 ${rentTable.hotel.toLocaleString()}`);
  }

  // 독점 2배 적용
  if (isMonopoly) {
    total *= GAME_CONSTANTS.MONOPOLY_MULTIPLIER;
    parts.push('(독점 2배)');
  }

  return {
    total,
    details: parts.join(' + '),
  };
}

// ============================================================
// T038: 독점 판정
// ============================================================

/** 독점 판정 */
export function checkMonopoly(
  game: Game,
  playerId: string,
  tileIndex: number
): boolean {
  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.colorGroup) return false;

  const tilesInGroup = getTilesByColorGroup(tileData.colorGroup);
  
  return tilesInGroup.every(tileId => {
    const state = game.board.find(t => t.id === tileId);
    return state?.ownerId === playerId;
  });
}

// ============================================================
// T039: 통행료 지불
// ============================================================

/** 통행료 지불 */
export function payToll(
  game: Game,
  payerId: string,
  ownerId: string,
  amount: number
): { success: boolean; canAfford: boolean } {
  const payer = game.players.find(p => p.id === payerId);
  const owner = game.players.find(p => p.id === ownerId);

  if (!payer || !owner) {
    return { success: false, canAfford: false };
  }

  if (payer.money < amount) {
    return { success: false, canAfford: false };
  }

  // 이체
  payer.money -= amount;
  owner.money += amount;

  return { success: true, canAfford: true };
}
