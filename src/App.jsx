import React from 'react';
import Board from './components/Board/Board';
import CardHand from './components/UI/CardHand';
import CreatureActionPanel from './components/UI/CreatureActionPanel';
import TurnPhasePanel from './components/UI/TurnPhasePanel';
import TowerPanel from './components/UI/TowerPanel';
import { GameProvider, useGame } from './context/GameContext';
import './App.css';

function GameUI() {
  const { gameState, actions, helpers } = useGame();

  const handleHexClick = (coords) => {
    const hexKey = `${coords.x},${coords.y}`;
    
    // If we have a card selected and the hex is a valid target, summon creature
    if (gameState.selectedCardType && helpers.isValidSummoningTarget(hexKey)) {
      actions.summonCreature(hexKey, gameState.selectedCardType, gameState.currentPlayer);
    } else {
      // Otherwise, just select the hex
      actions.selectHex(hexKey);
    }
    
    console.log('Hex clicked:', coords, 'Key:', hexKey);
    console.log('Current game state:', gameState);
  };

  const handleCardSelect = (cardIndex, cardType) => {
    actions.selectCard(cardIndex, cardType);
    // Deselect hex when selecting a new card
    if (gameState.selectedHex) {
      actions.selectHex(null);
    }
  };

  const handleEndTurn = () => {
    actions.deselectAll();
    actions.endTurn();
  };

  const currentHand = gameState.hands?.[gameState.currentPlayer] || [];
  const currentMana = gameState.mana?.[gameState.currentPlayer] || 0;

  return (
    <div className="App">
      <div className="game-header">
        <h1>Hex Strategy Game</h1>
        <div className="game-info">
          <div className="turn-info">
            Turn: {gameState.turn} | Current Player: {gameState.currentPlayer}
          </div>
          <div className="mana-info">
            Player A Mana: {gameState.mana.A} | Player B Mana: {gameState.mana.B}
          </div>
          <button onClick={handleEndTurn} className="end-turn-btn">
            End Turn
          </button>
        </div>
      </div>
      
      <div className="game-content">
        <div className="game-board-area">
          <Board 
            gameState={gameState} 
            onHexClick={handleHexClick}
            isValidSummoningTarget={helpers.isValidSummoningTarget}
          />
        </div>
        
        <div className="game-bottom-panel">
          <TowerPanel />
        </div>
      </div>
      
      {/* Horizontal Card Bar at Bottom */}
      <div className="horizontal-card-bar">
        <div className="card-bar-section">
          <div className="card-bar-player-info">
            <div>Player {gameState.currentPlayer}</div>
            <div>Mana: {currentMana}</div>
          </div>
        </div>
        
        <div className="card-bar-cards">
          <CardHand
            hand={currentHand}
            selectedCard={gameState.selectedCard}
            onCardSelect={handleCardSelect}
            currentPlayer={gameState.currentPlayer}
            mana={currentMana}
          />
        </div>
        
        <div className="card-bar-section">
          <div className="card-bar-status">
            {gameState.selectedCardType && (
              <div>Selected: {gameState.selectedCardType}</div>
            )}
            {gameState.selectedHex && !gameState.selectedCardType && (
              <div>Hex: {gameState.selectedHex}</div>
            )}
            {!gameState.selectedCardType && !gameState.selectedHex && (
              <div>Turn: {gameState.turn}</div>
            )}
          </div>
        </div>
      </div>
      
      <CreatureActionPanel />
      <TurnPhasePanel />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
}

export default App;