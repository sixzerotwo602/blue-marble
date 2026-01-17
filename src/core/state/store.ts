/**
 * Redux Store Configuration
 * @description 부루마블 게임의 Redux Store 설정
 */
import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice.js';

/**
 * Redux Store 생성
 */
export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  // 개발 환경에서만 DevTools 활성화
  devTools: process.env.NODE_ENV !== 'production',
});

/** RootState 타입 (전체 상태 트리) */
export type RootState = ReturnType<typeof store.getState>;

/** AppDispatch 타입 (디스패치 함수 타입) */
export type AppDispatch = typeof store.dispatch;

/**
 * 새로운 Store 인스턴스 생성 (테스트용)
 * @description 각 테스트가 독립된 상태를 가질 수 있도록 함
 */
export function createTestStore() {
  return configureStore({
    reducer: {
      game: gameReducer,
    },
    devTools: false,
  });
}
