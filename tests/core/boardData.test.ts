/**
 * Board Data Tests
 * @description Story 1.2 - 40칸 보드 데이터 테스트
 */
import { describe, it, expect } from 'vitest';
import {
  BOARD_DATA,
  BOARD_SIZE,
  SPECIAL_TILE_INDICES,
  getTileById,
  getCityTiles,
  getVacantCityCount,
} from '../../src/core/data/boardData.js';

describe('Board Data - Story 1.2', () => {
  describe('AC1: BOARD_DATA는 40개의 Tile 객체를 반환해야 한다', () => {
    it('BOARD_DATA의 길이는 40이어야 한다', () => {
      expect(BOARD_DATA).toHaveLength(40);
      expect(BOARD_SIZE).toBe(40);
    });

    it('모든 타일은 고유한 id를 가져야 한다', () => {
      const ids = BOARD_DATA.map(tile => tile.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(40);
    });

    it('타일 id는 0부터 39까지 순차적이어야 한다', () => {
      BOARD_DATA.forEach((tile, index) => {
        expect(tile.id).toBe(index);
      });
    });
  });

  describe('AC2: 특수 칸 위치 검증', () => {
    it('인덱스 0은 "시작"이어야 한다', () => {
      const startTile = BOARD_DATA[0];
      expect(startTile.name).toBe('시작');
      expect(startTile.type).toBe('start');
      expect(SPECIAL_TILE_INDICES.START).toBe(0);
    });

    it('인덱스 10은 "무인도"이어야 한다', () => {
      const islandTile = BOARD_DATA[10];
      expect(islandTile.name).toBe('무인도');
      expect(islandTile.type).toBe('island');
      expect(SPECIAL_TILE_INDICES.ISLAND).toBe(10);
    });

    it('인덱스 20은 "사회복지기금"이어야 한다', () => {
      const socialFundTile = BOARD_DATA[20];
      expect(socialFundTile.name).toBe('사회복지기금');
      expect(socialFundTile.type).toBe('socialFund');
      expect(SPECIAL_TILE_INDICES.SOCIAL_FUND).toBe(20);
    });

    it('인덱스 30은 "우주여행"이어야 한다', () => {
      const spaceTravelTile = BOARD_DATA[30];
      expect(spaceTravelTile.name).toBe('우주여행');
      expect(spaceTravelTile.type).toBe('spaceTravel');
      expect(SPECIAL_TILE_INDICES.SPACE_TRAVEL).toBe(30);
    });
  });

  describe('AC3: 도시 타일 속성 검증', () => {
    it('도시 타일은 landPrice, buildingPrice, baseToll, group을 가져야 한다', () => {
      const cityTiles = getCityTiles();

      cityTiles.forEach(tile => {
        expect(tile.type).toBe('city');
        expect(tile.landPrice).toBeDefined();
        expect(tile.landPrice).toBeGreaterThan(0);
        expect(tile.buildingPrice).toBeDefined();
        expect(tile.buildingPrice).toBeGreaterThan(0);
        expect(tile.baseToll).toBeDefined();
        expect(tile.baseToll).toBeGreaterThan(0);
        expect(tile.group).toBeDefined();
      });
    });

    it('초기 상태에서 모든 도시는 소유자가 없어야 한다', () => {
      const cityTiles = getCityTiles();

      cityTiles.forEach(tile => {
        expect(tile.ownerId).toBeNull();
      });
    });

    it('getVacantCityCount는 초기에 모든 도시 수를 반환해야 한다', () => {
      const cityCount = getCityTiles().length;
      const vacantCount = getVacantCityCount();

      expect(vacantCount).toBe(cityCount);
      expect(vacantCount).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    it('getTileById는 올바른 타일을 반환해야 한다', () => {
      const tile = getTileById(39);
      expect(tile?.name).toBe('서울');
      expect(tile?.type).toBe('city');
    });

    it('getTileById는 존재하지 않는 id에 대해 undefined를 반환해야 한다', () => {
      const tile = getTileById(100);
      expect(tile).toBeUndefined();
    });
  });

  describe('Board Layout Validation', () => {
    it('황금열쇠 칸이 여러 개 있어야 한다', () => {
      const goldenKeyTiles = BOARD_DATA.filter(t => t.type === 'goldenKey');
      expect(goldenKeyTiles.length).toBeGreaterThanOrEqual(6);
    });

    it('세금 칸이 존재해야 한다', () => {
      const taxTiles = BOARD_DATA.filter(t => t.type === 'tax');
      expect(taxTiles.length).toBeGreaterThanOrEqual(1);
    });

    it('서울은 가장 비싼 도시여야 한다', () => {
      const cityTiles = getCityTiles();
      const maxPrice = Math.max(...cityTiles.map(t => t.landPrice ?? 0));
      const seoul = getTileById(39);

      expect(seoul?.landPrice).toBe(maxPrice);
    });
  });
});
