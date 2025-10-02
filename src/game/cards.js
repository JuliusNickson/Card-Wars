// Card definitions for creatures and spells

export const CREATURE_TYPES = {
  WARRIOR: 'warrior',
  ARCHER: 'archer',
  MAGE: 'mage',
  SCOUT: 'scout',
  GELATINOUS_CUBE: 'gelatinous_cube',
  SHIELD_GUARDIAN: 'shield_guardian',
  STONE_DEFENDER: 'stone_defender'
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
    icon: '⚔️',
    image: '/images/creatures/warrior.png'
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
    icon: '🏹',
    image: '/images/creatures/archer.png'
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
    icon: '🔮',
    image: '/images/creatures/mage.png'
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
    icon: '👁️',
    image: '/images/creatures/scout.png'
  },
  [CREATURE_TYPES.GELATINOUS_CUBE]: {
    id: CREATURE_TYPES.GELATINOUS_CUBE,
    name: 'Gelatinous Cube',
    type: CARD_TYPES.CREATURE,
    manaCost: 4,
    attack: 2,
    health: 10,
    speed: 1,
    range: 1,
    canCapture: true,
    archetype: 'Tank',
    description: 'Engulf stun makes it strong at low speed',
    icon: '🟩',
    image: '/images/creatures/gelatinous_cube.png'
  },
  [CREATURE_TYPES.SHIELD_GUARDIAN]: {
    id: CREATURE_TYPES.SHIELD_GUARDIAN,
    name: 'Shield Guardian',
    type: CARD_TYPES.CREATURE,
    manaCost: 6,
    attack: 3,
    health: 14,
    speed: 1,
    range: 1,
    canCapture: true,
    archetype: 'Tank',
    description: 'Can redirect damage — higher cost',
    icon: '🛡️',
    image: '/images/creatures/shield_guardian.png'
  },
  [CREATURE_TYPES.STONE_DEFENDER]: {
    id: CREATURE_TYPES.STONE_DEFENDER,
    name: 'Stone Defender',
    type: CARD_TYPES.CREATURE,
    manaCost: 5,
    attack: 3,
    health: 12,
    speed: 1,
    range: 1,
    canCapture: true,
    archetype: 'Tank',
    description: 'Redirects damage from allies within 2 spaces to itself',
    icon: '🗿',
    image: '/images/creatures/stone_defender.png'
  }
};

// Default hand for each player
export const DEFAULT_HAND = [
  CREATURE_TYPES.WARRIOR,
  CREATURE_TYPES.ARCHER,
  CREATURE_TYPES.MAGE,
  CREATURE_TYPES.SCOUT,
  CREATURE_TYPES.GELATINOUS_CUBE,
  CREATURE_TYPES.SHIELD_GUARDIAN,
  CREATURE_TYPES.STONE_DEFENDER
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
  // Convert zigzag column coordinates to axial coordinates
  // In our grid: odd columns (x % 2 === 1) are offset down by half a hex
  
  const fromAxial = {
    q: from.x,
    r: from.y - Math.floor(from.x / 2)
  };
  
  const toAxial = {
    q: to.x,
    r: to.y - Math.floor(to.x / 2)
  };
  
  // Calculate hex distance using axial coordinates
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
    
    // Valid if within range and has enemy creature (check creature owner, not hex owner)
    if (distance <= range && distance > 0 && hex.creatureId) {
      // We need to get the creature data to check its owner
      // This will be handled by the calling code that has access to creatures
      validTargets.push(key);
    }
  });
  
  return validTargets;
};

// Get the exact 6 neighbor positions for a hex in our zigzag grid
// Using proper hexagonal directions: top, bottom, left-upper, left-lower, right-upper, right-lower
export const getHexNeighborPositions = (position) => {
  const { x, y } = position;
  const isOddColumn = x % 2 === 1;
  
  if (isOddColumn) {
    // Odd columns - based on (9,5) example -> [8,5 8,6 9,4 10,5 9,6 10,6]
    return [
      { x: x, y: y - 1 },     // top
      { x: x, y: y + 1 },     // bottom
      { x: x - 1, y: y },     // left-upper
      { x: x - 1, y: y + 1 }, // left-lower
      { x: x + 1, y: y },     // right-upper
      { x: x + 1, y: y + 1 }  // right-lower
    ];
  } else {
    // Even columns - hexagonal directions
    return [
      { x: x, y: y - 1 },     // top
      { x: x, y: y + 1 },     // bottom
      { x: x - 1, y: y - 1 }, // left-upper
      { x: x - 1, y: y },     // left-lower
      { x: x + 1, y: y - 1 }, // right-upper
      { x: x + 1, y: y }      // right-lower
    ];
  }
};

// Check if two hexes share an edge (are truly adjacent)
export const areHexesAdjacent = (pos1, pos2) => {
  // Same hex is not adjacent to itself
  if (pos1.x === pos2.x && pos1.y === pos2.y) return false;
  
  // Get all neighbors of pos1 and check if pos2 is among them
  const neighbors = getHexNeighborPositions(pos1);
  return neighbors.some(neighbor => 
    neighbor.x === pos2.x && neighbor.y === pos2.y
  );
};

export const getAdjacentHexes = (position, board) => {
  const adjacent = [];
  const neighborPositions = getHexNeighborPositions(position);
  
  // Check each neighbor position to see if it exists in the board
  neighborPositions.forEach(neighbor => {
    const key = `${neighbor.x},${neighbor.y}`;
    if (board[key]) {
      adjacent.push(key);
    }
  });
  
  return adjacent;
};