/**
 * Blue Marble Game Engine Contracts
 * 블루마블 게임 엔진 인터페이스 정의
 * 
 * @date 2026-01-21
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type GamePhase = 'FIRST_HALF' | 'AUCTION' | 'SECOND_HALF';

export type TileType =
    | 'START'
    | 'CITY'
    | 'VEHICLE'
    | 'GOLDEN_KEY'
    | 'ISLAND'
    | 'SPACE_TRAVEL'
    | 'FUND_RECEIVE'
    | 'FUND_DONATE';

export type BuildingType = 'VILLA' | 'BUILDING' | 'HOTEL';

export type CardEffectType =
    | 'MOVE_TO'
    | 'MOVE_BACK'
    | 'RECEIVE_MONEY'
    | 'PAY_MONEY'
    | 'PAY_MAINTENANCE'
    | 'FORCE_SELL'
    | 'HOLD_ESCAPE'
    | 'HOLD_DISCOUNT';

// ============================================================================
// GAME ENGINE INTERFACE
// ============================================================================

export interface IGameEngine {
    /** 게임 초기화 */
    initialize(playerNames: string[]): void;

    /** 현재 게임 상태 반환 */
    getState(): GameState;

    /** 게임 종료 여부 */
    isGameOver(): boolean;

    /** 승자 반환 (게임 종료 시) */
    getWinner(): Player | null;

    /** 시스템 접근자 */
    readonly dice: IDiceSystem;
    readonly movement: IMovementSystem;
    readonly economy: IEconomySystem;
    readonly phase: IPhaseSystem;
    readonly turn: ITurnSystem;
    readonly auction: IAuctionSystem;
    readonly building: IBuildingSystem;
    readonly loan: ILoanSystem;
    readonly bankruptcy: IBankruptcySystem;
    readonly specialTile: ISpecialTileSystem;
    readonly goldenKey: IGoldenKeySystem;
}

// ============================================================================
// SYSTEM INTERFACES
// ============================================================================

export interface IDiceSystem {
    /** 주사위 굴리기 */
    roll(): DiceResult;

    /** 더블 횟수 리셋 */
    resetDoubleCount(): void;

    /** 현재 더블 횟수 */
    getDoubleCount(): number;
}

export interface IMovementSystem {
    /** 플레이어 이동 (주사위 결과 기반) */
    move(player: Player, diceResult: DiceResult): MoveResult;

    /** 특정 위치로 직접 이동 (우주여행, 황금열쇠 등) */
    teleport(player: Player, targetIndex: number, options?: TeleportOptions): MoveResult;

    /** 뒤로 이동 */
    moveBack(player: Player, steps: number): MoveResult;
}

export interface IEconomySystem {
    /** 씨앗증서 구매 */
    buyDeed(player: Player, deed: Deed): PurchaseResult;

    /** 통행료 계산 */
    calculateRent(deed: Deed): number;

    /** 통행료 징수 */
    collectRent(payer: Player, owner: Player, deed: Deed): RentResult;

    /** 자산 매각 (건물) */
    sellBuilding(player: Player, deed: Deed, buildingType: BuildingType): SellResult;

    /** 증서 인계 (대물 변제) */
    transferDeed(from: Player, to: Player, deed: Deed): TransferResult;
}

export interface IPhaseSystem {
    /** 현재 페이즈 반환 */
    getCurrentPhase(): GamePhase;

    /** 경매 트리거 여부 확인 */
    shouldTriggerAuction(): boolean;

    /** 경매 시작 */
    startAuction(): void;

    /** 후반전 전환 */
    transitionToSecondHalf(): void;
}

export interface ITurnSystem {
    /** 현재 플레이어 반환 */
    getCurrentPlayer(): Player;

    /** 턴 종료 */
    endTurn(): void;

    /** 다음 플레이어로 전환 */
    nextPlayer(): Player;

    /** 더블로 인한 추가 턴 */
    grantExtraTurn(): void;
}

export interface IAuctionSystem {
    /** 경매 시작 */
    startAuction(deeds: Deed[]): void;

    /** 현재 경매 상태 반환 */
    getAuctionState(): AuctionState | null;

    /** 입찰 */
    placeBid(player: Player, amount: number): BidResult;

    /** 폴드 */
    fold(player: Player): void;

    /** 현재 증서 경매 진행 */
    processCurrentAuction(): AuctionResult;

    /** 다음 증서로 이동 */
    nextDeed(): Deed | null;

    /** 경매 완료 여부 */
    isAuctionComplete(): boolean;
}

export interface IBuildingSystem {
    /** 건설 가능한 건물 목록 반환 */
    getAvailableBuildings(deed: Deed): BuildingType[];

    /** 건설 비용 계산 */
    calculateBuildCost(deed: Deed, buildings: BuildingType[]): number;

    /** 건물 건설 */
    build(player: Player, deed: Deed, buildings: BuildingType[]): BuildResult;

    /** 건설 가능 여부 확인 */
    canBuild(player: Player, deed: Deed, buildings: BuildingType[]): boolean;
}

export interface ILoanSystem {
    /** 대출 가능 여부 */
    canTakeLoan(player: Player): boolean;

    /** 대출 실행 */
    takeLoan(player: Player, amount: number): LoanResult;

    /** 대출 상환 */
    repayLoan(player: Player): RepayResult;

    /** 상환 기한 확인 */
    checkLoanDue(player: Player): boolean;
}

export interface IBankruptcySystem {
    /** 파산 여부 확인 */
    isBankrupt(player: Player, requiredAmount: number): boolean;

    /** 파산 처리 */
    processBankruptcy(player: Player, creditor: Player | 'BANK'): void;

    /** 자산 청산 */
    liquidateAssets(player: Player): number;
}

export interface ISpecialTileSystem {
    /** 우주여행 처리 */
    handleSpaceTravel(player: Player): SpaceTravelResult;

    /** 우주여행 워프 실행 */
    executeWarp(player: Player, targetIndex: number): WarpResult;

    /** 무인도 처리 */
    handleIsland(player: Player): void;

    /** 무인도 탈출 시도 */
    attemptEscape(player: Player, diceResult: DiceResult): EscapeResult;

    /** 복지기금 기부 */
    handleDonate(player: Player): void;

    /** 복지기금 수령 */
    handleReceive(player: Player): number;
}

export interface IGoldenKeySystem {
    /** 카드 뽑기 */
    drawCard(): GoldenKeyCard;

    /** 카드 효과 실행 */
    executeCard(player: Player, card: GoldenKeyCard): CardExecutionResult;

    /** 보관 카드 사용 */
    useHeldCard(player: Player, card: GoldenKeyCard): CardExecutionResult;

    /** 덱 셔플 */
    shuffleDeck(): void;
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface DiceResult {
    die1: number;
    die2: number;
    total: number;
    isDouble: boolean;
}

export interface MoveResult {
    previousPosition: number;
    newPosition: number;
    passedStart: boolean;
    salaryPaid: number;
}

export interface TeleportOptions {
    checkSalary?: boolean;  // 월급 지급 여부 확인
    sourceIndex?: number;   // 출발 위치 (우주여행 등)
}

export interface PurchaseResult {
    success: boolean;
    reason?: 'INSUFFICIENT_FUNDS' | 'ALREADY_OWNED' | 'NOT_FOR_SALE';
}

export interface RentResult {
    amount: number;
    paid: boolean;
    shortfall: number;  // 부족액 (0이면 전액 지불)
}

export interface SellResult {
    success: boolean;
    amount: number;
}

export interface TransferResult {
    success: boolean;
    reason?: 'HAS_BUILDINGS' | 'NOT_OWNED';
}

export interface BidResult {
    success: boolean;
    reason?: 'INSUFFICIENT_FUNDS' | 'BID_TOO_LOW' | 'ALREADY_FOLDED';
}

export interface AuctionResult {
    winnerId: string | null;
    finalPrice: number;
    isNoSale: boolean;  // 유찰 여부
}

export interface BuildResult {
    success: boolean;
    totalCost: number;
    reason?: 'INSUFFICIENT_FUNDS' | 'SLOT_FULL' | 'NOT_OWNER' | 'WRONG_PHASE';
}

export interface LoanResult {
    success: boolean;
    amount: number;
    dueLap: number;
    reason?: 'ALREADY_HAS_LOAN' | 'AMOUNT_TOO_HIGH';
}

export interface RepayResult {
    success: boolean;
    amountPaid: number;
    reason?: 'INSUFFICIENT_FUNDS';
}

export interface SpaceTravelResult {
    feePaid: number;
    feeRecipientId: string | null;
    waitingForWarp: boolean;
}

export interface WarpResult {
    targetIndex: number;
    salaryPaid: number;
}

export interface EscapeResult {
    escaped: boolean;
    moveDistance: number;  // 탈출 시 이동 거리
    turnsRemaining: number;
}

export interface CardExecutionResult {
    effectApplied: boolean;
    cardHeld: boolean;  // 보관 카드인 경우 true
    description: string;
}

// ============================================================================
// ENTITY TYPES (Summary - see data-model.md for full definitions)
// ============================================================================

export interface Player {
    id: string;
    name: string;
    money: number;
    position: number;
    deeds: Deed[];
    heldCards: GoldenKeyCard[];
    loan: Loan | null;
    lapsCompleted: number;
    isStranded: boolean;
    strandedTurnsLeft: number;
    isBankrupt: boolean;
    isWaitingForWarp: boolean;
}

export interface Tile {
    index: number;
    type: TileType;
    name: string;
    deedId: string | null;
}

export interface Deed {
    id: string;
    name: string;
    tileIndex: number;
    price: number;
    baseRent: number;
    canBuild: boolean;
    buildingCosts: {
        villa: number;
        building: number;
        hotel: number;
    };
    rentTable: {
        base: number;
        villa1: number;
        villa2: number;
        building: number;
        hotel: number;
        full: number;
    };
    ownerId: string | null;
    buildings: BuildingState;
}

export interface BuildingState {
    villaCount: number;
    hasBuilding: boolean;
    hasHotel: boolean;
}

export interface GoldenKeyCard {
    id: string;
    name: string;
    description: string;
    effectType: CardEffectType;
    effectValue: number | null;
    targetIndex: number | null;
    canHold: boolean;
    count: number;
}

export interface Loan {
    amount: number;
    startLap: number;
    dueLap: number;
}

export interface WelfareFund {
    balance: number;
}

export interface GameState {
    id: string;
    phase: GamePhase;
    players: Player[];
    currentPlayerIndex: number;
    turnNumber: number;
    board: Tile[];
    deeds: Deed[];
    goldenKeyDeck: GoldenKeyCard[];
    welfareFund: WelfareFund;
    auctionState: AuctionState | null;
    turnState: TurnState;
}

export interface AuctionState {
    deedsToAuction: Deed[];
    currentDeedIndex: number;
    currentBid: number;
    highestBidderId: string | null;
    activeBidderIds: string[];
    currentBidderIndex: number;
    minRaise: number;
}

export interface TurnState {
    doublesCount: number;
    hasRolled: boolean;
    lastDiceResult: DiceResult | null;
    pendingActions: PendingAction[];
}

export interface PendingAction {
    type: 'PAY_RENT' | 'BUY_DEED' | 'BUILD' | 'WARP' | 'AUCTION_BID';
    data: unknown;
}

// ============================================================================
// AI STRATEGY INTERFACE
// ============================================================================

export interface IAIStrategy {
    readonly name: string;
    readonly difficulty: 'random' | 'basic' | 'smart';

    /** 구매 결정 */
    decidePurchase(context: PurchaseContext): boolean;

    /** 건설 결정 */
    decideBuild(context: BuildContext): BuildingType[];

    /** 경매 입찰 결정 */
    decideAuctionBid(context: AuctionContext): number | 'fold';

    /** 워프 목적지 결정 */
    decideWarpDestination(context: WarpContext): number;

    /** 매각 자산 결정 */
    decideAssetToSell(context: SellContext): { deed: Deed; building?: BuildingType } | null;

    /** 대출 결정 */
    decideLoan(context: LoanContext): number | null;

    /** 보관 카드 사용 결정 */
    decideUseHeldCard(context: CardContext): boolean;
}

export interface PurchaseContext {
    player: Player;
    deed: Deed;
    gameState: GameState;
}

export interface BuildContext {
    player: Player;
    deed: Deed;
    availableBuildings: BuildingType[];
    gameState: GameState;
}

export interface AuctionContext {
    player: Player;
    deed: Deed;
    currentBid: number;
    minRaise: number;
    remainingDeeds: Deed[];
    opponents: Player[];
}

export interface WarpContext {
    player: Player;
    board: Tile[];
    phase: GamePhase;
    welfareFund: number;
    opponents: Player[];
}

export interface SellContext {
    player: Player;
    requiredAmount: number;
    gameState: GameState;
}

export interface LoanContext {
    player: Player;
    requiredAmount: number;
    gameState: GameState;
}

export interface CardContext {
    player: Player;
    card: GoldenKeyCard;
    situation: 'ISLAND_ESCAPE' | 'RENT_DISCOUNT' | 'OTHER';
    gameState: GameState;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type GameEventType =
    | 'GAME_STARTED'
    | 'TURN_STARTED'
    | 'TURN_ENDED'
    | 'DICE_ROLLED'
    | 'PLAYER_MOVED'
    | 'DEED_PURCHASED'
    | 'RENT_PAID'
    | 'BUILDING_BUILT'
    | 'AUCTION_STARTED'
    | 'AUCTION_BID'
    | 'AUCTION_ENDED'
    | 'GOLDEN_KEY_DRAWN'
    | 'PLAYER_BANKRUPT'
    | 'GAME_ENDED';

export interface GameEvent {
    type: GameEventType;
    timestamp: number;
    playerId?: string;
    data: Record<string, unknown>;
}

export interface IEventBus {
    emit(event: GameEvent): void;
    on(eventType: GameEventType, handler: (event: GameEvent) => void): void;
    off(eventType: GameEventType, handler: (event: GameEvent) => void): void;
}
