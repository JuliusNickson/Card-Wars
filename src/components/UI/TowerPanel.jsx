import React from 'react';
import { useGame } from '../../context/GameContext';
import { TOWER_DEFINITIONS } from '../../game/towers';
import { calculateHexDistance } from '../../game/cards';
import './TowerPanel.css';

const TowerPanel = () => {
  const { gameState } = useGame();
  
  const getCreaturesInTowerRange = (tower) => {
    const towerHex = gameState.board[tower.position];
    if (!towerHex) return [];
    
    return Object.values(gameState.creatures).filter(creature => {
      if (!creature.position) return false;
      const creatureHex = gameState.board[creature.position];
      if (!creatureHex) return false;
      
      const distance = calculateHexDistance(towerHex.coords, creatureHex.coords);
      return distance <= tower.domainRange;
    });
  };
  
  const getEnemyCreaturesInRange = (tower) => {
    return getCreaturesInTowerRange(tower).filter(creature => creature.owner !== tower.owner);
  };
  
  const renderTowerInfo = (tower) => {
    const towerDef = TOWER_DEFINITIONS[tower.type];
    const creaturesInRange = getCreaturesInTowerRange(tower);
    const enemyCreatures = getEnemyCreaturesInRange(tower);
    
    return (
      <div key={tower.position} className={`tower-info player-${tower.owner}`}>
        <div className="tower-header">
          <span className="tower-icon">{towerDef.icon}</span>
          <div className="tower-details">
            <div className="tower-name">{towerDef.name}</div>
            <div className="tower-position">Position: {tower.position}</div>
          </div>
        </div>
        
        <div className="tower-stats">
          <div className="stat">
            <span className="stat-label">Health:</span>
            <span className="stat-value">{tower.health}/{tower.maxHealth}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Damage:</span>
            <span className="stat-value">{tower.damage}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Range:</span>
            <span className="stat-value">{tower.domainRange}</span>
          </div>
        </div>
        
        <div className="domain-effect">
          <div className="effect-name">Domain: {towerDef.domainEffect}</div>
          <div className="effect-description">{towerDef.description}</div>
        </div>
        
        <div className="creatures-affected">
          <div className="affected-header">
            Creatures in Domain: {creaturesInRange.length}
          </div>
          {enemyCreatures.length > 0 && (
            <div className="enemy-creatures">
              <div className="enemy-count">Enemies: {enemyCreatures.length}</div>
              <div className="enemy-list">
                {enemyCreatures.map(creature => (
                  <div key={creature.id} className="enemy-creature">
                    {creature.type} ({creature.health}/{creature.maxHealth} HP)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {gameState.lastTowerDamage && gameState.lastTowerDamage.length > 0 && (
          <div className="recent-damage">
            <div className="damage-header">Recent Activity:</div>
            {gameState.lastTowerDamage
              .filter(msg => msg.includes(tower.type))
              .map((msg, index) => (
                <div key={index} className="damage-message">{msg}</div>
              ))}
          </div>
        )}
      </div>
    );
  };
  
  const playerATowers = Object.values(gameState.towers).filter(tower => tower.owner === 'A');
  const playerBTowers = Object.values(gameState.towers).filter(tower => tower.owner === 'B');
  
  return (
    <div className="tower-panel">
      <div className="panel-header">
        <h3>Tower Status</h3>
      </div>
      
      <div className="towers-container">
        <div className="player-towers">
          <h4>Player A Towers</h4>
          <div className="towers-list">
            {playerATowers.map(tower => renderTowerInfo(tower))}
          </div>
        </div>
        
        <div className="player-towers">
          <h4>Player B Towers</h4>
          <div className="towers-list">
            {playerBTowers.map(tower => renderTowerInfo(tower))}
          </div>
        </div>
      </div>
      
      <div className="tower-legend">
        <h5>Domain Effects:</h5>
        <div className="legend-item">🔥 Burn: 1 damage per turn</div>
        <div className="legend-item">❄️ Slow: -1 movement speed</div>
        <div className="legend-item">☠️ Poison: 1 damage per turn (stacks)</div>
        <div className="legend-item">🌑 Weaken: -1 attack power</div>
      </div>
    </div>
  );
};

export default TowerPanel;