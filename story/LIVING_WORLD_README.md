# ⚔️ Chronicles of Aetheria - Living World Update

## 🌍 NEW: Living World System

The world of Aetheria is now a **functioning, dynamic ecosystem** where events happen, time progresses, and NPCs have their own lives!

### Time System
- **Time Progression**: In-game time advances as you play (1 hour per ~5 seconds of gameplay)
- **Day/Night Cycle**: The world changes appearance based on time of day (Morning, Afternoon, Evening, Night)
- **Seasons**: 🌸 Spring, ☀️ Summer, 🍂 Autumn, ❄️ Winter - each affects gameplay and events
- **Age System**: NPCs age annually and have natural lifespans

### NPC Life Cycles
- **Birth**: NPCs are born, adding to the population
- **Aging**: NPCs grow older each year, with realistic lifespans (60-100 years)
- **Death**: NPCs die of old age or tragic events, removing them from the world
- **Relationships**: NPCs develop feelings toward each other and the player
- **Professions**: Each NPC has a distinct profession (blacksmith, innkeeper, alchemist, priest)
- **Moods**: Happiness and health fluctuate based on world events

### Dynamic World Events (7 Types)

| Event | Effect | Probability |
|-------|--------|-------------|
| 🎪 Treasure Discovery | Items appear in locations | Common |
| 👶 Births | New NPCs born | Very Rare |
| 🦠 Plague | NPCs get sick or die | Rare |
| ⚔️ Invasion | More enemies spawn | Rare |
| 💰 Good Harvest | Prices drop 20% | Common |
| 🎆 Peace Festival | NPCs happier | Common |
| ☄️ Meteor Shower | Special enemies appear | Rare |

### Living World Dashboard
Your world status is displayed above the game:
- **🌍 World Time**: Current date, time, and season
- **📊 Population**: How many NPCs are alive vs deceased
- **📰 Active Events**: Current world events affecting gameplay

## 👤 NEW: User Account System

### The New Login Screen

When you start the game, you'll see:
1. **Login Form** - For returning players
2. **Register Form** - To create a new account

### Account Features
- **Multiple Characters**: Create multiple characters per account
- **Progress Tracking**: Your progress is saved per character
- **Server Saves**: Optional server backend for cloud saves
- **Leaderboard**: Compete with other players

### How to Use

#### Playing WITHOUT Server
1. Open `story.html` in your browser
2. Enter any username (no password needed in local mode)
3. Create your character and play
4. Progress saves locally to your browser

#### Playing WITH Server (Optional)

**Setup**:
```bash
cd story
npm install
npm start
```

Then visit: `http://localhost:3000/story.html`

**Features**:
- ✅ Account authentication with passwords
- ✅ Cloud saves to database
- ✅ Play from multiple devices
- ✅ Global leaderboard
- ✅ Player statistics tracking

## 🎮 Gameplay Changes

### What's New
1. **World Info Panel** - See live world statistics above the game
2. **NPC Status** - View NPC age, happiness, and health
3. **Living NPCs** - NPCs can die and new ones can be born
4. **Event Log** - See world events as they happen
5. **Seasonal Changes** - Different seasons affect the world

### A Living Economy
- ✅ Prices fluctuate based on events
- ✅ Treasure discoveries add new items
- ✅ Population affects NPC availability
- ✅ Seasonal events change gameplay

## 📊 World Statistics

### Population Tracking
- View how many NPCs are alive
- See how many have died
- Track population changes over time

### Event History
- Last 10 world events are logged
- Events affect gameplay mechanics
- Some events are repeatable, others are one-time

## 🔄 World State Persistence

### In Local Mode
- World state saves to browser storage
- Time and events persist across sessions
- Progress is tied to your browser

### In Server Mode
- World state syncs with database
- Multiple devices can play the same character
- Cloud saves ensure no data loss

## 🎯 Playing the Living World

### Tips for Maximum Immersion

1. **Watch the World**: Check the world info panel regularly to see changes
2. **Follow Events**: React to world events - sometimes threats appear!
3. **Track NPCs**: See your favorite characters age and grow
4. **Adapt to Seasons**: Different seasons have different event rates
5. **Monitor Population**: If NPCs die, new ones may be born

### Strategic Considerations

- **Plague Strikes**: Better prepare before plagues hit
- **Treasure Hunts**: Events spawn special items
- **Population Effects**: Fewer NPCs means fewer trades
- **Seasonal Quests**: Some events only happen in certain seasons

## 📋 Server API (Optional)

If running the server backend:

```
POST /api/auth/register
  - Register new account
  - Body: { username, email, password, confirmPassword }

POST /api/auth/login
  - Login to account
  - Body: { username, password }

GET /api/auth/players/:userId
  - Get list of player characters

POST /api/save
  - Save game to database
  - Body: { userId, playerId, playerData }

GET /api/leaderboard
  - View top 100 players
```

## 🚀 Quick Start

### Without Server (Default)
```
1. Open story.html
2. Enter username (any name)
3. Create character
4. Play!
```

### With Server
```
1. npm install
2. npm start
3. Visit http://localhost:3000/story.html
4. Register account
5. Create character
6. Play!
```

## 🌟 Living World Example

**scenario: Your First Day**
- 6:00 AM: Sun rises, time begins
- 8:00 AM: Merchant passes through village
- 9:00 AM: Farmers report goblin trouble
- 10:00 AM: You fight first battle
- 12:00 PM: Afternoon - quest giver offers bounty
- Your actions affect the world
- NPCs see your victories and react

## 🔮 Future Enhancements

Potential additions for the living world:
- 🏘️ Town development based on player actions
- 👨‍👩‍👧‍👦 NPC families and relationships
- 🏛️ Building construction and development
- 📚 History tracking (what happened each day)
- 🎭 NPC personality-driven interactions
- 🏰 Dynamic faction reputation
- 🌳 Environmental changes (forests grow/shrink)
- ⚡ Dynamic quest generation based on events

## 📝 Character Management

### Multiple Characters
- Create many characters on your account
- Each has their own progress
- Switch between characters anytime
- Different world states for each character

### Character Data
- Name, class, level
- Experience and gold
- Inventory and equipment
- Quest progress
- timestamp of creation

## 🎓 FAQ

**Q: Will my progress be lost?**
A: No! Progress is saved locally and to server (if enabled).

**Q: Can NPCs I know die?**
A: Yes, if they get very old or a plague strikes. New ones can be born.

**Q: How long is a game year?**
A: ~15-20 minutes of gameplay (time advances continuously).

**Q: Do I need a server to play?**
A: No! The game works perfectly in local mode. Server is optional for cloud saves.

**Q: Can I play on multiple devices?**
A: Yes, if you use the server version. Your progress syncs.

**Q: How do events affect me?**
A: Events can spawn items, change prices, cause NPC deaths, or bring invasions.

---

**Your adventure in a living, breathing world awaits!** 🌍✨
