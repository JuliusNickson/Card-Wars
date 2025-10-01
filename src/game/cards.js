// Card definitions for creatures and spells

export const CREATURE_TYPES = {
  WARRIOR: 'warrior',
  ARCHER: 'archer',
  MAGE: 'mage',
  SCOUT: 'scout'
};

export const CARD_TYPES = {
  CREATURE: 'creature',
  SPELL: 'spell'
};

// Creature definitions
export const CREATURES = {
  [CREATURE_TYPES.WARRIOR]: {
    id: CREATURE_TYPES.WARRIOR,
    name: 'Warrior',
    type: CARD_TYPES.CREATURE,
    manaCost: 3,
    attack: 3,
    health: 4,
    speed: 2,
    range: 1,
    canCapture: true,
    archetype: 'Tank',
    description: 'A sturdy melee fighter with Tank guarding',
    icon: '⚔️'
  },
  [CREATURE_TYPES.ARCHER]: {
    id: CREATURE_TYPES.ARCHER,
    name: 'Archer',
    type: CARD_TYPES.CREATURE,
    manaCost: 2,
    attack: 2,
    health: 2,
    speed: 2,
    range: 3,
    canCapture: true,
    archetype: 'Ranged',
    description: 'Ranged unit with quick strikes',
    icon: '🏹'
  },
  [CREATURE_TYPES.MAGE]: {
    id: CREATURE_TYPES.MAGE,
    name: 'Mage',
    type: CARD_TYPES.CREATURE,
    manaCost: 4,
    attack: 1,
    health: 3,
    speed: 1,
    range: 2,
    canCapture: false,
    archetype: 'Support',
    description: 'Magical support unit (cannot capture)',
    icon: '🔮'
  },
  [CREATURE_TYPES.SCOUT]: {
    id: CREATURE_TYPES.SCOUT,
    name: 'Scout',
    type: CARD_TYPES.CREATURE,
    manaCost: 1,
    attack: 1,
    health: 1,
    speed: 3,
    range: 1,
    canCapture: true,
    archetype: 'Fast',
    description: 'Fast, cheap unit for exploration',
    icon: '👁️'
  }
};

// Default hand for each player
export const DEFAULT_HAND = [
  CREATURE_TYPES.WARRIOR,
  CREATURE_TYPES.ARCHER,
  CREATURE_TYPES.MAGE,
  CREATURE_TYPES.SCOUT,
  CREATURE_TYPES.WARRIOR
];

// Helper functions
export const getCreatureById = (id) => CREATURES[id];

export const createCreatureInstance = (creatureType, owner, position) => {
  const template = CREATURES[creatureType];
  if (!template) return null;
  
  return {
    id: `${creatureType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: creatureType,
    owner,
    position,
    attack: template.attack,
    health: template.health,
    maxHealth: template.health,
    speed: template.speed,
    range: template.range,
    canCapture: template.canCapture,
    archetype: template.archetype,
    canMove: true,
    canAttack: true,
    hasMoved: false,
    hasAttacked: false,
    markedForCapture: false,
    statusEffects: [],
    baseAttack: template.attack,
    baseSpeed: template.speed
  };
};

// Movement and range calculation utilities
export const calculateHexDistance = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // For flat-topped hex grid (offset coordinates)
  // Convert to axial coordinates for proper distance calculation
  const fromAxial = {
    q: from.x - Math.floor(from.y / 2),
    r: from.y
  };
  const toAxial = {
    q: to.x - Math.floor(to.y / 2), 
    r: to.y
  };
  
  return (Math.abs(fromAxial.q - toAxial.q) + 
          Math.abs(fromAxial.q + fromAxial.r - toAxial.q - toAxial.r) + 
          Math.abs(fromAxial.r - toAxial.r)) / 2;
};

export const getValidMoveTargets = (fromPosition, speed, board) => {
  const validTargets = [];
  
  // Check all positions within speed range
  Object.entries(board).forEach(([key, hex]) => {
    const distance = calculateHexDistance(fromPosition, hex.coords);
    
    // Valid if within speed range and hex is empty (no creature)
    if (distance <= speed && distance > 0 && !hex.creatureId) {
      validTargets.push(key);
    }
  });
  
  return validTargets;
};

export const getValidAttackTargets = (fromPosition, range, board, attackerOwner) => {
  const validTargets = [];
  
  // Check all positions within attack range
  Object.entries(board).forEach(([key, hex]) => {
    const distance = calculateHexDistance(fromPosition, hex.coords);
    
    // Valid if within range and has enemy creature
    if (distance <= range && distance > 0 && hex.creatureId && hex.owner !== attackerOwner) {
      validTargets.push(key);
    }
  });
  
  return validTargets;
};

export const getAdjacentHexes = (position, board) => {
  const adjacent = [];
  const { x, y } = position;
  
  // Hex neighbors for flat-topped orientation
  const neighborOffsets = [
    [-1, 0], [1, 0],        // Left, Right
    [0, -1], [0, 1],        // Up, Down
    [-1, -1], [-1, 1]       // Up-left, Down-left (for even rows)
  ];
  
  // Adjust for odd/even row offset
  if (y % 2 === 1) {
    neighborOffsets[4] = [0, -1];  // Up-right for odd rows
    neighborOffsets[5] = [0, 1];   // Down-right for odd rows
  }
  
  neighborOffsets.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    const key = `${nx},${ny}`;
    
    if (board[key]) {
      adjacent.push(key);
    }
  });
  
  return adjacent;
};