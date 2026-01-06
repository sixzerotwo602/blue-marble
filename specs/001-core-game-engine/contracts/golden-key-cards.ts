/**
 * Golden Key Cards - 황금열쇠 카드 27종 데이터
 *
 * Feature: 001-core-game-engine
 * Date: 2026-01-04
 * Source: Notion 부루마블 요소 정리 문서 (정식 규칙)
 *
 * 카드 분포 (27종):
 * - 지정 이동: 10종 (37.0%)
 * - 상금: 5종 (18.5%)
 * - 유지비: 3종 (11.1%)
 * - 지출: 3종 (11.1%)
 * - 후퇴/탈출권/면제/반액매출: 각 1종
 * - 기타: 2종 (7.4%)
 *
 * 특수 카드:
 * - 보관 가능 카드: 무인도 탈출권, 우대권(통행료 면제)
 * - 2장 존재하는 카드: 반액 대매출, 우대권, 후퇴(2칸/3칸)
 */

import { CardEffectType } from './enums';

export interface GoldenKeyCardData {
  id: string;
  name: string;
  message: string;
  effectType: CardEffectType;
  /** 이동할 칸 인덱스 (MOVE_TO 타입) */
  destinationIndex?: number;
  /** 뒤로 이동할 칸 수 (MOVE_BACK 타입) */
  moveBackSteps?: number;
  /** 금액 (상금/지출) */
  value?: number;
  /** 건물당 비용 [빌라, 건물, 호텔] (유지비 타입) */
  buildingFees?: [number, number, number];
  /** 보관 가능 여부 */
  canHold?: boolean;
  /** 매각가 (보관 카드용) */
  sellPrice?: number;
  /** 카드 개수 (2장 존재하는 카드) */
  quantity?: number;
}

export const GOLDEN_KEY_CARDS: GoldenKeyCardData[] = [
  // ========================================
  // 반액 매출 (1종, 2장)
  // ========================================
  {
    id: 'card-01',
    name: '반액 대매출',
    message: '보유한 가장 비싼 땅(건물 포함)을 은행에 반값 매각합니다.',
    effectType: CardEffectType.FORCE_SELL,
    quantity: 2,
  },

  // ========================================
  // 유지비 (3종)
  // ========================================
  {
    id: 'card-02',
    name: '정기종합소득세',
    message: '보유 건물당 유지비 지불: 호텔 15만 / 건물 10만 / 빌라 3만',
    effectType: CardEffectType.BUILDING_FEE,
    buildingFees: [30000, 100000, 150000], // [빌라, 건물, 호텔]
  },
  {
    id: 'card-03',
    name: '건물수리비',
    message: '보유 건물당 수리비 지불: 호텔 10만 / 건물 6만 / 빌라 3만',
    effectType: CardEffectType.BUILDING_FEE,
    buildingFees: [30000, 60000, 100000],
  },
  {
    id: 'card-04',
    name: '방범비',
    message: '보유 건물당 방범비 지불: 호텔 5만 / 건물 3만 / 빌라 1만',
    effectType: CardEffectType.BUILDING_FEE,
    buildingFees: [10000, 30000, 50000],
  },

  // ========================================
  // 탈출권/면제 (2종)
  // ========================================
  {
    id: 'card-05',
    name: '무인도 탈출권',
    message: '무인도에서 더블 없이 즉시 탈출 (보관 가능, 매각가 20만)',
    effectType: CardEffectType.ISLAND_ESCAPE,
    canHold: true,
    sellPrice: 200000,
  },
  {
    id: 'card-06',
    name: '우대권',
    message: '1회 통행료 면제 (보관 가능, 거래 가능)',
    effectType: CardEffectType.TOLL_EXEMPT,
    canHold: true,
    quantity: 2,
  },

  // ========================================
  // 후퇴 (1종, 2장)
  // ========================================
  {
    id: 'card-07',
    name: '뒤로 2칸 이동',
    message: '2칸 뒤로 이동합니다.',
    effectType: CardEffectType.MOVE_BACK,
    moveBackSteps: 2,
  },
  {
    id: 'card-08',
    name: '뒤로 3칸 이동',
    message: '3칸 뒤로 이동합니다. (출발 앞에서 뽑으면 서울 재진입 가능)',
    effectType: CardEffectType.MOVE_BACK,
    moveBackSteps: 3,
  },

  // ========================================
  // 지정 이동 (10종)
  // ========================================
  {
    id: 'card-09',
    name: '관광여행 – 제주',
    message: '제주도로 이동합니다.',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 6, // 제주도
  },
  {
    id: 'card-10',
    name: '관광여행 – 부산',
    message: '부산으로 이동합니다.',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 25, // 부산
  },
  {
    id: 'card-11',
    name: '관광여행 – 서울',
    message: '서울로 이동합니다.',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 39, // 서울
  },
  {
    id: 'card-12',
    name: '무인도 이동',
    message: '무인도로 이동합니다. (출발 통과해도 월급 미지급)',
    effectType: CardEffectType.TO_ISLAND,
    destinationIndex: 10, // 무인도
  },
  {
    id: 'card-13',
    name: '사회복지기금 배당',
    message: '사회복지기금 접수로 이동하여 적립금 전액 수령',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 20, // 사회복지기금 접수
  },
  {
    id: 'card-14',
    name: '세계일주 초대권',
    message: '현재 위치에서 한 바퀴 이동 (월급 + 기금 수령)',
    effectType: CardEffectType.WORLD_TOUR,
  },
  {
    id: 'card-15',
    name: '우주여행 초대권',
    message: '컬럼비아호 → 우주여행으로 이동 (이용료 면제)',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 30, // 우주여행
  },
  {
    id: 'card-16',
    name: '유람선 여행',
    message: '퀸 엘리자베스 호 → 베이징으로 이동',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 3, // 베이징
  },
  {
    id: 'card-17',
    name: '항공여행',
    message: '콩코드 여객기 → 타이베이로 이동',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 1, // 타이베이
  },
  {
    id: 'card-18',
    name: '고속도로',
    message: '출발로 이동합니다 (월급 지급).',
    effectType: CardEffectType.MOVE_TO,
    destinationIndex: 0, // 출발
  },

  // ========================================
  // 상금 (5종)
  // ========================================
  {
    id: 'card-19',
    name: '노벨평화상',
    message: '노벨평화상 상금 30만원을 받습니다.',
    effectType: CardEffectType.RECEIVE,
    value: 300000,
  },
  {
    id: 'card-20',
    name: '복권 당첨',
    message: '복권 당첨! 20만원을 받습니다.',
    effectType: CardEffectType.RECEIVE,
    value: 200000,
  },
  {
    id: 'card-21',
    name: '자동차 경주 우승',
    message: '자동차 경주 우승! 10만원을 받습니다.',
    effectType: CardEffectType.RECEIVE,
    value: 100000,
  },
  {
    id: 'card-22',
    name: '장학금 혜택',
    message: '장학금 10만원을 받습니다.',
    effectType: CardEffectType.RECEIVE,
    value: 100000,
  },
  {
    id: 'card-23',
    name: '연금 혜택',
    message: '연금 5만원을 받습니다.',
    effectType: CardEffectType.RECEIVE,
    value: 50000,
  },

  // ========================================
  // 지출 (3종)
  // ========================================
  {
    id: 'card-24',
    name: '해외유학',
    message: '해외유학 비용 10만원을 지불합니다.',
    effectType: CardEffectType.PAY,
    value: 100000,
  },
  {
    id: 'card-25',
    name: '병원비',
    message: '병원비 5만원을 지불합니다.',
    effectType: CardEffectType.PAY,
    value: 50000,
  },
  {
    id: 'card-26',
    name: '과속운전 벌금',
    message: '과속운전 벌금 5만원을 지불합니다.',
    effectType: CardEffectType.PAY,
    value: 50000,
  },

  // ========================================
  // 기타 (2종)
  // ========================================
  {
    id: 'card-27',
    name: '생일축하',
    message: '생일입니다! 모든 플레이어에게 1천원씩 받습니다.',
    effectType: CardEffectType.COLLECT_FROM_ALL,
    value: 1000,
  },
  {
    id: 'card-28',
    name: '장기자랑',
    message: '장기자랑! 타 플레이어가 임의로 상금을 지급합니다.',
    effectType: CardEffectType.SPECIAL,
  },
];

/** 카드 종류별 개수 */
export const CARD_DISTRIBUTION = {
  MOVE_TO: 10,
  RECEIVE: 5,
  BUILDING_FEE: 3,
  PAY: 3,
  MOVE_BACK: 2,
  FORCE_SELL: 1,
  ISLAND_ESCAPE: 1,
  TOLL_EXEMPT: 1,
  WORLD_TOUR: 1,
  TO_ISLAND: 1,
  COLLECT_FROM_ALL: 1,
  SPECIAL: 1,
  TOTAL_TYPES: 27,
};

/** 보관 가능 카드 */
export const HOLDABLE_CARDS = ['card-05', 'card-06'];

/** 2장 존재하는 카드 */
export const DUPLICATE_CARDS = ['card-01', 'card-06', 'card-07', 'card-08'];
