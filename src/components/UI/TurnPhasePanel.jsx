import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import './TurnPhasePanel.css';

const TurnPhasePanel = () => {
  const { gameState, actions, helpers } = useGame();
  const timerRef = useRef(null);
  
  // Timer effect for main phase
  useEffect(() => {
    if (gameState.turnPhase === 'main' && gameState.phaseTimer.isActive) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameState.phaseTimer.startTime) / 1000);
        const remaining = Math.max(0, 20 - elapsed);
        
        actions.updateTimer(remaining);
        
        // Auto advance when timer reaches 0
        if (remaining <= 0) {
          actions.setTurnPhase('end');
        }
      }, 1000);
    }
    
    // Cleanup timer when phase changes or component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.turnPhase, gameState.phaseTimer.isActive, gameState.phaseTimer.startTime, actions]);
  
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
      // End main phase early
      actions.endMainPhaseEarly();
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
        return 'End Turn Early';
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
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getTimerClass = () => {
    if (gameState.phaseTimer.timeRemaining <= 5) return 'timer-critical';
    if (gameState.phaseTimer.timeRemaining <= 10) return 'timer-warning';
    return 'timer-normal';
  };
  
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
      
      {gameState.turnPhase === 'main' && (
        <div className="timer-display">
          <div className={`timer-circle ${getTimerClass()}`}>
            <span className="timer-text">{formatTime(gameState.phaseTimer.timeRemaining)}</span>
          </div>
          <div className="timer-label">Time Remaining</div>
        </div>
      )}
      
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