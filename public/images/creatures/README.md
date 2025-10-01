# Creature Images Setup

## Directory Structure
The game now supports creature images stored in `/public/images/creatures/`

## Required Image Files
Place the following image files in the `/public/images/creatures/` directory:

- `warrior.png` - Warrior creature image
- `archer.png` - Archer creature image  
- `mage.png` - Mage creature image
- `scout.png` - Scout creature image
- `gelatinous_cube.png` - Gelatinous Cube creature image
- `shield_guardian.png` - Shield Guardian creature image
- `stone_defender.png` - Stone Defender creature image

## Image Specifications
- **Format**: PNG (recommended) or JPG
- **Card Images**: Recommended size 100x100px to 200x200px
- **Token Images**: Recommended size 32x32px to 64x64px
- **Aspect Ratio**: Square (1:1) works best
- **Background**: Transparent PNG preferred for tokens

## Fallback Behavior
If images fail to load or aren't found, the game will automatically fall back to emoji icons.

## Adding Your Images
1. Create or find creature artwork
2. Save as PNG files with the exact names listed above
3. Place them in the `/public/images/creatures/` directory
4. Refresh the game to see the images

## Image Sources
You can use:
- AI-generated images (Midjourney, DALL-E, Stable Diffusion)
- Free game assets (OpenGameArt.org, itch.io)
- Custom artwork
- Royalty-free stock images