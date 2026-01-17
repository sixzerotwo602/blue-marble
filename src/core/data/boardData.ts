/**
 * 부루마블 보드 데이터
 * @description 40칸 보드의 정적 데이터 정의
 */
import { Tile, TileType, createTile, createEmptyBuildings } from '../model/Tile.js';

/**
 * 도시 그룹 정의 (색상별)
 */
export const CITY_GROUPS = {
  ASIA: 'asia',
  MIDDLE_EAST: 'middle-east',
  EUROPE: 'europe',
  AFRICA: 'africa',
  SOUTH_AMERICA: 'south-america',
  OCEANIA: 'oceania',
  NORTH_AMERICA: 'north-america',
  SPECIAL: 'special',
} as const;

/**
 * 40칸 보드 데이터
 * 인덱스: 0=시작, 10=무인도, 20=사회복지기금, 30=우주여행
 */
export const BOARD_DATA: readonly Tile[] = Object.freeze([
  // === Row 0-9 (Bottom) ===
  // 0: 시작
  createTile(0, 'start', '시작'),

  // 1: 타이베이
  createTile(1, 'city', '타이베이', {
    group: CITY_GROUPS.ASIA,
    landPrice: 50000,
    buildingPrice: 50000,
    baseToll: 2000,
  }),

  // 2: 황금열쇠
  createTile(2, 'goldenKey', '황금열쇠'),

  // 3: 홍콩
  createTile(3, 'city', '홍콩', {
    group: CITY_GROUPS.ASIA,
    landPrice: 80000,
    buildingPrice: 50000,
    baseToll: 4000,
  }),

  // 4: 마닐라
  createTile(4, 'city', '마닐라', {
    group: CITY_GROUPS.ASIA,
    landPrice: 80000,
    buildingPrice: 50000,
    baseToll: 4000,
  }),

  // 5: 제주도 (올림픽 개최)
  createTile(5, 'olympicStart', '제주도'),

  // 6: 싱가포르
  createTile(6, 'city', '싱가포르', {
    group: CITY_GROUPS.ASIA,
    landPrice: 100000,
    buildingPrice: 50000,
    baseToll: 6000,
  }),

  // 7: 황금열쇠
  createTile(7, 'goldenKey', '황금열쇠'),

  // 8: 카이로
  createTile(8, 'city', '카이로', {
    group: CITY_GROUPS.MIDDLE_EAST,
    landPrice: 100000,
    buildingPrice: 50000,
    baseToll: 6000,
  }),

  // 9: 이스탄불
  createTile(9, 'city', '이스탄불', {
    group: CITY_GROUPS.MIDDLE_EAST,
    landPrice: 120000,
    buildingPrice: 50000,
    baseToll: 8000,
  }),

  // === Row 10-19 (Left) ===
  // 10: 무인도
  createTile(10, 'island', '무인도'),

  // 11: 아테네
  createTile(11, 'city', '아테네', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 140000,
    buildingPrice: 100000,
    baseToll: 10000,
  }),

  // 12: 황금열쇠
  createTile(12, 'goldenKey', '황금열쇠'),

  // 13: 코펜하겐
  createTile(13, 'city', '코펜하겐', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 160000,
    buildingPrice: 100000,
    baseToll: 12000,
  }),

  // 14: 스톡홀름
  createTile(14, 'city', '스톡홀름', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 160000,
    buildingPrice: 100000,
    baseToll: 12000,
  }),

  // 15: 콩코드 (세금)
  createTile(15, 'tax', '콩코드여객기'),

  // 16: 취리히
  createTile(16, 'city', '취리히', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 180000,
    buildingPrice: 100000,
    baseToll: 14000,
  }),

  // 17: 황금열쇠
  createTile(17, 'goldenKey', '황금열쇠'),

  // 18: 베를린
  createTile(18, 'city', '베를린', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 180000,
    buildingPrice: 100000,
    baseToll: 14000,
  }),

  // 19: 몬트리올
  createTile(19, 'city', '몬트리올', {
    group: CITY_GROUPS.NORTH_AMERICA,
    landPrice: 200000,
    buildingPrice: 100000,
    baseToll: 16000,
  }),

  // === Row 20-29 (Top) ===
  // 20: 사회복지기금
  createTile(20, 'socialFund', '사회복지기금'),

  // 21: 부에노스아이레스
  createTile(21, 'city', '부에노스아이레스', {
    group: CITY_GROUPS.SOUTH_AMERICA,
    landPrice: 220000,
    buildingPrice: 150000,
    baseToll: 18000,
  }),

  // 22: 황금열쇠
  createTile(22, 'goldenKey', '황금열쇠'),

  // 23: 상파울루
  createTile(23, 'city', '상파울루', {
    group: CITY_GROUPS.SOUTH_AMERICA,
    landPrice: 240000,
    buildingPrice: 150000,
    baseToll: 20000,
  }),

  // 24: 시드니
  createTile(24, 'city', '시드니', {
    group: CITY_GROUPS.OCEANIA,
    landPrice: 240000,
    buildingPrice: 150000,
    baseToll: 20000,
  }),

  // 25: 부산 (올림픽)
  createTile(25, 'olympicStart', '부산'),

  // 26: 하와이
  createTile(26, 'city', '하와이', {
    group: CITY_GROUPS.OCEANIA,
    landPrice: 260000,
    buildingPrice: 150000,
    baseToll: 22000,
  }),

  // 27: 황금열쇠
  createTile(27, 'goldenKey', '황금열쇠'),

  // 28: 리스본
  createTile(28, 'city', '리스본', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 260000,
    buildingPrice: 150000,
    baseToll: 22000,
  }),

  // 29: 마드리드
  createTile(29, 'city', '마드리드', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 280000,
    buildingPrice: 150000,
    baseToll: 24000,
  }),

  // === Row 30-39 (Right) ===
  // 30: 우주여행
  createTile(30, 'spaceTravel', '우주여행'),

  // 31: 도쿄
  createTile(31, 'city', '도쿄', {
    group: CITY_GROUPS.ASIA,
    landPrice: 300000,
    buildingPrice: 200000,
    baseToll: 26000,
  }),

  // 32: 황금열쇠
  createTile(32, 'goldenKey', '황금열쇠'),

  // 33: 파리
  createTile(33, 'city', '파리', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 320000,
    buildingPrice: 200000,
    baseToll: 28000,
  }),

  // 34: 로마
  createTile(34, 'city', '로마', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 320000,
    buildingPrice: 200000,
    baseToll: 28000,
  }),

  // 35: 컬럼비아호 (세금)
  createTile(35, 'tax', '컬럼비아호'),

  // 36: 런던
  createTile(36, 'city', '런던', {
    group: CITY_GROUPS.EUROPE,
    landPrice: 350000,
    buildingPrice: 200000,
    baseToll: 35000,
  }),

  // 37: 황금열쇠
  createTile(37, 'goldenKey', '황금열쇠'),

  // 38: 뉴욕
  createTile(38, 'city', '뉴욕', {
    group: CITY_GROUPS.NORTH_AMERICA,
    landPrice: 350000,
    buildingPrice: 200000,
    baseToll: 35000,
  }),

  // 39: 서울
  createTile(39, 'city', '서울', {
    group: CITY_GROUPS.SPECIAL,
    landPrice: 500000,
    buildingPrice: 200000,
    baseToll: 50000,
  }),
]);

/**
 * 보드 칸 수 상수
 */
export const BOARD_SIZE = 40;

/**
 * 특수 칸 인덱스 상수
 */
export const SPECIAL_TILE_INDICES = {
  START: 0,
  ISLAND: 10,
  SOCIAL_FUND: 20,
  SPACE_TRAVEL: 30,
} as const;

/**
 * 타일 ID로 타일 조회
 */
export function getTileById(id: number): Tile | undefined {
  return BOARD_DATA[id];
}

/**
 * 도시 타일만 필터링
 */
export function getCityTiles(): Tile[] {
  return BOARD_DATA.filter(tile => tile.type === 'city');
}

/**
 * 남은 빈 도시 수 계산
 */
export function getVacantCityCount(): number {
  return BOARD_DATA.filter(tile => tile.type === 'city' && tile.ownerId === null).length;
}
