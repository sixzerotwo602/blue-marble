/**
 * 보드 데이터 (40칸)
 *
 * Feature: 001-core-game-engine
 * Date: 2026-01-09
 *
 * 데이터 출처: 부루마블(블루마블) 요소 정리.md
 * - 40칸 보드판 (모서리 4개 + 각 변 9개)
 * - 29개 증서 (도시 26 + 탈것 3)
 * - 황금열쇠 6칸
 * - 통행료/건설비: 증서 카드 뒷면 기준
 */

import { TileType } from './enums';
import { BoardTile, PropertySpec } from './types';

// ───────────────────────────────────────────────────────────────
// 보드 타일 데이터 (40칸)
// ───────────────────────────────────────────────────────────────
export const BOARD_TILES: BoardTile[] = [
  // 코너 0: 출발
  { index: 0, name: '출발', type: TileType.START, propertyId: null },

  // 1구역 (출발 → 무인도, 하단 9칸)
  { index: 1, name: '타이베이', type: TileType.CITY_PROPERTY, propertyId: 'taipei' },
  { index: 2, name: '황금열쇠', type: TileType.GOLDEN_KEY, propertyId: null },
  { index: 3, name: '베이징', type: TileType.CITY_PROPERTY, propertyId: 'beijing' },
  { index: 4, name: '마닐라', type: TileType.CITY_PROPERTY, propertyId: 'manila' },
  { index: 5, name: '황금열쇠', type: TileType.GOLDEN_KEY, propertyId: null },
  { index: 6, name: '제주도', type: TileType.NO_BUILD_PROPERTY, propertyId: 'jeju' },
  { index: 7, name: '싱가포르', type: TileType.CITY_PROPERTY, propertyId: 'singapore' },
  { index: 8, name: '카이로', type: TileType.CITY_PROPERTY, propertyId: 'cairo' },
  { index: 9, name: '이스탄불', type: TileType.CITY_PROPERTY, propertyId: 'istanbul' },

  // 코너 10: 무인도
  { index: 10, name: '무인도', type: TileType.ISLAND, propertyId: null },

  // 2구역 (무인도 → 사회복지기금 접수처, 좌측 9칸)
  { index: 11, name: '아테네', type: TileType.CITY_PROPERTY, propertyId: 'athens' },
  { index: 12, name: '황금열쇠', type: TileType.GOLDEN_KEY, propertyId: null },
  { index: 13, name: '코펜하겐', type: TileType.CITY_PROPERTY, propertyId: 'copenhagen' },
  { index: 14, name: '스톡홀름', type: TileType.CITY_PROPERTY, propertyId: 'stockholm' },
  { index: 15, name: '콩코드여객기', type: TileType.VEHICLE, propertyId: 'concorde' },
  { index: 16, name: '황금열쇠', type: TileType.GOLDEN_KEY, propertyId: null },
  { index: 17, name: '베른', type: TileType.CITY_PROPERTY, propertyId: 'bern' },
  { index: 18, name: '베를린', type: TileType.CITY_PROPERTY, propertyId: 'berlin' },
  { index: 19, name: '오타와', type: TileType.CITY_PROPERTY, propertyId: 'ottawa' },

  // 코너 20: 사회복지기금 접수처
  { index: 20, name: '사회복지기금접수처', type: TileType.WELFARE_PAYOUT, propertyId: null },

  // 3구역 (사회복지기금 접수처 → 우주여행, 상단 9칸)
  { index: 21, name: '부에노스아이레스', type: TileType.CITY_PROPERTY, propertyId: 'buenosaires' },
  { index: 22, name: '황금열쇠', type: TileType.GOLDEN_KEY, propertyId: null },
  { index: 23, name: '상파울루', type: TileType.CITY_PROPERTY, propertyId: 'saopaulo' },
  { index: 24, name: '시드니', type: TileType.CITY_PROPERTY, propertyId: 'sydney' },
  { index: 25, name: '부산', type: TileType.NO_BUILD_PROPERTY, propertyId: 'busan' },
  { index: 26, name: '하와이', type: TileType.CITY_PROPERTY, propertyId: 'hawaii' },
  { index: 27, name: '리스본', type: TileType.CITY_PROPERTY, propertyId: 'lisbon' },
  { index: 28, name: '퀸엘리자베스호', type: TileType.VEHICLE, propertyId: 'queenelizabeth' },
  { index: 29, name: '마드리드', type: TileType.CITY_PROPERTY, propertyId: 'madrid' },

  // 코너 30: 우주여행
  { index: 30, name: '우주여행', type: TileType.SPACE_TRAVEL, propertyId: null },

  // 4구역 (우주여행 → 출발, 우측 9칸)
  { index: 31, name: '도쿄', type: TileType.CITY_PROPERTY, propertyId: 'tokyo' },
  { index: 32, name: '황금열쇠', type: TileType.GOLDEN_KEY, propertyId: null },
  { index: 33, name: '컬럼비아호', type: TileType.VEHICLE, propertyId: 'columbia' },
  { index: 34, name: '파리', type: TileType.CITY_PROPERTY, propertyId: 'paris' },
  { index: 35, name: '로마', type: TileType.CITY_PROPERTY, propertyId: 'rome' },
  { index: 36, name: '런던', type: TileType.CITY_PROPERTY, propertyId: 'london' },
  { index: 37, name: '뉴욕', type: TileType.CITY_PROPERTY, propertyId: 'newyork' },
  { index: 38, name: '사회복지기금기부', type: TileType.WELFARE_DONATION, propertyId: null },
  { index: 39, name: '서울', type: TileType.NO_BUILD_PROPERTY, propertyId: 'seoul' },
];

// ───────────────────────────────────────────────────────────────
// 증서 데이터 (29개)
// 출처: 부루마블(블루마블) 요소 정리.md - 증서 카드 표
// ───────────────────────────────────────────────────────────────
export const PROPERTY_SPECS: Record<string, PropertySpec> = {
  // ═══════════════════════════════════════════════════════════
  // 1구역 도시 (타이베이 ~ 이스탄불)
  // ═══════════════════════════════════════════════════════════
  taipei: {
    id: 'taipei',
    name: '타이베이',
    tileIndex: 1,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 50_000,
    canBuild: true,
    buildCost: { villa: 50_000, building: 150_000, hotel: 250_000 },
    toll: { land: 2_000, villa: 10_000, villa2: 30_000, building: 90_000, hotel: 250_000 },
    colorGroup: 'brown',
    isColumbia: false,
    isSeoul: false,
  },
  beijing: {
    id: 'beijing',
    name: '베이징',
    tileIndex: 3,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 80_000,
    canBuild: true,
    buildCost: { villa: 50_000, building: 150_000, hotel: 250_000 },
    toll: { land: 4_000, villa: 20_000, villa2: 60_000, building: 180_000, hotel: 450_000 },
    colorGroup: 'brown',
    isColumbia: false,
    isSeoul: false,
  },
  manila: {
    id: 'manila',
    name: '마닐라',
    tileIndex: 4,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 80_000,
    canBuild: true,
    buildCost: { villa: 50_000, building: 150_000, hotel: 250_000 },
    toll: { land: 4_000, villa: 20_000, villa2: 60_000, building: 180_000, hotel: 450_000 },
    colorGroup: 'brown',
    isColumbia: false,
    isSeoul: false,
  },
  jeju: {
    id: 'jeju',
    name: '제주도',
    tileIndex: 6,
    tileType: TileType.NO_BUILD_PROPERTY,
    purchasePrice: 200_000,
    canBuild: false,
    buildCost: null,
    toll: { land: 300_000, villa: 0, villa2: 0, building: 0, hotel: 0 },
    colorGroup: 'special-korea',
    isColumbia: false,
    isSeoul: false,
  },
  singapore: {
    id: 'singapore',
    name: '싱가포르',
    tileIndex: 7,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 100_000,
    canBuild: true,
    buildCost: { villa: 50_000, building: 150_000, hotel: 250_000 },
    toll: { land: 6_000, villa: 30_000, villa2: 90_000, building: 270_000, hotel: 550_000 },
    colorGroup: 'sky',
    isColumbia: false,
    isSeoul: false,
  },
  cairo: {
    id: 'cairo',
    name: '카이로',
    tileIndex: 8,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 100_000,
    canBuild: true,
    buildCost: { villa: 50_000, building: 150_000, hotel: 250_000 },
    toll: { land: 6_000, villa: 30_000, villa2: 90_000, building: 270_000, hotel: 550_000 },
    colorGroup: 'sky',
    isColumbia: false,
    isSeoul: false,
  },
  istanbul: {
    id: 'istanbul',
    name: '이스탄불',
    tileIndex: 9,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 120_000,
    canBuild: true,
    buildCost: { villa: 50_000, building: 150_000, hotel: 250_000 },
    toll: { land: 8_000, villa: 40_000, villa2: 100_000, building: 300_000, hotel: 600_000 },
    colorGroup: 'sky',
    isColumbia: false,
    isSeoul: false,
  },

  // ═══════════════════════════════════════════════════════════
  // 2구역 도시 (아테네 ~ 오타와)
  // ═══════════════════════════════════════════════════════════
  athens: {
    id: 'athens',
    name: '아테네',
    tileIndex: 11,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 140_000,
    canBuild: true,
    buildCost: { villa: 100_000, building: 300_000, hotel: 500_000 },
    toll: { land: 10_000, villa: 50_000, villa2: 150_000, building: 450_000, hotel: 750_000 },
    colorGroup: 'pink',
    isColumbia: false,
    isSeoul: false,
  },
  copenhagen: {
    id: 'copenhagen',
    name: '코펜하겐',
    tileIndex: 13,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 160_000,
    canBuild: true,
    buildCost: { villa: 100_000, building: 300_000, hotel: 500_000 },
    toll: { land: 12_000, villa: 60_000, villa2: 180_000, building: 500_000, hotel: 900_000 },
    colorGroup: 'pink',
    isColumbia: false,
    isSeoul: false,
  },
  stockholm: {
    id: 'stockholm',
    name: '스톡홀름',
    tileIndex: 14,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 160_000,
    canBuild: true,
    buildCost: { villa: 100_000, building: 300_000, hotel: 500_000 },
    toll: { land: 12_000, villa: 60_000, villa2: 180_000, building: 500_000, hotel: 900_000 },
    colorGroup: 'pink',
    isColumbia: false,
    isSeoul: false,
  },
  concorde: {
    id: 'concorde',
    name: '콩코드여객기',
    tileIndex: 15,
    tileType: TileType.VEHICLE,
    purchasePrice: 200_000,
    canBuild: false,
    buildCost: null,
    toll: { land: 300_000, villa: 0, villa2: 0, building: 0, hotel: 0 },
    colorGroup: 'vehicle',
    isColumbia: false,
    isSeoul: false,
  },
  bern: {
    id: 'bern',
    name: '베른',
    tileIndex: 17,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 180_000,
    canBuild: true,
    buildCost: { villa: 100_000, building: 300_000, hotel: 500_000 },
    toll: { land: 14_000, villa: 70_000, villa2: 200_000, building: 550_000, hotel: 950_000 },
    colorGroup: 'orange',
    isColumbia: false,
    isSeoul: false,
  },
  berlin: {
    id: 'berlin',
    name: '베를린',
    tileIndex: 18,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 180_000,
    canBuild: true,
    buildCost: { villa: 100_000, building: 300_000, hotel: 500_000 },
    toll: { land: 14_000, villa: 70_000, villa2: 200_000, building: 550_000, hotel: 950_000 },
    colorGroup: 'orange',
    isColumbia: false,
    isSeoul: false,
  },
  ottawa: {
    id: 'ottawa',
    name: '오타와',
    tileIndex: 19,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 200_000,
    canBuild: true,
    buildCost: { villa: 100_000, building: 300_000, hotel: 500_000 },
    toll: { land: 16_000, villa: 80_000, villa2: 220_000, building: 600_000, hotel: 1_000_000 },
    colorGroup: 'orange',
    isColumbia: false,
    isSeoul: false,
  },

  // ═══════════════════════════════════════════════════════════
  // 3구역 도시 (부에노스아이레스 ~ 마드리드)
  // ═══════════════════════════════════════════════════════════
  buenosaires: {
    id: 'buenosaires',
    name: '부에노스아이레스',
    tileIndex: 21,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 220_000,
    canBuild: true,
    buildCost: { villa: 150_000, building: 400_000, hotel: 750_000 },
    toll: { land: 18_000, villa: 90_000, villa2: 250_000, building: 700_000, hotel: 1_050_000 },
    colorGroup: 'red',
    isColumbia: false,
    isSeoul: false,
  },
  saopaulo: {
    id: 'saopaulo',
    name: '상파울루',
    tileIndex: 23,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 240_000,
    canBuild: true,
    buildCost: { villa: 150_000, building: 450_000, hotel: 750_000 },
    toll: { land: 20_000, villa: 100_000, villa2: 300_000, building: 750_000, hotel: 1_100_000 },
    colorGroup: 'red',
    isColumbia: false,
    isSeoul: false,
  },
  sydney: {
    id: 'sydney',
    name: '시드니',
    tileIndex: 24,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 240_000,
    canBuild: true,
    buildCost: { villa: 150_000, building: 450_000, hotel: 750_000 },
    toll: { land: 20_000, villa: 100_000, villa2: 300_000, building: 750_000, hotel: 1_100_000 },
    colorGroup: 'red',
    isColumbia: false,
    isSeoul: false,
  },
  busan: {
    id: 'busan',
    name: '부산',
    tileIndex: 25,
    tileType: TileType.NO_BUILD_PROPERTY,
    purchasePrice: 500_000,
    canBuild: false,
    buildCost: null,
    toll: { land: 600_000, villa: 0, villa2: 0, building: 0, hotel: 0 },
    colorGroup: 'special-korea',
    isColumbia: false,
    isSeoul: false,
  },
  hawaii: {
    id: 'hawaii',
    name: '하와이',
    tileIndex: 26,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 260_000,
    canBuild: true,
    buildCost: { villa: 150_000, building: 450_000, hotel: 750_000 },
    toll: { land: 22_000, villa: 110_000, villa2: 330_000, building: 800_000, hotel: 1_150_000 },
    colorGroup: 'yellow',
    isColumbia: false,
    isSeoul: false,
  },
  lisbon: {
    id: 'lisbon',
    name: '리스본',
    tileIndex: 27,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 260_000,
    canBuild: true,
    buildCost: { villa: 150_000, building: 450_000, hotel: 750_000 },
    toll: { land: 22_000, villa: 110_000, villa2: 330_000, building: 800_000, hotel: 1_150_000 },
    colorGroup: 'yellow',
    isColumbia: false,
    isSeoul: false,
  },
  queenelizabeth: {
    id: 'queenelizabeth',
    name: '퀸엘리자베스호',
    tileIndex: 28,
    tileType: TileType.VEHICLE,
    purchasePrice: 300_000,
    canBuild: false,
    buildCost: null,
    toll: { land: 250_000, villa: 0, villa2: 0, building: 0, hotel: 0 },
    colorGroup: 'vehicle',
    isColumbia: false,
    isSeoul: false,
  },
  madrid: {
    id: 'madrid',
    name: '마드리드',
    tileIndex: 29,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 280_000,
    canBuild: true,
    buildCost: { villa: 150_000, building: 450_000, hotel: 750_000 },
    toll: { land: 24_000, villa: 120_000, villa2: 360_000, building: 850_000, hotel: 1_200_000 },
    colorGroup: 'yellow',
    isColumbia: false,
    isSeoul: false,
  },

  // ═══════════════════════════════════════════════════════════
  // 4구역 도시 (도쿄 ~ 서울)
  // ═══════════════════════════════════════════════════════════
  tokyo: {
    id: 'tokyo',
    name: '도쿄',
    tileIndex: 31,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 300_000,
    canBuild: true,
    buildCost: { villa: 200_000, building: 600_000, hotel: 1_000_000 },
    toll: { land: 26_000, villa: 130_000, villa2: 390_000, building: 900_000, hotel: 1_270_000 },
    colorGroup: 'green',
    isColumbia: false,
    isSeoul: false,
  },
  columbia: {
    id: 'columbia',
    name: '컬럼비아호',
    tileIndex: 33,
    tileType: TileType.VEHICLE,
    purchasePrice: 450_000,
    canBuild: false,
    buildCost: null,
    toll: { land: 300_000, villa: 0, villa2: 0, building: 0, hotel: 0 },
    colorGroup: 'vehicle',
    isColumbia: true,  // 우주여행 이용료 수취
    isSeoul: false,
  },
  paris: {
    id: 'paris',
    name: '파리',
    tileIndex: 34,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 320_000,
    canBuild: true,
    buildCost: { villa: 200_000, building: 600_000, hotel: 1_000_000 },
    toll: { land: 28_000, villa: 150_000, villa2: 450_000, building: 1_000_000, hotel: 1_400_000 },
    colorGroup: 'green',
    isColumbia: false,
    isSeoul: false,
  },
  rome: {
    id: 'rome',
    name: '로마',
    tileIndex: 35,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 320_000,
    canBuild: true,
    buildCost: { villa: 200_000, building: 600_000, hotel: 1_000_000 },
    toll: { land: 28_000, villa: 150_000, villa2: 450_000, building: 1_000_000, hotel: 1_400_000 },
    colorGroup: 'green',
    isColumbia: false,
    isSeoul: false,
  },
  london: {
    id: 'london',
    name: '런던',
    tileIndex: 36,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 350_000,
    canBuild: true,
    buildCost: { villa: 200_000, building: 600_000, hotel: 1_000_000 },
    toll: { land: 35_000, villa: 170_000, villa2: 500_000, building: 1_100_000, hotel: 1_500_000 },
    colorGroup: 'blue',
    isColumbia: false,
    isSeoul: false,
  },
  newyork: {
    id: 'newyork',
    name: '뉴욕',
    tileIndex: 37,
    tileType: TileType.CITY_PROPERTY,
    purchasePrice: 350_000,
    canBuild: true,
    buildCost: { villa: 200_000, building: 600_000, hotel: 1_000_000 },
    toll: { land: 35_000, villa: 170_000, villa2: 500_000, building: 1_100_000, hotel: 1_500_000 },
    colorGroup: 'blue',
    isColumbia: false,
    isSeoul: false,
  },
  seoul: {
    id: 'seoul',
    name: '서울',
    tileIndex: 39,
    tileType: TileType.NO_BUILD_PROPERTY,
    purchasePrice: 1_000_000,
    canBuild: false,
    buildCost: null,
    toll: { land: 2_000_000, villa: 0, villa2: 0, building: 0, hotel: 0 },
    colorGroup: 'special-korea',
    isColumbia: false,
    isSeoul: true,  // 옵션게임 경매 대상
  },
};

// ───────────────────────────────────────────────────────────────
// 색상 그룹별 도시 목록 (독점 판정용)
// ───────────────────────────────────────────────────────────────
export const COLOR_GROUPS: Record<string, string[]> = {
  brown: ['taipei', 'beijing', 'manila'],
  sky: ['singapore', 'cairo', 'istanbul'],
  pink: ['athens', 'copenhagen', 'stockholm'],
  orange: ['bern', 'berlin', 'ottawa'],
  red: ['buenosaires', 'saopaulo', 'sydney'],
  yellow: ['hawaii', 'lisbon', 'madrid'],
  green: ['tokyo', 'paris', 'rome'],
  blue: ['london', 'newyork'],
  vehicle: ['concorde', 'queenelizabeth', 'columbia'],
  'special-korea': ['jeju', 'busan', 'seoul'],
};

// ───────────────────────────────────────────────────────────────
// 특수 칸 인덱스
// ───────────────────────────────────────────────────────────────
export const SPECIAL_TILE_INDICES = {
  START: 0,
  ISLAND: 10,
  WELFARE_PAYOUT: 20,
  SPACE_TRAVEL: 30,
  WELFARE_DONATION: 38,
  GOLDEN_KEY: [2, 5, 12, 16, 22, 32],
} as const;

// ───────────────────────────────────────────────────────────────
// 헬퍼 함수
// ───────────────────────────────────────────────────────────────
export function getPropertyByTileIndex(index: number): PropertySpec | null {
  const tile = BOARD_TILES[index];
  if (!tile?.propertyId) return null;
  return PROPERTY_SPECS[tile.propertyId] ?? null;
}

export function getPropertyById(id: string): PropertySpec | null {
  return PROPERTY_SPECS[id] ?? null;
}

export function getPropertiesByColorGroup(colorGroup: string): PropertySpec[] {
  const ids = COLOR_GROUPS[colorGroup] ?? [];
  return ids.map(id => PROPERTY_SPECS[id]).filter(Boolean);
}
