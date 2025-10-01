import React, { useState } from 'react';
import { getCreatureById } from '../../game/cards';
import './CreatureCard.css';

const CreatureCard = ({ cardType, selected, onClick, canAfford = true }) => {
  const creature = getCreatureById(cardType);
  const [imageError, setImageError] = useState(false);
  
  if (!creature) {
    return (
      <div className="creature-card error">
        <div className="card-content">Unknown Card</div>
      </div>
    );
  }

  const handleClick = () => {
    if (canAfford && onClick) {
      onClick();
    }
  };

  const getCardClass = () => {
    let classes = ['creature-card'];
    
    if (selected) {
      classes.push('selected');
    }
    
    if (!canAfford) {
      classes.push('disabled');
    }
    
    return classes.join(' ');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={getCardClass()} onClick={handleClick}>
      <div className="card-header">
        <div className="card-name">{creature.name}</div>
        <div className="mana-cost">{creature.manaCost}</div>
      </div>
      
      <div className="card-image-container">
        {creature.image && !imageError ? (
          <img 
            src={creature.image} 
            alt={creature.name}
            className="card-image"
            onError={handleImageError}
          />
        ) : (
          <div className="card-icon">
            {creature.icon}
          </div>
        )}
      </div>
      <div className="card-stats">
        <div className="stat">
          <span className="stat-label">ATK</span>
          <span className="stat-value">{creature.attack}</span>
        </div>
        <div className="stat">
          <span className="stat-label">HP</span>
          <span className="stat-value">{creature.health}</span>
        </div>
      </div>
      <div className="card-description">{creature.description}</div>
    </div>
  );
};

export default CreatureCard;