# 🌍 Chronicles of Aetheria - Living World & Multi-User Update

## 📋 WHAT'S NEW

Your fantasy RPG has been transformed into a **living, functioning world** with a **multi-user authentication system**!

---

## ✨ MAJOR FEATURES ADDED

### 1. 🌍 LIVING WORLD SYSTEM

A fully simulated world ecosystem that evolves over time:

#### Time Progression
- ⏰ **Dynamic Clock**: Time advances as you play (1 hour ~5 seconds)
- 📅 **Calendar System**: Tracks Year → Month → Day → Hour
- 🌅 **Day/Night Cycles**: Morning, Afternoon, Evening, Night
- 🌸 **Seasonal System**: Spring, Summer, Autumn, Winter (affects events)

#### NPC Life Cycles
- 👶 **Birth Events**: New NPCs are born (randomly)
- 📊 **Aging System**: NPCs age 1 year per game year
- ⚰️ **Death System**: NPCs die naturally at 60-100 years old
- 😊 **Happiness Tracking**: NPCs have moods that fluctuate
- ❤️ **Health System**: NPC health affected by events
- 💰 **Wealth System**: NPCs have individual finances
- 👥 **Relationships**: NPCs can develop connections

#### Random World Events (7 Types)
1. **🎪 Treasure Discovery** - Items appear in locations
2. **👶 NPC Birth** - Baby born in village
3. **🦠 Plague Outbreak** - NPCs get sick, death rate increases
4. **⚔️ Goblin Invasion** - Enemy spawn rate increases
5. **💰 Good Harvest** - Prices drop 20%
6. **🎆 Peace Festival** - NPCs become happier
7. **☄️ Meteor Shower** - Rare meteors spawn enemies

#### World Status Dashboard
New panel above game showing:
- 🌍 Current world time, date, and season
- 📊 Population statistics (alive vs deceased)
- 📰 Active events affecting the world

---

### 2. 👤 USER AUTHENTICATION SYSTEM

Multi-user support with login/registration:

#### Login Screen
- New welcome screen when you start
- Switch between login and registration forms
- Error handling and validation

#### Account Features
- **Registration**: Create accounts with username and password
- **Login**: Authenticate and access characters
- **Multiple Characters**: Create many characters per account
- **Cloud Saves** (Optional): Save to server database

#### Authentication Modes
- **🏠 Local Mode**: No server needed, works offline
- **☁️ Server Mode**: Cloud saves when server available

---

## 📁 FILES ADDED/MODIFIED

### New Files Created:
1. **`world-simulation.js`** (314 lines)
   - WorldTime class: Manages in-game time
   - NPCState class: Individual NPC state tracking
   - WorldSimulation class: Orchestrates world events
   - Event system for random occurrences

2. **`LIVING_WORLD_README.md`**
   - Comprehensive living world documentation
   - Gameplay tips and strategies
   - FAQ about the new features

### Modified Files:

1. **`index.html`** (+50 lines)
   - Added login screen with forms
   - Added world info panel display
   - Added script reference for world-simulation.js

2. **`story.css`** (+90 lines)
   - Login screen styling
   - Form styling and animations
   - World info panel styling
   - Error message styling

3. **`story.js`** (+150 lines)
   - Added authentication setup (4 functions)
   - Added world info updates (2 functions)
   - Integrated world simulation initialization
   - Updated UI to show world status
   - Enhanced NPC display with living world data
   - Updated save/load for multi-user support
   - Added server connection check

4. **`game-data.js`** (+95 lines)
   - Added NPC extended data (age, profession, skills)
   - Added 7 world event definitions
   - Added time period definitions (morning/afternoon/evening/night)
   - Added season definitions

5. **`server.js`** (+100 lines)
   - Added password hashing
   - Added users table to database
   - Added authentication endpoints:
     - POST /api/auth/register
     - POST /api/auth/login
     - GET /api/auth/players/:userId
   - Updated save endpoint for multi-user support
   - Updated database schema

6. **`package.json`**
   - Added crypto module (for password hashing)

---

## 🎮 HOW TO USE

### Playing WITHOUT Server (Default)

```
1. Open index.html in your browser
2. Enter any username (no password needed)
3. Create your character
4. Watch the world evolve!
```

**Features in Local Mode:**
- ✅ Living world simulation
- ✅ All world events
- ✅ NPC life cycles
- ✅ Time progression
- ✅ Local save/load
- ❌ No multi-device play
- ❌ No cloud backup

### Playing WITH Server (Optional)

```bash
# Install dependencies
cd story
npm install

# Start server
npm start
```

Then visit: `http://localhost:3000/index.html`

**Features with Server:**
- ✅ Everything above PLUS:
- ✅ Account authentication
- ✅ Cloud saves
- ✅ Play from multiple devices
- ✅ Global leaderboard
- ✅ Player statistics

---

## 🌟 LIVING WORLD EXAMPLE

### First Day of Play:

```
🕐 6:00 AM (Morning)
   └─ Game starts, world begins
   
🕐 7:30 AM (Morning)
   └─ World time updates in UI
   
🕐 9:00 AM (Morning)
   └─ 📰 EVENT: Treasure discovered in forest!
   └─ Enemy drops spawn in forest location
   
🕐 12:00 PM (Afternoon)
   └─ Season: Spring 🌸
   └─ Population: 4 alive, 0 deceased
   
🕐 3:00 PM (Afternoon)
   └─ 👶 EVENT: Baby born (population → 5)
   
🕐 6:00 PM (Evening)
   └─ NPCs mood changes based on events
   
🕐 9:00 PM (Night)
   └─ Harder enemies appear at night
   
🕐 12:00 AM (Night)
   └─ New day! Events reset, time continues...
```

---

## 🛠️ TECHNICAL DETAILS

### World Simulation Architecture

```
WorldTime (handles calendar)
   ↓
WorldSimulation (manages events)
   ├─ NPCState[] (individual NPC data)
   ├─ activeEvents[] (current world events)
   └─ eventHistory[] (what happened)

Game Loop (every 100ms)
   └─ simulateWorldTick()
       └─ Time advances
       └─ Events process
       └─ UI updates
```

### Authentication Flow

```
User Opens Game
   ├─ Check if server available
   ├─ Show login screen
   │
   └─ User Action:
       ├─ LOGIN
       │  └─ Validate credentials
       │  └─ Load user's characters
       │  └─ Go to character select
       │
       └─ REGISTER
          └─ Validate form
          └─ Create account
          └─ Go to character creation
          
New Game Started
   └─ Initialize world simulation
   └─ Begin ticking world clock
   └─ Start game loop
```

---

## 📊 WORLD STATISTICS

### Population Tracking
- Display alive vs deceased NPCs
- Track births and deaths
- Monitor population changes

### Event Frequency
- **Very Common**: Treasure, Festival, Harvest (~1 per day)
- **Common**: Invasions (~1 per 3 days)
- **Rare**: Plague (~1 per 2 weeks)
- **Very Rare**: Births (~1 per month)

### Seasonal Event Rates
- 🌸 **Spring**: Normal (100%)
- ☀️ **Summer**: Increased (130%)
- 🍂 **Autumn**: Decreased (90%)
- ❄️ **Winter**: Reduced (70%)

---

## 🔄 DATABASE SCHEMA (Server Mode)

### New Tables

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT,
    password_hash TEXT,
    created_at DATETIME,
    last_login DATETIME
);

-- Players table (updated)
CREATE TABLE players (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    player_id TEXT UNIQUE,
    name TEXT,
    class TEXT,
    level INTEGER,
    exp INTEGER,
    gold INTEGER,
    created_at DATETIME,
    FOREIGN KEY (user_id)
);

-- World state table
CREATE TABLE world_state (
    id INTEGER PRIMARY KEY,
    world_data TEXT,
    updated_at DATETIME
);
```

---

## 🎓 GAMEPLAY TIPS

### Surviving in a Living World

1. **Track World Events**
   - Plagues kill NPCs - prepare with potions
   - Invasions spawn enemies - be ready for combat
   - Treasures appear - go explore!

2. **Monitor Population**
   - If population drops, fewer shops/quests
   - New births might bring new NPCs
   - Deaths are permanent

3. **Adapt to Seasons**
   - Different event rates each season
   - Plan your activities accordingly

4. **Use World Info**
   - Check active events regularly
   - React to threats immediately
   - Exploit good events (treasures, festivals)

5. **Build Relationships**
   - NPCs with high happiness trade more
   - Repeated interactions increase relationships
   - Some NPCs might die - acknowledge them

---

## 🚀 QUICK START COMMANDS

### Local Play (No Setup)
```
-> Open index.html directly
-> Play!
```

### Server Play (Full Features)
```bash
cd story
npm install
npm start
# Visit http://localhost:3000/index.html
```

---

## 🎯 NEXT STEPS FOR USERS

1. **Try Local Mode First** - See the living world in action
2. **Enable Server** - Add multi-user features (optional)
3. **Create Characters** - Register account and build your team
4. **Watch Events** - See the world change dynamically
5. **Track NPCs** - Notice which ones age, what happens

---

## 🌈 THE VISION

> *Chronicles of Aetheria is more than a game - it's a living world.*
>
> *NPCs are born, age, and die. Events shape the realm. Time flows continuously.*
>
> *Your actions matter. The world remembers who you were.*

---

## 📞 SUPPORT

- **Local Mode Issues**: Check browser console (F12)
- **Server Connection**: Verify server is running on port 3000
- **Save Problems**: Check browser storage permissions
- **NPC Questions**: Read LIVING_WORLD_README.md

---

**Version**: 2.0 (Living World Edition)  
**Last Updated**: April 3, 2026  
**Status**: ✅ Fully Functional

Enjoy your adventure in a truly living world! 🌍✨
