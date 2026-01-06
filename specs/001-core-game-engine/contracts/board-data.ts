import { TileType } from './enums';

export interface BoardTile {
  index: number;
  name: string;
  type: TileType;
  price?: number;
  rentLevels?: number[]; // [Land, Villa, Building, Hotel]
  colorGroup?: string;
}

export const BOARD_DATA: BoardTile[] = [
  { index: 0, name: '출발', type: TileType.START },
  { index: 1, name: '타이베이', type: TileType.PROPERTY, price: 50000, rentLevels: [2000, 10000, 30000, 250000], colorGroup: 'brown' },
  { index: 2, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { index: 3, name: '베이징', type: TileType.PROPERTY, price: 80000, rentLevels: [4000, 20000, 60000, 450000], colorGroup: 'brown' },
  { index: 4, name: '마닐라', type: TileType.PROPERTY, price: 80000, rentLevels: [4000, 20000, 60000, 450000], colorGroup: 'brown' },
  { index: 5, name: '제주도', type: TileType.PROPERTY, price: 200000, rentLevels: [300000], colorGroup: 'special' }, // Special logic? Or just high rent? Assuming simple property for now
  { index: 6, name: '싱가포르', type: TileType.PROPERTY, price: 100000, rentLevels: [6000, 30000, 90000, 550000], colorGroup: 'sky' },
  { index: 7, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { index: 8, name: '카이로', type: TileType.PROPERTY, price: 100000, rentLevels: [6000, 30000, 90000, 550000], colorGroup: 'sky' },
  { index: 9, name: '이스탄불', type: TileType.PROPERTY, price: 120000, rentLevels: [8000, 40000, 120000, 600000], colorGroup: 'sky' },
  { index: 10, name: '무인도', type: TileType.ISLAND },
  { index: 11, name: '아테네', type: TileType.PROPERTY, price: 140000, rentLevels: [10000, 50000, 150000, 750000], colorGroup: 'pink' },
  { index: 12, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { index: 13, name: '코펜하겐', type: TileType.PROPERTY, price: 160000, rentLevels: [12000, 60000, 180000, 900000], colorGroup: 'pink' },
  { index: 14, name: '스톡홀름', type: TileType.PROPERTY, price: 160000, rentLevels: [12000, 60000, 180000, 900000], colorGroup: 'pink' },
  { index: 15, name: '콩코드여객기', type: TileType.VEHICLE, price: 200000, rentLevels: [300000] },
  { index: 16, name: '취리히', type: TileType.PROPERTY, price: 180000, rentLevels: [14000, 70000, 210000, 950000], colorGroup: 'orange' },
  { index: 17, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { index: 18, name: '베를린', type: TileType.PROPERTY, price: 180000, rentLevels: [14000, 70000, 210000, 950000], colorGroup: 'orange' },
  { index: 19, name: '몬트리올', type: TileType.PROPERTY, price: 200000, rentLevels: [16000, 80000, 240000, 1000000], colorGroup: 'orange' },
  { index: 20, name: '사회복지기금접수처', type: TileType.FUND_RECEIVE },
  { index: 21, name: '부에노스아이레스', type: TileType.PROPERTY, price: 220000, rentLevels: [18000, 90000, 270000, 1050000], colorGroup: 'yellow' },
  { index: 22, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { index: 23, name: '상파울루', type: TileType.PROPERTY, price: 240000, rentLevels: [20000, 100000, 300000, 1100000], colorGroup: 'yellow' },
  { index: 24, name: '시드니', type: TileType.PROPERTY, price: 240000, rentLevels: [20000, 100000, 300000, 1100000], colorGroup: 'yellow' },
  { index: 25, name: '부산', type: TileType.PROPERTY, price: 500000, rentLevels: [600000], colorGroup: 'special' },
  { index: 26, name: '하와이', type: TileType.PROPERTY, price: 260000, rentLevels: [22000, 110000, 330000, 1150000], colorGroup: 'green' },
  { index: 27, name: '리스본', type: TileType.PROPERTY, price: 260000, rentLevels: [22000, 110000, 330000, 1150000], colorGroup: 'green' },
  { index: 28, name: '퀸엘리자베스호', type: TileType.VEHICLE, price: 300000, rentLevels: [250000] },
  { index: 29, name: '마드리드', type: TileType.PROPERTY, price: 280000, rentLevels: [24000, 120000, 360000, 1200000], colorGroup: 'green' },
  { index: 30, name: '우주여행', type: TileType.TRAVEL },
  { index: 31, name: '도쿄', type: TileType.PROPERTY, price: 300000, rentLevels: [26000, 130000, 390000, 1270000], colorGroup: 'blue' },
  { index: 32, name: '콜롬비아호', type: TileType.VEHICLE, price: 450000, rentLevels: [400000] },
  { index: 33, name: '파리', type: TileType.PROPERTY, price: 320000, rentLevels: [28000, 150000, 450000, 1400000], colorGroup: 'blue' },
  { index: 34, name: '로마', type: TileType.PROPERTY, price: 320000, rentLevels: [28000, 150000, 450000, 1400000], colorGroup: 'blue' },
  { index: 35, name: '황금열쇠', type: TileType.GOLDEN_KEY },
  { index: 36, name: '런던', type: TileType.PROPERTY, price: 350000, rentLevels: [35000, 170000, 500000, 1500000], colorGroup: 'red' },
  { index: 37, name: '뉴욕', type: TileType.PROPERTY, price: 350000, rentLevels: [35000, 170000, 500000, 1500000], colorGroup: 'red' },
  { index: 38, name: '사회복지기금', type: TileType.FUND_DONATE },
  { index: 39, name: '서울', type: TileType.PROPERTY, price: 1000000, rentLevels: [2000000], colorGroup: 'special' },
];
