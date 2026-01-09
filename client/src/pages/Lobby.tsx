import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { socket } from '../services/socket';

export default function Lobby() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gameState, playerId, setGameState } = useGameStore();

  useEffect(() => {
    if (!id || !gameState) return;
    
    // Auto-redirect if game is already playing
    if (gameState.status === 'playing') {
        navigate(`/game/${id}`);
        return;
    }

    // Connect socket logic
    if (!socket.connected) {
      socket.io.opts.query = { gameId: id, playerId };
      socket.connect();
    } 

    // Listeners
    socket.on('playerJoined', (data: any) => {
      if (data.gameState) setGameState(data.gameState);
    });

    socket.on('gameUpdate', (data: any) => {
        if (data.gameState) {
            setGameState(data.gameState);
            if (data.gameState.status === 'playing') {
                navigate(`/game/${id}`);
            }
        }
    });

    socket.on('gameStarted', (data: any) => {
      setGameState(data.gameState);
      navigate(`/game/${id}`);
    });

    // Request initial sync (joinRoom)
    socket.emit('joinRoom', id);

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('gameUpdate');
    };
  }, [id, gameState?.status, navigate, setGameState, playerId]);

  const handleStart = async () => {
    try {
      const res = await fetch(`/api/games/${id}/start`, { method: 'POST' });
      if (!res.ok) {
          const err = await res.json();
          alert(`게임 시작 실패: ${err.error}`);
          return;
      }
    } catch (err) {
      console.error(err);
      alert('서버 통신 오류가 발생했습니다.');
    }
  };

  if (!gameState) return <div>Loading...</div>;

  const isHost = gameState.hostPlayerId === playerId;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Lobby: {id}</h1>
        <h2 className="text-xl mb-2">Players ({gameState.players.length}/4)</h2>
        <ul className="space-y-2 mb-6">
          {gameState.players.map(p => (
            <li key={p.id} className="p-2 bg-gray-50 rounded flex justify-between">
              <span>{p.name} {p.id === playerId ? '(You)' : ''} {p.id === gameState.hostPlayerId ? '👑' : ''}</span>
              <span style={{ color: p.color }}>●</span>
            </li>
          ))}
        </ul>
        
        {isHost && (
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded text-lg font-bold hover:bg-blue-700 disabled:opacity-50"
            onClick={handleStart}
            disabled={gameState.players.length < 1}
          >
            Start Game {gameState.players.length < 2 ? '(Solo Test)' : ''}
          </button>
        )}

        {!isHost && <p className="text-gray-500">Waiting for host to start...</p>}
      </div>
    </div>
  );
}
