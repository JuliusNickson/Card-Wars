import React from 'react';
import { useGame } from '../../context/GameContext';
import { calculateHexDistance } from '../../game/cards';
import HexTile from './HexTile';
import './Board.css';

const Board = ({ gameState, onHexClick, isValidSummoningTarget }) => {
  const { actions, helpers } = useGame();
  
  // Create a 16x8 grid
  const BOARD_WIDTH = 16;
  const BOARD_HEIGHT = 8;

  // Use the board data from gameState, or fallback to empty board
  const boardData = gameState?.board || {};

  const isInTowerDomain = (hexCoords) => {
    return Object.values(gameState.towers).some(tower => {
      const towerHex = boardData[tower.position];
      if (towerHex) {
        const distance = calculateHexDistance(hexCoords, towerHex.coords);
        return distance <= tower.domainRange;
      }
      return false;
    });
  };

  const handleHexClick = (coords) => {
    const hexKey = `${coords.x},${coords.y}`;
    const hex = boardData[hexKey];
    
    // Only allow actions during main phase
    if (!helpers.canPerformActions()) {
      return;
    }
    
    // Handle different action modes
    if (gameState.actionMode === 'move' && gameState.selectedCreature) {
      // Move creature
      if (helpers.isValidMoveTarget(hexKey)) {
        const creature = gameState.creatures[gameState.selectedCreature];
        actions.moveCreature(creature.position, hexKey, gameState.selectedCreature);
      }
    } else if (gameState.actionMode === 'attack' && gameState.selectedCreature) {
      // Attack creature
      if (helpers.isValidAttackTarget(hexKey) && hex.creatureId) {
        actions.attackCreature(gameState.selectedCreature, hex.creatureId, hexKey);
      }
    } else if (hex.creatureId && hex.owner === gameState.currentPlayer) {
      // Select own creature for actions
      actions.selectCreature(hex.creatureId, 'move'); // Default to move mode
    } else {
      // Default hex click (for summoning, etc.)
      if (onHexClick) {
        onHexClick(coords);
      }
    }
  };

  const renderRow = (rowIndex) => {
    const tiles = [];
    const isOddRow = rowIndex % 2 === 1;
    
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const key = `${x},${rowIndex}`;
      const hexData = boardData[key] || {
        owner: null,
        creatureId: null,
        isTower: false,
        coords: { x, y: rowIndex }
      };

      const isSelected = gameState?.selectedHex === key;
      const isValidTarget = isValidSummoningTarget && isValidSummoningTarget(key);
      const isSelectedCreature = gameState?.selectedCreature === hexData.creatureId;
      const hexInTowerDomain = isInTowerDomain(hexData.coords);

      tiles.push(
        <HexTile
          key={key}
          owner={hexData.owner}
          creatureId={hexData.creatureId}
          isTower={hexData.isTower}
          towerType={hexData.towerType}
          coords={hexData.coords}
          onClick={handleHexClick}
          selected={isSelected}
          isValidTarget={isValidTarget}
          isSelectedCreature={isSelectedCreature}
          isInTowerDomain={hexInTowerDomain}
        />
      );
    }

    return (
      <div 
        key={rowIndex} 
        className={`hex-row ${isOddRow ? 'odd-row' : 'even-row'}`}
      >
        {tiles}
      </div>
    );
  };

  const renderBoard = () => {
    const rows = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      rows.push(renderRow(y));
    }
    return rows;
  };

  return (
    <div className="board-container">
      <div className="hex-grid">
        {renderBoard()}
      </div>
      {gameState && (
        <div className="board-info">
          <div className="controlled-hexes">
            <h3>Controlled Hexes</h3>
            <div className="hex-counts">
              <div className="player-hex-count">
                Player A: {gameState.controlledHexes?.A?.length || 0} hexes
              </div>
              <div className="player-hex-count">
                Player B: {gameState.controlledHexes?.B?.length || 0} hexes
              </div>
            </div>
          </div>
          <div className="towers-status">
            <h3>Tower Health</h3>
            <div className="tower-list">
              {Object.entries(gameState.towers || {}).map(([position, tower]) => (
                <div key={position} className={`tower-status player-${tower.owner}`}>
                  {position}: {tower.health}/{tower.maxHealth} HP (Player {tower.owner})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;