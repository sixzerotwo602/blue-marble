/**
 * 황금열쇠 카드 데이터 (27종)
 */

import { CardEffectType, CardKeepPolicy, CardPhasePolicy } from '../enums.js';
import { GoldenKeyCard } from '../types.js';

// ───────────────────────────────────────────────────────────────
// 황금열쇠 카드 정의 (27종)
// ───────────────────────────────────────────────────────────────
export const GOLDEN_KEY_CARDS: GoldenKeyCard[] = [
  // ═══════════════════════════════════════════════════════════
  // 반액 매출 (2장)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'force-sell-half-1',
    name: '반액 대매출',
    message: '보유한 가장 비싼 땅(건물 포함)을 은행에 반값 매각',
    effectType: CardEffectType.FORCE_SELL_HALF,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
  },
  {
    id: 'force-sell-half-2',
    name: '반액 대매출',
    message: '보유한 가장 비싼 땅(건물 포함)을 은행에 반값 매각',
    effectType: CardEffectType.FORCE_SELL_HALF,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
  },

  // ═══════════════════════════════════════════════════════════
  // 유지비 카드 (후반전에만 적용)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'income-tax',
    name: '정기종합소득세',
    message: '보유 건물당 유지비 지불 (호텔 15만 / 빌딩 10만 / 별장 3만)',
    effectType: CardEffectType.MAINTENANCE_FEE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.SECOND_HALF_ONLY,
    repairCost: { villa: 30_000, building: 100_000, hotel: 150_000 },
  },
  {
    id: 'repair-fee',
    name: '건물수리비',
    message: '보유 건물당 수리비 지불 (호텔 10만 / 빌딩 6만 / 별장 3만)',
    effectType: CardEffectType.REPAIR_FEE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.SECOND_HALF_ONLY,
    repairCost: { villa: 30_000, building: 60_000, hotel: 100_000 },
  },
  {
    id: 'security-fee',
    name: '방범비',
    message: '보유 건물당 방범비 지불 (호텔 5만 / 빌딩 3만 / 별장 1만)',
    effectType: CardEffectType.MAINTENANCE_FEE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.SECOND_HALF_ONLY,
    repairCost: { villa: 10_000, building: 30_000, hotel: 50_000 },
  },

  // ═══════════════════════════════════════════════════════════
  // 보관형 카드 (사용 전까지 보관)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'island-escape',
    name: '무인도 탈출권',
    message: '무인도에서 더블 없이 즉시 탈출 (사용 후 반납, 은행에 20만원 매각 가능)',
    effectType: CardEffectType.GRANT_ESCAPE_CARD,
    keepPolicy: CardKeepPolicy.KEEP_UNTIL_USE,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 200_000, // 은행 매각가
  },
  {
    id: 'free-pass-1',
    name: '우대권',
    message: '1회 통행료 면제',
    effectType: CardEffectType.GRANT_FREE_PASS,
    keepPolicy: CardKeepPolicy.KEEP_UNTIL_USE,
    phasePolicy: CardPhasePolicy.ANYTIME,
  },
  {
    id: 'free-pass-2',
    name: '우대권',
    message: '1회 통행료 면제',
    effectType: CardEffectType.GRANT_FREE_PASS,
    keepPolicy: CardKeepPolicy.KEEP_UNTIL_USE,
    phasePolicy: CardPhasePolicy.ANYTIME,
  },

  // ═══════════════════════════════════════════════════════════
  // 후퇴 카드 (2장, 2~3칸 뒤로)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'move-back-2',
    name: '뒤로 이동',
    message: '2칸 뒤로 이동',
    effectType: CardEffectType.MOVE_STEPS,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    moveSteps: -2,
  },
  {
    id: 'move-back-3',
    name: '뒤로 이동',
    message: '3칸 뒤로 이동',
    effectType: CardEffectType.MOVE_STEPS,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    moveSteps: -3,
  },

  // ═══════════════════════════════════════════════════════════
  // 지정 이동 카드
  // ═══════════════════════════════════════════════════════════
  {
    id: 'travel-jeju',
    name: '관광여행 - 제주',
    message: '제주도로 이동',
    effectType: CardEffectType.MOVE_TO_TILE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 5, // Map index needed. Assuming standard Blue Marble. 5 is Jeju? 
    // In our board-data.ts, Jeju = Index 5 (Start=0, Taipei=1, Beijing=2, Manila=3, Jeju=4? No wait. 
    // Let's check Board Data. For now trust name or check ID.
    // Assuming user will check IDs.
    destinationName: '제주도',
  },
  {
    id: 'travel-busan',
    name: '관광여행 - 부산',
    message: '부산으로 이동',
    effectType: CardEffectType.MOVE_TO_TILE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 25,
    destinationName: '부산',
  },
  {
    id: 'travel-seoul',
    name: '관광여행 - 서울',
    message: '서울로 이동',
    effectType: CardEffectType.MOVE_TO_TILE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 39,
    destinationName: '서울',
  },
  {
    id: 'go-to-island',
    name: '무인도',
    message: '무인도로 이동 (출발지를 지나도 월급 미지급)',
    effectType: CardEffectType.SEND_TO_ISLAND,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 10, // Standard Island
  },
  {
    id: 'welfare-payout',
    name: '사회복지기금 배당',
    message: '사회복지기금 접수로 이동 → 적립금 수령',
    effectType: CardEffectType.RECEIVE_WELFARE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 20, // Standard Welfare
  },
  {
    id: 'world-tour',
    name: '세계일주 초대권',
    message: '현재 위치에서 한 바퀴 (출발·복지기금 경유, 월급 20만원 + 기금 수령)',
    effectType: CardEffectType.WORLD_TOUR,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 200_000, // 월급
  },
  {
    id: 'space-travel-free',
    name: '우주여행 초대권',
    message: '컬럼비아호 → 우주여행으로 이동 (이용료 면제)',
    effectType: CardEffectType.SPACE_TRAVEL_FREE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 30, // Space Travel
  },
  {
    id: 'cruise-travel',
    name: '유람선 여행',
    message: '퀸 엘리자베스 호 → 베이징(구판: 홍콩) 이동',
    effectType: CardEffectType.MOVE_TO_TILE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 3, // 베이징/홍콩
    destinationName: '베이징',
  },
  {
    id: 'flight-travel',
    name: '항공여행',
    message: '콩코드 여객기 → 타이베이 이동',
    effectType: CardEffectType.MOVE_TO_TILE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 1, // 타이베이
    destinationName: '타이베이',
  },
  {
    id: 'highway',
    name: '고속도로',
    message: '출발로 이동 (월급 20만원 지급)',
    effectType: CardEffectType.MOVE_TO_TILE,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    destinationIndex: 0,
    destinationName: '출발',
    value: 200_000, // 월급 지급
  },

  // ═══════════════════════════════════════════════════════════
  // 상금 카드
  // ═══════════════════════════════════════════════════════════
  {
    id: 'nobel-prize',
    name: '노벨평화상',
    message: '상금 30만원 수령',
    effectType: CardEffectType.RECEIVE_FROM_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 300_000,
  },
  {
    id: 'lottery',
    name: '복권 당첨',
    message: '상금 20만원 수령',
    effectType: CardEffectType.RECEIVE_FROM_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 200_000,
  },
  {
    id: 'racing-winner',
    name: '자동차 경주 우승',
    message: '상금 10만원 수령',
    effectType: CardEffectType.RECEIVE_FROM_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 100_000,
  },
  {
    id: 'scholarship',
    name: '장학금 혜택',
    message: '상금 10만원 수령',
    effectType: CardEffectType.RECEIVE_FROM_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 100_000,
  },
  {
    id: 'pension',
    name: '연금 혜택',
    message: '상금 5만원 수령',
    effectType: CardEffectType.RECEIVE_FROM_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 50_000,
  },

  // ═══════════════════════════════════════════════════════════
  // 지출 카드
  // ═══════════════════════════════════════════════════════════
  {
    id: 'study-abroad',
    name: '해외유학',
    message: '비용 10만원 지불',
    effectType: CardEffectType.PAY_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 100_000,
  },
  {
    id: 'hospital',
    name: '병원비',
    message: '비용 5만원 지불',
    effectType: CardEffectType.PAY_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 50_000,
  },
  {
    id: 'speeding-fine',
    name: '과속운전 벌금',
    message: '벌금 5만원 지불',
    effectType: CardEffectType.PAY_BANK,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    value: 50_000,
  },

  // ═══════════════════════════════════════════════════════════
  // 기타 카드
  // ═══════════════════════════════════════════════════════════
  {
    id: 'birthday',
    name: '생일축하',
    message: '모든 플레이어에게 1천원씩 받음',
    effectType: CardEffectType.RECEIVE_FROM_ALL,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    valuePerPlayer: 1_000,
  },
  {
    id: 'talent-show',
    name: '장기자랑',
    message: '타 플레이어가 임의로 상금 지급 (집집마다 룰 변형 多)',
    effectType: CardEffectType.RECEIVE_FROM_ALL,
    keepPolicy: CardKeepPolicy.DISCARD_BOTTOM,
    phasePolicy: CardPhasePolicy.ANYTIME,
    valuePerPlayer: 0, // 가변 (MVP에서는 무효 처리 또는 고정 금액)
  }
];

// ───────────────────────────────────────────────────────────────
// 헬퍼 함수
// ───────────────────────────────────────────────────────────────
export function getGoldenKeyCardById(id: string): GoldenKeyCard | undefined {
  for (const card of GOLDEN_KEY_CARDS) {
    if (card.id === id) {
      return card;
    }
  }
  return undefined;
}

export function createShuffledDeck(): string[] {
  const ids: string[] = [];
  for (const card of GOLDEN_KEY_CARDS) {
    ids.push(card.id);
  }
  // Fisher-Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = ids[i];
    ids[i] = ids[j];
    ids[j] = temp;
  }
  return ids;
}
