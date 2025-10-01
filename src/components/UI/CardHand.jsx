import React from 'react';
import CreatureCard from './CreatureCard';
import './CardHand.css';

const CardHand = ({ hand, selectedCard, onCardSelect, currentPlayer, mana }) => {
  if (!hand || hand.length === 0) {
    return (
      <div className="card-hand">
        <div className="hand-title">Hand (Empty)</div>
      </div>
    );
  }

  return (
    <div className="card-hand">
      <div className="hand-title">
        Player {currentPlayer} Hand (Mana: {mana})
      </div>
      <div className="cards-container">
        {hand.map((cardType, index) => (
          <CreatureCard
            key={`${cardType}_${index}`}
            cardType={cardType}
            selected={selectedCard === `${cardType}_${index}`}
            onClick={() => onCardSelect(`${cardType}_${index}`, cardType)}
            canAfford={mana >= (cardType ? cardType.manaCost || 0 : 0)}
          />
        ))}
      </div>
    </div>
  );
};

export default CardHand;