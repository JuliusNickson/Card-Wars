// Tower definitions and utilities

export const TOWER_TYPES = {
  INFERNO: 'inferno',
  FROST: 'frost', 
  VENOM: 'venom',
  SHADOW: 'shadow'
};

export const TOWER_DEFINITIONS = {
  [TOWER_TYPES.INFERNO]: {
    id: TOWER_TYPES.INFERNO,
    name: 'Inferno Tower',
    health: 25,
    maxHealth: 25,
    damage: 2,
    domainRange: 2,
    domainEffect: 'burn',
    icon: '🔥',
    description: 'Deals fire damage and applies burn effect'
  },
  [TOWER_TYPES.FROST]: {
    id: TOWER_TYPES.FROST,
    name: 'Frost Tower',
    health: 30,
    maxHealth: 30,
    damage: 1,
    domainRange: 2,
    domainEffect: 'slow',
    icon: '❄️',
    description: 'Deals ice damage and slows enemy movement'
  },
  [TOWER_TYPES.VENOM]: {
    id: TOWER_TYPES.VENOM,
    name: 'Venom Tower',
    health: 25,
    maxHealth: 25,
    damage: 1,
    domainRange: 2,
    domainEffect: 'poison',
    icon: '☠️',
    description: 'Deals poison damage over time'
  },
  [TOWER_TYPES.SHADOW]: {
    id: TOWER_TYPES.SHADOW,
    name: 'Shadow Tower',
    health: 30,
    maxHealth: 30,
    damage: 2,
    domainRange: 2,
    domainEffect: 'weaken',
    icon: '🌑',
    description: 'Reduces enemy attack power in domain'
  }
};

// Tower domain effects
export const DOMAIN_EFFECTS = {
  burn: {
    name: 'Burn',
    description: 'Takes 1 damage per turn',
    icon: '🔥',
    effect: (creature) => ({ ...creature, statusEffects: [...(creature.statusEffects || []), 'burn'] })
  },
  slow: {
    name: 'Slow',
    description: 'Movement reduced by 1',
    icon: '❄️',
    effect: (creature) => ({ 
      ...creature, 
      speed: Math.max(1, creature.speed - 1),
      statusEffects: [...(creature.statusEffects || []), 'slow']
    })
  },
  poison: {
    name: 'Poison',
    description: 'Takes 1 damage per turn, stacks',
    icon: '☠️',
    effect: (creature) => ({ 
      ...creature, 
      statusEffects: [...(creature.statusEffects || []), 'poison']
    })
  },
  weaken: {
    name: 'Weaken',
    description: 'Attack reduced by 1',
    icon: '🌑',
    effect: (creature) => ({ 
      ...creature, 
      attack: Math.max(1, creature.attack - 1),
      statusEffects: [...(creature.statusEffects || []), 'weaken']
    })
  }
};

// Helper functions
export const getTowerById = (towerType) => TOWER_DEFINITIONS[towerType];

export const createTowerInstance = (towerType, owner, position) => {
  const template = TOWER_DEFINITIONS[towerType];
  if (!template) return null;
  
  return {
    id: `${towerType}_${position}`,
    type: towerType,
    owner,
    position,
    health: template.health,
    maxHealth: template.maxHealth,
    damage: template.damage,
    domainRange: template.domainRange,
    domainEffect: template.domainEffect,
    lastDamageDealt: 0,
    creaturesInDomain: []
  };
};

// Calculate creatures within tower domain
export const getCreaturesInTowerDomain = (towerPosition, towerRange, creatures, board, calculateHexDistance) => {
  const creaturesInDomain = [];
  
  Object.values(creatures).forEach(creature => {
    if (creature.position) {
      const creatureHex = board[creature.position];
      if (creatureHex) {
        const distance = calculateHexDistance(towerPosition, creatureHex.coords);
        if (distance <= towerRange) {
          creaturesInDomain.push(creature.id);
        }
      }
    }
  });
  
  return creaturesInDomain;
};

// Apply domain effects to creatures
export const applyDomainEffects = (creature, domainEffect) => {
  if (!creature || !domainEffect || !DOMAIN_EFFECTS[domainEffect]) {
    return creature;
  }
  
  return DOMAIN_EFFECTS[domainEffect].effect(creature);
};

// Process tower damage for a single tower
export const processTowerDamage = (tower, creatures, board, calculateHexDistance) => {
  const towerPosition = board[tower.position].coords;
  const enemyCreatures = Object.values(creatures).filter(
    creature => creature.owner !== tower.owner && creature.position
  );
  
  const damageResults = [];
  
  enemyCreatures.forEach(creature => {
    const creatureHex = board[creature.position];
    if (creatureHex) {
      const distance = calculateHexDistance(towerPosition, creatureHex.coords);
      if (distance <= tower.domainRange) {
        damageResults.push({
          creatureId: creature.id,
          damage: tower.damage,
          position: creature.position
        });
      }
    }
  });
  
  return damageResults;
};