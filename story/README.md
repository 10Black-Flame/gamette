# Chronicles of Aetheria - Fantasy Adventure Game

A comprehensive fantasy RPG built with pure JavaScript, HTML5, and CSS3. Travel through a mystical world, battle enemies, complete quests, and become a legendary hero!

## 🎮 Features

### Core Gameplay
- **Character Creation**: Choose from 4 unique classes (Warrior, Mage, Rogue, Cleric)
- **Turn-Based Combat**: Strategic battles with attacks, spells, defend, and flee options
- **Experience & Leveling**: Gain experience, level up, and become stronger
- **Inventory System**: Collect items, equipment, and consumables
- **Quest System**: Multiple quests with rewards and story progression

### Game World
- **7 Unique Locations**: Village, Forest, Cave, Mountains, Sky Tower, Castle, Dungeon
- **Multiple NPCs**: Shopkeepers, quest givers, and lore characters
- **20+ Enemies**: From goblins to the powerful Shadow Lord
- **Environmental Items**: Herbs, ores, and treasure to discover

### Systems
- **Shop/Trading**: Buy and sell items, equipment, and potions
- **Health & Mana Management**: Monitor and restore resources
- **Stat System**: Attack, Defense, Speed, and special abilities per class
- **Equipment**: Wield different weapons and armor for stat bonuses
- **Gold Economy**: Earn gold from enemies and sell items
- **Save/Load System**: Progress is automatically saved locally

## 🚀 Quick Start

### Browser (No Installation Required)
1. Open `story.html` directly in your web browser
2. Create a character and start your adventure!
3. Click "Save" to save your progress

### Server Backend (Optional, with Database)

#### Prerequisites
- Node.js and npm installed on your system

#### Installation
```bash
cd story
npm install
```

#### Run the Server
```bash
npm start
```

The game will be accessible at:
- Game: `http://localhost:3000/story.html`
- API: `http://localhost:3000/api/`

## 📦 File Structure

```
story/
├── story.html           # Main game HTML interface
├── story.css            # Game styling and animations
├── story.js             # Game engine and logic
├── game-data.js         # Game world data (items, NPCs, enemies, locations)
├── server.js            # Node.js backend server (optional)
├── package.json         # Node.js dependencies
├── game.db              # SQLite database (created after running server)
└── README.md            # This file
```

## 🎯 How to Play

### 1. Character Creation
- Enter your character name
- Choose your class:
  - **Warrior**: High HP and Attack
  - **Mage**: High MP and magical abilities
  - **Rogue**: High Speed for quick attacks
  - **Cleric**: Balanced with healing abilities
- Click "Start Adventure"

### 2. Exploration
- View your current location description
- Interact with NPCs for quests and shopping
- Encounter and fight enemies
- Collect items and complete quests

### 3. Combat
In battle, you can:
- **Attack**: Deal weapon damage
- **Cast Spell**: Use MP for special magical attacks
- **Defend**: Reduce incoming damage
- **Flee**: Attempt to escape (40% success rate)

### 4. Inventory
- Manage your collected items
- Use consumables (healing herbs, mana potions)
- Equip weapons and armor
- Sell items for gold

### 5. Quests
- Complete quests to earn gold and rewards
- Track progress in the quest log
- Multiple quests available throughout the world

## 📊 Game Balance

### Classes (Base Stats)
| Stat | Warrior | Mage | Rogue | Cleric |
|------|---------|------|-------|--------|
| HP | 120 | 80 | 90 | 100 |
| MP | 20 | 50 | 15 | 40 |
| Attack | 15 | 8 | 14 | 10 |
| Defense | 8 | 3 | 5 | 10 |
| Speed | 5 | 8 | 12 | 6 |

### Enemy Progression
- **Early**: Goblins, Wolves (20-30 HP)
- **Mid**: Trolls, Dark Knights (60-80 HP)
- **Late**: Golems, Shadow Beasts (50-80 HP)
- **Boss**: Shadow Lord (150 HP)

## 💾 Save System

### Local Storage (Browser)
- Automatically saves to browser storage
- Click "Save" button to manually save
- Persistent across browser sessions
- Includes: stats, inventory, quests, gold

### Database (Server Backend)
- Optional server backend using SQLite
- Stores player data and game saves
- Leaderboard system
- Player statistics tracking

## 🔧 Server API Endpoints

```
GET /api/health
  - Check server status

POST /api/save
  - Save game data
  - Body: { playerId, playerData }

GET /api/load/:playerId
  - Load player game data

GET /api/leaderboard
  - Get top 100 players

GET /api/player/:playerId
  - Get player statistics

DELETE /api/player/:playerId
  - Delete player data (testing)
```

## 🎨 Customization

### Add New Items
Edit `game-data.js` in the `items` object:
```javascript
newItem: {
    id: 'newItem',
    name: 'Item Name',
    type: 'weapon|armor|consumable',
    attack: 5,  // optional
    defense: 3, // optional
    effect: 'heal',  // optional
    value: 20,  // optional
    gold: 100   // sell price
}
```

### Add New Enemies
Edit `game-data.js` in the `enemies` object:
```javascript
newEnemy: {
    id: 'newEnemy',
    name: 'Enemy Name',
    hp: 50,
    attack: 10,
    defense: 5,
    speed: 6,
    exp: 200,
    gold: 100,
    drops: ['itemId1', 'itemId2']
}
```

### Add New Locations
Edit `game-data.js` in the `locations` object:
```javascript
newLocation: {
    id: 'newLocation',
    name: 'Location Name',
    description: 'Description...',
    npcs: ['npcId'],
    enemies: ['enemyId'],
    items: ['itemId'],
    exits: { locationId: 'Exit description' }
}
```

## 🐛 Debugging

### Browser Console
Press `F12` to open developer tools. The console shows:
- Combat logs
- Save/load notifications
- Game state information

### Server Logging
Server outputs detailed logs including:
- Database operations
- API requests
- Connection status

## 📈 Future Enhancements

Potential additions:
- Multiplayer capabilities
- More complex skill trees
- Guild system
- PvP battles
- Crafting system
- Procedural dungeons
- Achievements/Badges
- Advanced graphics and animations
- Mobile app version
- Story/dialogue system

## 🤝 Contributing

Feel free to:
- Add new items, enemies, or locations
- Improve game balance
- Create custom adventures
- Enhance visuals
- Fix bugs

## 📝 License

MIT License - Feel free to use, modify, and distribute.

## 🎪 Game Features Summary

✅ 4 Unique Classes  
✅ 7 Explorable Locations  
✅ 20+ Enemies with AI  
✅ Turn-Based Combat System  
✅ Inventory Management  
✅ Quest System  
✅ Shop/Trading  
✅ Experience & Leveling  
✅ Equipment System  
✅ Gold Economy  
✅ Save/Load System  
✅ Leaderboard (with backend)  
✅ Mobile Responsive  
✅ Beautiful Dark Fantasy Theme  

## 🎵 Game Audio (Future)

Consider adding:
- Epic fantasy background music
- Combat sound effects
- UI interaction sounds
- Ambient environmental sounds

## 📜 Game Lore

Chronicles of Aetheria tells the story of a brave adventurer in a realm plagued by darkness. The Shadow Lord has awakened in the ancient castle dungeon, spreading corruption across the land. NPCs in the village offer quests to gather power and resources needed to face this ultimate evil.

---

**Have fun playing Chronicles of Aetheria!** 🎮✨
