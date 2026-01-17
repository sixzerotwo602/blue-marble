/**
 * Movement Logic
 * @description 플레이어 이동 로직
 */
import { BOARD_SIZE } from '../data/boardData.js';

/** 월급 금액 */
export const SALARY_AMOUNT = 200000;

/**
 * 이동 결과 인터페이스
 */
export interface MoveResult {
  /** 새 위치 */
  newPosition: number;
  /** 출발지 통과 여부 */
  passedStart: boolean;
  /** 지급될 월급 (통과 시) */
  salaryEarned: number;
}

/**
 * 플레이어 이동 계산
 * @param currentPosition 현재 위치 (0-39)
 * @param steps 이동할 칸 수
 * @returns MoveResult 객체
 */
export function calculateMove(currentPosition: number, steps: number): MoveResult {
  const rawNewPosition = currentPosition + steps;
  const newPosition = rawNewPosition % BOARD_SIZE;
  
  // 출발지(0)를 통과했는지 확인 (현재 위치에서 새 위치로 이동할 때 보드를 한 바퀴 돌았는지)
  const passedStart = rawNewPosition >= BOARD_SIZE;

  return {
    newPosition,
    passedStart,
    salaryEarned: passedStart ? SALARY_AMOUNT : 0,
  };
}

/**
 * 두 위치 사이의 거리 계산 (시계방향)
 * @param from 시작 위치
 * @param to 도착 위치
 * @returns 거리
 */
export function calculateDistance(from: number, to: number): number {
  if (to >= from) {
    return to - from;
  }
  return BOARD_SIZE - from + to;
}

/**
 * 특정 위치가 출발지인지 확인
 */
export function isStartTile(position: number): boolean {
  return position === 0;
}

/**
 * 플레이어가 출발지를 정확히 밟았는지 (통과가 아닌)
 */
export function isLandingOnStart(newPosition: number): boolean {
  return newPosition === 0;
}
