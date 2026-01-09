import { GameState, GameMode, PlayerState, PlayerColor, GameStatus, GamePhase, GAME_CONSTANTS, TileType, TurnPhase, BOARD_TILES, PROPERTY_SPECS, CardEffectType, getGoldenKeyCardById, createShuffledDeck, SPECIAL_TILE_INDICES } from '@blue-marble/shared';



import { createGameState } from '../models/game-state.js';
import { createPlayer } from '../models/player.js';
import { Dice } from '../utils/dice.js';
import { calculateToll } from '../utils/toll-utils.js';

const games: Record<string, GameState> = {};

export class GameService {

  private static log(game: GameState, message: string) {
      if (game.logs) {
          game.logs.unshift(message); // Newest first
          if (game.logs.length > 50) game.logs.pop();
      }
  }

  // T037: payToll
  private static payToll(game: GameState, sender: PlayerState, receiver: PlayerState, amount: number) {
      if (amount <= 0) return;

      // Check Free Pass (T040)
      if (sender.freePassCardCount > 0) {
          sender.freePassCardCount--;
          this.log(game, `${sender.name}님이 우대권을 사용하여 통행료를 면제받았습니다.`);
          // Note: Card ID return to deck is deferred to Phase 10 or requires deck management updates
          return;
      }

      if (sender.money < amount) {
          // T042: Insufficient Funds -> Trigger DEBT_RESOLUTION
          game.pendingDebt = {
              debtorId: sender.id,
              creditorId: receiver.id,
              amount: amount
          };
          game.turnPhase = TurnPhase.DEBT_RESOLUTION;
          this.log(game, `${sender.name}님이 자금이 부족합니다. 자산 매각 또는 대출이 필요합니다. (필요 금액: ${amount.toLocaleString()}원)`);
      } else {

          sender.money -= amount;
          receiver.money += amount;
          this.log(game, `${sender.name}님이 ${receiver.name}님에게 통행료 ${amount.toLocaleString()}원을 지불했습니다.`);
      }
  }

  static async createGame(mode: GameMode = GameMode.ORDINARY, timeLimitMinutes: number | null = null): Promise<GameState> {
     const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
     const game = createGameState(roomCode, '', mode);
     game.timeLimitMinutes = timeLimitMinutes;
     
     games[game.id] = game;
     return game;
  }

  static async joinGame(gameId: string, playerName: string): Promise<{ player: PlayerState; gameState: GameState }> {
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    if (game.status !== GameStatus.WAITING) throw new Error('Game already started');
    if (game.players.length >= GAME_CONSTANTS.MAX_PLAYERS) throw new Error('Room is full');

    // Assign color
    const colors = Object.values(PlayerColor);
    const assignedColor = colors[game.players.length % colors.length];


    const player = createPlayer(playerName, assignedColor); // Initial Money set by default (3-4P). Logic adjustments strictly in startGame 
    game.players.push(player);

    if (game.players.length === 1) {
      game.hostPlayerId = player.id;
    }

    return { player, gameState: game };
  }

  static async startGame(gameId: string): Promise<GameState> {
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    if (game.players.length < 2) throw new Error('Not enough players');
    if (game.status !== GameStatus.WAITING) throw new Error('Game already started');

    game.status = GameStatus.PLAYING;
    game.startedAt = Date.now();
    this.log(game, '게임이 시작되었습니다.');

    // Shuffle Order

    for (let i = game.players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [game.players[i], game.players[j]] = [game.players[j], game.players[i]];
    }
    game.turnOrder = game.players.map(p => p.id);
    game.currentTurnIndex = 0;

    // Adjust Initial Money for 2 Players
    // Default is 3-4P (2.93M). 2P is 5.86M.
    if (game.players.length === 2) {
      game.players.forEach(p => {
        p.money = GAME_CONSTANTS.INITIAL_MONEY_2P;
      });
    }

    return game;
  }

  static async rollDice(gameId: string, playerId: string): Promise<[number, number]> {
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    
    const currentPlayer = game.players[game.currentTurnIndex];
    
    // Skip turn validation in devMode (single tester can play all)
    if (!game.devMode && currentPlayer.id !== playerId) {
      throw new Error('Not your turn');
    }


    const result = Dice.roll();
    game.diceResult = result;
    this.log(game, `${currentPlayer.name}님이 주사위 ${result[0]}, ${result[1]}을(를) 굴렸습니다.`);
    
    // Double logic

    if (Dice.isDouble(result)) {
      currentPlayer.doubleCount++;
    } else {
      currentPlayer.doubleCount = 0;
    }

    // Island check (T062 placeholder)
    if (currentPlayer.islandTurnsLeft > 0) {
       if (Dice.isDouble(result)) {
         currentPlayer.islandTurnsLeft = 0;
         // Escaped! Proceed to move.
       } else {
         currentPlayer.islandTurnsLeft--;
         return result; // Stay in island
       }
    }

    // Move
    const steps = result[0] + result[1];
    this.movePlayer(game, currentPlayer, steps);

    // Handle Landing
    this.handleLanding(game, currentPlayer);
    
    return result;
  }

  private static movePlayer(game: GameState, player: PlayerState, steps: number) {

    const oldPosition = player.position;
    const newPosition = (oldPosition + steps) % 40;

    // Pass Start Salary
    if (oldPosition + steps >= 40) { // Simple check for wrapping
       player.money += GAME_CONSTANTS.START_SALARY;

       // T049: Check Phase Transition (End of First Half)
       // Rules: If unsold properties <= 5 or ... (Simplification: After start pass & unsold check)
       // Let's check whenever someone passes start or ends turn if we are in First Half?
       // Just check here:
       if (game.phase === GamePhase.FIRST_HALF || game.phase === GamePhase.SETUP) {
            // Count unsold
            // T049 says "unsoldProperties <= 5"
            // Let's count unowned city properties specifically? Or all deeds?

            // "증서" usually means all purchaseable tiles. 
            
            // Re-calc unsold count
            let unownedCount = 0;
            BOARD_TILES.forEach(t => {
                if (t.propertyId) {
                    const state = game.propertyStates[t.propertyId];
                    if (!state || !state.ownerPlayerId) unownedCount++;
                }
            });

            if (unownedCount <= 5) {
                game.phase = GamePhase.SECOND_HALF;
                this.log(game, "남은 증서가 5개 이하입니다. 후반전(건물 건설 가능)이 시작됩니다!");
            }
       }
    }

    player.position = newPosition;
  }


  private static handleLanding(game: GameState, player: PlayerState) {
    const tile = BOARD_TILES[player.position];
    if (!tile) return; // Should not happen

    // Default to Turn End unless action required
    // game.turnPhase = TurnPhase.TURN_END; // Wait, handled by client 'End Turn' button usually, or auto?
    // Rule: Double -> Roll Again. 
    // If Action required -> Set Phase to ACTION.

    switch (tile.type) {
        case TileType.CITY_PROPERTY:
        case TileType.VEHICLE: // e.g. Concorde, Queen Elizabeth, Columbia
        // case TileType.NO_BUILD_PROPERTY: // e.g. Jeju, Busan, Seoul (Special properties)
            // Check ownership
            if (tile.propertyId) {
                const propState = game.propertyStates[tile.propertyId];
                if (!propState || !propState.ownerPlayerId) {
                    // Unowned -> Can Purchase
                    if (player.money >= (this.getPropertyPrice(tile.propertyId) || 0)) {
                         game.turnPhase = TurnPhase.ACTION_PHASE;
                         // Client will see this phase + check tile type and show Purchase Modal
                         // Ideally we set a flag in GameState 'pendingAction' or similar?
                         // For MVP, TurnPhase.ACTION_PHASE + position is enough for Client to infer "I am on an unowned city".
                    } else {
                        // Not enough money -> Can't buy. Auto Pass?
                        // Or show modal with disabled buy button.
                        game.turnPhase = TurnPhase.ACTION_PHASE;
                    }
                } else if (propState.ownerPlayerId !== player.id) {
                    // Owned by other -> Pay Toll
                    const spec = PROPERTY_SPECS[tile.propertyId];
                    if (spec) {
                        const toll = calculateToll(spec, propState.buildingCounts);
                        const owner = game.players.find(p => p.id === propState.ownerPlayerId);
                        
                        if (owner) {
                            GameService.payToll(game, player, owner, toll);
                            
                            // Log event?
                            // game.turnPhase = TurnPhase.IDLE; // Paid and Done?
                            // or wait for confirmation?
                            // For MVP Auto-pay:
                            game.turnPhase = TurnPhase.IDLE;
                        }
                    }
                }

            }
            break;
        case TileType.GOLDEN_KEY:
            this.handleGoldenKey(game, player);
            break;

        case TileType.ISLAND:
            this.handleIsland(game, player);
            break;
        case TileType.SPACE_TRAVEL:
            this.handleSpaceTravel(game, player);
            break;
        case TileType.WELFARE_PAYOUT:
             // Receive Welfare
             if (game.welfarePot > 0) {
                 this.log(game, `${player.name}님이 사회복지기금 ${game.welfarePot.toLocaleString()}원을 수령했습니다!`);
                 player.money += game.welfarePot;
                 game.welfarePot = 0;
             }
             break;
        case TileType.WELFARE_DONATION:
             // Need to implement donation rule? Usually just passing through or paying?
             // Specs T066 says Implement Donation/Receive.
             // If landing on donation, usually play pays 150k?
             // Let's implement basics for now.
             if (GAME_CONSTANTS.WELFARE_DONATION) {
                 player.money -= GAME_CONSTANTS.WELFARE_DONATION;
                 game.welfarePot += GAME_CONSTANTS.WELFARE_DONATION;
                 this.log(game, `${player.name}님이 사회복지기금에 ${GAME_CONSTANTS.WELFARE_DONATION.toLocaleString()}원을 기부했습니다.`);
             }
             break;
    }
  }

  // T060, T061: Golden Key Logic
  private static handleGoldenKey(game: GameState, player: PlayerState) {
      if (game.goldenKeyDeck.length === 0) {
          game.goldenKeyDeck = createShuffledDeck();
      }
      const cardId = game.goldenKeyDeck.pop();
      if (!cardId) return;
      game.goldenKeyDeck.unshift(cardId); // Return to bottom (default logic for most cards, specific logic below)

      const card = getGoldenKeyCardById(cardId);
      if (!card) return;

      this.log(game, `황금열쇠: ${card.name} - ${card.message}`);

      // Handle Effects
      switch (card.effectType) {
          case CardEffectType.RECEIVE_FROM_BANK:
              if (card.value) player.money += card.value;
              break;
          case CardEffectType.PAY_BANK:
              if (card.value) player.money -= card.value;
              break;
          case CardEffectType.MOVE_TO_TILE:
              if (card.destinationIndex !== undefined) {
                  // Direct move logic? Or movePlayer?
                  // movePlayer handles salary.
                  // Need to calculate steps? Or just set position?
                  // Rules: Usually "Move to X". If passing start, get salary?
                  // Let's assume set position. Check salary if index < oldIndex (wrapping involved).
                  
                  // Simple approach: Calculate steps relative
                  // Or direct set. We use direct set but check start pass manually.
                  const oldPos = player.position;
                  let steps = card.destinationIndex - oldPos;
                  if (steps < 0) steps += 40;

                  // Use movePlayer to handle transitions and salary
                  // Except for 'Back' which is handled by MOVE_STEPS if needed.
                  // But 'Move to X' could mean wrap around?
                  // If "Ghost travel" (direct teleport), use forceMoveTo.
                  // If "Travel" (move pieces), use movePlayer.
                  // Most "Travel" cards imply moving forward to destination.
                  this.movePlayer(game, player, steps);
                  
                  // Note: movePlayer calls handleLanding, so RECURSION happens here.
                  // This is correct behavior (e.g., Move to Seoul -> Buy Seoul).
              }
              break;
           case CardEffectType.MOVE_STEPS:
                if (card.moveSteps) {
                    const steps = card.moveSteps; // e.g. -2, -3
                    // movePlayer handles negative steps?
                    // Usually movePlayer adds steps.
                    // If negative, no salary check usually (unless specified?)
                    if (steps < 0) {
                        player.position = (player.position + steps + 40) % 40;
                        this.handleLanding(game, player);
                    } else {
                        this.movePlayer(game, player, steps);
                    }
                }
                break;
           case CardEffectType.SEND_TO_ISLAND:
                this.forceMoveTo(game, player, SPECIAL_TILE_INDICES.ISLAND);
                this.handleIsland(game, player);
                break;
           case CardEffectType.GRANT_ESCAPE_CARD:
                player.escapeCardCount++;
                // Should remove from deck?
                // Re-pop from bottom/top if we put it back?
                // Logic above put it back at bottom. 
                // We should REMOVE it if player keeps it.
                game.goldenKeyDeck.shift(); // Remove from bottom (since we unshifted it)
                break;
           case CardEffectType.GRANT_FREE_PASS:
                player.freePassCardCount++;
                game.goldenKeyDeck.shift(); // Remove from deck
                break;
           case CardEffectType.PAY_WELFARE:
                // Not standard in basic cards list but supported
                if (card.value) {
                    player.money -= card.value;
                    game.welfarePot += card.value;
                }
                break;
           case CardEffectType.RECEIVE_WELFARE:
                // Move to Welfare Payout (Index 20 or 38 depending on map?)
                // Card says "Go to Welfare Reception" -> Usually just receive pot.
                // Or move to pot tile?
                // Let's execute effect directly here for safety.
                 if (card.destinationIndex !== undefined) {
                      this.movePlayer(game, player, card.destinationIndex - player.position + (card.destinationIndex < player.position ? 40 : 0));
                 } else {
                     player.money += game.welfarePot;
                     game.welfarePot = 0;
                 }
                 break;
           case CardEffectType.PAY_ALL_PLAYERS:
                // Birthday etc.
                // Not implemented fully in MVP cards list logic, but good to have
                 break;
           case CardEffectType.RECEIVE_FROM_ALL:
                if (card.valuePerPlayer) {
                    game.players.forEach(p => {
                        if (p.id !== player.id) {
                            if (p.money >= card.valuePerPlayer!) {
                                p.money -= card.valuePerPlayer!;
                                player.money += card.valuePerPlayer!;
                            } else {
                                // Take all they have?
                                player.money += p.money;
                                p.money = 0;
                            }
                        }
                    });
                }
                break;
            case CardEffectType.FORCE_SELL_HALF:
                // Find most expensive property
                let mostExpensiveId: string | null = null;
                let maxPrice = -1;
                
                player.ownedPropertyIds.forEach(pid => {
                    const spec = PROPERTY_SPECS[pid];
                    if (spec) {
                        // Value definition: Purchase Price + Buildings?
                        // Usually Purchase Price is used for ranking "Most Expensive" for this penalty.
                        if (spec.purchasePrice > maxPrice) {
                            maxPrice = spec.purchasePrice;
                            mostExpensiveId = pid;
                        }
                    }
                });

                if (mostExpensiveId) {
                    // Sell at half price
                    // "Half Price" of what? Spec says "Land + Buildings".
                    // Let's implement full calculation.
                    const spec = PROPERTY_SPECS[mostExpensiveId as string];
                    const pState = game.propertyStates[mostExpensiveId as string];
                    
                    let totalVal = spec.purchasePrice;
                    if (spec.buildCost) {
                         totalVal += (spec.buildCost.villa * pState.buildingCounts.villa);
                         totalVal += (spec.buildCost.building * pState.buildingCounts.building);
                         totalVal += (spec.buildCost.hotel * pState.buildingCounts.hotel);
                    }
                    
                    const refund = Math.floor(totalVal / 2);
                    player.money += refund;
                    
                    // Reset ownership
                    pState.ownerPlayerId = null;
                    pState.buildingCounts = { villa: 0, building: 0, hotel: 0 };
                    player.ownedPropertyIds = player.ownedPropertyIds.filter(id => id !== mostExpensiveId);
                    game.unsoldPropertyIds.push(mostExpensiveId as string);

                    this.log(game, `${player.name}님의 ${spec.name}이(가) 반액 대매출로 처분되었습니다. (+${refund.toLocaleString()}원)`);
                }
                break;
            case CardEffectType.MAINTENANCE_FEE:
            case CardEffectType.REPAIR_FEE:
                if (card.phasePolicy === 'secondHalfOnly' && game.phase === GamePhase.FIRST_HALF) {
                    this.log(game, "아직 전반전이므로 수리비/세금이 면제됩니다.");
                    break;
                }
                // Calculate Cost
                if (card.repairCost) {
                    let totalCost = 0;
                    player.ownedPropertyIds.forEach(pid => {
                        const pState = game.propertyStates[pid];
                        if (pState) {
                             totalCost += (pState.buildingCounts.villa * card.repairCost!.villa);
                             totalCost += (pState.buildingCounts.building * card.repairCost!.building);
                             totalCost += (pState.buildingCounts.hotel * card.repairCost!.hotel);
                        }
                    });
                    
                    if (totalCost > 0) {
                        player.money -= totalCost;
                        this.log(game, `${player.name}님이 수리비/세금 ${totalCost.toLocaleString()}원을 지불했습니다.`);
                        // Check Bankruptcy?
                        if (player.money < 0) {
                            // Trigger debt resolution... (Simplification: just subtract, let next check handle it)
                        }
                    }
                }
                break;
            case CardEffectType.SPACE_TRAVEL_FREE:
                 this.forceMoveTo(game, player, SPECIAL_TILE_INDICES.SPACE_TRAVEL);
                 this.handleSpaceTravel(game, player);
                 break;
            case CardEffectType.WORLD_TOUR:
                 // Move to Start, Receive Salary
                 this.movePlayer(game, player, 40 - player.position); // Move exactly to 40 (Start)
                 // Or Start is 0. moving to 40 wraps? 
                 // Our board is 0-39.
                 // Steps to Start = (40 - pos) % 40.
                 // movePlayer handles salary.
                 // Also card says 'receive extra fund'?
                 if (card.value) player.money += card.value;
                 break;
      }
  }

  private static forceMoveTo(_game: GameState, player: PlayerState, index: number) {
      player.position = index;
      // No salary check for force move usually, unless specified.
  }

  // T062: Island Logic
  private static handleIsland(game: GameState, player: PlayerState) {
       // If just landed (moved here), set lock.
       // Check if already locked?
       if (player.islandTurnsLeft === 0) {
           player.islandTurnsLeft = 3;
           this.log(game, `${player.name}님이 무인도에 갇혔습니다. (3턴)`);
       }
  }

  // T063: Escape Island Action
  static async escapeIsland(gameId: string, playerId: string, method: 'money' | 'card'): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');

      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');
      
      if (player.islandTurnsLeft <= 0) throw new Error("무인도에 갇혀있지 않습니다.");

      if (method === 'money') {
          const ESCAPE_FEE = 200_000; // Usually set fee
          if (player.money < ESCAPE_FEE) throw new Error("자금이 부족합니다.");
          
          player.money -= ESCAPE_FEE;
          player.islandTurnsLeft = 0;
          this.log(game, `${player.name}님이 수수료를 지불하고 무인도를 탈출했습니다.`);
      } else if (method === 'card') {
          if (player.escapeCardCount <= 0) throw new Error("탈출권이 없습니다.");
          player.escapeCardCount--;
          player.islandTurnsLeft = 0;
          // Return card to deck?
           // If 'keepUntilUse', usually discarded to bottom after use.
           game.goldenKeyDeck.unshift('island-escape'); // Assuming known ID or we need to find it?
           // Simplification: Just allow use. Ideally we track exact card ID held.
          this.log(game, `${player.name}님이 탈출권을 사용하여 무인도를 탈출했습니다.`);
      }
      return game;
  }

  // T064: Space Travel
  private static handleSpaceTravel(game: GameState, player: PlayerState) {
       player.pendingSpaceChoice = true;
       this.log(game, `${player.name}님이 우주여행에 도착했습니다. 다음 턴에 원하는 곳으로 이동합니다.`);
  }
  
  // T064: Execute Space Travel
  static async travelToSpace(gameId: string, playerId: string, targetIndex: number): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');
      
      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');
      
      if (!player.pendingSpaceChoice) throw new Error("우주여행 대기 상태가 아닙니다.");
      if (targetIndex < 0 || targetIndex >= 40) throw new Error("유효하지 않은 위치입니다.");

      player.pendingSpaceChoice = false;
      this.forceMoveTo(game, player, targetIndex);
      this.log(game, `${player.name}님이 우주여행을 통해 ${BOARD_TILES[targetIndex].name}(으)로 이동했습니다.`);
      
      // Trigger landing logic for destination
      this.handleLanding(game, player);
      
      return game;
  }




  private static getPropertyPrice(propertyId: string): number {
      const spec = PROPERTY_SPECS[propertyId];
      return spec ? spec.purchasePrice : 0;
  }


  // Task T032: purchaseProperty
  static async purchaseProperty(gameId: string, playerId: string, buy: boolean): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');
      
      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');
      
      if (game.currentTurnIndex !== game.turnOrder.indexOf(playerId)) throw new Error('Not your turn');
      if (game.turnPhase !== TurnPhase.ACTION_PHASE) throw new Error('Not in action phase');

      // Check current tile
      const tile = BOARD_TILES[player.position];
      if (!tile || !tile.propertyId) throw new Error('Cannot purchase this tile');

      // Check if already owned
      const propState = game.propertyStates[tile.propertyId];
      if (propState && propState.ownerPlayerId) throw new Error('Already owned');

      if (buy) {
          // Calculate Price
          const price = this.getPropertyPrice(tile.propertyId); 
          if (player.money < price) throw new Error('Not enough money');

          // Deduct Money
          player.money -= price;

          // assign Owner
          if (!game.propertyStates[tile.propertyId]) {
             // Use factory or manual
             game.propertyStates[tile.propertyId] = {
                 ownerPlayerId: playerId,
                 buildingCounts: { villa: 0, building: 0, hotel: 0 }
             };
          } else {
              game.propertyStates[tile.propertyId].ownerPlayerId = playerId;
              // Reset buildings on new purchase? Usually yes if it was unowned (e.g. bankrupt & returned to bank)
              // But here we are buying FROM BANK. 
              // If it was somehow existing with buildings but no owner? (Bankrupt logic might clear it)
              game.propertyStates[tile.propertyId].buildingCounts = { villa: 0, building: 0, hotel: 0 };
          }
          player.ownedPropertyIds.push(tile.propertyId);
          this.log(game, `${player.name}님이 ${tile.name}을(를) ${price.toLocaleString()}원에 구매했습니다.`);
      }


      // End Action
      game.turnPhase = TurnPhase.IDLE; 
      
      // Remove from unsold
      if (buy) {
        // We know tile.propertyId exists if buy happened (logic above ensures it)
        const tile = BOARD_TILES[player.position];
        if (tile.propertyId) {
             game.unsoldPropertyIds = game.unsoldPropertyIds.filter(id => id !== tile.propertyId);
        }
        // Check Phase Transition
        this.checkPhaseTransition(game);
      }

      return game;
  }

  private static checkPhaseTransition(game: GameState) {
        if (game.phase !== GamePhase.FIRST_HALF) return;

        // Condition: All City Properties Sold? 
        if (game.unsoldPropertyIds.length === 0) {
            game.phase = GamePhase.SECOND_HALF;
            this.log(game, "모든 증서가 판매되었습니다! 후반전(건설 단계)이 시작됩니다.");
        }
  }





  // T043: Sell Building
  static async sellBuilding(gameId: string, playerId: string, propertyId: string, type: 'villa' | 'building' | 'hotel'): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');
      
      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      // Check Ownership
      const propState = game.propertyStates[propertyId];
      if (!propState || propState.ownerPlayerId !== playerId) throw new Error('Not your property');

      // Check Building Count
      if (propState.buildingCounts[type] <= 0) throw new Error('Building not found');

      const spec = PROPERTY_SPECS[propertyId];
      if (!spec || !spec.buildCost) throw new Error('Cannot sell this building');

      // Calculate Refund (50%)
      const cost = spec.buildCost[type];
      const refund = Math.floor(cost / 2);

      // Execute
      propState.buildingCounts[type]--;
      player.money += refund;

      this.log(game, `${player.name}님이 ${spec.name}의 ${type}을(를) 매각하여 ${refund.toLocaleString()}원을 획득했습니다.`);

      // Check Debt Resolution if applicable
      if (game.turnPhase === TurnPhase.DEBT_RESOLUTION && game.pendingDebt && game.pendingDebt.debtorId === playerId) {
          if (player.money >= game.pendingDebt.amount) {
               // Auto-Resolve? Or wait for user action?
               // Let's Log that they can now pay.
               this.log(game, `${player.name}님의 자금이 확보되었습니다. 통행료를 지불할 수 있습니다.`);
          }
      }

      return game;
  }

  // T046: Bankruptcy
  static async declareBankruptcy(gameId: string, playerId: string): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');

      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      player.bankrupt = true;
      player.money = 0;
      
      // Return assets to Bank or Creditor?
      // For MVP, return to Bank (reset ownership)
      for (const pid of player.ownedPropertyIds) {
          const pState = game.propertyStates[pid];
          if (pState) {
              pState.ownerPlayerId = null;
              pState.buildingCounts = { villa: 0, building: 0, hotel: 0 };
              game.unsoldPropertyIds.push(pid); // Back to market
          }
      }
      player.ownedPropertyIds = [];

      this.log(game, `${player.name}님이 파산을 선언했습니다.`);

      // If Debt Resolution, clear it
      if (game.turnPhase === TurnPhase.DEBT_RESOLUTION && game.pendingDebt?.debtorId === playerId) {
          game.pendingDebt = null;
          game.turnPhase = TurnPhase.IDLE; // Or End Turn?
          // If 2 players, Game Over check T056
          this.checkWinCondition(game);
      } else {
         // Also check if they just went bankrupt normally
         this.checkWinCondition(game);
      }


      return game;
  }

  // T042: Resolve Debt
  static async resolveDebt(gameId: string, playerId: string): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');
      
      const debt = game.pendingDebt;
      if (!debt || debt.debtorId !== playerId) throw new Error("갚을 빚이 없습니다.");
      
      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');
      
      if (player.money < debt.amount) throw new Error("자금이 부족합니다.");

      // Execute Payment
      player.money -= debt.amount;
      if (debt.creditorId !== 'BANK') {
          const creditor = game.players.find(p => p.id === debt.creditorId);
          if (creditor) {
              creditor.money += debt.amount;
          }
      }
      
      this.log(game, `${player.name}님이 빚 ${debt.amount.toLocaleString()}원을 청산했습니다.`);
      
      // Clear Debt
      game.pendingDebt = null;
      game.turnPhase = TurnPhase.IDLE;
      
      return game;
  }

  // T045: Take Loan
  static async takeLoan(gameId: string, playerId: string): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');

      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      if (player.hasLoan) throw new Error('이미 대출을 받았습니다.');
      
      const LOAN_AMOUNT = 1_000_000; // MVP fixed
      player.money += LOAN_AMOUNT;
      player.hasLoan = true;
      
      this.log(game, `${player.name}님이 은행에서 대출 ${LOAN_AMOUNT.toLocaleString()}원을 받았습니다.`);

      return game;
  }

  // T044: Transfer Property
  static async transferProperty(gameId: string, playerId: string, propertyId: string): Promise<GameState> {
        const game = games[gameId];
        if (!game) throw new Error('Game not found');

        const debt = game.pendingDebt;
        if (!debt || debt.debtorId !== playerId) throw new Error("갚을 빚이 없습니다.");
        if (debt.creditorId === 'BANK') throw new Error("은행에는 증서를 양도할 수 없습니다 (매각 필요).");

        const player = game.players.find(p => p.id === playerId);
        const creditor = game.players.find(p => p.id === debt.creditorId);
        if (!player || !creditor) throw new Error("플레이어 정보를 찾을 수 없습니다.");

        // Check Ownership
        const propState = game.propertyStates[propertyId];
        if (!propState || propState.ownerPlayerId !== playerId) throw new Error("본인의 소유가 아닙니다.");

        const spec = PROPERTY_SPECS[propertyId];
        if (!spec) throw new Error("증서 정보 오류.");

        // Transfer Logic
        // Value = Purchase Price? Or negotiated?
        // Spec rule says: If cash insufficient, can transfer property instead of cash.
        // Usually valued at Purchase Price or some agreed value. 
        // For MVP: Value = Purchase Price + Building Costs (Full Value).
        
        let value = spec.purchasePrice;
        if (spec.buildCost) {
            value += (spec.buildCost.villa * propState.buildingCounts.villa);
            value += (spec.buildCost.building * propState.buildingCounts.building);
            value += (spec.buildCost.hotel * propState.buildingCounts.hotel);
        }

        // Transfer Ownership
        propState.ownerPlayerId = creditor.id;
        
        // Remove from sender, Add to receiver
        player.ownedPropertyIds = player.ownedPropertyIds.filter(id => id !== propertyId);
        creditor.ownedPropertyIds.push(propertyId);

        // Reduce Debt
        if (value >= debt.amount) {
             // Overpaid? Return change?
             // Simplification: Excess value is lost or given as bonus?
             // Usually Blue Marble rules: Transfer property to cover debt. 
             // If property value > debt, creditor pays difference?
             // Let's implement: Creditor pays difference to debtor.
             const change = value - debt.amount;
             if (creditor.money >= change) {
                 creditor.money -= change;
                 player.money += change;
                 this.log(game, `${player.name}님이 ${creditor.name}님에게 ${spec.name}(가치 ${value.toLocaleString()}원)을 양도하고 거스름돈 ${change.toLocaleString()}원을 받았습니다.`);
             } else {
                 // Creditor strictly can't pay change? 
                 // Force trade or fail?
                 // Let's just log it and handle debt cleared. 
                 // Or just assume full transfer covers debt.
                 this.log(game, `${player.name}님이 ${creditor.name}님에게 ${spec.name}(가치 ${value.toLocaleString()}원)을 양도하여 빚을 청산했습니다.`);
             }
             
             game.pendingDebt = null;
             game.turnPhase = TurnPhase.IDLE;
        } else {
            // Partial Pay
            debt.amount -= value;
            this.log(game, `${player.name}님이 ${creditor.name}님에게 ${spec.name}(가치 ${value.toLocaleString()}원)을 양도하여 빚을 차감했습니다. (남은 빚: ${debt.amount.toLocaleString()}원)`);
        }

        return game;
  }

  // T052: Construct Building
  static async constructBuilding(gameId: string, playerId: string, propertyId: string, type: 'villa' | 'building' | 'hotel'): Promise<GameState> {
      const game = games[gameId];
      if (!game) throw new Error('Game not found');

      if (game.phase !== GamePhase.SECOND_HALF) throw new Error("건설은 후반전에만 가능합니다.");

      const player = game.players.find(p => p.id === playerId);
      if (!player) throw new Error('Player not found');

      const propState = game.propertyStates[propertyId];
      if (!propState || propState.ownerPlayerId !== playerId) throw new Error("본인의 도시가 아닙니다.");

      const spec = PROPERTY_SPECS[propertyId];
      if (!spec || !spec.buildCost) throw new Error("건설할 수 없는 도시입니다.");

      // Check Limits (T051)
      // Villa: Max 2
      // Building: Max 1
      // Hotel: Max 1
      // Note: Usually Blue Marble allows full build sequence. 
      // Rule: Can build what exactly?
      // Villa (별장) cost -> count++, max 2? Actually it varies. 
      // Let's stick to standard rules or simple max. 
      // Standard: 3 Villas, 1 Building, 1 Hotel? 
      // User Task says: (별장:2, 빌딩:1, 호텔:1)
      
      const MAX_VILLA = 2;
      const MAX_BUILDING = 1;
      const MAX_HOTEL = 1;

      if (type === 'villa' && propState.buildingCounts.villa >= MAX_VILLA) throw new Error("별장은 최대 2개까지 건설 가능합니다.");
      if (type === 'building' && propState.buildingCounts.building >= MAX_BUILDING) throw new Error("빌딩은 1개만 건설 가능합니다.");
      if (type === 'hotel' && propState.buildingCounts.hotel >= MAX_HOTEL) throw new Error("호텔은 1개만 건설 가능합니다.");

      // Check Cost
      const cost = spec.buildCost[type];
      if (player.money < cost) throw new Error("자금이 부족합니다.");

      // Execute
      player.money -= cost;
      propState.buildingCounts[type]++;
      
      this.log(game, `${player.name}님이 ${spec.name}에 ${type === 'villa' ? '별장' : type === 'building' ? '빌딩' : '호텔'}을(를) 건설했습니다.`);

      return game;
  }

  // T056: Check Win Condition
  private static checkWinCondition(game: GameState) {
      if ((game.status as GameStatus) === GameStatus.FINISHED) return;

      // Check Time Limit (T057)
      this.checkTimeLimit(game);
      if ((game.status as GameStatus) === GameStatus.FINISHED) return;

      const survivors = game.players.filter(p => !p.bankrupt);
      if (survivors.length === 1) {
          game.status = GameStatus.FINISHED;
          game.phase = GamePhase.END;
          this.log(game, `게임 종료! 승자는 ${survivors[0].name}입니다!`);
          // T058: We might want to store winner stats here.
      }
  }



  // T057: Check Time Limit
  private static checkTimeLimit(game: GameState) {
      if (!game.timeLimitMinutes || !game.startedAt) return;
      
      const elapsedMinutes = (Date.now() - game.startedAt) / 60000;
      if (elapsedMinutes >= game.timeLimitMinutes) {
          game.gameEndByTimeLimit = true;
          game.status = GameStatus.FINISHED;
          game.phase = GamePhase.END;
          
          this.log(game, "제한 시간 종료! 자산 집계를 시작합니다.");
          
          // Calculate Net Worth and Rank
          // T057: Total Asset = Money + Property Price + Building Cost
          // Note: Usually Blue Marble specifies 'Total Asset Value'. We'll use purchasePrice + buildCost.
          
          const results = game.players.map(p => {
              if (p.bankrupt) return { player: p, netWorth: -1 };
              
              let netWorth = p.money;
              // Add Property Values
              p.ownedPropertyIds.forEach(pid => {
                  const spec = PROPERTY_SPECS[pid];
                  const state = game.propertyStates[pid];
                  if (spec && state) {
                      netWorth += spec.purchasePrice;
                      if (spec.buildCost) {
                          netWorth += (spec.buildCost.villa * state.buildingCounts.villa);
                          netWorth += (spec.buildCost.building * state.buildingCounts.building);
                          netWorth += (spec.buildCost.hotel * state.buildingCounts.hotel);
                      }
                  }
              });
              return { player: p, netWorth };
          });
          
          results.sort((a, b) => b.netWorth - a.netWorth);
          
          const winner = results[0].player;
          this.log(game, `게임 종료! 승자: ${winner.name} (총 자산: ${results[0].netWorth.toLocaleString()}원)`);
      }
  }



  static getGame(id: string): GameState | undefined {
    return games[id];
  }

  // Test Mode: Toggle devMode for single tester play
  static async setDevMode(gameId: string, enabled: boolean): Promise<GameState> {
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    
    game.devMode = enabled;
    this.log(game, enabled ? "🧪 테스트 모드가 활성화되었습니다. 모든 플레이어를 조작할 수 있습니다." : "테스트 모드가 비활성화되었습니다.");
    
    return game;
  }

  // End Turn: Advance to next player
  static async endTurn(gameId: string, playerId: string): Promise<GameState> {
    const game = games[gameId];
    if (!game) throw new Error('Game not found');
    
    const currentPlayer = game.players[game.currentTurnIndex];
    
    // In devMode, anyone can end the turn
    if (!game.devMode && currentPlayer.id !== playerId) {
      throw new Error('Not your turn');
    }

    // Check for double (extra turn)
    if (currentPlayer.doubleCount > 0 && game.diceResult && game.diceResult[0] === game.diceResult[1]) {
      // Player gets another turn
      this.log(game, `${currentPlayer.name}님이 더블을 굴려 추가 턴을 얻습니다!`);
      game.turnPhase = TurnPhase.IDLE;
      game.diceResult = null;
      return game;
    }

    // Advance to next non-bankrupt player
    let nextIndex = (game.currentTurnIndex + 1) % game.players.length;
    let attempts = 0;
    while (game.players[nextIndex].bankrupt && attempts < game.players.length) {
      nextIndex = (nextIndex + 1) % game.players.length;
      attempts++;
    }
    
    game.currentTurnIndex = nextIndex;
    game.turnPhase = TurnPhase.IDLE;
    game.diceResult = null;
    game.turnsElapsed++;
    
    this.log(game, `${game.players[nextIndex].name}님의 턴입니다.`);
    
    // Check win condition after turn
    this.checkWinCondition(game);
    
    return game;
  }
}


