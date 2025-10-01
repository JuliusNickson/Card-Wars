import React, { createContext, useContext, useReducer } from 'react';
import { 
  DEFAULT_HAND, 
  createCreatureInstance, 
  getCreatureById,
  calculateHexDistance,
  getValidMoveTargets,
  getValidAttackTargets,
  getAdjacentHexes
} from '../game/cards';
import {
  TOWER_TYPES,
  TOWER_DEFINITIONS,
  createTowerInstance,
  getCreaturesInTowerDomain,
  applyDomainEffects,
  processTowerDamage
} from '../game/towers';
import { GAME_ACTIONS } from '../constants/gameActions';

// Initialize board function
function initializeBoard() {
  const BOARD_WIDTH = 16;
  const BOARD_HEIGHT = 8;
  const board = {};
  
  // Create array of all hex positions in order (left to right, column by column)
  const allPositions = [];
  for (let x = 0; x < BOARD_WIDTH; x++) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      allPositions.push({ x, y, key: `${x},${y}` });
    }
  }
  
  // Initialize all hexes
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const key = `${x},${y}`;
      board[key] = {
        owner: null,
        creatureId: null,
        isTower: false,
        coords: { x, y }
      };
    }
  }

  // Assign Player A territory (columns 0-4, 5 columns wide)
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      const key = `${x},${y}`;
      board[key].owner = 'A';
    }
  }
  
  // Assign Player B territory (columns 11-15, 5 columns wide)
  for (let x = 11; x < 16; x++) {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      const key = `${x},${y}`;
      board[key].owner = 'B';
    }
  }
  
  // Neutral zone in columns 5-10 (6 columns wide)

  // Set up towers at corners with different types
  board['0,0'].isTower = true;
  board['0,0'].owner = 'A';
  board['0,0'].towerType = TOWER_TYPES.INFERNO;
  
  board['15,0'].isTower = true;
  board['15,0'].owner = 'B';
  board['15,0'].towerType = TOWER_TYPES.FROST;
  
  board['0,7'].isTower = true;
  board['0,7'].owner = 'A';
  board['0,7'].towerType = TOWER_TYPES.VENOM;
  
  board['15,7'].isTower = true;
  board['15,7'].owner = 'B';
  board['15,7'].towerType = TOWER_TYPES.SHADOW;
  
  // Add some initial creatures in controlled territories
  board['2,3'].creatureId = 'warrior_1'; // Left side for Player A
  board['2,3'].owner = 'A';
  
  board['13,4'].creatureId = 'archer_1'; // Right side for Player B
  board['13,4'].owner = 'B';

  return board;
}

// Helper function to get controlled hexes from board
function getControlledHexes(board) {
  const controlled = { A: [], B: [] };
  
  Object.entries(board).forEach(([key, hex]) => {
    if (hex.owner === 'A') {
      controlled.A.push(key);
    } else if (hex.owner === 'B') {
      controlled.B.push(key);
    }
  });
  
  return controlled;
}

// Helper function to check if a hex is within a tower's domain (2 hex range)
function isInTowerDomain(hexCoords, board) {
  const towerPositions = [
    { x: 0, y: 0 }, { x: 11, y: 0 },
    { x: 0, y: 7 }, { x: 11, y: 7 }
  ];
  
  return towerPositions.some(tower => {
    return calculateHexDistance(hexCoords, tower) <= 2;
  });
}

// Initial game state
const initialGameState = {
  turn: 1,
  currentPlayer: "A",
  mana: { 
    A: 10, 
    B: 10 
  },
  board: initializeBoard(),
  creatures: {},
  towers: {
    "0,0": createTowerInstance(TOWER_TYPES.INFERNO, "A", "0,0"),
    "15,0": createTowerInstance(TOWER_TYPES.FROST, "B", "15,0"),
    "0,7": createTowerInstance(TOWER_TYPES.VENOM, "A", "0,7"),
    "15,7": createTowerInstance(TOWER_TYPES.SHADOW, "B", "15,7")
  },
  controlledHexes: getControlledHexes(initializeBoard()),
  selectedHex: null,
  selectedCard: null,
  selectedCardType: null,
  selectedCreature: null,
  actionMode: null, // 'move', 'attack', 'summon'
  validTargets: [],
  turnPhase: 'main', // 'upkeep', 'main', 'end'
  lastTowerDamage: [],
  hands: {
    A: [...DEFAULT_HAND],
    B: [...DEFAULT_HAND]
  }
};

// Game state reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.END_TURN:
      const nextPlayer = state.currentPlayer === "A" ? "B" : "A";
      
      // Reset all creature actions for next player
      const resetCreatures = {};
      Object.entries(state.creatures).forEach(([id, creature]) => {
        resetCreatures[id] = {
          ...creature,
          hasMoved: false,
          hasAttacked: false,
          // Clear temporary status effects
          statusEffects: creature.statusEffects?.filter(effect => 
            !['slow', 'weaken'].includes(effect)
          ) || [],
          // Reset stats to base values
          attack: creature.baseAttack,
          speed: creature.baseSpeed
        };
      });
      
      // Process tower damage and domain effects during upkeep
      let towerDamageResults = [];
      let updatedCreaturesAfterTower = { ...resetCreatures };
      
      Object.values(state.towers).forEach(tower => {
        if (tower.owner === nextPlayer) {
          // Process damage to enemy creatures in range
          const damageResults = processTowerDamage(
            tower, 
            updatedCreaturesAfterTower, 
            state.board, 
            calculateHexDistance
          );
          
          damageResults.forEach(result => {
            const creature = updatedCreaturesAfterTower[result.creatureId];
            if (creature) {
              const newHealth = creature.health - result.damage;
              if (newHealth <= 0) {
                // Creature dies
                delete updatedCreaturesAfterTower[result.creatureId];
                towerDamageResults.push(`${creature.type} destroyed by ${tower.type} tower`);
              } else {
                updatedCreaturesAfterTower[result.creatureId] = {
                  ...creature,
                  health: newHealth
                };
                towerDamageResults.push(`${creature.type} takes ${result.damage} damage from ${tower.type} tower`);
              }
            }
          });
          
          // Apply domain effects to creatures in range
          Object.values(updatedCreaturesAfterTower).forEach(creature => {
            if (creature.owner !== tower.owner && creature.position) {
              const creatureHex = state.board[creature.position];
              const distance = calculateHexDistance(state.board[tower.position].coords, creatureHex.coords);
              if (distance <= tower.domainRange) {
                updatedCreaturesAfterTower[creature.id] = applyDomainEffects(creature, tower.domainEffect);
              }
            }
          });
        }
      });
      
      // Process hex captures from current player's creatures
      let updatedBoard = { ...state.board };
      const captureProcessing = {};
      
      Object.entries(state.creatures).forEach(([id, creature]) => {
        if (creature.owner === state.currentPlayer && 
            creature.canCapture && 
            creature.markedForCapture) {
          
          const hexKey = creature.position;
          const adjacentHexes = getAdjacentHexes(updatedBoard[hexKey].coords, updatedBoard);
          
          // Mark hex for capture
          if (updatedBoard[hexKey].owner !== creature.owner && !updatedBoard[hexKey].isTower) {
            captureProcessing[hexKey] = creature.owner;
          }
          
          // Mark adjacent hexes for capture (adjacency spread) - but not in tower domains
          adjacentHexes.forEach(adjKey => {
            if (updatedBoard[adjKey].owner !== creature.owner && 
                !updatedBoard[adjKey].isTower &&
                !isInTowerDomain(updatedBoard[adjKey].coords, updatedBoard)) {
              captureProcessing[adjKey] = creature.owner;
            }
          });
          
          // Reset capture flag
          if (updatedCreaturesAfterTower[id]) {
            updatedCreaturesAfterTower[id].markedForCapture = false;
          }
        }
      });
      
      // Apply captures
      Object.entries(captureProcessing).forEach(([hexKey, newOwner]) => {
        updatedBoard[hexKey] = {
          ...updatedBoard[hexKey],
          owner: newOwner
        };
      });
      
      // Clear creatures from board if they died
      Object.entries(updatedBoard).forEach(([key, hex]) => {
        if (hex.creatureId && !updatedCreaturesAfterTower[hex.creatureId]) {
          updatedBoard[key] = {
            ...hex,
            creatureId: null
          };
        }
      });
      
      return {
        ...state,
        turn: state.turn + 1,
        currentPlayer: nextPlayer,
        creatures: updatedCreaturesAfterTower,
        board: updatedBoard,
        controlledHexes: getControlledHexes(updatedBoard),
        mana: {
          ...state.mana,
          [nextPlayer]: Math.min(
            state.mana[nextPlayer] + 2, 
            20
          )
        },
        selectedHex: null,
        selectedCard: null,
        selectedCardType: null,
        selectedCreature: null,
        actionMode: null,
        validTargets: [],
        turnPhase: 'upkeep',
        lastTowerDamage: towerDamageResults
      };

    case GAME_ACTIONS.SET_TURN_PHASE:
      const { phase } = action.payload;
      return {
        ...state,
        turnPhase: phase
      };

    case GAME_ACTIONS.MOVE_CREATURE:
      const { from, to, creatureId } = action.payload;
      const creature = state.creatures[creatureId];
      
      // Validate movement
      if (!creature || creature.hasMoved || creature.owner !== state.currentPlayer) {
        return state;
      }
      
      const distance = calculateHexDistance(state.board[from].coords, state.board[to].coords);
      if (distance > creature.speed || state.board[to].creatureId) {
        return state;
      }
      
      const newBoard = { ...state.board };
      const moveUpdatedCreatures = { ...state.creatures };
      
      // Clear old position
      newBoard[from] = {
        ...newBoard[from],
        creatureId: null
      };
      
      // Set new position
      newBoard[to] = {
        ...newBoard[to],
        creatureId: creatureId,
        owner: creature.owner
      };
      
      // Update creature
      moveUpdatedCreatures[creatureId] = {
        ...creature,
        position: to,
        hasMoved: true,
        markedForCapture: creature.canCapture // Mark for capture if can capture
      };
      
      return {
        ...state,
        board: newBoard,
        creatures: moveUpdatedCreatures,
        selectedCreature: null,
        actionMode: null,
        validTargets: []
      };

    case GAME_ACTIONS.SPEND_MANA:
      const { player: spendPlayer, amount } = action.payload;
      return {
        ...state,
        mana: {
          ...state.mana,
          [spendPlayer]: Math.max(0, state.mana[spendPlayer] - amount)
        }
      };

    case GAME_ACTIONS.CAPTURE_HEX:
      const { hexKey, player: capturePlayer } = action.payload;
      return {
        ...state,
        board: {
          ...state.board,
          [hexKey]: {
            ...state.board[hexKey],
            owner: capturePlayer
          }
        },
        controlledHexes: {
          ...state.controlledHexes,
          [capturePlayer]: [...(state.controlledHexes[capturePlayer] || []), hexKey]
        }
      };

    case GAME_ACTIONS.ADD_CREATURE:
      const { position, creature: newCreatureData } = action.payload;
      return {
        ...state,
        creatures: {
          ...state.creatures,
          [newCreatureData.id]: newCreatureData
        },
        board: {
          ...state.board,
          [position]: {
            ...state.board[position],
            creatureId: newCreatureData.id,
            owner: newCreatureData.owner
          }
        }
      };

    case GAME_ACTIONS.REMOVE_CREATURE:
      const { creatureId: removeCreatureId, position: removePosition } = action.payload;
      const removeUpdatedCreatures = { ...state.creatures };
      delete removeUpdatedCreatures[removeCreatureId];
      
      return {
        ...state,
        creatures: removeUpdatedCreatures,
        board: {
          ...state.board,
          [removePosition]: {
            ...state.board[removePosition],
            creatureId: null,
            owner: state.board[removePosition].isTower ? state.board[removePosition].owner : null
          }
        }
      };

    case GAME_ACTIONS.DAMAGE_TOWER:
      const { towerKey, damage } = action.payload;
      return {
        ...state,
        towers: {
          ...state.towers,
          [towerKey]: {
            ...state.towers[towerKey],
            health: Math.max(0, state.towers[towerKey].health - damage)
          }
        }
      };

    case GAME_ACTIONS.RESET_GAME:
      return initialGameState;

    case GAME_ACTIONS.SELECT_HEX:
      const { hexKey: selectHexKey } = action.payload;
      return {
        ...state,
        selectedHex: state.selectedHex === selectHexKey ? null : selectHexKey
      };

    case GAME_ACTIONS.SELECT_CARD:
      const { cardIndex: selectedCardIndex, cardType } = action.payload;
      return {
        ...state,
        selectedCard: state.selectedCard === selectedCardIndex ? null : selectedCardIndex,
        selectedCardType: state.selectedCard === selectedCardIndex ? null : cardType
      };

    case GAME_ACTIONS.DESELECT_ALL:
      return {
        ...state,
        selectedHex: null,
        selectedCard: null,
        selectedCardType: null,
        selectedCreature: null,
        actionMode: null,
        validTargets: []
      };

    case GAME_ACTIONS.SUMMON_CREATURE:
      const { hexPosition, creatureType, player: summonPlayer } = action.payload;
      const creatureTemplate = getCreatureById(creatureType);
      
      // Validate summoning conditions
      if (!creatureTemplate) return state;
      if (state.mana[summonPlayer] < creatureTemplate.manaCost) return state;
      if (state.board[hexPosition]?.owner !== summonPlayer) return state;
      if (state.board[hexPosition]?.creatureId) return state;
      
      const newCreature = createCreatureInstance(creatureType, summonPlayer, hexPosition);
      const updatedHand = [...state.hands[summonPlayer]];
      const handCardIndex = updatedHand.findIndex(card => card === creatureType);
      if (handCardIndex !== -1) {
        updatedHand.splice(handCardIndex, 1);
      }
      
      return {
        ...state,
        creatures: {
          ...state.creatures,
          [newCreature.id]: newCreature
        },
        board: {
          ...state.board,
          [hexPosition]: {
            ...state.board[hexPosition],
            creatureId: newCreature.id
          }
        },
        mana: {
          ...state.mana,
          [summonPlayer]: state.mana[summonPlayer] - creatureTemplate.manaCost
        },
        hands: {
          ...state.hands,
          [summonPlayer]: updatedHand
        },
        selectedHex: null,
        selectedCard: null,
        selectedCardType: null
      };

    case GAME_ACTIONS.ATTACK_CREATURE:
      const { attackerId, targetId, targetPosition } = action.payload;
      const attacker = state.creatures[attackerId];
      const target = state.creatures[targetId];
      
      // Validate attack
      if (!attacker || !target || attacker.hasAttacked || attacker.owner !== state.currentPlayer) {
        return state;
      }
      
      const attackDistance = calculateHexDistance(
        state.board[attacker.position].coords, 
        state.board[targetPosition].coords
      );
      if (attackDistance > attacker.range) {
        return state;
      }
      
      // Check for Tank guarding
      const adjacentToTarget = getAdjacentHexes(state.board[targetPosition].coords, state.board);
      const tankGuards = adjacentToTarget.some(adjKey => {
        const adjHex = state.board[adjKey];
        if (adjHex.creatureId) {
          const adjCreature = state.creatures[adjHex.creatureId];
          return adjCreature && 
                 adjCreature.archetype === 'Tank' && 
                 adjCreature.owner === target.owner &&
                 adjCreature.id !== targetId;
        }
        return false;
      });
      
      if (tankGuards && attacker.range === 1) {
        // Melee attack blocked by Tank
        return state;
      }
      
      const attackUpdatedCreatures = { ...state.creatures };
      
      // Apply damage
      const newTargetHealth = target.health - attacker.attack;
      
      if (newTargetHealth <= 0) {
        // Target dies
        delete attackUpdatedCreatures[targetId];
        const updatedBoardAfterAttack = {
          ...state.board,
          [targetPosition]: {
            ...state.board[targetPosition],
            creatureId: null
          }
        };
        
        // Mark attacker as attacked
        attackUpdatedCreatures[attackerId] = {
          ...attacker,
          hasAttacked: true
        };
        
        return {
          ...state,
          creatures: attackUpdatedCreatures,
          board: updatedBoardAfterAttack,
          selectedCreature: null,
          actionMode: null,
          validTargets: []
        };
      } else {
        // Target survives
        attackUpdatedCreatures[targetId] = {
          ...target,
          health: newTargetHealth
        };
        
        attackUpdatedCreatures[attackerId] = {
          ...attacker,
          hasAttacked: true
        };
        
        return {
          ...state,
          creatures: attackUpdatedCreatures,
          selectedCreature: null,
          actionMode: null,
          validTargets: []
        };
      }

    case GAME_ACTIONS.SELECT_CREATURE:
      const { creatureId: selectCreatureId, mode } = action.payload;
      const selectedCreature = state.creatures[selectCreatureId];
      
      if (!selectedCreature || selectedCreature.owner !== state.currentPlayer) {
        return state;
      }
      
      let validTargets = [];
      if (mode === 'move' && !selectedCreature.hasMoved) {
        validTargets = getValidMoveTargets(
          state.board[selectedCreature.position].coords,
          selectedCreature.speed,
          state.board
        );
      } else if (mode === 'attack' && !selectedCreature.hasAttacked) {
        validTargets = getValidAttackTargets(
          state.board[selectedCreature.position].coords,
          selectedCreature.range,
          state.board,
          selectedCreature.owner
        );
      }
      
      return {
        ...state,
        selectedCreature: selectCreatureId,
        actionMode: mode,
        validTargets: validTargets,
        selectedHex: null,
        selectedCard: null,
        selectedCardType: null
      };

    default:
      return state;
  }
}

// Create context
const GameContext = createContext();

// Context provider component
export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

  // Helper functions
  const endTurn = () => {
    dispatch({ type: GAME_ACTIONS.END_TURN });
  };

  const moveCreature = (from, to, creatureId) => {
    dispatch({
      type: GAME_ACTIONS.MOVE_CREATURE,
      payload: { from, to, creatureId }
    });
  };

  const spendMana = (player, amount) => {
    dispatch({
      type: GAME_ACTIONS.SPEND_MANA,
      payload: { player, amount }
    });
  };

  const captureHex = (hexKey, player) => {
    dispatch({
      type: GAME_ACTIONS.CAPTURE_HEX,
      payload: { hexKey, player }
    });
  };

  const addCreature = (position, creature) => {
    dispatch({
      type: GAME_ACTIONS.ADD_CREATURE,
      payload: { position, creature }
    });
  };

  const removeCreature = (creatureId, position) => {
    dispatch({
      type: GAME_ACTIONS.REMOVE_CREATURE,
      payload: { creatureId, position }
    });
  };

  const damageTower = (towerKey, damage) => {
    dispatch({
      type: GAME_ACTIONS.DAMAGE_TOWER,
      payload: { towerKey, damage }
    });
  };

  const resetGame = () => {
    dispatch({ type: GAME_ACTIONS.RESET_GAME });
  };

  const selectHex = (hexKey) => {
    dispatch({
      type: GAME_ACTIONS.SELECT_HEX,
      payload: { hexKey }
    });
  };

  const selectCard = (cardIndex, cardType) => {
    dispatch({
      type: GAME_ACTIONS.SELECT_CARD,
      payload: { cardIndex, cardType }
    });
  };

  const deselectAll = () => {
    dispatch({ type: GAME_ACTIONS.DESELECT_ALL });
  };

  const summonCreature = (hexPosition, creatureType, player) => {
    dispatch({
      type: GAME_ACTIONS.SUMMON_CREATURE,
      payload: { hexPosition, creatureType, player }
    });
  };

  const selectCreature = (creatureId, mode) => {
    dispatch({
      type: GAME_ACTIONS.SELECT_CREATURE,
      payload: { creatureId, mode }
    });
  };

  const attackCreature = (attackerId, targetId, targetPosition) => {
    dispatch({
      type: GAME_ACTIONS.ATTACK_CREATURE,
      payload: { attackerId, targetId, targetPosition }
    });
  };

  const setTurnPhase = (phase) => {
    dispatch({
      type: GAME_ACTIONS.SET_TURN_PHASE,
      payload: { phase }
    });
  };

  // Helper function to advance to next turn phase
  const advanceTurnPhase = () => {
    const phases = ['upkeep', 'main', 'end'];
    const currentIndex = phases.indexOf(gameState.turnPhase);
    
    if (currentIndex < phases.length - 1) {
      // Move to next phase
      setTurnPhase(phases[currentIndex + 1]);
    } else {
      // End turn and move to next player's upkeep
      endTurn();
    }
  };

  // Helper function to check if it's the main phase (when actions are allowed)
  const canPerformActions = () => {
    return gameState.turnPhase === 'main';
  };

  // Helper function to check if a hex is a valid summoning target
  const isValidSummoningTarget = (hexKey) => {
    if (!gameState.selectedCardType) return false;
    const hex = gameState.board[hexKey];
    return hex && hex.owner === gameState.currentPlayer && !hex.creatureId;
  };

  // Helper function to check if a hex is a valid move target
  const isValidMoveTarget = (hexKey) => {
    return gameState.validTargets.includes(hexKey);
  };

  // Helper function to check if a hex is a valid attack target
  const isValidAttackTarget = (hexKey) => {
    return gameState.validTargets.includes(hexKey);
  };

  const value = {
    gameState,
    dispatch,
    actions: {
      endTurn,
      moveCreature,
      spendMana,
      captureHex,
      addCreature,
      removeCreature,
      damageTower,
      resetGame,
      selectHex,
      selectCard,
      deselectAll,
      summonCreature,
      selectCreature,
      attackCreature,
      setTurnPhase,
      advanceTurnPhase
    },
    helpers: {
      isValidSummoningTarget,
      isValidMoveTarget,
      isValidAttackTarget,
      canPerformActions
    }
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;