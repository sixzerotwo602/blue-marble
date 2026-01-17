# BlueMarble-CLI - Development Epics

## Epic Overview

| # | Epic Name | Scope | Dependencies | Est. Stories |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **The Core Loop** | Dice, Move, Board Setup, Land Purchase | None | 5 |
| **2** | **Economic Interaction** | Construction, Toll, Bankruptcy, Liquidation | Epic 1 | 6 |
| **3** | **Special Rules** | Golden Key, Space, Island, Donation | Epic 2 | 8 |
| **4** | **CLI UX Polish** | Dashboard UI, Colors, Interactive Prompts | Epic 1, 2, 3 | 4 |

---

## Epic 1: The Core Loop

### Goal
게임의 가장 기초적인 골격(Skeleton)을 완성한다. 맵을 순환하고, 주사위를 굴려 도착한 칸의 데이터를 읽고, 소유권을 변경하는 기능까지 구현한다. '돈'과 '건설'은 아직 다루지 않는다.

### Scope

**Includes:**
*   Map Data Structure (40 Tiles)
*   Seed-based Dice Roll
*   Player Position Management
*   Buy Land (Generic Purchase Logic)
*   Turn Management (Next Turn)

**Excludes:**
*   Building Construction (Villa/Hotel)
*   Toll Payment
*   Bankruptcy
*   Special Tile Logic (Island/Space)
*   UI / Dashboard

### Dependencies
*   Technical Specification (TypeScript/Redux setup)

### Deliverable
*   CLI 로그를 통해 플레이어가 맵을 뱅글뱅글 돌며 땅을 사는 모습이 확인됨.

### Stories
1.  As a developer, I want to define the `GameState` interface so that `Type-Safe Rule Engine` foundation is laid.
2.  As a player, I want to roll 2d6 dice with a specific seed so that I can reproduce my movement exactly.
3.  As a player, I want to move my piece on the 40-tile board so that I can land on specific cities.
4.  As a player, I want to buy a vacant land when I arrive so that I can claim ownership.
5.  As a system, I want to pass the turn to the next player so that the game loop continues.

---

## Epic 2: Economic Interaction

### Goal
플레이어 간의 '경쟁' 요소를 구현한다. 건설을 통해 가치를 높이고, 통행료를 통해 부를 이동시키며, 파산 시스템을 통해 게임의 종료 조건을 완성한다.

### Scope

**Includes:**
*   Construction System (Villa/Building/Hotel)
*   Toll Calculation Logic
*   Asset Liquidation (Sell to Bank)
*   Bankruptcy & Asset Transfer
*   Victory Condition Check

**Excludes:**
*   Golden Key Cards (Except strict movement cards)
*   Complex Island Escape
*   Space Travel Reservation

### Dependencies
*   Epic 1: The Core Loop

### Deliverable
*   봇 4명이 대전을 펼쳐 3명이 파산하고 1명이 승리하는 전체 게임 로그(Game Log)가 생성됨.

### Stories
1.  As a player, I want to construct buildings on my land so that I can increase the toll fee.
2.  As a player, I want to pay toll automatically when I land on opponent's land.
3.  As a player, I want to liquidate my assets for 50% value when I cannot pay the toll.
4.  As a system, I want to declaring bankruptcy for a player when their assets are insufficient.
5.  As a winner, I want to inherit the bankrupt player's assets so that the game speeds up.
6.  As a system, I want to detect "Last Man Standing" so that the game ends immediately.

---

## Epic 3: Special Rules

### Goal
부루마불의 재미 요소인 '예외 상황(Exception)'을 구현한다. 단순 이동/구매 루프를 벗어나는 특수 규칙들을 통합한다.

### Scope

**Includes:**
*   Golden Key Deck & Effects
*   Island (Deserted Island) Escape Logic
*   Space Travel (Columbia) Logic
*   Social Welfare Fund (Donation/Receive)
*   Salary System (Start Tile)

**Excludes:**
*   Refined UI/UX
*   Network Play

### Dependencies
*   Epic 2: Economic Interaction

### Deliverable
*   모든 특수 규칙이 포함된 완전한 오리지널 룰 시뮬레이션.

### Stories
1.  As a player, I want to receive salary when I pass the Start tile.
2.  As a player, I want to stay in the Island for 3 turns unless I escape.
3.  As a player, I want to move to any tile next turn when I land on Space Travel.
4.  As a player, I want to draw a Golden Key card and apply its effect immediately.
5.  As a player, I want to keep specific Golden Keys (Escape/Exemption) for later use.
6.  As a system, I want to stack donations in the Fund and give it to the landing player.

---

## Epic 4: CLI UX Polish

### Goal
개발자용 로그 텍스트 더미를 실제 게임처럼 보이게 만드는 '시각화' 작업. TUI(Text User Interface)를 적용한다.

### Scope

**Includes:**
*   Dashboard Layout (Top/Mid/Bottom)
*   ANSI Color Coding
*   Interactive Input Prompts (Inquirer)
*   Help / Status Command

**Excludes:**
*   Graphical GUI
*   Sound

### Dependencies
*   Epic 3: Special Rules

### Deliverable
*   `npm start`로 실행했을 때 직관적이고 깔끔한 텍스트 UI로 게임을 즐길 수 있는 최종 빌드.

### Stories
1.  As a player, I want to see the board status in a summarized dashboard layout.
2.  As a player, I want to distinguish players and properties using text colors.
3.  As a player, I want to select actions using a clear numbered menu.
4.  As a player, I want to verify the game rules via a help command.
