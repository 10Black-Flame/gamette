# 🚀 Quick Setup Guide - Living World & Multi-User Update

## Choose Your Playstyle

### Option 1: Play Now (No Setup) ⚡

**Best for**: Testing, casual play, single-device gaming

```
1. Open: index.html
2. Enter username: (any name, no password needed)
3. Create character
4. Start playing!
```

✅ Everything works  
✅ No installation  
✅ Lives world enabled  
❌ Local save only  

---

### Option 2: Play with Friends (Server Setup) 🌐

**Best for**: Cloud saves, multiple devices, multiplayer leaderboards

#### Windows Setup:

```powershell
# Open PowerShell in story folder
cd "C:\Users\OWNER\Desktop\Gamette\story"

# Install Node.js packages
npm install

# Start server
npm start
```

Then visit: **http://localhost:3000/index.html**

#### Mac/Linux Setup:

```bash
# Open Terminal in story folder
cd ~/Desktop/Gamette/story

# Install Node.js packages
npm install

# Start server
npm start
```

Then visit: **http://localhost:3000/index.html**

✅ All features work  
✅ Cloud saves  
✅ Play from any device  
✅ Global leaderboards  
✅ Password protected  

---

## First Time Playing

### Step 1: Create Account

**Choose ONE:**

**🏠 Local Mode (No Server)**
- Username: Enter anything you want
- Password: Leave blank or skip
- Email: Not needed

**☁️ Server Mode (With Server)**
- Username: Choose unique username
- Email: Your email address
- Password: Create strong password (6+ chars)
- Click "Create Account"

### Step 2: Create Character

1. Enter character name
2. Choose class:
   - 🛡️ **Warrior** - Tank (high HP/Defense)
   - 🔥 **Mage** - DPS (high magic damage)
   - 💨 **Rogue** - Assassin (high speed)
   - ✨ **Cleric** - Support (can heal)
3. Click "Start Adventure"

### Step 3: Explore

You start in **Aldermere Village**.:
- Talk to NPCs (see their age and mood)
- Watch the world clock advance
- Notice events happening
- Fight enemies
- Complete quests

---

## Understanding the Living World

### What You'll See

**🌍 World Info Panel** (above game):
```
🌍 World Time: Jan 15, Year 1 - 🌅 Morning (7:00)
📊 Population: 4 alive, 0 deceased
📰 Active Events: Treasure Discovery
```

### NPCs Now Show:

```
Old Marta
The warm-hearted innkeeper
| Age: 45 | 😊 78% | ❤️ 95%
```

### Events That Happen:

- 📰 **Treasure Found** - New items appear!
- 👶 **Baby Born** - Population grows
- 🦠 **Plague** - NPCs get sick (buy potions!)
- ⚔️ **Invasion** - More enemies (be ready!)
- 💰 **Good Harvest** - Items cost less
- 🎆 **Festival** - NPCs party (safer time)
- ☄️ **Meteors** - Special enemies appear

---

## Managing Your Character

### Saving Game

**Button**: Click "Save" in game menu

**What saves?**
- ✅ Character stats
- ✅ Inventory & equipment
- ✅ Quest progress
- ✅ Explorer progress
- ✅ Friendships with NPCs

**Where?**
- 🏠 Local: Browser storage
- ☁️ Server: Cloud database + browser

### Loading Game

**Automatic**: Game loads last save when you log in

**Multiple Characters**:
1. Log in to account
2. See list of characters
3. Choose one to load

---

## Server Management

### Start Server

```bash
npm start
```

Output will show:
```
╔═══════════════════════════════════════════╗
║  Chronicles of Aetheria Server Running   ║
║  Server: http://localhost:3000           ║
║  Game: http://localhost:3000/index.html  ║
╚═══════════════════════════════════════════╝
```

### Stop Server

Press: `Ctrl + C` in PowerShell/Terminal

### Troubleshoot Server

**Port 3000 already in use?**
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it (Windows)
taskkill /PID xxxxx /F
```

**Server not connecting?**
- Restart server
- Refresh browser
- Check firewall
- Try without server (local mode)

---

## Switching Between Modes

### From Local to Server

1. Start server: `npm start`
2. Visit: `http://localhost:3000/index.html`
3. Register new account
4. Create character
5. Old local saves still work in browser

### From Server to Local

1. Stop server: `Ctrl + C`
2. Open: `index.html` directly
3. Local saves from history will load
4. You can continue with new username

---

## Settings to Know

### Configuration File: `config.js`

```javascript
// Difficulty
difficulty: 'normal', // 'easy', 'normal', 'hard'

// Combat speed
enemyTurnDelay: 800,

// Game economy
startingGold: 100,

// World features
weatherSystem: false,
crafting: false,
guilds: false
```

To change: Edit `config.js` and reload game

---

## Frequently Asked Questions

**Q: Will my progress be lost?**  
A: No! Game saves automatically. You can always load previous progress.

**Q: Can I delete my account?**  
A: Contact support or manually delete from database (advanced).

**Q: How do I transfer characters between devices?**  
A: Use server mode - log in on any device!

**Q: Do I need to restart the server?**  
A: Yes, after editing config files or if it crashes.

**Q: Can I play offline?**  
A: Yes! Local mode works completely offline.

**Q: How many characters per account?**  
A: Unlimited! Create as many as you want.

**Q: Does the world keep evolving when I'm offline?**  
A: Not in this version, but we're working on it!

**Q: Can I see other players?**  
A: Not yet, but multiplayer is planned!

---

## Troubleshooting

### Game Won't Load

```
1. Hard refresh: Ctrl+F5
2. Clear browser cache
3. Try another browser
4. Check console: F12
```

### Can't Login

```
1. Check username/password
2. Restart server (if using)
3. Check database (server mode)
4. Try local mode as fallback
```

### Performance Issues

```
1. Reduce active events (edit world-simulation.js)
2. Use smaller world (fewer NPCs)
3. Close extra browser tabs
4. Restart browser
```

### Save Not Working

```
1. Check browser storage permissions
2. In server mode: verify server running
3. Clear browser cache
4. Try local save first
```

---

## Next Steps

### What to Do First

1. ✅ **Play local** - Get familiar with game
2. ✅ **Watch world events** - See living system
3. ✅ **Notice NPCs** - Track their ages/moods
4. ✅ **Reach level 10** - Get comfortable
5. ✅ **Try server mode** - If you want cloud saves

### Cool Things to Try

- 🎪 Wait for treasure event
- 👶 Watch for NPCs being born
- ⚔️ Prepare for invasions
- 💰 Sell items during good harvest
- 🎆 Enjoy the festival (safest time)

### Challenge Ideas

- 🏆 Beat game before any NPCs die
- 💯 Get to level 99
- 💎 Collect all items
- 👥 Keep 100% NPC population happy
- ⚡ Beat Shadow Lord in 1 hour

---

## File Reference

### What Each File Does

| File | Purpose | Edit? |
|------|---------|-------|
| index.html | Game interface | ❌ No |
| story.js | Game logic | ⚠️ Advanced |
| story.css | Styling | ✅ Yes |
| game-data.js | World data | ✅ Yes |
| world-simulation.js | Living world | ⚠️ Advanced |
| server.js | Backend | ⚠️ Advanced |
| config.js | Settings | ✅ Yes |
| package.json | Dependencies | ❌ No |

---

## Advanced Setup

### Using Git (Optional)

```bash
# Clone repository
git clone <url>

# Install dependencies
npm install

# Start server
npm start
```

### Docker (Optional)

```dockerfile
FROM node:16
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD npm start
```

### Custom Domain (Advanced)

Instead of `localhost:3000`, use your domain:
```
1. Buy domain
2. Point DNS to your computer
3. Setup reverse proxy (nginx)
4. Use HTTPS
5. Share with friends!
```

---

## Need Help?

### Resources

- 📖 **README.md** - Full game documentation
- 📖 **LIVING_WORLD_README.md** - World system guide
- 📖 **QUICKSTART.md** - Beginner guide
- 📖 **CHANGELOG.md** - What's new

### Browser Console

Press `F12` → Console tab:
- See loading messages
- Check for errors
- Debug issues

### Common Errors & Fixes

```
"Cannot read property 'xyz' of undefined"
→ Refresh page, clear cache

"Server connection failed"
→ Start server or use local mode

"Save failed"
→ Check browser storage quota

"Syntax error in game-data.js"
→ Reload, check for typos
```

---

## You're Ready! 🎮

Everything is set up. Here's what to do:

1. **Local Play**: Open `index.html`
2. **Server Play**: Run `npm start`
3. **Happy Gaming**: Create character and explore!

**The world of Aetheria awaits!** 🌍✨

---

*Enjoy the Living World!*  
*Last Updated: April 3, 2026*
