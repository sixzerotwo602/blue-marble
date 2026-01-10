// 40칸 보드판 데이터 (contracts/board-data.ts 기반, 합산 방식 rentTable 적용)
// 색상 그룹: 1~4구역별 건설 가능 땅만 (건설 불가 땅은 독점 제외)

import { BoardTileData, TileType, RentTable } from '../types/index.js';

/**
 * rentLevels [대지, 별장1, 별장2, 빌딩, 호텔]을 RentTable로 변환
 * 합산 방식: 별장2는 별장1 추가분으로 계산
 */
function convertToRentTable(rentLevels: [number, number, number, number, number]): RentTable {
  return {
    land: rentLevels[0],
    villa1: rentLevels[1] - rentLevels[0],      // 별장 1개 추가분
    villa2: rentLevels[2] - rentLevels[1],      // 별장 2개 추가분 (기존 별장1 위에 추가)
    building: rentLevels[3] - rentLevels[0],    // 빌딩 (대지 위에 추가)
    hotel: rentLevels[4] - rentLevels[0],       // 호텔 (대지 위에 추가)
  };
}

// 원본 rentLevels 데이터 (contracts/board-data.ts에서 가져옴)
const RENT_LEVELS_DATA: Record<string, [number, number, number, number, number]> = {
  'tile-1': [2000, 10000, 30000, 90000, 250000],       // 타이베이
  'tile-3': [4000, 20000, 60000, 180000, 450000],     // 베이징
  'tile-4': [4000, 20000, 60000, 180000, 450000],     // 마닐라
  'tile-6': [300000, 0, 0, 0, 0],                       // 제주도 (건설 불가)
  'tile-7': [6000, 30000, 90000, 270000, 550000],     // 싱가포르
  'tile-8': [6000, 30000, 90000, 270000, 550000],     // 카이로
  'tile-9': [8000, 40000, 100000, 300000, 600000],    // 이스탄불
  'tile-11': [10000, 50000, 150000, 450000, 750000],  // 아테네
  'tile-13': [12000, 60000, 180000, 500000, 900000],  // 코펜하겐
  'tile-14': [12000, 60000, 180000, 500000, 900000],  // 스톡홀름
  'tile-15': [300000, 0, 0, 0, 0],                     // 콩코드여객기
  'tile-17': [14000, 70000, 200000, 550000, 950000],  // 베른
  'tile-18': [14000, 70000, 200000, 550000, 950000],  // 베를린
  'tile-19': [16000, 80000, 220000, 600000, 1000000], // 오타와
  'tile-21': [18000, 90000, 250000, 700000, 1050000], // 부에노스아이레스
  'tile-23': [20000, 100000, 300000, 750000, 1100000],// 상파울루
  'tile-24': [20000, 100000, 300000, 750000, 1100000],// 시드니
  'tile-25': [600000, 0, 0, 0, 0],                     // 부산 (건설 불가)
  'tile-26': [22000, 110000, 330000, 800000, 1150000],// 하와이
  'tile-27': [22000, 110000, 330000, 800000, 1150000],// 리스본
  'tile-28': [250000, 0, 0, 0, 0],                     // 퀸엘리자베스호
  'tile-29': [24000, 120000, 360000, 850000, 1200000],// 마드리드
  'tile-31': [26000, 130000, 390000, 900000, 1270000],// 도쿄
  'tile-33': [300000, 0, 0, 0, 0],                     // 컬럼비아호
  'tile-34': [28000, 150000, 450000, 1000000, 1400000],// 파리
  'tile-35': [28000, 150000, 450000, 1000000, 1400000],// 로마
  'tile-36': [35000, 170000, 500000, 1100000, 1500000],// 런던
  'tile-37': [35000, 170000, 500000, 1100000, 1500000],// 뉴욕
  'tile-39': [2000000, 0, 0, 0, 0],                    // 서울 (건설 불가)
};

/**
 * 색상 그룹 규칙:
 * - 1구역: zone1 (타이베이, 베이징, 마닐라, 싱가포르, 카이로, 이스탄불 - 건설 가능 6개)
 * - 2구역: zone2 (아테네, 코펜하겐, 스톡홀름, 베른, 베를린, 오타와 - 건설 가능 6개)
 * - 3구역: zone3 (부에노스아이레스, 상파울루, 시드니, 하와이, 리스본, 마드리드 - 건설 가능 6개)
 * - 4구역: zone4 (도쿄, 파리, 로마, 런던, 뉴욕 - 건설 가능 5개)
 * - 건설 불가: undefined (제주도, 부산, 서울, 탈것들) - 독점 비적용
 */

/** 40칸 보드판 데이터 */
export const BOARD_TILES: BoardTileData[] = [
  // ===== 0: 출발 =====
  { id: 'tile-0', index: 0, name: '출발', type: TileType.START, canBuild: false },

  // ===== 1~9: 1구역 =====
  { id: 'tile-1', index: 1, name: '타이베이', type: TileType.PROPERTY, colorGroup: 'zone1', price: 50000, buildingPrices: { villa: 50000, building: 150000, hotel: 250000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-1']), canBuild: true },
  { id: 'tile-2', index: 2, name: '황금열쇠', type: TileType.GOLDEN_KEY, canBuild: false },
  { id: 'tile-3', index: 3, name: '베이징', type: TileType.PROPERTY, colorGroup: 'zone1', price: 80000, buildingPrices: { villa: 50000, building: 150000, hotel: 250000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-3']), canBuild: true },
  { id: 'tile-4', index: 4, name: '마닐라', type: TileType.PROPERTY, colorGroup: 'zone1', price: 80000, buildingPrices: { villa: 50000, building: 150000, hotel: 250000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-4']), canBuild: true },
  { id: 'tile-5', index: 5, name: '황금열쇠', type: TileType.GOLDEN_KEY, canBuild: false },
  // 제주도: 건설 불가 → colorGroup 없음 (독점 비적용)
  { id: 'tile-6', index: 6, name: '제주도', type: TileType.PROPERTY, price: 200000, rentTable: { land: 300000, villa1: 0, villa2: 0, building: 0, hotel: 0 }, canBuild: false },
  { id: 'tile-7', index: 7, name: '싱가포르', type: TileType.PROPERTY, colorGroup: 'zone1', price: 100000, buildingPrices: { villa: 50000, building: 150000, hotel: 250000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-7']), canBuild: true },
  { id: 'tile-8', index: 8, name: '카이로', type: TileType.PROPERTY, colorGroup: 'zone1', price: 100000, buildingPrices: { villa: 50000, building: 150000, hotel: 250000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-8']), canBuild: true },
  { id: 'tile-9', index: 9, name: '이스탄불', type: TileType.PROPERTY, colorGroup: 'zone1', price: 120000, buildingPrices: { villa: 50000, building: 150000, hotel: 250000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-9']), canBuild: true },

  // ===== 10: 무인도 =====
  { id: 'tile-10', index: 10, name: '무인도', type: TileType.ISLAND, canBuild: false },

  // ===== 11~19: 2구역 =====
  { id: 'tile-11', index: 11, name: '아테네', type: TileType.PROPERTY, colorGroup: 'zone2', price: 140000, buildingPrices: { villa: 100000, building: 300000, hotel: 500000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-11']), canBuild: true },
  { id: 'tile-12', index: 12, name: '황금열쇠', type: TileType.GOLDEN_KEY, canBuild: false },
  { id: 'tile-13', index: 13, name: '코펜하겐', type: TileType.PROPERTY, colorGroup: 'zone2', price: 160000, buildingPrices: { villa: 100000, building: 300000, hotel: 500000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-13']), canBuild: true },
  { id: 'tile-14', index: 14, name: '스톡홀름', type: TileType.PROPERTY, colorGroup: 'zone2', price: 160000, buildingPrices: { villa: 100000, building: 300000, hotel: 500000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-14']), canBuild: true },
  // 콩코드여객기: VEHICLE → colorGroup 없음 (독점 비적용)
  { id: 'tile-15', index: 15, name: '콩코드여객기', type: TileType.VEHICLE, price: 200000, rentTable: { land: 300000, villa1: 0, villa2: 0, building: 0, hotel: 0 }, canBuild: false },
  { id: 'tile-16', index: 16, name: '황금열쇠', type: TileType.GOLDEN_KEY, canBuild: false },
  { id: 'tile-17', index: 17, name: '베른', type: TileType.PROPERTY, colorGroup: 'zone2', price: 180000, buildingPrices: { villa: 100000, building: 300000, hotel: 500000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-17']), canBuild: true },
  { id: 'tile-18', index: 18, name: '베를린', type: TileType.PROPERTY, colorGroup: 'zone2', price: 180000, buildingPrices: { villa: 100000, building: 300000, hotel: 500000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-18']), canBuild: true },
  { id: 'tile-19', index: 19, name: '오타와', type: TileType.PROPERTY, colorGroup: 'zone2', price: 200000, buildingPrices: { villa: 100000, building: 300000, hotel: 500000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-19']), canBuild: true },

  // ===== 20: 사회복지기금 접수 =====
  { id: 'tile-20', index: 20, name: '사회복지기금접수', type: TileType.FUND_RECEIVE, canBuild: false },

  // ===== 21~29: 3구역 =====
  { id: 'tile-21', index: 21, name: '부에노스아이레스', type: TileType.PROPERTY, colorGroup: 'zone3', price: 220000, buildingPrices: { villa: 150000, building: 400000, hotel: 750000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-21']), canBuild: true },
  { id: 'tile-22', index: 22, name: '황금열쇠', type: TileType.GOLDEN_KEY, canBuild: false },
  { id: 'tile-23', index: 23, name: '상파울루', type: TileType.PROPERTY, colorGroup: 'zone3', price: 240000, buildingPrices: { villa: 150000, building: 450000, hotel: 750000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-23']), canBuild: true },
  { id: 'tile-24', index: 24, name: '시드니', type: TileType.PROPERTY, colorGroup: 'zone3', price: 240000, buildingPrices: { villa: 150000, building: 450000, hotel: 750000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-24']), canBuild: true },
  // 부산: 건설 불가 → colorGroup 없음 (독점 비적용)
  { id: 'tile-25', index: 25, name: '부산', type: TileType.PROPERTY, price: 500000, rentTable: { land: 600000, villa1: 0, villa2: 0, building: 0, hotel: 0 }, canBuild: false },
  { id: 'tile-26', index: 26, name: '하와이', type: TileType.PROPERTY, colorGroup: 'zone3', price: 260000, buildingPrices: { villa: 150000, building: 450000, hotel: 750000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-26']), canBuild: true },
  { id: 'tile-27', index: 27, name: '리스본', type: TileType.PROPERTY, colorGroup: 'zone3', price: 260000, buildingPrices: { villa: 150000, building: 450000, hotel: 750000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-27']), canBuild: true },
  // 퀸엘리자베스호: VEHICLE → colorGroup 없음 (독점 비적용)
  { id: 'tile-28', index: 28, name: '퀸엘리자베스호', type: TileType.VEHICLE, price: 300000, rentTable: { land: 250000, villa1: 0, villa2: 0, building: 0, hotel: 0 }, canBuild: false },
  { id: 'tile-29', index: 29, name: '마드리드', type: TileType.PROPERTY, colorGroup: 'zone3', price: 280000, buildingPrices: { villa: 150000, building: 450000, hotel: 750000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-29']), canBuild: true },

  // ===== 30: 우주여행 =====
  { id: 'tile-30', index: 30, name: '우주여행', type: TileType.TRAVEL, canBuild: false },

  // ===== 31~39: 4구역 =====
  { id: 'tile-31', index: 31, name: '도쿄', type: TileType.PROPERTY, colorGroup: 'zone4', price: 300000, buildingPrices: { villa: 200000, building: 600000, hotel: 1000000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-31']), canBuild: true },
  { id: 'tile-32', index: 32, name: '황금열쇠', type: TileType.GOLDEN_KEY, canBuild: false },
  // 컬럼비아호: VEHICLE → colorGroup 없음 (독점 비적용)
  { id: 'tile-33', index: 33, name: '컬럼비아호', type: TileType.VEHICLE, price: 450000, rentTable: { land: 300000, villa1: 0, villa2: 0, building: 0, hotel: 0 }, canBuild: false },
  { id: 'tile-34', index: 34, name: '파리', type: TileType.PROPERTY, colorGroup: 'zone4', price: 320000, buildingPrices: { villa: 200000, building: 600000, hotel: 1000000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-34']), canBuild: true },
  { id: 'tile-35', index: 35, name: '로마', type: TileType.PROPERTY, colorGroup: 'zone4', price: 320000, buildingPrices: { villa: 200000, building: 600000, hotel: 1000000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-35']), canBuild: true },
  { id: 'tile-36', index: 36, name: '런던', type: TileType.PROPERTY, colorGroup: 'zone4', price: 350000, buildingPrices: { villa: 200000, building: 600000, hotel: 1000000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-36']), canBuild: true },
  { id: 'tile-37', index: 37, name: '뉴욕', type: TileType.PROPERTY, colorGroup: 'zone4', price: 350000, buildingPrices: { villa: 200000, building: 600000, hotel: 1000000 }, rentTable: convertToRentTable(RENT_LEVELS_DATA['tile-37']), canBuild: true },
  { id: 'tile-38', index: 38, name: '사회복지기금기부', type: TileType.FUND_DONATE, canBuild: false },
  // 서울: 건설 불가 → colorGroup 없음 (독점 비적용)
  { id: 'tile-39', index: 39, name: '서울', type: TileType.PROPERTY, price: 1000000, rentTable: { land: 2000000, villa1: 0, villa2: 0, building: 0, hotel: 0 }, canBuild: false },
];

/** 특수 칸 인덱스 */
export const SPECIAL_TILES = {
  START: 0,
  ISLAND: 10,
  FUND_RECEIVE: 20,
  TRAVEL: 30,
  FUND_DONATE: 38,
  GOLDEN_KEY: [2, 5, 12, 16, 22, 32],
  VEHICLES: [15, 28, 33],
  NO_BUILD_PROPERTIES: [6, 25, 39], // 제주도, 부산, 서울 (독점 비적용)
};

/**
 * 색상 그룹 정보
 * - zone1 (1구역): 타이베이, 베이징, 마닐라, 싱가포르, 카이로, 이스탄불 (6개)
 * - zone2 (2구역): 아테네, 코펜하겐, 스톡홀름, 베른, 베를린, 오타와 (6개)
 * - zone3 (3구역): 부에노스아이레스, 상파울루, 시드니, 하와이, 리스본, 마드리드 (6개)
 * - zone4 (4구역): 도쿄, 파리, 로마, 런던, 뉴욕 (5개)
 */
export const COLOR_GROUPS = {
  zone1: ['tile-1', 'tile-3', 'tile-4', 'tile-7', 'tile-8', 'tile-9'],
  zone2: ['tile-11', 'tile-13', 'tile-14', 'tile-17', 'tile-18', 'tile-19'],
  zone3: ['tile-21', 'tile-23', 'tile-24', 'tile-26', 'tile-27', 'tile-29'],
  zone4: ['tile-31', 'tile-34', 'tile-35', 'tile-36', 'tile-37'],
};

/** ID로 타일 데이터 찾기 */
export function getTileDataById(id: string): BoardTileData | undefined {
  return BOARD_TILES.find(t => t.id === id);
}

/** 인덱스로 타일 데이터 찾기 */
export function getTileDataByIndex(index: number): BoardTileData | undefined {
  return BOARD_TILES[index];
}

/** 색상 그룹에 속한 타일 ID 목록 */
export function getTilesByColorGroup(colorGroup: string): string[] {
  return BOARD_TILES
    .filter(t => t.colorGroup === colorGroup)
    .map(t => t.id);
}
