/**
 * Special Tile Logic
 * @description 특수 타일 처리 로직 (무인도, 우주여행, 사회복지기금, 황금열쇠)
 */

/**
 * 무인도 잔류 턴 수
 */
export const ISLAND_TURNS = 3;

/**
 * 사회복지기금 기부/수령 금액
 */
export const SOCIAL_FUND_AMOUNT = 150000;

/**
 * 특수 타일 타입 체크 함수들
 */
export function isIslandTile(tileId: number): boolean {
  return tileId === 10;
}

export function isSpaceTravelTile(tileId: number): boolean {
  return tileId === 30;
}

export function isSocialFundTile(tileId: number): boolean {
  return tileId === 20;
}

export function isGoldenKeyTile(tileId: number): boolean {
  // 황금열쇠 위치: 2, 7, 12, 17, 22, 27, 32, 37
  return [2, 7, 12, 17, 22, 27, 32, 37].includes(tileId);
}

export function isStartTile(tileId: number): boolean {
  return tileId === 0;
}

export function isTaxTile(tileId: number): boolean {
  // 세금 위치: 15 (콩코드), 35 (컬럼비아호)
  return [15, 35].includes(tileId);
}

/**
 * 타일 타입에 따른 다음 액션 결정
 */
export type SpecialTileAction =
  | 'NONE'
  | 'ISLAND_STAY'
  | 'SPACE_TRAVEL'
  | 'SOCIAL_FUND'
  | 'GOLDEN_KEY'
  | 'TAX'
  | 'PURCHASE_OPTION';

export function getSpecialTileAction(tileId: number, tileType: string): SpecialTileAction {
  if (isIslandTile(tileId)) return 'ISLAND_STAY';
  if (isSpaceTravelTile(tileId)) return 'SPACE_TRAVEL';
  if (isSocialFundTile(tileId)) return 'SOCIAL_FUND';
  if (isGoldenKeyTile(tileId)) return 'GOLDEN_KEY';
  if (isTaxTile(tileId)) return 'TAX';
  if (tileType === 'city') return 'PURCHASE_OPTION';
  return 'NONE';
}
