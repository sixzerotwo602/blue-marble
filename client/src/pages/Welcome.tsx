import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { GameMode } from '@blue-marble/shared';

export default function Welcome() {
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();
  const { setPlayerId, setGameState } = useGameStore();

  const handleCreate = async () => {
    if (!name) return alert('Name is required');
    try {
      // 1. Create Game
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: GameMode.ORDINARY, timeLimit: 60 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 2. Join Game (Host)
      const joinRes = await fetch(`/api/games/${data.gameId}/join`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ playerName: name }),
      });
      const joinData = await joinRes.json();
      if (!joinRes.ok) throw new Error(joinData.error);
      
      setPlayerId(joinData.playerId);
      setGameState(joinData.gameState);
      navigate(`/lobby/${data.gameId}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleJoin = async () => {
    if (!name || !gameId) return alert('Name and GameID required');
    try {
      const res = await fetch(`/api/games/${gameId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      navigate(`/lobby/${gameId}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <h1 className="text-4xl font-bold mb-8 text-blue-700">Blue Marble</h1>
      
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <input 
          className="w-full border p-2 rounded" 
          placeholder="Your Name" 
          value={name} 
          onChange={e => setName(e.target.value)} 
        />
        
        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Create New Game</h2>
          <button 
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            onClick={handleCreate}
          >
            Create Game
          </button>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Join Existing Game</h2>
          <input 
            className="w-full border p-2 rounded mb-2" 
            placeholder="Game ID" 
            value={gameId} 
            onChange={e => setGameId(e.target.value)} 
          />
          <button 
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            onClick={handleJoin}
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}
