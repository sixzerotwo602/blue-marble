// 건물 건설 서비스

import { Game, Player, BoardTileState } from '../types/index.js';
import { getTileDataByIndex } from '../data/boardData.js';

// ============================================================
// T032: 건설 가능 여부 확인 (후반전 체크 포함)
// ============================================================

/** 별장 건설 가능 여부 (최대 2개, 후반전만) */
export function canBuildVilla(
  player: Player,
  tileState: BoardTileState,
  tileIndex: number
): boolean {
  if (!player.isSecondHalf) return false;

  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.buildingPrices || !tileData.canBuild) return false;

  if (tileState.buildings.villaCount >= 2) return false;
  if (player.money < tileData.buildingPrices.villa) return false;

  return true;
}

/** 빌딩 건설 가능 여부 (최대 1개, 후반전만) */
export function canBuildBuilding(
  player: Player,
  tileState: BoardTileState,
  tileIndex: number
): boolean {
  if (!player.isSecondHalf) return false;

  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.buildingPrices || !tileData.canBuild) return false;

  if (tileState.buildings.hasBuilding) return false;
  if (player.money < tileData.buildingPrices.building) return false;

  return true;
}

/** 호텔 건설 가능 여부 (최대 1개, 후반전만) */
export function canBuildHotel(
  player: Player,
  tileState: BoardTileState,
  tileIndex: number
): boolean {
  if (!player.isSecondHalf) return false;

  const tileData = getTileDataByIndex(tileIndex);
  if (!tileData?.buildingPrices || !tileData.canBuild) return false;

  if (tileState.buildings.hasHotel) return false;
  if (player.money < tileData.buildingPrices.hotel) return false;

  return true;
}

// ============================================================
// T033: 건물 건설
// ============================================================

/** 별장 건설 */
export function buildVilla(
  game: Game,
  player: Player,
  tileIndex: number
): { success: boolean; error?: string } {
  const tileState = game.board[tileIndex];
  if (!canBuildVilla(player, tileState, tileIndex)) {
    return { success: false, error: '별장을 건설할 수 없습니다.' };
  }

  const tileData = getTileDataByIndex(tileIndex)!;
  player.money -= tileData.buildingPrices!.villa;
  tileState.buildings.villaCount = (tileState.buildings.villaCount + 1) as 0 | 1 | 2;

  return { success: true };
}

/** 빌딩 건설 */
export function buildBuilding(
  game: Game,
  player: Player,
  tileIndex: number
): { success: boolean; error?: string } {
  const tileState = game.board[tileIndex];
  if (!canBuildBuilding(player, tileState, tileIndex)) {
    return { success: false, error: '빌딩을 건설할 수 없습니다.' };
  }

  const tileData = getTileDataByIndex(tileIndex)!;
  player.money -= tileData.buildingPrices!.building;
  tileState.buildings.hasBuilding = true;

  return { success: true };
}

/** 호텔 건설 */
export function buildHotel(
  game: Game,
  player: Player,
  tileIndex: number
): { success: boolean; error?: string } {
  const tileState = game.board[tileIndex];
  if (!canBuildHotel(player, tileState, tileIndex)) {
    return { success: false, error: '호텔을 건설할 수 없습니다.' };
  }

  const tileData = getTileDataByIndex(tileIndex)!;
  player.money -= tileData.buildingPrices!.hotel;
  tileState.buildings.hasHotel = true;

  return { success: true };
}
