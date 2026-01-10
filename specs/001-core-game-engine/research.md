# Research: 부루마블 MVP 핵심 엔진 (CLI 테스트 모드)

**Feature**: 001-core-game-engine
**Date**: 2026-01-10
**Purpose**: Technical Context 분석 및 미결 사항 해결

## 1. Technical Context 결정

### Language/Version

- **Decision**: TypeScript 5.x + Node.js 18+
- **Rationale**: 타입 안정성, 기존 contracts 파일 호환
- **Alternatives**: JavaScript - 타입 검증 부재로 제외

### Primary Dependencies

- **Decision**: Node.js readline (내장 모듈)
- **Rationale**: 터미널 입출력을 위한 표준 모듈, 추가 의존성 없음
- **Alternatives**: inquirer.js - 오버엔지니어링, chalk - 색상은 선택적

### Storage

- **Decision**: In-Memory (변수)
- **Rationale**: 테스트 모드, 영구 저장 불필요
- **Alternatives**: JSON 파일 - 추후 게임 저장 기능 시 고려

### Testing

- **Decision**: Vitest
- **Rationale**: TypeScript 네이티브 지원, 빠른 실행
- **Alternatives**: Jest - Vitest가 더 가벼움

### Target Platform

- **Decision**: Node.js CLI (터미널)
- **Rationale**: React UI 제거, 텍스트 기반 테스트 환경
- **Alternatives**: 브라우저 - 불필요한 복잡성

### Project Type

- **Decision**: Single Node.js CLI Application
- **Rationale**: 서버/클라이언트 분리 불필요, 단일 프로세스

## 2. 아키텍처 변경 (UI → CLI)

### 변경 전 (React UI)

```
React + Zustand + Vite
├── components/ (Board, PlayerPanel, etc.)
├── stores/ (gameStore)
└── services/ (gameService, etc.)
```

### 변경 후 (Node.js CLI)

```
Node.js + TypeScript
├── src/
│   ├── cli/          # CLI 입출력 처리
│   │   ├── prompts.ts
│   │   ├── display.ts
│   │   └── gameLoop.ts
│   ├── services/     # 게임 로직 (재사용)
│   ├── data/         # 보드판 데이터
│   └── types/        # 타입 정의
└── package.json
```

### 제거된 항목

- React, Zustand, Vite
- 모든 UI 컴포넌트
- 브라우저 관련 설정

### 추가된 항목

- readline 기반 프롬프트
- 터미널 출력 포매터
- 게임 루프 (메인 실행)

## 3. Constitution Check

| Principle                  | Compliance | Notes                               |
| -------------------------- | ---------- | ----------------------------------- |
| I. 서버 중심 진실의 원천   | ⚠️ 변형    | 단일 프로세스, 메모리가 진실의 원천 |
| II. QR 기반 엄격 검증      | ⛔ 제외    | CLI 모드, 자동 이동                 |
| III. 양심 기반 신고 시스템 | ⛔ 제외    | 자동 주사위                         |
| IV. 즉시 파산 처리         | ✅ 준수    | 파산 로직 구현                      |
| V. 턴 종료 명시적 선언     | ✅ 준수    | Enter 입력으로 턴 진행              |
| VI. 연결 복원성            | ⛔ 제외    | 로컬 CLI, 네트워크 없음             |
| VII~X. 개발 원칙           | ✅ 준수    | KISS, YAGNI, DRY, SOLID             |

## 4. 결론

- **기술 스택**: TypeScript + Node.js + readline
- **아키텍처**: 단일 CLI 애플리케이션
- **주요 변경**: React UI 제거, 터미널 텍스트 인터페이스
