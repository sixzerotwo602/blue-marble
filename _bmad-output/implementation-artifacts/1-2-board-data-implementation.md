# Story 1.2: Board Data Implementation (Data)

Status: review

---

## Story

**사용자(개발자)로서**,
40칸의 정적인 보드 데이터를 정의하고 싶습니다.
**그래야** 게임 엔진이 맵의 레이아웃을 알 수 있기 때문입니다.

## Acceptance Criteria

1. **Given** 룰북에 명시된 보드 레이아웃이 주어졌을 때
   **When** `BOARD_DATA` 상수에 접근하면
   **Then** 40개의 Tile 객체 배열을 반환해야 한다.

2. **And** 인덱스 0은 "시작", 10은 "무인도", 20은 "사회복지기금", 30은 "우주여행"이어야 한다.

3. **And** 각 도시 타일은 landPrice, buildingPrice, baseToll, group 정보를 포함해야 한다.

---

## Tasks / Subtasks

- [x] **Task 1: BOARD_DATA 상수 파일 생성**

  - [x] 1.1. `src/core/data/boardData.ts` 파일 생성
  - [x] 1.2. 40개 타일 데이터 정의 (시작, 도시, 황금열쇠, 무인도 등)
  - [x] 1.3. 각 도시별 가격/통행료 정보 입력

- [x] **Task 2: 테스트 작성**
  - [x] 2.1. `tests/core/boardData.test.ts` 생성
  - [x] 2.2. BOARD_DATA 길이가 40인지 확인
  - [x] 2.3. 특수 칸 위치 검증 (0, 10, 20, 30)
  - [x] 2.4. 도시 타일의 필수 속성 검증

---

## Dev Notes

### Board Layout

- **0:** 시작
- **10:** 무인도
- **20:** 사회복지기금
- **30:** 우주여행
- **39:** 서울 (가장 비싼 도시, 500,000원)

### City Groups

- ASIA, MIDDLE_EAST, EUROPE, AFRICA, SOUTH_AMERICA, OCEANIA, NORTH_AMERICA, SPECIAL

### Helper Functions

- `getTileById(id)`: ID로 타일 조회
- `getCityTiles()`: 도시 타일만 필터링
- `getVacantCityCount()`: 빈 도시 수 계산

---

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (Antigravity)

### Completion Notes List

- ✅ 40칸 보드 데이터 완성 (8개 타일 타입)
- ✅ 특수 칸 위치 정확히 배치 (0, 10, 20, 30)
- ✅ 22개 도시 타일 (가격, 통행료, 그룹 포함)
- ✅ 8개 황금열쇠, 2개 세금, 2개 올림픽
- ✅ 15개 테스트 전체 통과

### Changed File List

- `src/core/data/boardData.ts` [NEW]
- `src/core/data/index.ts` [NEW]
- `tests/core/boardData.test.ts` [NEW]
