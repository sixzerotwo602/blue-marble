import React from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Building2, MapPin, Plane, AlertCircle, Coins, User, Ship, Rocket, Key } from 'lucide-react';

// ───────────────────────────────────────────────────────────────
// 타입 임포트 (contracts/types.ts, contracts/enums.ts 기반)
// ───────────────────────────────────────────────────────────────
import type { PlayerState, GameState, BoardTile } from '../contracts/types';
import { TileType, PlayerColor, GameStatus, TurnPhase } from '../contracts/enums';

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
// Props 인터페이스 (contracts 기반)
// ───────────────────────────────────────────────────────────────

interface BlueMarbleUIProps {
  /** 보드 타일 배열 (40칸) */
  tiles: BoardTile[];
  /** 플레이어 상태 배열 */
  players: PlayerState[];
  /** 현재 턴 인덱스 */
  currentTurnIndex: number;
  /** 주사위 상태 */
  diceState: {
    die1: number;
    die2: number;
    isRolling: boolean;
  };
  /** 게임 상태 */
  gameStatus: GameStatus;
  /** 턴 단계 */
  turnPhase: TurnPhase;
  /** 게임 로그 */
  gameLog: string[];
  /** 구매 모달 상태 */
  purchaseModal: {
    isOpen: boolean;
    tile: BoardTile | null;
    price: number;
  } | null;
  /** 사회복지기금 누적액 */
  welfarePot: number;

  // 이벤트 핸들러
  onRollDice: () => void;
  onBuyProperty: (tileIndex: number) => void;
  onPassProperty: () => void;
  onEndTurn: () => void;
  onRestart: () => void;
}

// ───────────────────────────────────────────────────────────────
// 메인 컴포넌트
// ───────────────────────────────────────────────────────────────

/**
 * BlueMarbleUI Component
 * 
 * 부루마블 게임 UI 레퍼런스 구현
 * - 40칸 11x11 그리드 보드
 * - contracts/types.ts 및 enums.ts 기반 데이터 바인딩
 * 
 * @see spec.md FR-006: 40개 칸 보드 관리
 * @see contracts/types.ts: PlayerState, GameState, BoardTile
 * @see contracts/enums.ts: TileType, PlayerColor, GameStatus, TurnPhase
 */
export default function BlueMarbleUI({
  tiles = [],
  players = [],
  currentTurnIndex = 0,
  diceState = { die1: 1, die2: 1, isRolling: false },
  gameStatus = GameStatus.WAITING,
  turnPhase = TurnPhase.IDLE,
  gameLog = [],
  purchaseModal = null,
  welfarePot = 0,
  onRollDice = () => console.log('Roll Dice'),
  onBuyProperty = () => console.log('Buy Property'),
  onPassProperty = () => console.log('Pass Property'),
  onEndTurn = () => console.log('End Turn'),
  onRestart = () => console.log('Restart'),
}: BlueMarbleUIProps) {

  const currentPlayer = players[currentTurnIndex] || null;
  const canRollDice = gameStatus === GameStatus.PLAYING && 
                      turnPhase === TurnPhase.IDLE && 
                      currentPlayer && 
                      !currentPlayer.bankrupt;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-[1400px] w-full flex flex-col lg:flex-row gap-6">

        {/* ─────────────────────────────────────────────────────────── */}
        {/* 왼쪽: 게임 보드 (11x11 Grid for 40 tiles) */}
        {/* ─────────────────────────────────────────────────────────── */}
        <div className="flex-1 bg-white p-2 rounded-xl shadow-2xl overflow-hidden">
          {/* 11x11 Grid Container */}
          <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] grid-rows-[repeat(11,minmax(0,1fr))] gap-0.5 w-full aspect-square bg-slate-200 border-4 border-slate-300 p-1 relative">

            {/* 센터 영역 (로고 및 주사위 - Inner 9x9) */}
            <div className="col-start-2 col-end-[11] row-start-2 row-end-[11] bg-slate-50 flex flex-col items-center justify-center rounded-lg p-6 relative">
              <h1 className="text-4xl font-extrabold text-indigo-600 mb-2 tracking-tighter">BLUE MARBLE</h1>
              <p className="text-slate-400 mb-8 font-medium">Core Game Engine v1.0</p>

              {/* 사회복지기금 표시 */}
              {welfarePot > 0 && (
                <div className="absolute top-4 right-4 bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-bold">
                  복지기금: {formatMoney(welfarePot)}
                </div>
              )}

              {/* 주사위 컨트롤 */}
              <div className="flex flex-col items-center gap-4 z-10">
                <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <DiceIcon value={diceState.die1} rolling={diceState.isRolling} />
                  <DiceIcon value={diceState.die2} rolling={diceState.isRolling} />
                </div>

                {/* 상태에 따른 버튼 표시 */}
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
                  <div className="text-slate-500 font-medium">선택 대기 중...</div>
                )}

                {turnPhase === TurnPhase.TURN_END && (
                  <button
                    onClick={onEndTurn}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-bold shadow-lg"
                  >
                    턴 종료
                  </button>
                )}
              </div>

              {/* 턴 표시기 */}
              {currentPlayer && (
                <div className="absolute top-4 left-4">
                  <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    현재 턴: {currentPlayer.name}
                  </span>
                </div>
              )}
            </div>

            {/* 보드 타일 렌더링 */}
            {tiles.map((tile) => (
              <div
                key={tile.index}
                style={getGridStyle(tile.index)}
                className={`
                  relative border border-slate-300 flex flex-col justify-between p-0.5 select-none transition-colors duration-300 text-[10px]
                  ${getTileBackground(tile.type)}
                  ${purchaseModal?.tile?.index === tile.index ? 'ring-4 ring-yellow-400 z-10' : ''}
                `}
              >
                {/* 상단: 이름 */}
                <div className="font-bold text-center leading-tight pt-0.5 break-keep line-clamp-2">
                  {tile.name}
                </div>

                {/* 중앙: 아이콘 */}
                <div className="flex justify-center items-center opacity-30 my-auto">
                  {getTileIcon(tile.type)}
                </div>

                {/* 플레이어 토큰 */}
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
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* 오른쪽: 정보 패널 */}
        {/* ─────────────────────────────────────────────────────────── */}
        <div className="w-full lg:w-80 flex flex-col gap-4">

          {/* 현재 턴 정보 */}
          {currentPlayer && (
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-indigo-500">
              <h2 className="text-gray-500 text-sm font-bold uppercase mb-1">Current Turn</h2>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getPlayerColorClass(currentPlayer.color)}`}></div>
                <span className="text-2xl font-bold text-gray-800">{currentPlayer.name}</span>
              </div>
              {currentPlayer.islandTurnsLeft > 0 && (
                <span className="text-red-500 text-sm">
                  무인도 수감 중 ({currentPlayer.islandTurnsLeft}턴 남음)
                </span>
              )}
              {currentPlayer.pendingSpaceChoice && (
                <span className="text-purple-500 text-sm">우주여행 목적지 선택 대기</span>
              )}
            </div>
          )}

          {/* 플레이어 목록 및 자산 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 min-h-[300px]">
            <div className="bg-slate-50 p-3 border-b border-slate-100 font-bold text-slate-700">
              플레이어 현황
            </div>
            <div className="divide-y divide-slate-100">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className={`
                    p-4 flex items-center justify-between
                    ${currentTurnIndex === idx ? 'bg-indigo-50' : ''}
                    ${player.bankrupt ? 'opacity-50 grayscale' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${getPlayerColorClass(player.color)}`}>
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        {player.bankrupt ? '파산' : `위치: ${player.position}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-indigo-600">
                      {formatMoney(player.money)}
                    </div>
                    <div className="text-xs text-gray-400">
                      증서: {player.ownedPropertyIds.length}개
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 게임 로그 */}
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

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 모달: 땅 구매 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {purchaseModal?.isOpen && purchaseModal.tile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{purchaseModal.tile.name} 구매?</h3>
              <p className="text-gray-500">이 땅의 주인이 없습니다.<br />구매하시겠습니까?</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">가격</span>
                <span className="font-bold text-slate-900">{formatMoney(purchaseModal.price)}</span>
              </div>
              {currentPlayer && (
                <div className="flex justify-between">
                  <span className="text-slate-600">내 자산</span>
                  <span className="font-bold text-indigo-600">{formatMoney(currentPlayer.money)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onPassProperty}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                안 살래요
              </button>
              <button
                onClick={() => purchaseModal.tile && onBuyProperty(purchaseModal.tile.index)}
                disabled={currentPlayer && currentPlayer.money < purchaseModal.price}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                구매하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 모달: 게임 종료 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {gameStatus === GameStatus.FINISHED && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
            <h2 className="text-3xl font-black text-indigo-800 mb-4">GAME OVER</h2>
            <div className="text-xl mb-8">
              승리자는 <span className="font-bold text-indigo-600">
                {players.find((p) => !p.bankrupt)?.name || '없음'}
              </span> 입니다!
            </div>
            <button
              onClick={onRestart}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition"
            >
              다시 하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
