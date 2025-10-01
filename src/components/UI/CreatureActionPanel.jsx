import React from 'react';
import { useGame } from '../../context/GameContext';
import './CreatureActionPanel.css';

const CreatureActionPanel = () => {
  const { gameState, actions, helpers } = useGame();
  
  if (!gameState.selectedCreature || !helpers.canPerformActions()) {
    return null;
  }
  
  const creature = gameState.creatures[gameState.selectedCreature];
  
  if (!creature || creature.owner !== gameState.currentPlayer) {
    return null;
  }
  
  const handleMoveClick = () => {
    if (!creature.hasMoved) {
      actions.selectCreature(gameState.selectedCreature, 'move');
    }
  };
  
  const handleAttackClick = () => {
    if (!creature.hasAttacked) {
      actions.selectCreature(gameState.selectedCreature, 'attack');
    }
  };
  
  const handleCancelClick = () => {
    actions.deselectAll();
  };
  
  return (
    <div className="creature-action-panel">
      <div className="panel-header">
        <h3>Creature Actions</h3>
        <div className="creature-name">{creature.type}</div>
        <div className="creature-stats">
          HP: {creature.health}/{creature.maxHealth} | ATK: {creature.attack} | SPD: {creature.speed} | RNG: {creature.range}
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          className={`action-btn move-btn ${creature.hasMoved ? 'disabled' : ''} ${gameState.actionMode === 'move' ? 'active' : ''}`}
          onClick={handleMoveClick}
          disabled={creature.hasMoved}
        >
          Move (Speed: {creature.speed})
        </button>
        
        <button 
          className={`action-btn attack-btn ${creature.hasAttacked ? 'disabled' : ''} ${gameState.actionMode === 'attack' ? 'active' : ''}`}
          onClick={handleAttackClick}
          disabled={creature.hasAttacked}
        >
          Attack (Range: {creature.range})
        </button>
        
        <button 
          className="action-btn cancel-btn"
          onClick={handleCancelClick}
        >
          Cancel
        </button>
      </div>
      
      {gameState.actionMode && (
        <div className="action-hint">
          {gameState.actionMode === 'move' && 'Click a highlighted hex to move there.'}
          {gameState.actionMode === 'attack' && 'Click an enemy creature to attack.'}
        </div>
      )}
      
      <div className="creature-archetype">
        <strong>Archetype:</strong> {creature.archetype}
        {creature.archetype === 'Tank' && ' (Guards adjacent allies from melee attacks)'}
        {!creature.canCapture && ' (Cannot capture hexes)'}
      </div>
    </div>
  );
};

export default CreatureActionPanel;