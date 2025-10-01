# Hex Strategy Game

A turn-based strategy game built with React and Vite, featuring hexagonal grid gameplay with creatures, towers, and territory control.

## Features

- **Hexagonal Grid**: 16x8 hex board with strategic positioning
- **Turn-based Combat**: Move and attack with different creature types
- **Territory Control**: Capture and control hexes to expand your domain
- **Tower Defense**: Defensive towers with unique domain effects
- **Multiple Creature Types**: Warriors, Archers, Mages, and Scouts with unique abilities
- **Strategic Gameplay**: Tank guarding, ranged attacks, and tactical positioning

## Game Mechanics

### Creatures
- **Warrior**: Tank archetype with high health and melee attacks
- **Archer**: Ranged unit with moderate stats and long-range attacks
- **Mage**: Support unit with magical abilities (cannot capture)
- **Scout**: Fast, cheap unit perfect for exploration and quick captures

### Towers
- **Inferno Tower**: Deals fire damage and applies burn effects
- **Frost Tower**: Slows enemy movement with ice damage
- **Venom Tower**: Applies poison damage over time
- **Shadow Tower**: Weakens enemy attack power

### Board Layout
- **Player A Territory**: Columns 0-4 (left side)
- **Neutral Zone**: Columns 5-10 (contested middle area)
- **Player B Territory**: Columns 11-15 (right side)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/hex-strategy-game.git
cd hex-strategy-game
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. **Turn Structure**: Each turn has phases - Upkeep, Main, and End
2. **Summoning**: Select a creature card and click on your controlled hex to summon
3. **Movement**: Click on your creatures, then select "Move" and click a valid hex
4. **Combat**: Select "Attack" and click on an enemy creature within range
5. **Territory**: Move creatures to capture neutral hexes and expand your control
6. **Victory**: Control more territory and eliminate enemy forces

## Project Structure

\`\`\`
src/
├── components/          # React components
│   ├── Board/          # Game board and hex tiles
│   └── UI/             # User interface components
├── context/            # React context for game state
├── game/               # Game logic and mechanics
├── constants/          # Game constants and actions
└── hooks/              # Custom React hooks
\`\`\`

## Technologies Used

- **React 18**: Frontend framework
- **Vite**: Build tool and dev server
- **CSS3**: Styling with hexagonal grid layouts
- **Context API**: State management

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Features

- [ ] Multiplayer support
- [ ] AI opponents
- [ ] Additional creature types
- [ ] Spell cards
- [ ] Campaign mode
- [ ] Custom maps
- [ ] Audio and visual effects

## Screenshots

[Add screenshots of your game here]