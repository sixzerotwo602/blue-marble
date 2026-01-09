import React from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Building2, MapPin, AlertCircle, Coins, User, Ship, Rocket, Key } from 'lucide-react';


import { PlayerState, BoardTile, TileType, PlayerColor, GameStatus, TurnPhase, GamePhase } from '@blue-marble/shared';


// ───────────────────────────────────────────────────────────────
// 유틸리티 함수
// ───────────────────────────────────────────────────────────────

/**
 * 주사위 아이콘 컴포넌트
 */
const DiceIcon = ({ value, rolling }: { value: number; rolling: boolean }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon size={48} className={`text-indigo-600 ${rolling ? 'animate-spin' : ''}`} />;
};

/**
 * 금액 포맷팅 (한국어)
 */
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

/**
 * PlayerColor enum → CSS 클래스 매핑
 */
const getPlayerColorClass = (color: PlayerColor): string => {
  const colorMap: Record<PlayerColor, string> = {
    [PlayerColor.RED]: 'bg-red-500',
    [PlayerColor.BLUE]: 'bg-blue-500',
    [PlayerColor.YELLOW]: 'bg-yellow-500',
    [PlayerColor.GREEN]: 'bg-green-500',
  };
  return colorMap[color] || 'bg-gray-500';
};

/**
 * 보드 그리드 스타일 계산 (40칸, 11x11 그리드)
 * Index 0: 출발 (우하단), 시계방향 진행
 */
const getGridStyle = (index: number): React.CSSProperties => {
  // 0~10: 하단 (우→좌) - Bottom Row
  if (index >= 0 && index <= 10) return { gridRow: 11, gridColumn: 11 - index };
  // 11~19: 좌측 (하→상) - Left Column
  if (index > 10 && index <= 20) return { gridRow: 11 - (index - 10), gridColumn: 1 };
  // 21~29: 상단 (좌→우) - Top Row
  if (index > 20 && index <= 30) return { gridRow: 1, gridColumn: 1 + (index - 20) };
  // 31~39: 우측 (상→하) - Right Column
  if (index > 30 && index <= 39) return { gridRow: 1 + (index - 30), gridColumn: 11 };
  return {};
};

/**
 * 타일 유형에 따른 배경색 반환
 */
const getTileBackground = (type: TileType): string => {
  switch (type) {
    case TileType.START:
      return 'bg-green-100';
    case TileType.ISLAND:
      return 'bg-orange-100';
    case TileType.SPACE_TRAVEL:
      return 'bg-purple-100';
    case TileType.WELFARE_DONATION:
    case TileType.WELFARE_PAYOUT:
      return 'bg-pink-100';
    case TileType.GOLDEN_KEY:
      return 'bg-yellow-100';
    case TileType.VEHICLE:
      return 'bg-cyan-100';
    default:
      return 'bg-white';
  }
};

/**
 * 타일 유형에 따른 아이콘 반환
 */
const getTileIcon = (type: TileType): React.ReactNode => {
  switch (type) {
    case TileType.START:
      return <MapPin size={16} />;
    case TileType.ISLAND:
      return <AlertCircle size={16} />;
    case TileType.SPACE_TRAVEL:
      return <Rocket size={16} />;
    case TileType.WELFARE_DONATION:
    case TileType.WELFARE_PAYOUT:
      return <Coins size={16} />;
    case TileType.GOLDEN_KEY:
      return <Key size={16} />;
    case TileType.VEHICLE:
      return <Ship size={16} />;
    case TileType.CITY_PROPERTY:
    case TileType.NO_BUILD_PROPERTY:
      return <Building2 size={16} />;
    default:
      return null;
  }
};

// ───────────────────────────────────────────────────────────────
// Props 인터페이스
// ───────────────────────────────────────────────────────────────

interface BlueMarbleUIProps {
  tiles: BoardTile[];
  players: PlayerState[];
  currentTurnIndex: number;
  diceState: {
    die1: number;
    die2: number;
    isRolling: boolean;
  };
  gameStatus: GameStatus;
  gamePhase: GamePhase;
  turnPhase: TurnPhase;

  gameLog: string[];
  purchaseModal: {
    isOpen: boolean;
    tile: BoardTile | null;
    price: number;
  } | null;
  welfarePot: number;

  onRollDice: () => void;
  onBuyProperty: (tileIndex: number) => void;
  onPassProperty: () => void;
  onEndTurn: () => void;
  onRestart: () => void;

  // Debt Resolution Handlers
  pendingDebt: { debtorId: string; amount: number } | null;
  onSellBuilding: (propertyId: string, type: 'villa' | 'building' | 'hotel') => void;
  onTakeLoan: () => void;
  onResolveDebt: () => void;
  onDeclareBankruptcy: () => void;
}

// ───────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ───────────────────────────────────────────────────────────────

export default function BlueMarbleUI({
  tiles = [],
  players = [],
  currentTurnIndex = 0,
  diceState = { die1: 1, die2: 1, isRolling: false },
  gameStatus = GameStatus.WAITING,
  gamePhase = GamePhase.FIRST_HALF,
  turnPhase = TurnPhase.IDLE,

  gameLog = [],
  purchaseModal = null,
  welfarePot = 0,
  onRollDice = () => console.log('Roll Dice'),
  onBuyProperty = () => console.log('Buy Property'),
  onPassProperty = () => console.log('Pass Property'),
  onEndTurn = () => console.log('End Turn'),
  propertyStates = {},

  
  pendingDebt = null,
  onSellBuilding = () => {},
  onTakeLoan = () => {},
  onResolveDebt = () => {},
  onDeclareBankruptcy = () => {},
  
  onConstructBuilding = () => {},
  onTransferProperty = () => {},

  // Test Mode
  devMode = false,
  onToggleDevMode = () => {},
}: BlueMarbleUIProps & { 
    propertyStates?: Record<string, any>; 
    onConstructBuilding?: (propertyId: string, type: 'villa' | 'building' | 'hotel') => void;
    onTransferProperty?: (propertyId: string) => void;
    devMode?: boolean;
    onToggleDevMode?: () => void;
}) {




  const currentPlayer = players[currentTurnIndex] || null;
  const canRollDice = gameStatus === GameStatus.PLAYING && 
                      turnPhase === TurnPhase.IDLE && 
                      currentPlayer && 
                      !currentPlayer.bankrupt;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-[1400px] w-full flex flex-col lg:flex-row gap-6">

        {/* 왼쪽: 게임 보드 */}
        <div className="flex-1 bg-white p-2 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] grid-rows-[repeat(11,minmax(0,1fr))] gap-0.5 w-full aspect-square bg-slate-200 border-4 border-slate-300 p-1 relative">
            
            {/* ... CENTER AREA (Keep existing) ... */}
            <div className="col-start-2 col-end-[11] row-start-2 row-end-[11] bg-slate-50 flex flex-col items-center justify-center rounded-lg p-6 relative">
              <h1 className="text-4xl font-extrabold text-indigo-600 mb-2 tracking-tighter">BLUE MARBLE</h1>
              <p className="text-slate-400 mb-2 font-medium">Core Game Engine v1.0</p>
              
              <div className={`px-4 py-1 rounded-full text-sm font-bold mb-6 ${gamePhase === GamePhase.SECOND_HALF ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                   {gamePhase === GamePhase.SECOND_HALF ? '후반전 (건설 가능)' : '전반전 (증서 구매)'}
              </div>


              {welfarePot > 0 && (
                <div className="absolute top-4 right-4 bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold">
                  복지기금: {formatMoney(welfarePot)}
                </div>
              )}

              {/* Test Mode Toggle */}
              <button
                onClick={onToggleDevMode}
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  devMode 
                    ? 'bg-yellow-400 text-yellow-900 ring-2 ring-yellow-500' 
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
                title="테스트 모드: 모든 플레이어 조작 가능"
              >
                🧪 {devMode ? '테스트 ON' : '테스트 OFF'}
              </button>


              <div className="flex flex-col items-center gap-4 z-10">
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <DiceIcon value={diceState.die1} rolling={diceState.isRolling} />
                  <DiceIcon value={diceState.die2} rolling={diceState.isRolling} />
                </div>

                {canRollDice && (
                  <button
                    onClick={onRollDice}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg transform transition active:scale-95 animate-pulse"
                  >
                    주사위 굴리기
                  </button>
                )}

                {turnPhase === TurnPhase.MOVING && (
                  <div className="text-slate-500 font-medium animate-bounce">이동 중...</div>
                )}
                {turnPhase === TurnPhase.ACTION_PHASE && (
                   <div className="text-indigo-600 font-bold animate-pulse">행동 선택 중...</div>
                )}
                {turnPhase === TurnPhase.TURN_END && (
                  <button onClick={onEndTurn} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg">
                    턴 종료
                  </button>
                )}
              </div>

              {currentPlayer && (
                <div className="absolute top-4 left-4">
                  <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    현재 턴: {currentPlayer.name}
                  </span>
                </div>
              )}
            </div>

            {/* 보드 타일 렌더링 */}
            {tiles.map((tile) => {
              const pState = tile.propertyId ? propertyStates[tile.propertyId] : null;
              const owner = pState?.ownerPlayerId ? players.find(p => p.id === pState.ownerPlayerId) : null;

              return (
              <div
                key={tile.index}
                style={getGridStyle(tile.index)}
                onClick={() => {
                   // 1. Debt Resolution Phase: Sell or Transfer
                  if (turnPhase === TurnPhase.DEBT_RESOLUTION && 
                      owner && currentPlayer && owner.id === currentPlayer.id && tile.propertyId) {
                       const counts = propertyStates[tile.propertyId]?.buildingCounts;
                       
                       // Option A: Transfer Property (if Debt exists and insufficient funds? Or just allow?)
                       // For MVP, if building count > 0, ask to Sell Building. 
                       // If building count == 0 or user chooses Transfer, ask Transfer?
                       // Let's make it simple prompt flow.
                       
                       const hasBuildings = counts && (counts.hotel > 0 || counts.building > 0 || counts.villa > 0);
                       
                       if (hasBuildings) {
                           let type: 'hotel' | 'building' | 'villa' | null = null;
                           if (counts.hotel > 0) type = 'hotel';
                           else if (counts.building > 0) type = 'building';
                           else if (counts.villa > 0) type = 'villa';
                           
                           if (type && window.confirm(`${tile.name}의 ${type}을(를) 매각하시겠습니까? (취소 시 증서 양도)`)) {
                               onSellBuilding(tile.propertyId, type);
                               return;
                           }
                       }
                       
                       // If no buildings or Cancelled sell, offer Transfer
                       if (window.confirm(`${tile.name} 증서를 채권자에게 양도하여 빚을 청산하시겠습니까?`)) {
                           if (onTransferProperty) onTransferProperty(tile.propertyId);
                       }
                  } 
                  // 2. Action Phase / Idle Phase in Second Half: Construct Building
                  else if (turnPhase === TurnPhase.IDLE && 
                           currentPlayer && currentPlayer.id === players[currentTurnIndex].id &&
                           owner && owner.id === currentPlayer.id && 
                           tile.propertyId && 
                           propertyStates[tile.propertyId] &&
                           /* Check if Second Half is tracked in UI? We need gamePhase prop, or derive it. 
                              For now, just allow if owner clicks and let server reject if Wrong Phase. */
                           // Better: Check if can build (server rejects anyway)
                           players.some(p => p.id === currentPlayer.id) // Dummy check
                           ) {
                        
                        // Simple Prompt for Construction
                        // In real UI, this should be a nice modal.
                        // MVP: Window prompt
                        
                        const typeInput = window.prompt(`${tile.name}에 건설할 건물을 입력하세요 (villa / building / hotel)`);
                        if (typeInput === 'villa' || typeInput === 'building' || typeInput === 'hotel') {
                             if (onConstructBuilding) onConstructBuilding(tile.propertyId, typeInput);
                        }
                  }
                }}

                className={`
                  relative border border-slate-300 flex flex-col justify-between p-0.5 select-none transition-colors duration-300 text-[10px] cursor-pointer
                  ${getTileBackground(tile.type)}
                  ${purchaseModal?.tile?.index === tile.index ? 'ring-4 ring-yellow-400 z-10' : ''}
                  ${owner ? `ring-2 ring-inset ${owner.color === PlayerColor.RED ? 'ring-red-500' : owner.color === PlayerColor.BLUE ? 'ring-blue-500' : owner.color === PlayerColor.YELLOW ? 'ring-yellow-500' : 'ring-green-500'}` : ''}
                  ${turnPhase === TurnPhase.DEBT_RESOLUTION && owner?.id === currentPlayer?.id ? 'ring-4 ring-red-400 animate-pulse hover:bg-red-50' : ''}
                `}
              >
                {owner && (
                    <div className={`absolute top-0 right-0 w-3 h-3 ${getPlayerColorClass(owner.color)} rounded-bl-lg shadow-sm z-0`} />
                )}
                <div className="font-bold text-center leading-tight pt-0.5 break-keep line-clamp-2 z-10">
                  {tile.name}
                </div>
                
                {/* T054: Building Visualization */}
                {tile.propertyId && propertyStates[tile.propertyId] && (
                  <div className="flex justify-center items-center gap-px z-10 mt-0.5">
                    {/* Villas - Green dots */}
                    {Array.from({ length: propertyStates[tile.propertyId].buildingCounts?.villa || 0 }).map((_, i) => (
                      <span key={`v${i}`} className="w-1.5 h-1.5 rounded-full bg-green-500 border border-green-600" title="별장" />
                    ))}
                    {/* Buildings - Blue squares */}
                    {Array.from({ length: propertyStates[tile.propertyId].buildingCounts?.building || 0 }).map((_, i) => (
                      <span key={`b${i}`} className="w-1.5 h-1.5 bg-blue-500 border border-blue-600" title="빌딩" />
                    ))}
                    {/* Hotels - Red diamonds */}
                    {Array.from({ length: propertyStates[tile.propertyId].buildingCounts?.hotel || 0 }).map((_, i) => (
                      <span key={`h${i}`} className="w-2 h-2 bg-red-500 border border-red-600 rotate-45" title="호텔" />
                    ))}
                  </div>
                )}

                <div className="flex justify-center items-center opacity-30 my-auto z-0">
                  {getTileIcon(tile.type)}
                </div>


                <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none flex-wrap p-1">
                  {players.map((player, idx) => (
                    player.position === tile.index && !player.bankrupt && (
                      <div
                        key={player.id}
                        className={`
                          w-4 h-4 sm:w-6 sm:h-6 rounded-full border border-white shadow-lg 
                          flex items-center justify-center text-white text-[8px] font-bold z-20 
                          transform transition-all
                          ${getPlayerColorClass(player.color)}
                          ${currentTurnIndex === idx ? 'scale-110 ring-2 ring-yellow-400' : 'opacity-80'}
                        `}
                      >
                        P{idx + 1}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* 오른쪽: 정보 패널 */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
            {/* ... Player Info & Log panels ... */}
           <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-indigo-500">
              {currentPlayer && (
                <>
                  <h2 className="text-gray-500 text-sm font-bold uppercase mb-1">Current Turn</h2>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getPlayerColorClass(currentPlayer.color)}`}></div>
                    <span className="text-2xl font-bold text-gray-800">{currentPlayer.name}</span>
                  </div>
                  {currentPlayer.islandTurnsLeft > 0 && <span className="text-red-500 text-sm">무인도 수감 중 ({currentPlayer.islandTurnsLeft}턴 남음)</span>}
                  {currentPlayer.pendingSpaceChoice && <span className="text-purple-500 text-sm">우주여행 목적지 선택 대기</span>}
                  {currentPlayer.hasLoan && <span className="text-blue-500 text-sm block">대출 보유 중</span>}
                </>
              )}
            </div>

             <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 min-h-[300px]">
            <div className="bg-slate-50 p-3 border-b border-slate-100 font-bold text-slate-700">플레이어 현황</div>
            <div className="divide-y divide-slate-100">
              {players.map((player, idx) => (
                <div key={player.id} className={`p-4 flex items-center justify-between ${currentTurnIndex === idx ? 'bg-indigo-50' : ''} ${player.bankrupt ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${getPlayerColorClass(player.color)}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.bankrupt ? '파산' : `위치: ${player.position}`}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-indigo-600">{formatMoney(player.money)}</div>
                    <div className="text-xs text-gray-400">증서: {player.ownedPropertyIds.length}개</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
           <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg h-48 overflow-y-auto text-sm font-mono leading-relaxed">
            <div className="text-xs text-slate-400 mb-2 border-b border-slate-600 pb-1">GAME LOG</div>
            {gameLog.map((log, idx) => (
              <div key={idx} className="mb-1 opacity-90">
                {idx === 0 ? <span className="text-yellow-400 mr-2">➤</span> : <span className="text-slate-500 mr-2">•</span>}
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {purchaseModal && purchaseModal.isOpen && purchaseModal.tile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform scale-100 animate-pop-in">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                 {getTileIcon(purchaseModal.tile.type)}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{purchaseModal.tile.name}</h3>
              <p className="text-gray-500 mb-6">구매하시겠습니까?</p>
              
              <div className="text-3xl font-bold text-indigo-600 mb-8 font-mono">
                {formatMoney(purchaseModal.price)}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onPassProperty}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
                >
                  포기하기
                </button>
                <button
                  onClick={() => purchaseModal.tile && onBuyProperty(purchaseModal.tile.index)}
                  className="flex-1 px-4 py-3 bg-indigo-600 rounded-xl font-bold text-white hover:bg-indigo-700 shadow-lg transform transition active:scale-95"
                >
                  구매하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debt Resolution Overlay */}
      {turnPhase === TurnPhase.DEBT_RESOLUTION && pendingDebt && (
        <div className="fixed inset-0 bg-red-900/50 flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-red-500 max-w-md w-full animate-shake">
              <h2 className="text-2xl font-bold text-red-600 mb-4 animate-pulse">자금 부족!</h2>
              <p className="mb-2">지불해야 할 금액: <span className="font-bold text-xl">{formatMoney(pendingDebt.amount)}</span></p>
              <p className="mb-6 text-sm text-gray-500">현재 자산: {currentPlayer ? formatMoney(currentPlayer.money) : 0}</p>
              
              <div className="space-y-3">
                 <button
                   onClick={onResolveDebt}
                   disabled={!currentPlayer || currentPlayer.money < pendingDebt.amount}
                   className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${!currentPlayer || currentPlayer.money < pendingDebt.amount ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                 >
                   지불하기
                 </button>
                 
                 <div className="flex gap-2">
                    <button
                        onClick={onTakeLoan} 
                        disabled={currentPlayer?.hasLoan}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        대출받기
                    </button>
                     <button
                        onClick={onDeclareBankruptcy}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                    >
                        파산신청
                    </button>
                 </div>
                 
                 <p className="text-xs text-center text-gray-400 mt-2">
                    * 보유 자산을 클릭하여 매각하세요. (지도 클릭)
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* T058: Game Over Screen */}
      {gameStatus === GameStatus.FINISHED && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl shadow-2xl max-w-lg w-full text-white animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-extrabold mb-2">🏆 게임 종료!</h2>
              <p className="text-indigo-200">최종 순위</p>
            </div>

            <div className="space-y-3">
              {players
                .map(p => {
                  // Calculate Net Worth (Money + Properties)
                  let netWorth = p.money;
                  p.ownedPropertyIds?.forEach(pid => {
                    // Simplified: Just count properties. Full calculation needs PROPERTY_SPECS.
                    // For display, we show owned count * estimated value.
                    netWorth += 500000; // Placeholder average property value
                    const pState = propertyStates[pid];
                    if (pState?.buildingCounts) {
                      netWorth += (pState.buildingCounts.villa || 0) * 100000;
                      netWorth += (pState.buildingCounts.building || 0) * 200000;
                      netWorth += (pState.buildingCounts.hotel || 0) * 400000;
                    }
                  });
                  return { ...p, netWorth };
                })
                .sort((a, b) => (b.bankrupt ? -1 : b.netWorth) - (a.bankrupt ? -1 : a.netWorth))
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      idx === 0 ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-white/10'
                    } ${p.bankrupt ? 'opacity-50 line-through' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${idx === 0 ? 'text-yellow-300' : 'text-white/70'}`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                      <div className={`w-10 h-10 rounded-full ${getPlayerColorClass(p.color)} flex items-center justify-center shadow-lg`}>
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs text-indigo-200">
                          {p.bankrupt ? '파산' : `증서 ${p.ownedPropertyIds?.length || 0}개`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-lg font-bold ${idx === 0 ? 'text-yellow-300' : ''}`}>
                        {formatMoney(p.netWorth)}
                      </div>
                      <div className="text-xs text-indigo-300">총 자산</div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white text-indigo-900 rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform"
              >
                새 게임
              </button>
            </div>
          </div>
        </div>
      )}

    </div>


  );
}

