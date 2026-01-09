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
    
    // Connect socket logic
    if (!socket.connected) {
      socket.io.opts.query = { gameId: id, playerId };
      socket.connect();
    } // Or just emit joinRoom?

    // Listeners
    socket.on('playerJoined', (data: any) => {
      // In a real app we might patch the gameState carefully or refetch
      // For MVP, server sends full updated gamestate?
      if (data.gameState) setGameState(data.gameState);
    });

    socket.on('gameStarted', (data: any) => {
      setGameState(data.gameState);
      navigate(`/game/${id}`);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
    };
  }, [id, gameState, navigate, setGameState, playerId]);

  const handleStart = async () => {
    try {
      await fetch(`/api/games/${id}/start`, { method: 'POST' });
    } catch (err) {
      console.error(err);
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
            disabled={gameState.players.length < 2}
          >
            Start Game
          </button>
        )}
        {!isHost && <p className="text-gray-500">Waiting for host to start...</p>}
      </div>
    </div>
  );
}
