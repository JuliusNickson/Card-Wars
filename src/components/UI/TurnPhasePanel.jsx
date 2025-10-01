import React from 'react';
import { useGame } from '../../context/GameContext';
import './TurnPhasePanel.css';

const TurnPhasePanel = () => {
  const { gameState, actions, helpers } = useGame();
  
  const getPhaseDescription = (phase) => {
    switch (phase) {
      case 'upkeep':
        return 'Process captures, gain mana, reset creature actions';
      case 'main':
        return 'Move creatures, attack, summon, play cards';
      case 'end':
        return 'Mark hexes for capture, cleanup effects';
      default:
        return '';
    }
  };
  
  const handlePhaseAdvance = () => {
    if (gameState.turnPhase === 'upkeep') {
      // Auto-advance from upkeep to main
      actions.setTurnPhase('main');
    } else if (gameState.turnPhase === 'main') {
      // Advance to end phase
      actions.setTurnPhase('end');
    } else if (gameState.turnPhase === 'end') {
      // End turn
      actions.endTurn();
    }
  };
  
  const getPhaseButtonText = () => {
    switch (gameState.turnPhase) {
      case 'upkeep':
        return 'Start Main Phase';
      case 'main':
        return 'End Main Phase';
      case 'end':
        return 'End Turn';
      default:
        return 'Continue';
    }
  };
  
  const getActiveCreatures = () => {
    return Object.values(gameState.creatures).filter(
      creature => creature.owner === gameState.currentPlayer
    );
  };
  
  const getActionsRemaining = () => {
    const creatures = getActiveCreatures();
    const canMove = creatures.filter(c => !c.hasMoved).length;
    const canAttack = creatures.filter(c => !c.hasAttacked).length;
    
    return { canMove, canAttack };
  };
  
  const { canMove, canAttack } = getActionsRemaining();
  
  return (
    <div className="turn-phase-panel">
      <div className="phase-header">
        <h3>Turn {gameState.turn} - Player {gameState.currentPlayer}</h3>
        <div className="current-phase">
          <span className={`phase-indicator phase-${gameState.turnPhase}`}>
            {gameState.turnPhase.toUpperCase()} PHASE
          </span>
        </div>
      </div>
      
      <div className="phase-description">
        {getPhaseDescription(gameState.turnPhase)}
      </div>
      
      {gameState.turnPhase === 'main' && (
        <div className="actions-summary">
          <div className="action-count">
            Moves available: {canMove} | Attacks available: {canAttack}
          </div>
          <div className="mana-display">
            Mana: {gameState.mana[gameState.currentPlayer]}
          </div>
        </div>
      )}
      
      <div className="phase-controls">
        <button 
          className="phase-advance-btn"
          onClick={handlePhaseAdvance}
        >
          {getPhaseButtonText()}
        </button>
      </div>
      
      {gameState.turnPhase === 'upkeep' && (
        <div className="upkeep-info">
          <div>• Hexes captured from last turn processed</div>
          <div>• Creature actions reset</div>
          <div>• Mana gained: +2</div>
        </div>
      )}
      
      {gameState.turnPhase === 'end' && (
        <div className="end-phase-info">
          <div>• Creatures with capture ability mark their hexes</div>
          <div>• Adjacency spread will occur on next upkeep</div>
        </div>
      )}
    </div>
  );
};

export default TurnPhasePanel;