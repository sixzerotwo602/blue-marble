import React from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Building2, MapPin, Plane, AlertCircle, Coins, User } from 'lucide-react';

// --- 유틸리티 (UI 표시용) ---
const DiceIcon = ({ value, rolling }) => {
const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
const Icon = icons[value - 1] || Dice1;
return <Icon size={48} className={`text-indigo-600 ${rolling ? 'animate-spin' : ''}`} />;
};

const formatMoney = (amount) => {
return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount).replace('₩', '') + '원';
};

// 보드 그리드 스타일 계산 함수
const getGridStyle = (index) => {
// 0~5: 하단 (우->좌), 6~10: 좌측 (하->상), 11~15: 상단 (좌->우), 16~19: 우측 (상->하)
if (index >= 0 && index <= 5) return { gridRow: 6, gridColumn: 6 - index };
if (index >= 6 && index <= 10) return { gridRow: 6 - (index - 5), gridColumn: 1 };
if (index >= 11 && index <= 15) return { gridRow: 1, gridColumn: index - 10 };
if (index >= 16 && index <= 19) return { gridRow: index - 14, gridColumn: 6 };
return {};
};

/\*\*

- BlueMarbleUI Component
- - @param {Object} props
- @param {Array} props.cells - 보드 칸 데이터 배열 (id, name, type, owner, price 등)
- @param {Array} props.players - 플레이어 데이터 배열 (name, money, position, color 등)
- @param {number} props.currentTurnIndex - 현재 턴인 플레이어의 인덱스
- @param {Object} props.diceState - { d1: number, d2: number, isRolling: boolean }
- @param {string} props.gameState - 'WAITING', 'ROLLING', 'MOVING', 'ACTION', 'END'
- @param {Array} props.gameLog - 게임 로그 문자열 배열
- @param {Object} props.modalState - { type: 'BUY'|null, cell: Object } 현재 활성화된 모달 정보
- @param {Function} props.onRollDice - 주사위 굴리기 버튼 클릭 핸들러
- @param {Function} props.onBuyLand - 땅 구매 버튼 클릭 핸들러
- @param {Function} props.onPassLand - 구매 포기 버튼 클릭 핸들러
- @param {Function} props.onRestart - 재시작 버튼 클릭 핸들러
  \*/
  export default function BlueMarbleUI({
  cells = [],
  players = [],
  currentTurnIndex = 0,
  diceState = { d1: 1, d2: 1, isRolling: false },
  gameState = 'WAITING',
  gameLog = [],
  modalState = null,
  onRollDice = () => console.log('Roll Dice Clicked'),
  onBuyLand = () => console.log('Buy Land Clicked'),
  onPassLand = () => console.log('Pass Land Clicked'),
  onRestart = () => console.log('Restart Clicked'),
  }) {

const currentPlayer = players[currentTurnIndex] || players[0];

return (
<div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
<div className="max-w-6xl w-full flex flex-col lg:flex-row gap-6">

        {/* --- 왼쪽: 게임 보드 --- */}
        <div className="flex-1 bg-white p-2 rounded-xl shadow-2xl overflow-hidden">
           {/* 6x6 Grid Container */}
           <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full aspect-square bg-slate-200 border-4 border-slate-300 p-1 relative">

              {/* 센터 영역 (로고 및 주사위) */}
              <div className="col-start-2 col-end-6 row-start-2 row-end-6 bg-slate-50 flex flex-col items-center justify-center rounded-lg p-6 relative">
                 <h1 className="text-4xl font-extrabold text-indigo-600 mb-2 tracking-tighter">BLUE MARBLE</h1>
                 <p className="text-slate-400 mb-8 font-medium">Backend Connected UI</p>

                 {/* 주사위 컨트롤 */}
                 <div className="flex flex-col items-center gap-4 z-10">
                    <div className="flex gap-4 p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                        <DiceIcon value={diceState.d1} rolling={diceState.isRolling} />
                        <DiceIcon value={diceState.d2} rolling={diceState.isRolling} />
                    </div>

                    {/* 상태에 따른 버튼 표시 */}
                    {gameState === 'WAITING' && !currentPlayer?.bankrupt && (
                        <button
                            onClick={onRollDice}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg transform transition active:scale-95 animate-pulse"
                        >
                            주사위 굴리기
                        </button>
                    )}

                    {gameState !== 'WAITING' && (
                        <div className="text-slate-500 font-medium animate-bounce">
                            {gameState === 'ROLLING' ? '굴리는 중...' :
                             gameState === 'MOVING' ? '이동 중...' :
                             gameState === 'ACTION' ? '선택 대기 중...' : ''}
                        </div>
                    )}
                 </div>

                 {/* 턴 표시기 */}
                 <div className="absolute top-4 left-4">
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                        Current Turn: {players[currentTurnIndex]?.name}
                    </span>
                 </div>
              </div>

              {/* 보드 칸 렌더링 */}
              {cells.map((cell) => (
                  <div
                    key={cell.id}
                    style={getGridStyle(cell.id)}
                    className={`
                        relative border border-slate-300 flex flex-col justify-between p-1 select-none transition-colors duration-300
                        ${cell.type === 'START' || cell.type === 'ISLAND' || cell.type === 'SPACE' || cell.type === 'WELFARE' ? 'bg-slate-200' : 'bg-white'}
                        ${cell.color ? cell.color : ''}
                        ${modalState?.cell?.id === cell.id ? 'ring-4 ring-yellow-400 z-10' : ''}
                    `}
                  >
                    {/* 상단: 이름 */}
                    <div className="text-[10px] sm:text-xs font-bold text-center leading-tight pt-1 break-keep">
                        {cell.name}
                    </div>

                    {/* 중앙: 아이콘 */}
                    <div className="flex justify-center items-center opacity-30">
                        {cell.type === 'START' && <MapPin size={24} />}
                        {cell.type === 'ISLAND' && <AlertCircle size={24} />}
                        {cell.type === 'SPACE' && <Plane size={24} />}
                        {cell.type === 'WELFARE' && <Coins size={24} />}
                        {cell.type === 'LAND' && <Building2 size={24} />}
                    </div>

                    {/* 하단: 가격 */}
                    {cell.type === 'LAND' && (
                        <div className="text-[9px] text-center font-medium text-slate-600">
                            {formatMoney(cell.price).replace('원', '')}
                        </div>
                    )}

                    {/* 플레이어 토큰 (위치 기반 렌더링) */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
                        {players.map((p, idx) => p.position === cell.id && !p.bankrupt && (
                            <div key={idx} className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold z-20 transform transition-all ${p.color} ${currentTurnIndex === idx ? 'scale-110 ring-2 ring-yellow-400' : 'opacity-80'}`}>
                                P{idx + 1}
                            </div>
                        ))}
                    </div>
                  </div>
              ))}
           </div>
        </div>

        {/* --- 오른쪽: 정보 패널 --- */}
        <div className="w-full lg:w-80 flex flex-col gap-4">

            {/* 현재 턴 정보 */}
            <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-indigo-500">
                <h2 className="text-gray-500 text-sm font-bold uppercase mb-1">Current Turn</h2>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${currentPlayer?.color}`}></div>
                    <span className="text-2xl font-bold text-gray-800">{currentPlayer?.name}</span>
                </div>
                {currentPlayer?.jailed > 0 && <span className="text-red-500 text-sm">무인도 수감 중 ({currentPlayer.jailed})</span>}
            </div>

            {/* 플레이어 목록 및 자산 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1">
                <div className="bg-slate-50 p-3 border-b border-slate-100 font-bold text-slate-700">플레이어 현황</div>
                <div className="divide-y divide-slate-100">
                    {players.map((p, idx) => (
                        <div key={idx} className={`p-4 flex items-center justify-between ${currentTurnIndex === idx ? 'bg-indigo-50' : ''} ${p.bankrupt ? 'opacity-50 grayscale' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${p.color}`}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{p.name}</div>
                                    <div className="text-xs text-gray-500">{p.bankrupt ? '파산' : '경기 중'}</div>
                                </div>
                            </div>
                            <div className="text-right font-mono font-bold text-indigo-600">
                                {formatMoney(p.money)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 게임 로그 */}
            <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg h-48 overflow-y-auto text-sm font-mono leading-relaxed">
                <div className="text-xs text-slate-400 mb-2 border-b border-slate-600 pb-1">GAME LOG</div>
                {gameLog.map((log, idx) => (
                    <div key={idx} className="mb-1 opacity-90 animate-fade-in">
                        {idx === 0 ? <span className="text-yellow-400 mr-2">➤</span> : <span className="text-slate-500 mr-2">•</span>}
                        {log}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- 모달: 땅 구매 --- */}
      {modalState && modalState.type === 'BUY' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all scale-100">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{modalState.cell.name} 구매?</h3>
                    <p className="text-gray-500">이 땅의 주인은 없습니다.<br/>구매하시겠습니까?</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-slate-600">가격</span>
                        <span className="font-bold text-slate-900">{formatMoney(modalState.cell.price)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">내 자산</span>
                        <span className="font-bold text-indigo-600">{formatMoney(currentPlayer?.money || 0)}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onPassLand}
                        className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                        안 살래요
                    </button>
                    <button
                        onClick={() => onBuyLand(modalState.cell)}
                        className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
                    >
                        구매하기
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- 모달: 게임 종료 --- */}
      {gameState === 'END' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
                <h2 className="text-3xl font-black text-indigo-800 mb-4">GAME OVER</h2>
                <div className="text-xl mb-8">
                    승리자는 <span className="font-bold text-indigo-600">{players.find(p => !p.bankrupt)?.name || '없음'}</span> 입니다!
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
