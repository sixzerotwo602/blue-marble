import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { socket } from '../services/socket';
import BlueMarbleUI from '../components/BlueMarbleUI';
import { BOARD_TILES, TurnPhase, PROPERTY_SPECS } from '@blue-marble/shared';


export default function Game() {
  const { id } = useParams();
  const { gameState, setGameState, playerId } = useGameStore();

  useEffect(() => {
    if (!socket.connected) {
      if (id && playerId) {
         socket.io.opts.query = { gameId: id, playerId };
         socket.connect();
      }
    }

    socket.on('diceRolled', () => {
        // Handle dice roll animation?
    });

    socket.on('gameUpdate', (data: any) => { // Generic update
        setGameState(data.gameState);
    });

    return () => {
        socket.off('diceRolled');
        socket.off('gameUpdate');
    };
  }, [id, playerId, setGameState]);

  if (!gameState) return <div>Loading Game...</div>;

  const handleBuy = (buy: boolean) => {
      fetch(`/api/games/${id}/purchase`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ playerId, buy })
      });
  };

  // Determine Purchase Modal
  let purchaseModal = null;
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  if (gameState.turnPhase === TurnPhase.ACTION_PHASE && currentPlayer && currentPlayer.id === playerId) {
      const tile = BOARD_TILES[currentPlayer.position];
      if (tile && tile.propertyId) {
          const pState = gameState.propertyStates[tile.propertyId];
           // If unowned
           if (!pState || !pState.ownerPlayerId) {
                const spec = PROPERTY_SPECS[tile.propertyId];
                if (spec) {
                     purchaseModal = {
                         isOpen: true,
                         tile, 
                         price: spec.purchasePrice
                     };
                }
           }
      }
  }

  return (
    <BlueMarbleUI 
      tiles={BOARD_TILES}
      players={gameState.players}

      currentTurnIndex={gameState.currentTurnIndex}
      diceState={{ 
        die1: gameState.diceResult?.[0] || 1, 
        die2: gameState.diceResult?.[1] || 1, 
        isRolling: false 
      }}
      gameStatus={gameState.status}
      gamePhase={gameState.phase}
      turnPhase={gameState.turnPhase}

      gameLog={gameState.logs || []} 
      welfarePot={gameState.welfarePot}

      purchaseModal={purchaseModal}
      propertyStates={gameState.propertyStates}
      onRollDice={() => {
        fetch(`/api/games/${id}/roll`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ playerId })
        });
      }}
      onBuyProperty={() => handleBuy(true)}
      onPassProperty={() => handleBuy(false)}
      onEndTurn={() => {}}
      onRestart={() => {}}

      pendingDebt={gameState.pendingDebt || null}
      onSellBuilding={(propertyId, type) => {
        fetch(`/api/games/${id}/sell-building`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ playerId, propertyId, type })
        });
      }}
      onTakeLoan={() => {
        fetch(`/api/games/${id}/take-loan`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ playerId })
        });
      }}
      onResolveDebt={() => {
         fetch(`/api/games/${id}/resolve-debt`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ playerId })
        });
      }}
      onDeclareBankruptcy={() => {
         if(confirm("정말로 파산하시겠습니까? 돌이킬 수 없습니다.")) {
            fetch(`/api/games/${id}/bankruptcy`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ playerId })
            });
         }
      }}
      
      // T052: Construct Building Handler
      onConstructBuilding={(propertyId, type) => {
          fetch(`/api/games/${id}/construct`, {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ playerId, propertyId, type })
          });
      }}
      
      // T044: Transfer Property Handler
      onTransferProperty={(propertyId) => {
          fetch(`/api/games/${id}/transfer-property`, {
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ playerId, propertyId })
          });
      }}

    />

  );
}

