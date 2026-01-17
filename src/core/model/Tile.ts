/**
 * 타일(칸) 타입 정의
 * @description 부루마블 보드의 각 칸을 나타내는 인터페이스
 */

/** 타일 종류 */
export type TileType =
  | 'start'           // 시작
  | 'city'            // 도시 (구매 가능)
  | 'goldenKey'       // 황금열쇠
  | 'island'          // 무인도
  | 'spaceTravel'     // 우주여행
  | 'socialFund'      // 사회복지기금
  | 'olympicStart'    // 올림픽 개최 (특수)
  | 'tax';            // 세금

/** 건물 상태 */
export interface Buildings {
  /** 별장 수 (최대 2) */
  villa: number;
  /** 빌딩 수 (최대 1) */
  building: number;
  /** 호텔 수 (최대 1) */
  hotel: number;
}

/** 타일 인터페이스 */
export interface Tile {
  /** 타일 인덱스 (0-39) */
  id: number;
  /** 타일 종류 */
  type: TileType;
  /** 타일 이름 (예: 타이베이, 서울 등) */
  name: string;
  /** 지역 그룹 (색상 그룹, 도시만 해당) */
  group?: string;
  /** 토지 가격 (도시만 해당) */
  landPrice?: number;
  /** 건물 가격 (도시만 해당) */
  buildingPrice?: number;
  /** 기본 통행료 (건물 없을 때) - 구버전 호환용 */
  baseToll?: number;
  /** 통행료 단계별 [대지, 별장1, 별장2, 빌딩, 호텔] */
  rentLevels?: [number, number, number, number, number];
  /** 현재 소유자 플레이어 ID (null = 무주지) */
  ownerId: string | null;
  /** 건물 상태 (도시만 해당) */
  buildings: Buildings;
}

/**
 * 빈 건물 상태 생성
 */
export function createEmptyBuildings(): Buildings {
  return {
    villa: 0,
    building: 0,
    hotel: 0,
  };
}

/**
 * 타일 생성 팩토리
 */
export function createTile(
  id: number,
  type: TileType,
  name: string,
  options?: Partial<Pick<Tile, 'group' | 'landPrice' | 'buildingPrice' | 'baseToll'>>
): Tile {
  return {
    id,
    type,
    name,
    group: options?.group,
    landPrice: options?.landPrice,
    buildingPrice: options?.buildingPrice,
    baseToll: options?.baseToll,
    ownerId: null,
    buildings: createEmptyBuildings(),
  };
}
