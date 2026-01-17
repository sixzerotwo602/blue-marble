/**
 * 플레이어 타입 정의
 * @description 부루마블 게임의 플레이어 상태를 나타내는 인터페이스
 */
export interface Player {
  /** 플레이어 고유 ID */
  id: string;
  /** 플레이어 이름 */
  name: string;
  /** 현재 보드 위치 (0-39) */
  position: number;
  /** 보유 현금 */
  money: number;
  /** 소유 타일 ID 목록 */
  ownedTileIds: number[];
  /** 파산 여부 */
  isBankrupt: boolean;
  /** 후반전(건설가능) 여부 - 출발지 2회 통과 */
  isSecondHalf: boolean;
  /** 무인도 갇힘 남은 턴 (0이면 자유) */
  jailTurnsRemaining: number;
  /** 더블 연속 횟수 (3이면 무인도행) */
  consecutiveDoubles: number;
  /** AI 여부 */
  isAI: boolean;
  /** 우주여행 목적지 선택 가능 여부 (Story 1.7) */
  canChooseDestination: boolean;
  /** 보관 중인 카드 (Story 3.3) */
  heldCards: ('ISLAND_ESCAPE' | 'TOLL_DISCOUNT')[];
}

/**
 * 플레이어 초기값 생성 팩토리
 */
export function createPlayer(
  id: string,
  name: string,
  initialMoney: number = 4000000,
  isAI: boolean = false
): Player {
  return {
    id,
    name,
    position: 0,
    money: initialMoney,
    ownedTileIds: [],
    isBankrupt: false,
    isSecondHalf: false,
    jailTurnsRemaining: 0,
    consecutiveDoubles: 0,
    isAI,
    canChooseDestination: false,
    heldCards: [],
  };
}
