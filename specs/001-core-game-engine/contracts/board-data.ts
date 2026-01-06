/**
 * Board Data - 부루마블 40칸 보드판 데이터
 *
 * Feature: 001-core-game-engine
 * Date: 2026-01-04
 * Source: Notion 부루마블 요소 정리 문서 (정식 규칙)
 *
 * 보드판 구성 (총 40칸):
 * - 모서리칸: 4개 (출발, 무인도, 사회복지기금접수, 우주여행)
 * - 증서칸: 29개 (도시 26 + 탈것 3)
 * - 특수칸: 7개 (황금열쇠 6 + 사회복지기금기부 1)
 */

import { TileType } from './enums';

export interface BoardTileData {
  id: string;
  index: number;
  name: string;
  type: TileType;
  colorGroup?: string;
  price?: number;
  buildingPrices?: [number, number, number]; // [빌라, 건물, 호텔]
  /** [대지, 빌라, 빌라2개, 건물, 호텔] 통행료 */
  rentLevels?: [number, number, number, number, number];
  canBuild?: boolean;
}

export const BOARD_TILES: BoardTileData[] = [
  // ===== 모서리 0: 출발 =====
  { id: 'tile-0', index: 0, name: '출발', type: TileType.START },

  // ===== 1구역 (출발 → 무인도 직전, 하단) =====
  { id: 'tile-1', index: 1, name: '타이베이', type: TileType.PROPERTY, colorGroup: 'asia1', price: 50000, buildingPrices: [50000, 150000, 250000], rentLevels: [2000, 10000, 30000, 90000, 250000], canBuild: true },
  { id: 'tile-2', index: 2, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { id: 'tile-3', index: 3, name: '베이징', type: TileType.PROPERTY, colorGroup: 'asia1', price: 80000, buildingPrices: [50000, 150000, 250000], rentLevels: [4000, 20000, 60000, 180000, 450000], canBuild: true },
  { id: 'tile-4', index: 4, name: '마닐라', type: TileType.PROPERTY, colorGroup: 'asia1', price: 80000, buildingPrices: [50000, 150000, 250000], rentLevels: [4000, 20000, 60000, 180000, 450000], canBuild: true },
  { id: 'tile-5', index: 5, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { id: 'tile-6', index: 6, name: '제주도', type: TileType.PROPERTY, colorGroup: 'korea', price: 200000, rentLevels: [300000, 0, 0, 0, 0], canBuild: false },
  { id: 'tile-7', index: 7, name: '싱가포르', type: TileType.PROPERTY, colorGroup: 'asia2', price: 100000, buildingPrices: [50000, 150000, 250000], rentLevels: [6000, 30000, 90000, 270000, 550000], canBuild: true },
  { id: 'tile-8', index: 8, name: '카이로', type: TileType.PROPERTY, colorGroup: 'asia2', price: 100000, buildingPrices: [50000, 150000, 250000], rentLevels: [6000, 30000, 90000, 270000, 550000], canBuild: true },
  { id: 'tile-9', index: 9, name: '이스탄불', type: TileType.PROPERTY, colorGroup: 'europe1', price: 120000, buildingPrices: [50000, 150000, 250000], rentLevels: [8000, 40000, 100000, 300000, 600000], canBuild: true },

  // ===== 모서리 1: 무인도 =====
  { id: 'tile-10', index: 10, name: '무인도', type: TileType.ISLAND },

  // ===== 2구역 (무인도 → 사회복지기금접수 직전, 좌측) =====
  { id: 'tile-11', index: 11, name: '아테네', type: TileType.PROPERTY, colorGroup: 'europe2', price: 140000, buildingPrices: [100000, 300000, 500000], rentLevels: [10000, 50000, 150000, 450000, 750000], canBuild: true },
  { id: 'tile-12', index: 12, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { id: 'tile-13', index: 13, name: '코펜하겐', type: TileType.PROPERTY, colorGroup: 'europe2', price: 160000, buildingPrices: [100000, 300000, 500000], rentLevels: [12000, 60000, 180000, 500000, 900000], canBuild: true },
  { id: 'tile-14', index: 14, name: '스톡홀름', type: TileType.PROPERTY, colorGroup: 'europe2', price: 160000, buildingPrices: [100000, 300000, 500000], rentLevels: [12000, 60000, 180000, 500000, 900000], canBuild: true },
  { id: 'tile-15', index: 15, name: '콩코드여객기', type: TileType.VEHICLE, price: 200000, rentLevels: [300000, 0, 0, 0, 0], canBuild: false },
  { id: 'tile-16', index: 16, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { id: 'tile-17', index: 17, name: '베른', type: TileType.PROPERTY, colorGroup: 'europe3', price: 180000, buildingPrices: [100000, 300000, 500000], rentLevels: [14000, 70000, 200000, 550000, 950000], canBuild: true },
  { id: 'tile-18', index: 18, name: '베를린', type: TileType.PROPERTY, colorGroup: 'europe3', price: 180000, buildingPrices: [100000, 300000, 500000], rentLevels: [14000, 70000, 200000, 550000, 950000], canBuild: true },
  { id: 'tile-19', index: 19, name: '오타와', type: TileType.PROPERTY, colorGroup: 'america1', price: 200000, buildingPrices: [100000, 300000, 500000], rentLevels: [16000, 80000, 220000, 600000, 1000000], canBuild: true },

  // ===== 모서리 2: 사회복지기금 접수 (수령처) =====
  { id: 'tile-20', index: 20, name: '사회복지기금접수', type: TileType.FUND_RECEIVE },

  // ===== 3구역 (사회복지기금접수 → 우주여행 직전, 상단) =====
  { id: 'tile-21', index: 21, name: '부에노스아이레스', type: TileType.PROPERTY, colorGroup: 'america2', price: 220000, buildingPrices: [150000, 400000, 750000], rentLevels: [18000, 90000, 250000, 700000, 1050000], canBuild: true },
  { id: 'tile-22', index: 22, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { id: 'tile-23', index: 23, name: '상파울루', type: TileType.PROPERTY, colorGroup: 'america2', price: 240000, buildingPrices: [150000, 450000, 750000], rentLevels: [20000, 100000, 300000, 750000, 1100000], canBuild: true },
  { id: 'tile-24', index: 24, name: '시드니', type: TileType.PROPERTY, colorGroup: 'oceania', price: 240000, buildingPrices: [150000, 450000, 750000], rentLevels: [20000, 100000, 300000, 750000, 1100000], canBuild: true },
  { id: 'tile-25', index: 25, name: '부산', type: TileType.PROPERTY, colorGroup: 'korea', price: 500000, rentLevels: [600000, 0, 0, 0, 0], canBuild: false },
  { id: 'tile-26', index: 26, name: '하와이', type: TileType.PROPERTY, colorGroup: 'america3', price: 260000, buildingPrices: [150000, 450000, 750000], rentLevels: [22000, 110000, 330000, 800000, 1150000], canBuild: true },
  { id: 'tile-27', index: 27, name: '리스본', type: TileType.PROPERTY, colorGroup: 'europe4', price: 260000, buildingPrices: [150000, 450000, 750000], rentLevels: [22000, 110000, 330000, 800000, 1150000], canBuild: true },
  { id: 'tile-28', index: 28, name: '퀸엘리자베스호', type: TileType.VEHICLE, price: 300000, rentLevels: [250000, 0, 0, 0, 0], canBuild: false },
  { id: 'tile-29', index: 29, name: '마드리드', type: TileType.PROPERTY, colorGroup: 'europe4', price: 280000, buildingPrices: [150000, 450000, 750000], rentLevels: [24000, 120000, 360000, 850000, 1200000], canBuild: true },

  // ===== 모서리 3: 우주여행 =====
  { id: 'tile-30', index: 30, name: '우주여행', type: TileType.TRAVEL },

  // ===== 4구역 (우주여행 → 출발 직전, 우측) =====
  { id: 'tile-31', index: 31, name: '도쿄', type: TileType.PROPERTY, colorGroup: 'asia3', price: 300000, buildingPrices: [200000, 600000, 1000000], rentLevels: [26000, 130000, 390000, 900000, 1270000], canBuild: true },
  { id: 'tile-32', index: 32, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { id: 'tile-33', index: 33, name: '컬럼비아호', type: TileType.VEHICLE, price: 450000, rentLevels: [300000, 0, 0, 0, 0], canBuild: false },
  { id: 'tile-34', index: 34, name: '파리', type: TileType.PROPERTY, colorGroup: 'europe5', price: 320000, buildingPrices: [200000, 600000, 1000000], rentLevels: [28000, 150000, 450000, 1000000, 1400000], canBuild: true },
  { id: 'tile-35', index: 35, name: '로마', type: TileType.PROPERTY, colorGroup: 'europe5', price: 320000, buildingPrices: [200000, 600000, 1000000], rentLevels: [28000, 150000, 450000, 1000000, 1400000], canBuild: true },
  { id: 'tile-36', index: 36, name: '런던', type: TileType.PROPERTY, colorGroup: 'europe5', price: 350000, buildingPrices: [200000, 600000, 1000000], rentLevels: [35000, 170000, 500000, 1100000, 1500000], canBuild: true },
  { id: 'tile-37', index: 37, name: '뉴욕', type: TileType.PROPERTY, colorGroup: 'america4', price: 350000, buildingPrices: [200000, 600000, 1000000], rentLevels: [35000, 170000, 500000, 1100000, 1500000], canBuild: true },
  { id: 'tile-38', index: 38, name: '사회복지기금기부', type: TileType.FUND_DONATE },
  { id: 'tile-39', index: 39, name: '서울', type: TileType.PROPERTY, colorGroup: 'korea', price: 1000000, rentLevels: [2000000, 0, 0, 0, 0], canBuild: false },
];

/** 특수 칸 인덱스 */
export const SPECIAL_TILES = {
  START: 0,
  ISLAND: 10,
  FUND_RECEIVE: 20,  // 사회복지기금 접수 (수령)
  TRAVEL: 30,        // 우주여행
  FUND_DONATE: 38,   // 사회복지기금 기부
  GOLDEN_KEY: [2, 5, 12, 16, 22, 32],
  VEHICLES: [15, 28, 33],  // 콩코드, 퀸엘리자베스, 컬럼비아
};

/** 건설 불가 부동산 칸 */
export const NO_BUILD_PROPERTIES = [6, 25, 39]; // 제주도, 부산, 서울

/** 사회복지기금 기부 금액 */
export const FUND_DONATE_AMOUNT = 150000;

/** 우주여행 이용료 */
export const TRAVEL_FEE = 200000;

/** 무인도 탈출 비용 */
export const ISLAND_ESCAPE_FEE = 50000;

/** 출발 통과 월급 */
export const SALARY = 200000;

/** 총 칸 수 */
export const TOTAL_TILES = 40;

/** 총 증서 수 */
export const TOTAL_DEEDS = 29;
