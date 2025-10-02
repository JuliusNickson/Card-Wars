import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { TOWER_DEFINITIONS } from '../../game/towers';
import { getCreatureById } from '../../game/cards';
import './HexTile.css';

const HexTile = ({ 
  owner, 
  creatureId, 
  isTower, 
  towerType,
  coords, 
  onClick, 
  selected, 
  isValidTarget,
  isSelectedCreature,
  isInTowerDomain
}) => {
  const { gameState, actions, helpers } = useGame();
  const [imageError, setImageError] = useState(false);
  
  const handleClick = () => {
    if (onClick) {
      onClick(coords);
    }
  };

  const getHexClass = () => {
    let classes = ['hex-tile'];
    
    // Add odd-column class for alternating column offset
    if (coords.x % 2 === 1) {
      classes.push('odd-column');
    }
    
    if (owner) {
      classes.push(`owner-${owner}`);
    }
    
    if (isTower) {
      classes.push('is-tower');
    }
    
    if (creatureId) {
      classes.push('has-creature');
    }
    
    if (selected) {
      classes.push('selected');
    }
    
    if (isValidTarget) {
      classes.push('valid-target');
    }
    
    if (isSelectedCreature) {
      classes.push('selected-creature');
    }
    
    if (gameState.actionMode === 'move' && helpers.isValidMoveTarget(`${coords.x},${coords.y}`)) {
      classes.push('valid-move');
    }
    
    if (gameState.actionMode === 'attack' && helpers.isValidAttackTarget(`${coords.x},${coords.y}`)) {
      classes.push('valid-attack');
    }
    
    if (isInTowerDomain) {
      classes.push('in-tower-domain');
    }
    
    return classes.join(' ');
  };

  const getTowerData = () => {
    if (!isTower || !towerType) return null;
    return TOWER_DEFINITIONS[towerType];
  };

  const renderTowerIcon = () => {
    const tower = getTowerData();
    if (!tower) return '🏰';
    return tower.icon;
  };

  const getCreatureData = () => {
    if (!creatureId) return null;
    return gameState.creatures[creatureId];
  };

  const renderCreatureIcon = () => {
    const creature = getCreatureData();
    if (!creature) return '⚔️';
    
    // Get creature template data
    const creatureTemplate = getCreatureById(creature.type);
    
    // If creature has image and no error, try to show image
    if (creatureTemplate && creatureTemplate.image && !imageError) {
      return (
        <img 
          src={creatureTemplate.image} 
          alt={creature.type}
          className="creature-token-image"
          onError={() => setImageError(true)}
        />
      );
    }
    
    // Fallback to icon based on type
    switch (creature.type) {
      case 'warrior': return '⚔️';
      case 'archer': return '🏹';
      case 'mage': return '🔮';
      case 'scout': return '👁️';
      case 'gelatinous_cube': return '🟩';
      case 'shield_guardian': return '🛡️';
      case 'stone_defender': return '🗿';
      default: return '⚔️';
    }
  };

  const renderCreatureInfo = () => {
    const creature = getCreatureData();
    if (!creature) return null;
    
    return (
      <div className="creature-info">
        <div className="creature-health">{creature.health}/{creature.maxHealth}</div>
        {creature.hasMoved && <div className="action-indicator moved">M</div>}
        {creature.hasAttacked && <div className="action-indicator attacked">A</div>}
      </div>
    );
  };

  return (
    <div 
      className={getHexClass()}
      onClick={handleClick}
      data-coords={`${coords.x},${coords.y}`}
    >
      <div className="hex-inner">
        <div className="hex-content">
          {isTower && <div className="tower-icon">{renderTowerIcon()}</div>}
          {creatureId && (
            <>
              <div className="creature-icon">{renderCreatureIcon()}</div>
              {renderCreatureInfo()}
            </>
          )}
          <div className="coords-display">
            {coords.x},{coords.y}
          </div>
          {isInTowerDomain && (
            <div className="domain-indicator">⚡</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HexTile;