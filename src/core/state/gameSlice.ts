/**
 * Game Slice - Redux State Management
 * @description 부루마블 게임 상태를 관리하는 Redux Slice
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, createInitialGameState, TurnPhase, GamePhase } from '../model/GameState.js';
import { Player, createPlayer } from '../model/Player.js';
import { Tile } from '../model/Tile.js';

/** 초기 상태 */
const initialState: GameState = createInitialGameState();

/** Game Slice 정의 */
export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    /**
     * 게임 초기화
     */
    initializeGame: (state, action: PayloadAction<{ seed: string; tiles: Tile[] }>) => {
      state.seed = action.payload.seed;
      state.tiles = action.payload.tiles;
      state.players = [];
      state.currentPlayerIndex = 0;
      state.turnNumber = 1;
      state.phase = 'EARLY';
      state.turnPhase = 'TURN_START';
      state.isGameStarted = false;
      state.winnerId = null;
      state.socialFundBalance = 0;
      state.lastDiceResult = null;
    },

    /**
     * 플레이어 추가
     */
    addPlayer: (state, action: PayloadAction<{ id: string; name: string; isAI?: boolean }>) => {
      const { id, name, isAI = false } = action.payload;
      const newPlayer = createPlayer(id, name, 4000000, isAI);
      state.players.push(newPlayer);
    },

    /**
     * 게임 시작
     */
    startGame: (state) => {
      if (state.players.length >= 2) {
        state.isGameStarted = true;
        state.turnPhase = 'TURN_START';
      }
    },

    /**
     * 턴 페이즈(FSM) 변경
     */
    setTurnPhase: (state, action: PayloadAction<TurnPhase>) => {
      state.turnPhase = action.payload;
    },

    /**
     * 게임 페이즈 변경
     */
    setGamePhase: (state, action: PayloadAction<GamePhase>) => {
      state.phase = action.payload;
    },

    /**
     * 주사위 결과 저장
     */
    setDiceResult: (state, action: PayloadAction<{ dice1: number; dice2: number }>) => {
      const { dice1, dice2 } = action.payload;
      state.lastDiceResult = {
        dice1,
        dice2,
        isDouble: dice1 === dice2,
      };
    },

    /**
     * 플레이어 이동 (Story 1.4)
     * 주사위 합계만큼 이동, 출발지 통과 시 월급 지급
     */
    movePlayer: (state, action: PayloadAction<{ playerId: string; steps: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      const currentPosition = player.position;
      const steps = action.payload.steps;
      const BOARD_SIZE = 40;
      const SALARY_AMOUNT = 200000;

      const rawNewPosition = currentPosition + steps;
      const newPosition = rawNewPosition % BOARD_SIZE;
      const passedStart = rawNewPosition >= BOARD_SIZE;

      // 위치 업데이트
      player.position = newPosition;

      // 출발지 통과 시 월급 지급
      if (passedStart) {
        player.money += SALARY_AMOUNT;
      }

      // FSM 상태 업데이트
      state.turnPhase = 'MOVING';
    },

    /**
     * 플레이어 위치 업데이트
     */
    updatePlayerPosition: (state, action: PayloadAction<{ playerId: string; newPosition: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player) {
        player.position = action.payload.newPosition;
      }
    },

    /**
     * 플레이어 자금 업데이트
     */
    updatePlayerMoney: (state, action: PayloadAction<{ playerId: string; amount: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (player) {
        player.money += action.payload.amount;
      }
    },

    /**
     * 턴 종료 및 다음 플레이어로 전환
     */
    endTurn: (state) => {
      const activePlayers = state.players.filter(p => !p.isBankrupt);
      if (activePlayers.length <= 1) {
        state.turnPhase = 'GAME_OVER';
        if (activePlayers.length === 1) {
          state.winnerId = activePlayers[0].id;
        }
        return;
      }

      // 더블이 아니면 다음 플레이어로
      if (!state.lastDiceResult?.isDouble) {
        do {
          state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        } while (state.players[state.currentPlayerIndex].isBankrupt);
        state.turnNumber++;
      }

      state.turnPhase = 'TURN_START';
      state.lastDiceResult = null;
    },

    /**
     * 타일 소유권 설정
     */
    setTileOwner: (state, action: PayloadAction<{ tileId: number; ownerId: string }>) => {
      const tile = state.tiles.find(t => t.id === action.payload.tileId);
      if (tile) {
        tile.ownerId = action.payload.ownerId;
        const owner = state.players.find(p => p.id === action.payload.ownerId);
        if (owner && !owner.ownedTileIds.includes(tile.id)) {
          owner.ownedTileIds.push(tile.id);
        }
      }
    },

    /**
     * 땅 구매 (Story 1.5)
     * 빈 땅 구매, 자금 검증, 소유권 이전
     */
    buyLand: (state, action: PayloadAction<{ playerId: string; tileId: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      const tile = state.tiles.find(t => t.id === action.payload.tileId);

      if (!player || !tile) return;

      // 이미 소유자가 있으면 실패
      if (tile.ownerId !== null) return;

      // 도시 타일이 아니면 구매 불가
      if (tile.type !== 'city') return;

      // 땅 가격 확인
      const landPrice = tile.landPrice ?? 0;

      // 자금 부족하면 실패
      if (player.money < landPrice) return;

      // 자금 차감
      player.money -= landPrice;

      // 소유권 이전
      tile.ownerId = player.id;
      if (!player.ownedTileIds.includes(tile.id)) {
        player.ownedTileIds.push(tile.id);
      }

      // FSM 상태 업데이트
      state.turnPhase = 'PURCHASE_DECISION';
    },

    /**
     * 무인도로 보내기 (Story 1.7)
     * 플레이어를 무인도로 이동시키고 3턴 잠금
     */
    sendToIsland: (state, action: PayloadAction<{ playerId: string }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      player.position = 10; // 무인도 위치
      player.jailTurnsRemaining = 3;
      state.turnPhase = 'SPECIAL_EVENT';
    },

    /**
     * 무인도 탈출 시도 (Story 1.7)
     * 더블이면 탈출, 3턴 지나면 자동 탈출
     */
    tryEscapeIsland: (state, action: PayloadAction<{ playerId: string; isDouble: boolean }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player || player.jailTurnsRemaining === 0) return;

      if (action.payload.isDouble) {
        // 더블로 탈출
        player.jailTurnsRemaining = 0;
      } else {
        // 남은 턴 감소
        player.jailTurnsRemaining--;
        if (player.jailTurnsRemaining <= 0) {
          player.jailTurnsRemaining = 0;
        }
      }
    },

    /**
     * 우주여행 상태 설정 (Story 1.7)
     * 다음 턴에 원하는 위치로 이동 가능
     */
    setSpaceTravelReady: (state, action: PayloadAction<{ playerId: string }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      player.canChooseDestination = true;
      state.turnPhase = 'SPECIAL_EVENT';
    },

    /**
     * 우주여행 목적지 선택 (Story 1.7)
     */
    spaceTravelTo: (state, action: PayloadAction<{ playerId: string; destination: number }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player || !player.canChooseDestination) return;

      player.position = action.payload.destination % 40;
      player.canChooseDestination = false;
    },

    /**
     * 사회복지기금 처리 (Story 1.7)
     * 기금이 있으면 수령, 없으면 기부
     */
    handleSocialFund: (state, action: PayloadAction<{ playerId: string }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      const SOCIAL_FUND_AMOUNT = 150000;

      if (state.socialFundBalance > 0) {
        // 기금 수령
        player.money += state.socialFundBalance;
        state.socialFundBalance = 0;
      } else {
        // 기금 기부
        player.money -= SOCIAL_FUND_AMOUNT;
        state.socialFundBalance += SOCIAL_FUND_AMOUNT;
      }

      state.turnPhase = 'SPECIAL_EVENT';
    },

    /**
     * 통행료 지불 (Story 2.1)
     * 타인 땅 도착 시 통행료 지불
     */
    payToll: (state, action: PayloadAction<{ payerId: string; tileId: number }>) => {
      const payer = state.players.find(p => p.id === action.payload.payerId);
      const tile = state.tiles.find(t => t.id === action.payload.tileId);

      if (!payer || !tile) return;
      if (!tile.ownerId || tile.ownerId === payer.id) return; // 무소유 또는 자기 땅

      const owner = state.players.find(p => p.id === tile.ownerId);
      if (!owner || owner.isBankrupt) return;

      // 건물 단계 계산: 0=대지, 1=별장1, 2=별장2, 3=빌딩, 4=호텔
      const { villa, building, hotel } = tile.buildings;
      let buildingLevel = 0;
      if (hotel > 0) {
        buildingLevel = 4;
      } else if (building > 0) {
        buildingLevel = 3;
      } else if (villa > 0) {
        buildingLevel = villa; // 1 또는 2
      }

      // rentLevels가 있으면 사용, 없으면 baseToll 사용 (하위호환)
      let toll = 0;
      if (tile.rentLevels && tile.rentLevels.length > buildingLevel) {
        toll = tile.rentLevels[buildingLevel];
      } else {
        toll = tile.baseToll ?? 0;
      }

      if (toll <= 0) return;

      // 지불 처리
      payer.money -= toll;
      owner.money += toll;

      state.turnPhase = 'TOLL_PAYMENT';
    },

    /**
     * 파산 선언 (Story 2.2)
     * 지불 능력이 없을 때 파산 처리 및 자산 양도
     */
    declareBankruptcy: (state, action: PayloadAction<{ 
      playerId: string; 
      creditorId?: string; // 채권자 ID (없으면 은행)
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player || player.isBankrupt) return;

      // 파산 선언
      player.isBankrupt = true;

      // 소유 타일 처리
      const ownedTiles = state.tiles.filter(t => t.ownerId === player.id);
      
      if (action.payload.creditorId) {
        // 채권자에게 자산 양도
        const creditor = state.players.find(p => p.id === action.payload.creditorId);
        if (creditor && !creditor.isBankrupt) {
          // 남은 현금 양도
          creditor.money += player.money;
          player.money = 0;

          // 소유 타일 양도
          ownedTiles.forEach(tile => {
            tile.ownerId = creditor.id;
            creditor.ownedTileIds.push(tile.id);
          });
        }
      } else {
        // 은행에 반납 (무주지로 전환)
        ownedTiles.forEach(tile => {
          tile.ownerId = null;
          tile.buildings = { villa: 0, building: 0, hotel: 0 };
        });
        player.money = 0;
      }

      // 소유 타일 목록 초기화
      player.ownedTileIds = [];

      // 남은 플레이어 수 체크 (1명이면 게임 종료)
      const activePlayers = state.players.filter(p => !p.isBankrupt);
      if (activePlayers.length <= 1) {
        state.phase = 'DEVELOPMENT'; // 게임 종료 상태
        state.turnPhase = 'GAME_OVER';
        if (activePlayers.length === 1) {
          state.winnerId = activePlayers[0].id;
        }
      }
    },

    /**
     * 지불 능력 확인 (Story 2.2)
     * 현금 + 자산 가치로 지불 가능 여부 반환
     */
    checkPaymentAbility: (state, action: PayloadAction<{ 
      playerId: string; 
      amount: number 
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      // 현금으로 지불 가능
      if (player.money >= action.payload.amount) {
        state.turnPhase = 'TURN_START'; // 지불 가능
        return;
      }

      // 자산 가치 계산 (땅 50% + 건물 100%)
      const ownedTiles = state.tiles.filter(t => t.ownerId === player.id);
      let assetValue = 0;
      ownedTiles.forEach(tile => {
        // 땅 가치 (50%)
        assetValue += (tile.landPrice ?? 0) * 0.5;
        // 건물 가치 (100%)
        const { villa, building, hotel } = tile.buildings;
        const buildingPrice = tile.buildingPrice ?? 0;
        assetValue += villa * buildingPrice;
        assetValue += building * buildingPrice * 3;
        assetValue += hotel * buildingPrice * 5;
      });

      if (player.money + assetValue >= action.payload.amount) {
        state.turnPhase = 'LIQUIDATION'; // 매각 필요
      } else {
        state.turnPhase = 'GAME_OVER'; // 파산 불가피
      }
    },

    /**
     * 건물 매각 (Story 2.3)
     * 건물 100% 환불
     */
    sellBuilding: (state, action: PayloadAction<{ 
      playerId: string; 
      tileId: number;
      buildingType: 'villa' | 'building' | 'hotel';
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      const tile = state.tiles.find(t => t.id === action.payload.tileId);

      if (!player || !tile) return;
      if (tile.ownerId !== player.id) return; // 내 땅만 매각 가능

      const { buildingType } = action.payload;
      const buildingPrice = tile.buildingPrice ?? 0;

      // 매각할 건물이 있는지 확인
      if (tile.buildings[buildingType] <= 0) return;

      // 건물별 환불 금액 (100%)
      let refund = 0;
      if (buildingType === 'villa') {
        refund = buildingPrice;
        tile.buildings.villa -= 1;
      } else if (buildingType === 'building') {
        refund = buildingPrice * 3;
        tile.buildings.building -= 1;
      } else if (buildingType === 'hotel') {
        refund = buildingPrice * 5;
        tile.buildings.hotel -= 1;
      }

      player.money += refund;
    },

    /**
     * 땅 매각 (Story 2.3)
     * 땅 50% 환불, 건물은 100% 환불
     */
    sellLand: (state, action: PayloadAction<{ 
      playerId: string; 
      tileId: number;
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      const tile = state.tiles.find(t => t.id === action.payload.tileId);

      if (!player || !tile) return;
      if (tile.ownerId !== player.id) return; // 내 땅만 매각 가능

      const landPrice = tile.landPrice ?? 0;
      const buildingPrice = tile.buildingPrice ?? 0;

      // 건물 환불 (100%)
      const { villa, building, hotel } = tile.buildings;
      const buildingRefund = 
        villa * buildingPrice +
        building * buildingPrice * 3 +
        hotel * buildingPrice * 5;

      // 땅 환불 (50%)
      const landRefund = landPrice * 0.5;

      const totalRefund = buildingRefund + landRefund;
      player.money += totalRefund;

      // 타일 초기화
      tile.ownerId = null;
      tile.buildings = { villa: 0, building: 0, hotel: 0 };

      // 소유 타일 목록에서 제거
      player.ownedTileIds = player.ownedTileIds.filter(id => id !== tile.id);
    },

    /**
     * 경매 트리거 확인 (Story 2.4)
     * 빈 땅이 6개 이하면 AUCTION 페이즈 전환
     */
    checkAuctionTrigger: (state) => {
      const vacantLands = state.tiles.filter(
        t => (t.type === 'city') && t.ownerId === null
      );

      if (vacantLands.length <= 6 && state.phase === 'EARLY') {
        state.phase = 'AUCTION';
      }

      if (vacantLands.length === 0 && state.phase === 'AUCTION') {
        state.phase = 'DEVELOPMENT';
      }
    },

    /**
     * 경매 시작 (Story 2.4)
     */
    startAuction: (state, action: PayloadAction<{ tileId: number }>) => {
      const tile = state.tiles.find(t => t.id === action.payload.tileId);
      if (!tile || tile.ownerId !== null) return;

      state.currentAuction = {
        tileId: tile.id,
        currentBid: tile.landPrice ?? 0,
        highestBidderId: null,
        passedPlayers: [],
      };
    },

    /**
     * 입찰 (Story 2.4)
     */
    placeBid: (state, action: PayloadAction<{ 
      playerId: string; 
      bidAmount: number 
    }>) => {
      if (!state.currentAuction) return;

      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player || player.isBankrupt) return;

      const { bidAmount } = action.payload;
      
      // 현재 입찰가보다 높아야 함
      if (bidAmount <= state.currentAuction.currentBid) return;
      
      // 플레이어 소유 금액 내에서만
      if (bidAmount > player.money) return;

      state.currentAuction.currentBid = bidAmount;
      state.currentAuction.highestBidderId = player.id;
    },

    /**
     * 패스 (Story 2.4)
     */
    passAuction: (state, action: PayloadAction<{ playerId: string }>) => {
      if (!state.currentAuction) return;
      
      if (!state.currentAuction.passedPlayers.includes(action.payload.playerId)) {
        state.currentAuction.passedPlayers.push(action.payload.playerId);
      }
    },

    /**
     * 경매 완료 (Story 2.4)
     */
    completeAuction: (state) => {
      if (!state.currentAuction) return;

      const { tileId, currentBid, highestBidderId } = state.currentAuction;
      const tile = state.tiles.find(t => t.id === tileId);

      if (tile && highestBidderId) {
        const winner = state.players.find(p => p.id === highestBidderId);
        if (winner) {
          winner.money -= currentBid;
          tile.ownerId = winner.id;
          winner.ownedTileIds.push(tile.id);
        }
      }

      state.currentAuction = null;
    },

    /**
     * 건물 건설 (Story 3.2)
     * DEVELOPMENT 페이즈에서만 가능
     */
    buildBuilding: (state, action: PayloadAction<{
      playerId: string;
      tileId: number;
      buildingType: 'villa' | 'building' | 'hotel';
    }>) => {
      // DEVELOPMENT 페이즈 체크
      if (state.phase !== 'DEVELOPMENT') return;

      const player = state.players.find(p => p.id === action.payload.playerId);
      const tile = state.tiles.find(t => t.id === action.payload.tileId);

      if (!player || !tile) return;
      if (tile.ownerId !== player.id) return; // 내 땅만 건설 가능

      const { buildingType } = action.payload;
      const buildingPrice = tile.buildingPrice ?? 0;

      // 건물 제한 확인 (별장 2, 빌딩 1, 호텔 1)
      const maxBuildings = { villa: 2, building: 1, hotel: 1 };
      if (tile.buildings[buildingType] >= maxBuildings[buildingType]) return;

      // 건물 비용 계산
      let cost = 0;
      if (buildingType === 'villa') {
        cost = buildingPrice;
      } else if (buildingType === 'building') {
        cost = buildingPrice * 3;
      } else if (buildingType === 'hotel') {
        cost = buildingPrice * 5;
      }

      // 비용 지불 가능 확인
      if (player.money < cost) return;

      // 건설
      player.money -= cost;
      tile.buildings[buildingType] += 1;
    },

    /**
     * 카드 지급 (Story 3.3)
     * 무인도 탈출권 등 보관 가능 카드
     */
    giveCard: (state, action: PayloadAction<{
      playerId: string;
      cardType: 'ISLAND_ESCAPE' | 'TOLL_DISCOUNT';
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      player.heldCards.push(action.payload.cardType);
    },

    /**
     * 카드 사용 (Story 3.3)
     */
    useCard: (state, action: PayloadAction<{
      playerId: string;
      cardType: 'ISLAND_ESCAPE' | 'TOLL_DISCOUNT';
    }>) => {
      const player = state.players.find(p => p.id === action.payload.playerId);
      if (!player) return;

      const cardIndex = player.heldCards.indexOf(action.payload.cardType);
      if (cardIndex === -1) return; // 카드 없음

      // 카드 제거
      player.heldCards.splice(cardIndex, 1);

      // 카드 효과 적용
      if (action.payload.cardType === 'ISLAND_ESCAPE') {
        player.jailTurnsRemaining = 0;
      }
      // TOLL_DISCOUNT는 payToll에서 별도 처리
    },
  },
});

/** Actions 내보내기 */
export const {
  initializeGame,
  addPlayer,
  startGame,
  setTurnPhase,
  setGamePhase,
  setDiceResult,
  movePlayer,
  updatePlayerPosition,
  updatePlayerMoney,
  endTurn,
  setTileOwner,
  buyLand,
  sendToIsland,
  tryEscapeIsland,
  setSpaceTravelReady,
  spaceTravelTo,
  handleSocialFund,
  payToll,
  declareBankruptcy,
  checkPaymentAbility,
  sellBuilding,
  sellLand,
  checkAuctionTrigger,
  startAuction,
  placeBid,
  passAuction,
  completeAuction,
  buildBuilding,
  giveCard,
  useCard,
} = gameSlice.actions;

/** Reducer 내보내기 */
export default gameSlice.reducer;
