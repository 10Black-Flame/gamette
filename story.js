// Main Game Engine for Chronicles of Aetheria

class Player {
    constructor(name, classType) {
        this.name = name;
        this.classType = classType;
        const classData = GAME_DATA.classes[classType];
        
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 500;
        this.gold = 100;
        
        // ============ PRIMARY STATS ============
        // Strength: determines min/max damage
        this.strength = classData.baseStrength || 10;
        // Stamina: determines HP and Defense
        this.stamina = classData.baseStamina || 10;
        // Intelligence: determines MP and Magical Damage
        this.intelligence = classData.baseIntelligence || 10;
        // Speed: determines Attack Speed and Movement Speed
        this.speed = classData.baseSpeed || 10;
        // Agility: determines Dodge Chance and Evasion
        this.agility = classData.baseAgility || 10;
        // Luck: determines Crit Chance and Rare Drop Rates
        this.luck = classData.baseLuck || 10;
        // Vitality: determines HP Regen (can be same as stamina or separate)
        this.vitality = classData.baseVitality || 8;
        // Wisdom: determines spell effectiveness and mana regen
        this.wisdom = classData.baseWisdom || 8;
        
        // ============ DERIVED STATS ============
        this.maxHP = Math.floor(100 + this.stamina * 8 + this.vitality * 4);
        this.hp = this.maxHP;
        this.maxMP = Math.floor(50 + this.intelligence * 6 + this.wisdom * 3);
        this.mp = this.maxMP;
        
        // Legacy stats for compatibility
        this.attack = classData.baseAttack || Math.floor(10 + this.strength * 1.2);
        this.defense = classData.baseDefense || Math.floor(5 + this.stamina * 0.8 + this.agility * 0.3);
        
        this.inventory = [];
        this.equipment = {};
        this.quests = {};
        this.currentLocation = 'village';
        this.inCombat = false;
        this.currentEnemy = null;
        
        // New tracking variables for achievements and systems
        this.achievements = {};
        this.enemiesKilled = 0;
        this.damageTakenInCombat = 0;
        this.spellsCast = 0;
        this.itemsCrafted = 0;
        this.locationsVisited = new Set(['village']);
        this.treasuresFound = 0;
        this.guild = { joined: false, guildId: null, guildLevel: 1, joinedAt: null };
        this.pet = { caught: false, petType: null, level: 1, exp: 0 };
        this.factionRep = {};
        this.prestige = 0;
        this.title = null;
        this.skillPoints = 0;
        this.skillTree = {};
        this.unlockedClasses = {};
        this.booksRead = [];
        this.activeEnchantments = {};
    }

    addItem(itemId, quantity = 1) {
        const existingItem = this.inventory.find(item => item.id === itemId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.inventory.push({ id: itemId, quantity: quantity });
        }
    }

    removeItem(itemId, quantity = 1) {
        const item = this.inventory.find(item => item.id === itemId);
        if (item) {
            item.quantity -= quantity;
            if (item.quantity <= 0) {
                this.inventory = this.inventory.filter(item => item.id !== itemId);
            }
        }
    }

    gainExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expToLevel) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.expToLevel;
        this.expToLevel = Math.max(200, Math.floor(this.expToLevel * 1.12 + this.level * 8));
        this.skillPoints += 1;
        
        // Stat increases per level (can be customized per class)
        this.strength += 1;
        this.stamina += 1;
        this.intelligence += 0.8;
        this.speed += 0.7;
        this.agility += 0.8;
        this.luck += 0.4;
        this.vitality += 0.6;
        this.wisdom += 0.7;
        
        // Recalculate derived stats
        this.maxHP = Math.floor(100 + this.stamina * 8 + this.vitality * 4);
        this.hp = this.maxHP;
        this.maxMP = Math.floor(50 + this.intelligence * 6 + this.wisdom * 3);
        this.mp = this.maxMP;
        this.attack = Math.floor(10 + this.strength * 1.2);
        this.defense = Math.floor(5 + this.stamina * 0.8 + this.agility * 0.3);
        
        addGameLog(`Level Up! You are now level ${this.level}!`, 'success');
        playLevelUpSound();
        triggerLevelUpAnimation();
        playLevelUpConfetti();
        
        // Check level-based achievements
        if (this.level >= 5) unlockAchievement('risingHero');
        if (this.level >= 10) unlockAchievement('level_10');
        if (this.level >= 50) unlockAchievement('level_50');
        if (this.level >= 15) this.checkHiddenClassUnlock();
        if (this.level >= 20 && this.prestige < 1) {
            addGameLog('You have reached the pinnacle of power! Prestige is now available.', 'success');
        }
        
        // Apply pet bonuses after level up
        this.applyPetBonuses();
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHP);
    }

    restoreMana(amount) {
        this.mp = Math.min(this.mp + amount, this.maxMP);
    }

    // Get stat bonuses from equipped items
    getStatBonus(stat) {
        let bonus = 0;
        if (!this.equipment) return bonus;
        Object.values(this.equipment).forEach(itemId => {
            const item = GAME_DATA.items[itemId];
            if (!item) return;
            if (item.stats && item.stats[stat]) bonus += item.stats[stat];
        });
        return bonus;
    }

    getEquipmentBonus(stat) {
        return this.getStatBonus(stat);
    }

    // Get final stats with equipment
    getFinalStat(baseStat, statName) {
        return baseStat + this.getStatBonus(statName);
    }

    // Damage calculation based on Strength
    getMinDamage() {
        const baseMin = Math.floor(5 + this.getFinalStat(this.strength, 'strength') * 0.8);
        const equipBonus = this.getStatBonus('attack') || 0;
        return Math.floor(baseMin + equipBonus * 0.5);
    }

    getMaxDamage() {
        const baseMax = Math.floor(12 + this.getFinalStat(this.strength, 'strength') * 1.5);
        const equipBonus = this.getStatBonus('attack') || 0;
        return Math.floor(baseMax + equipBonus * 0.8);
    }

    // Attack speed based on Speed stat
    getAttackSpeed() {
        const finalSpeed = this.getFinalStat(this.speed, 'speed');
        return Math.max(0.5, 1 + (finalSpeed - 10) * 0.05); // 1.0 baseline at 10 speed
    }

    // Crit chance based on Agility and Luck
    getCritChance() {
        const finalAgility = this.getFinalStat(this.agility, 'agility');
        const finalLuck = this.getFinalStat(this.luck, 'luck');
        return Math.min(0.50, 0.05 + (finalAgility - 10) * 0.015 + (finalLuck - 10) * 0.010);
    }

    // Crit damage multiplier
    getCritDamage() {
        return 1.5 + this.getFinalStat(this.strength, 'strength') * 0.01; // +1.5x to 2x+ at high str
    }

    // Dodge chance based on Agility and Luck
    getDodgeChance() {
        const finalAgility = this.getFinalStat(this.agility, 'agility');
        const finalLuck = this.getFinalStat(this.luck, 'luck');
        return Math.min(0.40, 0.02 + (finalAgility - 10) * 0.02 + (finalLuck - 10) * 0.008);
    }

    // Defense based on Stamina and Agility
    getDefensePower() {
        const baseDefense = Math.floor(5 + this.getFinalStat(this.stamina, 'stamina') * 0.8 + this.getFinalStat(this.agility, 'agility') * 0.3);
        return baseDefense + (this.getStatBonus('defense') || 0);
    }

    // Magical damage based on Intelligence and Wisdom
    getMagicalDamage() {
        const finalIntel = this.getFinalStat(this.intelligence, 'intelligence');
        const finalWisdom = this.getFinalStat(this.wisdom, 'wisdom');
        return Math.floor(8 + finalIntel * 1.2 + finalWisdom * 0.6);
    }

    // MP regen based on Wisdom and Intelligence
    getMPRegenRate() {
        const finalWisdom = this.getFinalStat(this.wisdom, 'wisdom');
        const finalIntel = this.getFinalStat(this.intelligence, 'intelligence');
        return Math.max(1, Math.floor(1 + (finalWisdom - 10) * 0.15 + (finalIntel - 10) * 0.1));
    }

    // HP regen based on Vitality and Stamina
    getHPRegenRate() {
        const finalVitality = this.getFinalStat(this.vitality, 'vitality');
        const finalStamina = this.getFinalStat(this.stamina, 'stamina');
        return Math.max(0.5, Math.floor(2 + (finalVitality - 8) * 0.2 + (finalStamina - 10) * 0.1));
    }

    // Luck affects rare drop rates
    getRareDropBonus() {
        const finalLuck = this.getFinalStat(this.luck, 'luck');
        return 1 + Math.max(0, (finalLuck - 10) * 0.02); // +2% per luck above 10
    }

    // Legacy method for compatibility
    getAttackPower() {
        return this.attack + (this.getStatBonus('attack') || 0);
    }

    takeDamage(damage) {
        const defensePower = this.getDefensePower();
        const actualDamage = Math.max(damage - Math.floor(defensePower * 0.6), 1);
        this.hp -= actualDamage;
        this.damageTakenInCombat += actualDamage;
        return actualDamage;
    }

    isDead() {
        return this.hp <= 0;
    }

    applyPetBonuses() {
        if (!this.pet || !this.pet.caught) return;
        
        const pet = GAME_DATA.pets[this.pet.petType];
        if (pet.bonuses) {
            this.maxHP += pet.bonuses.hp || 0;
            this.maxMP += pet.bonuses.mp || 0;
            this.attack += pet.bonuses.attack || 0;
            this.defense += pet.bonuses.defense || 0;
            this.speed += pet.bonuses.speed || 0;
        }
    }

    applyGuildPerks() {
        if (!this.guild || !this.guild.joined) return;
        
        const guild = GAME_DATA.guilds[this.guild.guildId];
        const perks = GAME_DATA.guildPerks[this.guild.guildLevel];
        if (perks) {
            this.maxHP += perks.hpBonus || 0;
            this.maxMP += perks.mpBonus || 0;
            this.attack += perks.attackBonus || 0;
            this.defense += perks.defenseBonus || 0;
            this.speed += perks.speedBonus || 0;
            this.gold += perks.goldBonus || 0;
        }
    }

    checkHiddenClassUnlock() {
        const hiddenClasses = GAME_DATA.hiddenClasses;
        
        if (this.classType === 'warrior' && this.level >= 10 && !this.unlockedClasses.paladin) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.paladin = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Paladin! You can now switch to this class.', 'success');
        }
        
        if (this.enemiesKilled >= 50 && !this.unlockedClasses.necromancer) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.necromancer = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Necromancer! You can now switch to this class.', 'success');
        }
        
        if (this.locationsVisited.has('forest') && !this.unlockedClasses.druid) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.druid = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Druid! You can now switch to this class.', 'success');
        }
        
        if (this.damageTakenInCombat === 0 && this.enemiesKilled >= 20 && !this.unlockedClasses.shadowAssassin) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.shadowAssassin = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Shadow Assassin! You can now switch to this class.', 'success');
        }
        
        if (this.level >= 15 && !this.unlockedClasses.demonHunter) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.demonHunter = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Demon Hunter! You can now switch to this class.', 'success');
        }
        
        if (worldTime && worldTime.totalDays >= 100 && !this.unlockedClasses.timeMage) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.timeMage = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Time Mage! You can now switch to this class.', 'success');
        }
        
        if (this.spellsCast >= 100 && !this.unlockedClasses.warlock) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.warlock = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Warlock! You can now switch to this class.', 'success');
        }
    }
}

// ============ CLASS MANAGEMENT ============
function changeClass(newClassType) {
    if (!GAME_DATA.classes[newClassType] && !GAME_DATA.hiddenClasses[newClassType]) {
        addGameLog('Invalid class type!', 'error');
        return;
    }
    
    const oldClass = gameState.player.classType;
    gameState.player.classType = newClassType;
    
    // Update stats based on new class
    const classData = GAME_DATA.classes[newClassType] || GAME_DATA.hiddenClasses[newClassType];
    gameState.player.maxHP = classData.baseHP + (gameState.player.level - 1) * 10;
    gameState.player.hp = Math.min(gameState.player.hp, gameState.player.maxHP);
    gameState.player.maxMP = classData.baseMP + (gameState.player.level - 1) * 5;
    gameState.player.mp = Math.min(gameState.player.mp, gameState.player.maxMP);
    gameState.player.attack = classData.baseAttack + (gameState.player.level - 1) * 2;
    gameState.player.defense = classData.baseDefense + (gameState.player.level - 1);
    gameState.player.speed = classData.baseSpeed;
    
    // Reapply bonuses
    gameState.player.applyPetBonuses();
    gameState.player.applyGuildPerks();
    
    addGameLog(`Class changed from ${GAME_DATA.classes[oldClass].name} to ${classData.name}!`, 'success');
    updateUI();
}

function prestigePlayer() {
    if (gameState.player.level < 20) {
        addGameLog('You must reach level 20 to prestige!', 'error');
        return;
    }
    
    gameState.player.prestige++;
    gameState.player.level = 1;
    gameState.player.exp = 0;
    gameState.player.expToLevel = 500;
    gameState.player.gold = 100 + (gameState.player.prestige * 1000);
    
    // Keep some bonuses from prestige
    const prestigeBonus = gameState.player.prestige;
    gameState.player.maxHP = 100 + (prestigeBonus * 20);
    gameState.player.hp = gameState.player.maxHP;
    gameState.player.maxMP = 50 + (prestigeBonus * 10);
    gameState.player.mp = gameState.player.maxMP;
    gameState.player.attack = 10 + (prestigeBonus * 5);
    gameState.player.defense = 5 + (prestigeBonus * 3);
    
    addGameLog(`You have prestiged! Level reset, but you gained permanent bonuses! Prestige level: ${gameState.player.prestige}`, 'success');
    updateUI();
}

// Game State
let gameState = {
    player: null,
    gameStarted: false,
    userId: null,
    username: null,
    playerId: null,
    pendingCombatRewards: null,
    isServerMode: false // Set to true if server is running
};

// Regional Mob Spawning System
let regionState = {
    forest: { kills: 0, spawnedMobs: [] },
    cave: { kills: 0, spawnedMobs: [] },
    mountains: { kills: 0, spawnedMobs: [] },
    tower: { kills: 0, spawnedMobs: [] },
    castle: { kills: 0, spawnedMobs: [] },
    dungeon: { kills: 0, spawnedMobs: [] }
};

function initializeRegionalState() {
    Object.keys(regionState).forEach(region => {
        regionState[region].kills = 0;
        regionState[region].spawnedMobs = [];
    });
}

function getRegionSpawnTier(regionId, kills) {
    const pool = GAME_DATA.regionMobPools[regionId];
    if (!pool) return 'common';
    const { elite, miniBoss, boss } = pool.killThresholds;
    if (kills >= boss) return 'boss';
    if (kills >= miniBoss) return 'miniBoss';
    if (kills >= elite) return 'elite';
    return 'common';
}

function spawnNewMob(regionId) {
    const region = GAME_DATA.regionMobPools[regionId];
    if (!region) return null;
    
    const state = regionState[regionId];
    const tier = getRegionSpawnTier(regionId, state.kills);
    
    let mobId, mobList;
    if (tier === 'boss') {
        mobId = region.regionalBoss;
    } else if (tier === 'miniBoss') {
        mobId = region.miniBoss;
    } else if (tier === 'elite') {
        mobList = region.eliteMobs;
        mobId = mobList[Math.floor(Math.random() * mobList.length)];
    } else {
        mobList = region.commonMobs;
        mobId = mobList[Math.floor(Math.random() * mobList.length)];
    }
    
    let mob = null;
    if (tier === 'boss') {
        mob = JSON.parse(JSON.stringify(GAME_DATA.regionalBosses[mobId]));
    } else if (tier === 'miniBoss') {
        mob = JSON.parse(JSON.stringify(GAME_DATA.miniBosses[mobId]));
    } else if (tier === 'elite') {
        const variant = GAME_DATA.eliteMobVariants[mobId];
        const baseMob = GAME_DATA.enemies[variant.baseId];
        mob = JSON.parse(JSON.stringify(baseMob));
        mob.id = mobId;
        mob.name = variant.name;
        mob.level = Math.ceil(mob.level * 1.2 + Math.random() * 2);
        mob.hp = Math.ceil(mob.hp * variant.statMultiplier);
        mob.mp = Math.ceil(mob.mp * variant.statMultiplier);
        mob.attack = Math.ceil(mob.attack * variant.statMultiplier);
        mob.defense = Math.ceil(mob.defense * variant.statMultiplier);
        mob.exp = Math.ceil(mob.exp * variant.expMultiplier);
        mob.gold = Math.ceil(mob.gold * variant.goldMultiplier);
        mob.elite = true;
    } else {
        mob = JSON.parse(JSON.stringify(GAME_DATA.enemies[mobId]));
    }
    
    return mob;
}

// UI Elements
const screens = {
    login: document.getElementById('login-screen'),
    characterCreation: document.getElementById('character-creation-screen'),
    mainGame: document.getElementById('main-game-screen'),
    inventory: document.getElementById('inventory-screen'),
    quests: document.getElementById('quests-screen'),
    map: document.getElementById('map-screen'),
    bookReader: document.getElementById('book-reader-screen'),
    shop: document.getElementById('shop-screen'),
    gameOver: document.getElementById('game-over-screen'),
    guild: document.getElementById('guild-screen'),
    crafting: document.getElementById('crafting-screen'),
    achievements: document.getElementById('achievements-screen'),
    pet: document.getElementById('pet-screen'),
    enchantments: document.getElementById('enchantments-screen'),
    classes: document.getElementById('classes-screen'),
    bookReader: document.getElementById('book-reader-screen')
};

const BOOK_CONTENT = {
    'spell_book': 'A manual of potent spells. It contains ancient arcane instructions, a fireball incantation, and subtle warnings about energy balance.',
    'ancient_tome': 'A thick, leather-bound tome of history. It explains the founding of Aetheria, the rise of the Shadow Kings, and the secret forgemasters of the Sky Tower.',
    'spell_scroll': 'A scroll covered in swirling runes. You can decode it to learn a new spell or study it for deep magical insights.',
    'ancient_scroll': 'A weathered scroll describing forbidden rituals, hidden caches, and a map of the ruined castle’s underground passages.'
};

// Sound Effects System
function playSound(frequency = 440, duration = 200, type = 'sine') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        // Fallback: no sound if Web Audio API not supported
    }
}

function playClickSound() { playSound(800, 100, 'square'); }
function playSuccessSound() { playSound(600, 300, 'sine'); }
function playErrorSound() { playSound(200, 500, 'sawtooth'); }
function playLevelUpSound() { playSound(1000, 800, 'triangle'); }

function triggerLevelUpAnimation() {
    const playerName = document.getElementById('player-name');
    if (playerName) {
        playerName.classList.remove('level-up-indicator');
        void playerName.offsetWidth;
        playerName.classList.add('level-up-indicator');
    }
}

function playLevelUpConfetti() {
    if (gameState.player) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const xp = gameState.player.level * 10;
                createFloatingXpText(`+${xp} XP`, window.innerWidth / 2, 100);
            }, i * 100);
        }
    }
}

function createFloatingXpText(text, x, y) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-xp exp-text';
    floatingText.textContent = text;
    floatingText.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
    floatingText.style.top = y + 'px';
    document.body.appendChild(floatingText);
    setTimeout(() => floatingText.remove(), 1500);
}

// Content Pack System for Modular Expansions
let loadedContentPacks = new Set();

async function loadContentPack(packName) {
    if (loadedContentPacks.has(packName)) {
        console.log(`Content pack ${packName} already loaded`);
        return true;
    }

    try {
        const response = await fetch(`content-packs/${packName}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load content pack: ${packName}`);
        }
        
        const packData = await response.json();
        
        // Merge content pack data into GAME_DATA
        mergeContentPack(packData);
        
        loadedContentPacks.add(packName);
        console.log(`Successfully loaded content pack: ${packName}`);
        addGameLog(`Content pack loaded: ${packData.name || packName}`, 'success');
        return true;
    } catch (error) {
        console.error(`Error loading content pack ${packName}:`, error);
        addGameLog(`Failed to load content pack: ${packName}`, 'error');
        return false;
    }
}

function mergeContentPack(packData) {
    // Merge locations
    if (packData.locations) {
        Object.assign(GAME_DATA.locations, packData.locations);
    }
    
    // Merge items
    if (packData.items) {
        Object.assign(GAME_DATA.items, packData.items);
    }
    
    // Merge quests
    if (packData.quests) {
        Object.assign(GAME_DATA.quests, packData.quests);
    }
    
    // Merge NPCs
    if (packData.npcs) {
        Object.assign(GAME_DATA.npcs, packData.npcs);
    }
    
    // Merge enemies
    if (packData.enemies) {
        Object.assign(GAME_DATA.enemies, packData.enemies);
    }
    
    // Merge book content
    if (packData.bookContent) {
        Object.assign(BOOK_CONTENT, packData.bookContent);
    }
    
    // Merge classes
    if (packData.classes) {
        Object.assign(GAME_DATA.classes, packData.classes);
    }
    
    // Merge guilds
    if (packData.guilds) {
        GAME_DATA.guilds.push(...packData.guilds);
    }
    
    // Merge events
    if (packData.events) {
        GAME_DATA.events.push(...packData.events);
    }
}

async function loadDefaultContentPacks() {
    const defaultPacks = ['base_game', 'expansion_dungeons', 'expansion_magic'];
    
    for (const pack of defaultPacks) {
        await loadContentPack(pack);
    }
}

// Accessibility: Keyboard Navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // ESC key to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-screen:not(.hidden)');
            if (activeModal) {
                const closeBtn = activeModal.querySelector('button[id*="close"]');
                if (closeBtn) closeBtn.click();
            }
        }
        
        // Tab navigation for main menu buttons
        if (e.key === 'Tab') {
            const mainMenuBtns = document.querySelectorAll('#game-menu button');
            const focused = document.activeElement;
            if (!Array.from(mainMenuBtns).includes(focused)) {
                mainMenuBtns[0].focus();
                e.preventDefault();
            }
        }
        
        // Number keys for quick actions in combat
        if (gameState.player && gameState.player.inCombat) {
            const combatBtns = ['attack-btn', 'spell-btn', 'defend-btn', 'flee-btn'];
            const num = parseInt(e.key);
            if (num >= 1 && num <= 4) {
                document.getElementById(combatBtns[num - 1]).click();
                e.preventDefault();
            }
        }
    });
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Load content packs first
    await loadDefaultContentPacks();
    
    initializeWorld(); // Initialize world simulation
    setupAuthentication();
    setupCharacterCreation();
    setupMainGameControls();
    setupKeyboardNavigation(); // Add keyboard navigation
    checkForServerConnection();

    // Restore persistent session if available
    if (loadSessionState()) {
        if (gameState.gameStarted && gameState.player) {
            showScreen('mainGame');
            updateUI();
            loadLocation(gameState.player.currentLocation || 'village');
        } else {
            showScreen('characterCreation');
        }
    } else {
        showScreen('login');
    }

    // Start world simulation tick
    setInterval(simulateWorldTick, 100);
});

// ============ AUTHENTICATION ============
function setupAuthentication() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const toggleFormBtn = document.getElementById('toggle-form-btn');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const requestResetBtn = document.getElementById('request-reset-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const backToForgotBtn = document.getElementById('back-to-forgot-btn');

    loginBtn.addEventListener('click', handleLogin);
    registerBtn.addEventListener('click', handleRegister);
    toggleFormBtn.addEventListener('click', () => {
        document.getElementById('login-form').style.display === 'none' ?
            showLoginForm() : showRegisterForm();
    });
    forgotPasswordBtn.addEventListener('click', showForgotPasswordForm);
    requestResetBtn.addEventListener('click', handleForgotPassword);
    resetPasswordBtn.addEventListener('click', handleResetPassword);
    backToLoginBtn.addEventListener('click', showLoginForm);
    backToForgotBtn.addEventListener('click', showForgotPasswordForm);
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'none';
    document.getElementById('toggle-form-btn').textContent = 'Create New Account';
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('forgot-password-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'none';
    document.getElementById('toggle-form-btn').textContent = 'Back to Login';
}

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (!username || !password) {
        showError(errorEl, 'Please fill in all fields');
        return;
    }

    // Try server first if available
    if (gameState.isServerMode) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.success) {
                gameState.userId = data.userId;
                gameState.username = data.username;
                saveSessionState();
                if (!promptLoadSavedGame()) {
                    showScreen('characterCreation');
                }
                errorEl.classList.remove('show');
            } else {
                showError(errorEl, data.error);
            }
        } catch (err) {
            showError(errorEl, 'Server connection failed. Using local mode.');
            // Fallback to local mode
            gameState.username = username;
            gameState.userId = 'local_' + Date.now();
            saveSessionState();
            if (!promptLoadSavedGame()) {
                showScreen('characterCreation');
            }
        }
    } else {
        // Local mode - just set username
        gameState.username = username;
        gameState.userId = 'local_' + Date.now();
        saveSessionState();
        if (!promptLoadSavedGame()) {
            showScreen('characterCreation');
        }
    }
}

function promptLoadSavedGame() {
    const save = getSavedGameForCurrentUser();
    if (!save) return false;

    const load = confirm(`Saved game found for ${save.player.name}. Load it now?`);
    if (load) {
        loadGame(save);
        return true;
    }
    return false;
}

async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const errorEl = document.getElementById('register-error');

    if (!username || !password || !confirmPassword) {
        showError(errorEl, 'Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        showError(errorEl, 'Passwords do not match');
        return;
    }

    if (gameState.isServerMode) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, confirmPassword })
            });

            const data = await response.json();
            if (data.success) {
                showError(errorEl, 'Account created! Please log in.', true);
                setTimeout(() => showLoginForm(), 1500);
            } else {
                showError(errorEl, data.error);
            }
        } catch (err) {
            showError(errorEl, 'Server connection failed');
        }
    } else {
        // In local mode, just create account
        gameState.username = username;
        gameState.userId = 'local_' + Date.now();
        showScreen('characterCreation');
    }
}

function showError(element, message, success = false) {
    element.textContent = message;
    element.classList.add('show');
    element.style.color = success ? '#00ff00' : '#ff6b6b';
}

function logout() {
    if (!confirm('Are you sure you want to logout? Any unsaved progress will be lost.')) {
        return;
    }
    
    clearSessionState();
    gameState.player = null;
    gameState.gameStarted = false;
    gameState.userId = null;
    gameState.username = null;
    gameState.playerId = null;

    // Reset UI elements
    showScreen('login');
    showLoginForm();
}

function showForgotPasswordForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'block';
    document.getElementById('reset-password-form').style.display = 'none';
    document.getElementById('reset-token-display').style.display = 'none';
    document.getElementById('forgot-username').value = '';
    document.getElementById('forgot-email').value = '';
    document.getElementById('forgot-error').textContent = '';
}

function showResetPasswordForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'none';
    document.getElementById('reset-password-form').style.display = 'block';
    document.getElementById('reset-token').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    document.getElementById('reset-error').textContent = '';
}

async function handleForgotPassword() {
    const username = document.getElementById('forgot-username').value.trim();
    const email = document.getElementById('forgot-email').value.trim();
    const errorEl = document.getElementById('forgot-error');

    if (!username && !email) {
        showError(errorEl, 'Please enter either username or email');
        return;
    }

    if (gameState.isServerMode) {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email })
            });

            const data = await response.json();
            if (data.success) {
                if (data.resetToken) {
                    // Demo mode - show the token
                    document.getElementById('reset-token-text').textContent = data.resetToken;
                    document.getElementById('reset-token-display').style.display = 'block';
                }
                showError(errorEl, data.message, true);
                // Show reset password form after successful token generation
                setTimeout(() => showResetPasswordForm(), 2000);
            } else {
                showError(errorEl, data.error);
            }
        } catch (err) {
            showError(errorEl, 'Server connection failed');
        }
    } else {
        showError(errorEl, 'Password reset requires server mode');
    }
}

async function handleResetPassword() {
    const resetToken = document.getElementById('reset-token').value.trim();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    const errorEl = document.getElementById('reset-error');

    if (!resetToken || !newPassword || !confirmPassword) {
        showError(errorEl, 'Please fill in all fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        showError(errorEl, 'Passwords do not match');
        return;
    }

    if (newPassword.length < 6) {
        showError(errorEl, 'Password must be at least 6 characters');
        return;
    }

    if (gameState.isServerMode) {
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword, confirmPassword })
            });

            const data = await response.json();
            if (data.success) {
                showError(errorEl, data.message, true);
                // Return to login form after successful reset
                setTimeout(() => showLoginForm(), 2000);
            } else {
                showError(errorEl, data.error);
            }
        } catch (err) {
            showError(errorEl, 'Server connection failed');
        }
    } else {
        showError(errorEl, 'Password reset requires server mode');
    }
}

async function checkForServerConnection() {
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            gameState.isServerMode = true;
            console.log('✅ Connected to game server');
        }
    } catch (err) {
        gameState.isServerMode = false;
        console.log('⚠️ Server not available - running in local mode');
    }
}

function saveSessionState() {
    if (!gameState.userId || !gameState.username) return;

    const sessionData = {
        userId: gameState.userId,
        username: gameState.username,
        playerId: gameState.playerId,
        gameStarted: gameState.gameStarted,
        player: null,
        pendingCombatRewards: gameState.pendingCombatRewards || null
    };

    if (gameState.player) {
        const playerCopy = JSON.parse(JSON.stringify(gameState.player));
        playerCopy.locationsVisited = Array.from(gameState.player.locationsVisited || []);
        sessionData.player = playerCopy;
    }

    localStorage.setItem('aetheriaSession', JSON.stringify(sessionData));
}

function loadSessionState() {
    const raw = localStorage.getItem('aetheriaSession');
    if (!raw) return false;

    try {
        const data = JSON.parse(raw);
        if (data.userId && data.username) {
            gameState.userId = data.userId;
            gameState.username = data.username;
            gameState.playerId = data.playerId;
            gameState.gameStarted = data.gameStarted || false;

            if (data.player) {
                const saved = data.player;
                const player = new Player(saved.name, saved.classType);
                Object.assign(player, saved);
                player.locationsVisited = new Set(saved.locationsVisited || [player.currentLocation || 'village']);
                gameState.player = player;
            }
            if (data.pendingCombatRewards) {
                gameState.pendingCombatRewards = data.pendingCombatRewards;
            }

            return true;
        }
    } catch (err) {
        console.error('Failed to load session state', err);
    }

    return false;
}

function clearSessionState() {
    localStorage.removeItem('aetheriaSession');
}

// ============ CHARACTER CREATION ============
function setupCharacterCreation() {
    const classOptions = document.querySelectorAll('.class-option');
    let selectedClass = 'warrior';

    classOptions.forEach(option => {
        option.addEventListener('click', () => {
            classOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedClass = option.dataset.class;
        });
    });

    document.getElementById('start-game-btn').addEventListener('click', () => {
        const name = document.getElementById('character-name').value.trim();
        if (name === '') {
            alert('Please enter a character name!');
            return;
        }
        startGame(name, selectedClass);
    });
}

function startGame(name, classType) {
    gameState.player = new Player(name, classType);
    gameState.gameStarted = true;
    gameState.playerId = `${gameState.userId}_${Date.now()}`;
    
    // Initialize regional mob system
    initializeRegionalState();
    
    // Add starting items
    gameState.player.addItem('herb', 2);
    gameState.player.addItem('mushroom', 1);

    gameState.gameStarted = true;
    saveSessionState();

    showScreen('mainGame');
    updateUI();
    loadLocation('village');
}

// ============ MAIN GAME CONTROLS ============
function setupMainGameControls() {
    // Menu Buttons
    document.getElementById('inventory-btn').addEventListener('click', () => showScreen('inventory'));
    document.getElementById('quests-btn').addEventListener('click', () => showScreen('quests'));
    document.getElementById('map-btn').addEventListener('click', () => showScreen('map'));
    document.getElementById('guild-btn').addEventListener('click', () => showScreen('guild'));
    document.getElementById('crafting-btn').addEventListener('click', () => showScreen('crafting'));
    document.getElementById('achievements-btn').addEventListener('click', () => showScreen('achievements'));
    const sortAvailableToggle = document.getElementById('sort-available-toggle');
    if (sortAvailableToggle) {
        sortAvailableToggle.addEventListener('change', (event) => {
            if (!gameState.player.crafting) gameState.player.crafting = { selectedRecipeId: null, sortByAvailable: false };
            gameState.player.crafting.sortByAvailable = event.target.checked;
            updateCraftingScreen();
        });
    }
    document.getElementById('pet-btn').addEventListener('click', () => showScreen('pet'));
    document.getElementById('enchantments-btn').addEventListener('click', () => showScreen('enchantments'));
    document.getElementById('classes-btn').addEventListener('click', () => showScreen('classes'));
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Close Buttons
    document.getElementById('stats-btn').addEventListener('click', () => {
        updateStatsScreen();
        showScreen('stats');
    });
    document.getElementById('close-stats-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-inventory-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-quests-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-quest-board-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('open-quest-board-btn').addEventListener('click', openQuestBoard);
    document.getElementById('close-map-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('scan-map-btn').addEventListener('click', () => scanForClues('map'));
    document.getElementById('close-guild-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-crafting-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('craft-btn').addEventListener('click', () => {
        const recipeId = document.getElementById('craft-btn').dataset.recipeId;
        if (recipeId) craftItem(recipeId);
    });
    document.getElementById('close-achievements-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-pet-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-enchantments-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-classes-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-shop-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-book-reader-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('scan-book-btn').addEventListener('click', () => {
        const currentBook = document.getElementById('book-reader-title').textContent;
        // Find book ID from name
        const bookEntry = Object.entries(GAME_DATA.items).find(([id, item]) => item.name === currentBook && item.type === 'book');
        if (bookEntry) {
            scanForClues('book', bookEntry[0]);
        }
    });
    document.getElementById('main-menu-btn').addEventListener('click', resetGame);

    // Guild Buttons
    document.getElementById('create-guild-btn').addEventListener('click', showCreateGuildForm);
    document.getElementById('browse-guilds-btn').addEventListener('click', showGuildList);
    document.getElementById('confirm-create-guild-btn').addEventListener('click', createGuild);
    document.getElementById('cancel-create-guild-btn').addEventListener('click', updateGuildScreen);
    document.getElementById('join-guild-btn').addEventListener('click', () => {
        // Get guild ID from the current guild details section
        const guildNameElement = document.getElementById('guild-details-name');
        if (guildNameElement && guildNameElement.dataset.guildId) {
            joinGuild(guildNameElement.dataset.guildId);
        }
    });
    document.getElementById('leave-guild-btn').addEventListener('click', leaveGuild);
    document.getElementById('guild-scouting-btn').addEventListener('click', showScoutingMissions);
    document.getElementById('disband-guild-btn').addEventListener('click', () => {
        // Get guild ID from the current guild details section
        const guildNameElement = document.getElementById('guild-details-name');
        if (guildNameElement && guildNameElement.dataset.guildId) {
            disbandGuild(guildNameElement.dataset.guildId);
        }
    });
    document.getElementById('back-to-guild-btn').addEventListener('click', () => {
        fetch(`/api/player/${gameState.playerId}/guild`)
            .then(response => response.json())
            .then(playerGuild => {
                if (playerGuild) {
                    showGuildDetails(playerGuild.guild_id);
                } else {
                    updateGuildScreen();
                }
            });
    });

    // Combat Buttons
    document.getElementById('attack-btn').addEventListener('click', combatAttack);
    document.getElementById('spell-btn').addEventListener('click', combatCastSpell);
    document.getElementById('defend-btn').addEventListener('click', combatDefend);
    document.getElementById('flee-btn').addEventListener('click', combatFlee);
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    if (claimRewardBtn) claimRewardBtn.addEventListener('click', claimCombatRewards);
    const dismissRewardBtn = document.getElementById('dismiss-reward-btn');
    if (dismissRewardBtn) dismissRewardBtn.addEventListener('click', hideCombatVictoryModal);
    const claimPendingRewardBtn = document.getElementById('claim-pending-reward-btn');
    if (claimPendingRewardBtn) claimPendingRewardBtn.addEventListener('click', claimCombatRewards);
}

// ============ SCREEN MANAGEMENT ============
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        if (screen.classList.contains('modal-screen')) {
            screen.classList.add('hidden');
        }
    });

    const targetScreen = screens[screenName];
    if (!targetScreen) return;

    targetScreen.classList.add('active');
    if (targetScreen.classList.contains('modal-screen')) {
        targetScreen.classList.remove('hidden');
    }

    if (screenName === 'inventory') updateInventoryScreen();
    if (screenName === 'quests') updateQuestsScreen();
    if (screenName === 'map') updateMapScreen();
    if (screenName === 'guild') updateGuildScreen();
    if (screenName === 'crafting') updateCraftingScreen();
    if (screenName === 'achievements') updateAchievementsScreen();
    if (screenName === 'pet') updatePetScreen();
    if (screenName === 'enchantments') updateEnchantmentsScreen();
    if (screenName === 'classes') updateClassesScreen();
    if (screenName === 'bookReader') {
        // nothing additional for book reader
    }
}

function checkExpiredEnchantments() {
    if (!gameState.player.activeEnchantments) return;
    
    const now = Date.now();
    let expired = false;
    
    Object.keys(gameState.player.activeEnchantments).forEach(enchantId => {
        if (gameState.player.activeEnchantments[enchantId].expiresAt <= now) {
            delete gameState.player.activeEnchantments[enchantId];
            expired = true;
        }
    });
    
    if (expired) {
        addGameLog('Some enchantments have expired.', 'info');
    }
}

function updateUI() {
    // Check for expired enchantments
    checkExpiredEnchantments();
    
    document.getElementById('player-name').textContent = gameState.player.name;
    document.getElementById('player-stats').textContent = 
        `Level ${gameState.player.level} ${GAME_DATA.classes[gameState.player.classType].name} | HP: ${gameState.player.hp}/${gameState.player.maxHP} | MP: ${gameState.player.mp}/${gameState.player.maxMP} | Gold: ${gameState.player.gold}`;
    
    // Update world info
    updateWorldInfo();
    updatePlayerExpUI();
    updatePendingRewardNotice();

    // Persist state to localStorage
    saveSessionState();
}

function updateWorldInfo() {
    if (worldTime) {
        document.getElementById('world-time-info').textContent = worldTime.toString();
    }
    if (worldSimulation) {
        const stats = worldSimulation.populationStats;
        document.getElementById('population-info').textContent = `${stats.alive} alive, ${stats.dead} deceased`;
        document.getElementById('events-info').textContent = worldSimulation.activeEvents.length > 0 ? 
            `${worldSimulation.activeEvents.length} event(s): ${worldSimulation.activeEvents.map(e => e.name).join(', ')}` :
            'None';
    }
}

function updatePlayerExpUI() {
    const player = gameState.player;
    if (!player) return;
    const expText = document.getElementById('exp-text');
    const expFill = document.getElementById('exp-bar-fill');
    if (expText) {
        expText.textContent = `EXP: ${player.exp}/${player.expToLevel}`;
    }
    if (expFill) {
        const fillPercent = player.expToLevel > 0 ? Math.min(100, Math.floor((player.exp / player.expToLevel) * 100)) : 0;
        expFill.style.width = `${fillPercent}%`;
    }
}

function updatePendingRewardNotice() {
    const notice = document.getElementById('reward-notice');
    const noticeText = document.getElementById('pending-reward-text');
    if (!notice || !noticeText) return;
    if (gameState.pendingCombatRewards) {
        notice.classList.remove('hidden');
        noticeText.textContent = `Defeated ${gameState.pendingCombatRewards.enemyName}. Claim ${gameState.pendingCombatRewards.exp} EXP and ${gameState.pendingCombatRewards.gold} gold.`;
    } else {
        notice.classList.add('hidden');
        noticeText.textContent = '';
    }
}

function showCombatVictoryModal() {
    const pending = gameState.pendingCombatRewards;
    if (!pending) return;

    document.getElementById('combat-victory-title').textContent = `${pending.enemyName} defeated!`;
    document.getElementById('combat-victory-description').textContent = 'Claim your spoils from the fallen enemy.';

    const summary = document.getElementById('combat-rewards-summary');
    if (summary) {
        summary.innerHTML = '';
        const expEntry = document.createElement('div');
        expEntry.className = 'reward-item';
        expEntry.innerHTML = `<span>Experience</span><strong>${pending.exp}</strong>`;
        summary.appendChild(expEntry);

        const goldEntry = document.createElement('div');
        goldEntry.className = 'reward-item';
        goldEntry.innerHTML = `<span>Gold</span><strong>${pending.gold}</strong>`;
        summary.appendChild(goldEntry);

        const dropEntry = document.createElement('div');
        dropEntry.className = 'reward-item';
        dropEntry.innerHTML = `<span>Drop</span><strong>${pending.droppedItemName || 'None'}</strong>`;
        summary.appendChild(dropEntry);
    }

    const modal = document.getElementById('combat-victory-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
}

function hideCombatVictoryModal() {
    const modal = document.getElementById('combat-victory-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('active');
    }
}

function claimCombatRewards() {
    const pending = gameState.pendingCombatRewards;
    if (!pending) return;

    const player = gameState.player;
    player.gainExp(pending.exp);
    player.gold += pending.gold;

    if (pending.droppedItemId && GAME_DATA.items[pending.droppedItemId]) {
        player.addItem(pending.droppedItemId);
        addGameLog(`Claimed drop: ${GAME_DATA.items[pending.droppedItemId].name}`, 'success');
        player.treasuresFound++;
    }

    addGameLog(`Claimed rewards from ${pending.enemyName}: ${pending.exp} EXP and ${pending.gold} gold.`, 'success');
    gameState.pendingCombatRewards = null;
    hideCombatVictoryModal();
    updateUI();
    
    // Auto-spawn next mob in the region
    if (gameState.player.currentLocation && regionState[gameState.player.currentLocation]) {
        loadLocation(gameState.player.currentLocation);
    }
}

// ============ LOCATION SYSTEM ============
function loadLocation(locationId) {
    const location = GAME_DATA.locations[locationId];
    if (!location) return;

    gameState.player.currentLocation = locationId;
    gameState.player.locationsVisited.add(locationId);
    
    // Check world explorer achievement
    if (gameState.player.locationsVisited.size >= Object.keys(GAME_DATA.locations).length) {
        unlockAchievement('worldExplorer');
    }
    const locationView = document.getElementById('location-view');

    // Update location info
    document.getElementById('location-name').textContent = location.name;
    document.getElementById('location-description').textContent = location.description;
    const locationNote = document.getElementById('location-note');
    if (location.npcs.includes('quest_board')) {
        locationNote.textContent = 'Mission Board available here! Click the Quest Board NPC or use the mission board button to view available village quests.';
    } else {
        locationNote.textContent = '';
    }

    // Update NPCs
    const npcsList = document.getElementById('npcs-list');
    npcsList.innerHTML = '';
    location.npcs.forEach(npcId => {
        const npc = GAME_DATA.npcs[npcId];
        if (npc) {
            const npcElement = createNPCElement(npc);
            npcsList.appendChild(npcElement);
        }
    });

    // Update Enemies - Dynamic Spawning System
    if (regionState[locationId]) {
        const state = regionState[locationId];
        
        // Ensure proper number of spawned mobs (1-3 depending on kill count)
        while (state.spawnedMobs.length < Math.min(1 + Math.floor(state.kills / 6), 3)) {
            const newMob = spawnNewMob(locationId);
            if (newMob) {
                newMob.spawnId = Math.random().toString(36).substr(2, 9);
                state.spawnedMobs.push(newMob);
            } else {
                break;
            }
        }
        
        // Display spawned mobs
        state.spawnedMobs.forEach(mob => {
            const enemyElement = createEnemyElement(mob);
            npcsList.appendChild(enemyElement);
        });
        
        // Show difficulty progression
        const tier = getRegionSpawnTier(locationId, state.kills);
        const regionName = GAME_DATA.regionMobPools[locationId]?.name || '';
        const tierDisplay = tier === 'boss' ? '👑 BOSS' : tier === 'miniBoss' ? '🏆 MINI-BOSS' : tier === 'elite' ? '⭐ ELITE' : '⚔️ Normal';
        const progressNote = document.createElement('div');
        progressNote.style.margin = '10px 0';
        progressNote.style.padding = '10px';
        progressNote.style.background = 'rgba(255, 215, 0, 0.1)';
        progressNote.style.borderRadius = '6px';
        progressNote.style.color = '#ffd700';
        progressNote.style.fontSize = '0.9em';
        progressNote.innerHTML = `${tierDisplay} | Kills in ${regionName}: ${state.kills}`;
        npcsList.appendChild(progressNote);
    } else if (location.enemies && location.enemies.length > 0) {
        // Fallback for non-dynamic regions
        location.enemies.forEach(enemyId => {
            const enemy = GAME_DATA.enemies[enemyId];
            if (enemy) {
                const enemyElement = createEnemyElement(enemy);
                npcsList.appendChild(enemyElement);
            }
        });
    }

    // Update Wild Pets
    if (location.wildPets && location.wildPets.length > 0) {
        location.wildPets.forEach(petId => {
            const pet = GAME_DATA.pets.find(p => p.id === petId);
            if (pet) {
                const petElement = createWildPetElement(pet);
                npcsList.appendChild(petElement);
            }
        });
    }

    // Update Items
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    location.items.forEach(itemId => {
        const item = GAME_DATA.items[itemId];
        if (item) {
            const itemElement = createItemElement(item);
            itemsList.appendChild(itemElement);
        }
    });

    // Update Exits
    const exitsList = document.getElementById('exits-list');
    exitsList.innerHTML = '';
    Object.entries(location.exits || {}).forEach(([exitId, exitDescription]) => {
        const exitElement = document.createElement('div');
        exitElement.className = 'exit-item';
        exitElement.innerHTML = `<strong>${exitDescription}</strong>`;
        exitElement.addEventListener('click', () => loadLocation(exitId));
        exitsList.appendChild(exitElement);
    });

    const questBoardButton = document.getElementById('open-quest-board-btn');
    if (questBoardButton) {
        questBoardButton.classList.toggle('hidden', !location.npcs.includes('quest_board'));
    }

    updateUI();
}

function createNPCElement(npc) {
    const element = document.createElement('div');
    element.className = 'npc-item';
    
    // Get NPC state from living world
    let npcInfo = '';
    let emotionDisplay = '';
    if (worldSimulation && worldSimulation.npcStates[npc.id]) {
        const npcState = worldSimulation.npcStates[npc.id];
        const status = npcState.alive ? '✓' : '✗';
        npcInfo = ` | Age: ${npcState.age} | 😊 ${Math.round(npcState.happiness * 100)}% | ❤️ ${Math.round(npcState.health * 100)}%`;
        
        // Add emotion display
        const emotion = npcState.getEmotionDisplay();
        emotionDisplay = ` ${emotion.icon}`;
    }
    
    // Add intelligence indicator
    let intelligenceIcon = '';
    if (npc.intelligence) {
        switch (npc.intelligence) {
            case 'genius':
                intelligenceIcon = ' 🧠';
                break;
            case 'high':
                intelligenceIcon = ' 📚';
                break;
            case 'average':
                intelligenceIcon = ' 👤';
                break;
        }
    }
    
    // Add personality indicator
    let personalityText = '';
    if (npc.personality) {
        personalityText = ` | ${npc.personality.charAt(0).toUpperCase() + npc.personality.slice(1)}`;
    }
    
    const boardHint = npc.type === 'quest_board' ? ' — Mission Board: click to view village quests' : '';
    element.innerHTML = `
        <div class="npc-item-header">${npc.name}${intelligenceIcon}${emotionDisplay}</div>
        <div class="npc-item-description" title="${npc.description}${boardHint}">${npc.description}${boardHint}${personalityText}${npcInfo}</div>
    `;
    element.addEventListener('click', () => interactWithNPC(npc));
    return element;
}

function createEnemyElement(enemy) {
    const element = document.createElement('div');
    element.className = 'npc-item enemy-tooltip';
    element.style.borderColor = '#e94560';
    
    const expReward = calculateEnemyExpReward(enemy);
    const levelDiff = gameState.player.level - getEnemyLevel(enemy);
    let scalingInfo = '';
    if (levelDiff > 0) {
        scalingInfo = `<div style="color: #ff9999; font-size: 0.85em; margin-top: 4px;">⬇️ Weaker foe: -${Math.round((1 - expReward / (GAME_DATA.enemies[enemy.id]?.exp || 50)) * 100)}% EXP</div>`;
    } else if (levelDiff < 0) {
        const bonus = Math.round(((expReward / (GAME_DATA.enemies[enemy.id]?.exp || 50)) - 1) * 100);
        scalingInfo = `<div style="color: #00ff88; font-size: 0.85em; margin-top: 4px;">⬆️ Stronger foe: +${bonus}% EXP BONUS</div>`;
    }
    
    element.innerHTML = `
        <div class="npc-item-header" style="color: #e94560;">⚔️ ${enemy.name} (Lv ${getEnemyLevel(enemy)})</div>
        <div class="npc-item-description">HP: ${enemy.hp} | Attack: ${enemy.attack}</div>
        <div class="tooltip-text">
            <strong>Rewards</strong><br>
            💰 Gold: ${GAME_DATA.enemies[enemy.id]?.gold || 0}<br>
            ⭐ EXP: ${expReward}
            ${scalingInfo}
        </div>
    `;
    element.addEventListener('click', () => startCombat(enemy));
    return element;
}

function createWildPetElement(pet) {
    const element = document.createElement('div');
    element.className = 'npc-item';
    element.style.borderColor = '#4CAF50';
    element.innerHTML = `
        <div class="npc-item-header" style="color: #4CAF50;">🐾 ${pet.name} (${pet.specie})</div>
        <div class="npc-item-description">Grade: ${pet.grade} | HP: ${pet.hp} | MP: ${pet.mp}</div>
    `;
    element.addEventListener('click', () => tryCatchPet(pet));
    return element;
}

function createItemElement(item) {
    const element = document.createElement('div');
    element.className = 'item-item';
    element.innerHTML = `
        <div><strong>${item.name}</strong></div>
        <div>Value: ${item.gold} gold</div>
    `;
    element.addEventListener('click', () => {
        const confirmPickup = confirm(`Pick up ${item.name}?`);
        if (confirmPickup) {
            pickUpItem(item);
        }
    });
    return element;
}

// ============ NPC INTERACTION ============
function interactWithNPC(npc) {
    let dialogue = npc.dialogue;
    let emotionModifier = '';
    
    // Get emotion-modified dialogue
    if (worldSimulation && worldSimulation.npcStates[npc.id]) {
        const npcState = worldSimulation.npcStates[npc.id];
        const emotion = npcState.getEmotionDisplay();
        
        // Modify dialogue based on emotion
        if (emotion.modifier) {
            dialogue = `${dialogue} ${emotion.modifier}`;
        }
        
        // Add emotion indicator
        emotionModifier = ` ${emotion.icon} (${emotion.name})`;
    }
    
    // Handle special interactions
    if (npc.specialInteraction) {
        const interaction = npc.specialInteraction;
        
        if (interaction.type === 'class_unlock') {
            // Check requirements
            const reqs = interaction.requirements;
            let meetsRequirements = true;
            if (reqs.level && gameState.player.level < reqs.level) meetsRequirements = false;
            if (reqs.classType && gameState.player.classType !== reqs.classType) meetsRequirements = false;
            
            if (meetsRequirements) {
                const accept = confirm(`${npc.name}${emotionModifier}: "${interaction.dialogue}"`);
                if (accept) {
                    // Unlock the class
                    if (!gameState.player.unlockedClasses) gameState.player.unlockedClasses = {};
                    gameState.player.unlockedClasses[interaction.classId] = true;
                    
                    // Give reward if specified
                    if (interaction.reward) {
                        gameState.player.addItem(interaction.reward, 1);
                        addGameLog(`Received ${GAME_DATA.items[interaction.reward].name}!`, 'success');
                    }
                    
                    addGameLog(`Unlocked hidden class: ${GAME_DATA.hiddenClasses[interaction.classId].name}!`, 'success');
                    playSuccessSound();
                    updateClassesScreen();
                }
            } else {
                alert(`${npc.name}${emotionModifier}: "You are not yet ready for this path. Return when you have proven yourself."`);
            }
            return;
        } else if (interaction.type === 'item_offer') {
            // Check requirements
            const reqs = interaction.requirements;
            let meetsRequirements = true;
            if (reqs.level && gameState.player.level < reqs.level) meetsRequirements = false;
            
            if (meetsRequirements) {
                const accept = confirm(`${npc.name}${emotionModifier}: "${interaction.dialogue}"`);
                if (accept) {
                    gameState.player.addItem(interaction.itemId, 1);
                    addGameLog(`Received ${GAME_DATA.items[interaction.itemId].name}!`, 'success');
                    playSuccessSound();
                    updateInventoryScreen();
                }
            } else {
                alert(`${npc.name}${emotionModifier}: "You are not yet ready for this gift."`);
            }
            return;
        }
    }
    
    if (npc.type === 'shopkeeper') {
        openShop(npc.id);
        return;
    } else if (npc.type === 'quest_giver') {
        if (offerQuestToPlayer(npc)) return;
    } else if (npc.type === 'quest_board') {
        openQuestBoard();
        return;
    }
    
    alert(`${npc.name}${emotionModifier}: "${dialogue}"`);
}

// Generate shop inventory with rare items at low probability
function generateShopInventory(shop) {
    let inventory = [...shop.baseInventory];
    
    // Add rare items based on probability
    if (Math.random() < shop.rareChance && shop.rareInventory.length > 0) {
        const rareItem = shop.rareInventory[Math.floor(Math.random() * shop.rareInventory.length)];
        // Add 1-2 rare items
        inventory.push(rareItem);
        if (Math.random() < shop.rareChance * 0.5) {
            const anotherRare = shop.rareInventory[Math.floor(Math.random() * shop.rareInventory.length)];
            if (anotherRare !== rareItem) inventory.push(anotherRare);
        }
    }
    
    return inventory;
}

function openShop(npcId) {
    let shop = null;
    let shopName = '';
    
    // Determine which shop based on NPC type
    const npc = GAME_DATA.npcs[npcId];
    if (npc) {
        if (npc.type === 'shopkeeper') {
            if (npc.name === 'Merchant') shop = GAME_DATA.shops.general_store;
            else if (npc.name === 'Blacksmith') shop = GAME_DATA.shops.blacksmith_shop;
            else if (npc.name === 'Alchemist') shop = GAME_DATA.shops.alchemist_shop;
            else shop = GAME_DATA.shops.general_store;
            shopName = shop.name;
        }
    }
    
    if (!shop) shop = GAME_DATA.shops.general_store;
    
    // Store current shop for reference
    gameState.currentShop = shop;
    gameState.shopInventory = generateShopInventory(shop);
    
    document.getElementById('shop-name').textContent = shopName || shop.name;
    document.getElementById('shop-player-gold').textContent = gameState.player.gold;
    
    // Setup tab switching
    document.querySelectorAll('.shop-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchShopTab(e.target.dataset.tab));
    });
    
    // Display buy tab by default
    switchShopTab('buy');
    
    showScreen('shop');
}

function switchShopTab(tabName) {
    // Hide all tabs
    document.getElementById('shop-buy-tab').classList.add('hidden');
    document.getElementById('shop-sell-tab').classList.add('hidden');
    
    // Remove active state from all buttons
    document.querySelectorAll('.shop-tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'buy') {
        document.getElementById('shop-buy-tab').classList.remove('hidden');
        document.querySelector('[data-tab="buy"]').classList.add('active');
        populateShopBuyList();
    } else if (tabName === 'sell') {
        document.getElementById('shop-sell-tab').classList.remove('hidden');
        document.querySelector('[data-tab="sell"]').classList.add('active');
        populateShopSellList();
    }
}

function populateShopBuyList() {
    const shopItemsList = document.getElementById('shop-items-list');
    shopItemsList.innerHTML = '';
    
    if (!gameState.shopInventory || !gameState.currentShop) return;
    
    // Remove duplicates and create item display
    const itemsToShow = [...new Set(gameState.shopInventory)];
    
    itemsToShow.forEach(itemId => {
        const item = GAME_DATA.items[itemId];
        if (item) {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            
            let rarity = '';
            if (gameState.currentShop.rareInventory && gameState.currentShop.rareInventory.includes(itemId)) {
                rarity = ' ⭐ RARE';
            }
            
            shopItem.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-name">${item.name}${rarity}</div>
                    <div class="shop-item-price">💰 ${item.gold}</div>
                </div>
                <div class="shop-item-description">${item.type}</div>
            `;
            
            shopItem.addEventListener('click', () => buyItem(item));
            shopItem.style.cursor = 'pointer';
            shopItemsList.appendChild(shopItem);
        }
    });
}

function populateShopSellList() {
    const shopSellList = document.getElementById('shop-sell-items-list');
    shopSellList.innerHTML = '';
    
    if (!gameState.player.inventory || gameState.player.inventory.length === 0) {
        shopSellList.innerHTML = '<p style="text-align:center; color:#999;">Your inventory is empty</p>';
        return;
    }
    
    gameState.player.inventory.forEach(invItem => {
        const item = GAME_DATA.items[invItem.id];
        if (item && item.gold > 0) {  // Only sellable items with gold value
            const sellPrice = Math.floor(item.gold * 0.75); // Players get 75% of item value
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            
            shopItem.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-quantity">x${invItem.quantity}</div>
                </div>
                <div class="shop-item-description">Sell for: 💰 ${sellPrice}</div>
            `;
            
            shopItem.addEventListener('click', () => sellItem(invItem.id, sellPrice, invItem.quantity));
            shopItem.style.cursor = 'pointer';
            shopSellList.appendChild(shopItem);
        }
    });
}

function buyItem(item) {
    if (!item) return;
    
    if (gameState.player.gold >= item.gold) {
        gameState.player.gold -= item.gold;
        gameState.player.addItem(item.id);
        const rarity = gameState.currentShop.rareInventory?.includes(item.id) ? ' (RARE)' : '';
        addGameLog(`Bought ${item.name}${rarity} for ${item.gold} gold`, 'success');
        document.getElementById('shop-player-gold').textContent = gameState.player.gold;
        populateShopBuyList(); // Refresh buy list
        updateUI();
    } else {
        addGameLog('Not enough gold!', 'enemy');
    }
}

function sellItem(itemId, sellPrice, quantity) {
    const item = GAME_DATA.items[itemId];
    if (!item) return;
    
    // Find the inventory item and reduce quantity
    const invItem = gameState.player.inventory.find(i => i.id === itemId);
    if (invItem && invItem.quantity > 0) {
        invItem.quantity--;
        if (invItem.quantity === 0) {
            gameState.player.inventory = gameState.player.inventory.filter(i => i.id !== itemId);
        }
        
        gameState.player.gold += sellPrice;
        addGameLog(`Sold ${item.name} for ${sellPrice} gold`, 'success');
        document.getElementById('shop-player-gold').textContent = gameState.player.gold;
        populateShopSellList(); // Refresh sell list
        updateUI();
    }
}

function acceptQuest(questId, giverId = null) {
    const quest = GAME_DATA.quests[questId];
    if (!quest) return false;
    if (!gameState.player.quests) gameState.player.quests = {};
    if (gameState.player.quests[questId]) return false;

    gameState.player.quests[questId] = {
        id: questId,
        status: quest.type === 'system' ? 'completed' : 'accepted',
        completed: quest.type === 'system',
        giver: giverId
    };

    if (quest.type === 'system') {
        rewardQuest(questId);
        addGameLog(`System quest completed: ${quest.title}`, 'success');
    } else {
        addGameLog(`Accepted quest: ${quest.title}`, 'success');
        updateQuestsScreen();
    }

    return true;
}

function openQuestBoard() {
    const questBoardList = document.getElementById('quest-board-list');
    questBoardList.innerHTML = '';

    Object.values(GAME_DATA.quests).forEach(quest => {
        const playerQuest = gameState.player.quests[quest.id];
        if (!playerQuest || !playerQuest.completed) {
            const questItem = document.createElement('div');
            questItem.className = 'quest-board-item';
            const systemIndicator = quest.type === 'system' ? ' (System Quest)' : '';
            questItem.innerHTML = `
                <div class="quest-title">${quest.title}${systemIndicator}</div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-reward">Reward: ${quest.reward} gold</div>
                <button class="btn btn-primary accept-quest-btn" data-quest="${quest.id}">Accept Quest</button>
            `;
            questBoardList.appendChild(questItem);
        }
    });

    questBoardList.querySelectorAll('.accept-quest-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const questId = btn.dataset.quest;
            const quest = GAME_DATA.quests[questId];
            if (quest.type === 'system') {
                acceptQuest(questId, null);
                updateQuestsScreen();
                openQuestBoard(); // Refresh
            } else {
                const accept = confirm(`Accept quest: ${quest.title}?`);
                if (accept) {
                    acceptQuest(questId, null);
                    updateQuestsScreen();
                    openQuestBoard(); // Refresh
                }
            }
        });
    });

    showScreen('questBoard');
}

function pickUpItem(item) {
    gameState.player.addItem(item.id);
    const location = GAME_DATA.locations[gameState.player.currentLocation];
    const itemIndex = location.items.indexOf(item.id);
    if (itemIndex !== -1) {
        location.items.splice(itemIndex, 1);
    }
    addGameLog(`Picked up ${item.name}`);
    loadLocation(gameState.player.currentLocation);
}

function tryCatchPet(pet) {
    const catchChance = 0.5; // 50% chance, can be adjusted based on pet rarity or player skills
    if (Math.random() < catchChance) {
        // Catch successful
        if (!gameState.player.pet || !gameState.player.pet.caught) {
            gameState.player.pet = {
                caught: true,
                petType: pet.id,
                level: 1,
                exp: 0,
                name: pet.name,
                specie: pet.specie,
                grade: pet.grade,
                hp: pet.hp,
                mp: pet.mp,
                attack: pet.attack,
                defense: pet.defense,
                speed: pet.speed
            };
            addGameLog(`You caught a ${pet.name}!`, 'success');
            unlockAchievement('pet_catcher');
            playSuccessSound();
            updatePetScreen();
        } else {
            alert('You already have a pet! Release your current pet first.');
        }
    } else {
        addGameLog(`The ${pet.name} escaped!`, 'neutral');
    }
    // Remove the pet from the location after attempt
    const location = GAME_DATA.locations[gameState.player.currentLocation];
    if (location.wildPets) {
        location.wildPets = location.wildPets.filter(id => id !== pet.id);
    }
    loadLocation(gameState.player.currentLocation);
}

// ============ QUEST SYSTEM ============
function offerQuestToPlayer(npc) {
    const questId = npc.quest;
    const quest = GAME_DATA.quests[questId];
    if (!quest) return;

    const playerQuest = gameState.player.quests[questId];
    if (!playerQuest) {
        if (quest.type === 'system') {
            acceptQuest(questId, npc.id || null);
            return true;
        }

        const accept = confirm(`${npc.name}: "${quest.description}"
Do you accept the quest \"${quest.title}\"?`);
        if (!accept) {
            return true;
        }

        acceptQuest(questId, npc.id || null);
        return true;
    }

    if (playerQuest.status === 'accepted' && !playerQuest.completed) {
        if (checkQuestCompletion(questId)) {
            completeQuest(questId, npc.id);
        } else {
            alert(`${npc.name}: "You have not completed this task yet. Return when you are ready."`);
        }
        return true;
    }

    if (playerQuest.completed) {
        alert(`${npc.name}: "Thank you again for your help."`);
        return true;
    }
    return true;
}

function completeQuest(questId, returningNpcId) {
    const quest = GAME_DATA.quests[questId];
    const playerQuest = gameState.player.quests[questId];
    if (!quest || !playerQuest || playerQuest.completed) return;

    if (quest.type === 'system') {
        rewardQuest(questId);
        playerQuest.status = 'completed';
        playerQuest.completed = true;
        playerQuest.completedAt = Date.now();
        addGameLog(`System quest complete: ${quest.title}`, 'success');
        updateQuestsScreen();
        return;
    }

    if (returningNpcId && playerQuest.giver && returningNpcId !== playerQuest.giver) {
        alert('You must return to the quest giver to claim your reward.');
        return;
    }

    playerQuest.status = 'completed';
    playerQuest.completed = true;
    playerQuest.completedAt = Date.now();
    rewardQuest(questId);
    addGameLog(`Quest Complete! ${quest.title} - +${quest.reward} gold`, 'success');
    
    // Check first quest achievement
    const completedQuests = Object.values(gameState.player.quests).filter(q => q.completed);
    if (completedQuests.length === 1) {
        unlockAchievement('first_quest');
    }
    
    updateUI();
    updateQuestsScreen();
}

function rewardQuest(questId) {
    const quest = GAME_DATA.quests[questId];
    if (!quest) return;
    if (quest.reward) {
        gameState.player.gold += quest.reward;
    }
    if (quest.expReward) {
        gameState.player.gainExp(quest.expReward);
        addGameLog(`Received ${quest.expReward} quest exp!`, 'success');
    }
    if (quest.rewardItem) {
        gameState.player.addItem(quest.rewardItem, 1);
        addGameLog(`Received item: ${GAME_DATA.items[quest.rewardItem].name}`, 'success');
    }
}

function autoCompleteKillQuests() {
    if (!gameState.player.quests) return;
    Object.values(gameState.player.quests).forEach(playerQuest => {
        if (!playerQuest || playerQuest.completed || playerQuest.status !== 'accepted') return;
        const quest = GAME_DATA.quests[playerQuest.id];
        if (!quest || !quest.autoCompleteOnKill) return;
        if (checkQuestCompletion(playerQuest.id)) {
            completeQuest(playerQuest.id);
        }
    });
}

function checkQuestCompletion(questId) {
    if (!gameState.player.quests[questId]) return false;
    const quest = GAME_DATA.quests[questId];
    if (!quest) return false;

    switch (questId) {
        case 'defeat_shadow_lord':
            return gameState.player.questProgress?.defeat_shadow_lord === true;
        case 'defeat_troll':
            return gameState.player.questProgress?.defeat_troll === true;
        case 'explore_cave':
            return (gameState.player.questProgress?.explore_cave_kills || 0) >= 4;
        case 'clear_goblin_camp':
            return (gameState.player.questProgress?.clear_goblin_camp_kills || 0) >= 5;
        case 'find_ancient_tome':
            return gameState.player.inventory.some(item => item.id === 'ancient_tome');
        case 'deliver_message':
            return gameState.player.currentLocation === 'forest';
        case 'translate_ancient_text':
            return gameState.player.inventory.some(item => item.id === 'ancient_scroll');
        default:
            return false;
    }
}

function updateQuestProgressForEnemyKill(enemyId) {
    gameState.player.questProgress = gameState.player.questProgress || {};
    const progress = gameState.player.questProgress;

    if (['goblin', 'goblinWarrior'].includes(enemyId)) {
        if (gameState.player.quests?.explore_cave?.status === 'accepted') {
            progress.explore_cave_kills = (progress.explore_cave_kills || 0) + 1;
            addGameLog(`Quest progress: Cleared ${progress.explore_cave_kills}/4 goblins for Explore the Cave.`, 'info');
        }
        if (gameState.player.quests?.clear_goblin_camp?.status === 'accepted') {
            progress.clear_goblin_camp_kills = (progress.clear_goblin_camp_kills || 0) + 1;
            addGameLog(`Quest progress: Cleared ${progress.clear_goblin_camp_kills}/5 goblins for Clear the Goblin Camp.`, 'info');
        }
    }

    if (enemyId === 'mountain_troll' && gameState.player.quests?.defeat_troll?.status === 'accepted') {
        progress.defeat_troll = true;
        addGameLog('Quest progress: Mountain Troll defeated for Slay the Mountain Troll.', 'success');
    }
}

function updateQuestsScreen() {
    const questsList = document.getElementById('quests-list');
    questsList.innerHTML = '';

    // Add explanatory text
    const explanation = document.createElement('p');
    explanation.textContent = 'Accepted quests appear below. Ready quests show a complete button you can use once objectives are met.';
    explanation.style.fontSize = '0.9em';
    explanation.style.color = '#888';
    explanation.style.marginBottom = '10px';
    questsList.appendChild(explanation);

    const acceptedQuests = Object.values(gameState.player.quests || {}).filter(q => q.status === 'accepted' && !q.completed);
    const completedQuests = Object.values(gameState.player.quests || {}).filter(q => q.completed);

    if (acceptedQuests.length === 0) {
        questsList.innerHTML += '<p>No accepted quests yet. Talk to quest givers to accept new tasks.</p>';
    } else {
        questsList.innerHTML += '<h3>Accepted Quests</h3>';
        acceptedQuests.forEach(playerQuest => {
            const quest = GAME_DATA.quests[playerQuest.id];
            if (!quest) return;
            const questItem = document.createElement('div');
            questItem.className = 'quest-item';
            const systemIndicator = quest.type === 'system' ? ' (System Quest)' : '';
            const readyToComplete = checkQuestCompletion(quest.id);
            const completionText = readyToComplete ? 'Ready to complete!' : 'In progress...';
            questItem.innerHTML = `
                <div class="quest-title">${quest.title}${systemIndicator}</div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-status">Status: Accepted</div>
                <div class="quest-progress">${completionText}</div>
                <div class="quest-reward">Reward: ${quest.reward} gold</div>
            `;
            if (readyToComplete) {
                const completeBtn = document.createElement('button');
                completeBtn.className = 'btn btn-primary';
                completeBtn.textContent = 'Complete Quest';
                completeBtn.addEventListener('click', () => {
                    completeQuest(quest.id, null);
                });
                questItem.appendChild(completeBtn);
            }
            questsList.appendChild(questItem);
        });
    }

    if (completedQuests.length > 0) {
        questsList.innerHTML += '<h3>Completed Quests</h3>';
        completedQuests.forEach(playerQuest => {
            const quest = GAME_DATA.quests[playerQuest.id];
            if (!quest) return;
            const questItem = document.createElement('div');
            questItem.className = 'quest-item completed';
            const systemIndicator = quest.type === 'system' ? ' (System Quest)' : '';
            questItem.innerHTML = `
                <div class="quest-title">${quest.title} ✓${systemIndicator}</div>
                <div class="quest-description">${quest.description}</div>
                <div class="quest-status">Status: Completed</div>
                <div class="quest-reward">Reward: ${quest.reward} gold</div>
            `;
            questsList.appendChild(questItem);
        });
    }
}

// ============ COMBAT SYSTEM ============
function startCombat(enemy) {
    gameState.player.inCombat = true;
    gameState.player.currentEnemy = JSON.parse(JSON.stringify(enemy));
    gameState.player.currentEnemy.hp = enemy.hp;
    gameState.player.damageTakenInCombat = 0; // Reset damage tracking

    document.getElementById('location-view').classList.add('hidden');
    document.getElementById('combat-view').classList.remove('hidden');
    document.getElementById('enemy-name').textContent = `${enemy.name} (Lv ${getEnemyLevel(enemy)})`;

    addGameLog(`Combat started with ${enemy.name}!`);
    updateCombatUI();
}

function updateCombatUI() {
    const enemy = gameState.player.currentEnemy;
    const player = gameState.player;

    const playerHealthPercent = Math.max(0, Math.min(100, (player.hp / player.maxHP) * 100));
    document.getElementById('player-health-bar').style.width = playerHealthPercent + '%';
    document.getElementById('player-health-text').textContent = `${player.hp}/${player.maxHP}`;

    if (!enemy) {
        document.getElementById('enemy-health-bar').style.width = '0%';
        document.getElementById('enemy-health-text').textContent = `0/0`;
        return;
    }

    const enemyMaxHP = GAME_DATA.enemies[enemy.id]?.hp || enemy.hp || 1;
    const enemyHealthPercent = Math.max(0, Math.min(100, (enemy.hp / enemyMaxHP) * 100));

    document.getElementById('enemy-health-bar').style.width = enemyHealthPercent + '%';
    document.getElementById('enemy-health-text').textContent = `${enemy.hp}/${enemyMaxHP}`;
}

function calculateDamage(player, defenseValue, enemy = null) {
    // Get base damage range from player stats
    const minDamage = player.getMinDamage();
    const maxDamage = player.getMaxDamage();
    
    // Roll damage within range
    let damage = Math.floor(minDamage + Math.random() * (maxDamage - minDamage));
    
    // Check for critical hit
    const isCrit = Math.random() < player.getCritChance();
    if (isCrit) {
        damage = Math.floor(damage * player.getCritDamage());
    }
    
    // Apply defense reduction
    const actualDamage = Math.max(1, Math.floor(damage - defenseValue * 0.5));
    
    return { damage: actualDamage, isCrit: isCrit, min: minDamage, max: maxDamage };
}

function getEnemyLevel(enemy) {
    if (!enemy) return 1;
    if (enemy.level) return enemy.level;
    const dataEnemy = GAME_DATA.enemies[enemy.id];
    return (dataEnemy && dataEnemy.level) ? dataEnemy.level : 1;
}

function calculateEnemyExpReward(enemy) {
    const baseExp = (enemy && GAME_DATA.enemies[enemy.id]?.exp) || (enemy?.exp || 0);
    const enemyLevel = getEnemyLevel(enemy);
    const playerLevel = gameState.player.level;
    const levelDiff = playerLevel - enemyLevel;
    const ratio = levelDiff <= 0
        ? Math.min(1.5, 1 + Math.abs(levelDiff) * 0.08)
        : Math.max(0.15, 1 - levelDiff * 0.12);
    return Math.max(1, Math.floor(baseExp * ratio));
}

function combatAttack() {
    playClickSound();
    const player = gameState.player;
    const enemy = gameState.player.currentEnemy;
    
    // Enemy dodge chance (simplistic)
    const enemyDodgeChance = Math.min(0.2, (enemy.level || 1) * 0.02);
    if (Math.random() < enemyDodgeChance) {
        addGameLog(`${enemy.name} dodged your attack!`, 'enemy');
        updateCombatUI();
        enemyTurn();
        return;
    }
    
    const damageResult = calculateDamage(player, enemy.defense || 0, enemy);
    enemy.hp = Math.max(0, enemy.hp - damageResult.damage);

    let message = `You strike ${enemy.name} for ${damageResult.damage} damage!`;
    if (damageResult.isCrit) {
        message += ` 💥 CRITICAL HIT!`;
        addGameLog(message, 'player');
        playSuccessSound();
    } else {
        addGameLog(message, 'player');
    }
    
    updateCombatUI();

    if (enemy.hp <= 0) {
        endCombat(true);
        return;
    }

    enemyTurn();
}

function combatCastSpell() {
    if (gameState.player.mp < 15) {
        alert('Not enough mana!');
        return;
    }

    const player = gameState.player;
    const enemy = gameState.player.currentEnemy;
    player.mp -= 15;
    player.spellsCast++;
    const spellPower = Math.floor(player.getAttackPower() * 1.7);
    const damage = calculateDamage(spellPower, enemy.defense, 0.35);
    enemy.hp = Math.max(0, enemy.hp - damage);

    addGameLog(`You cast a spell and deal ${damage} damage!`, 'player');
    updateCombatUI();

    if (enemy.hp <= 0) {
        endCombat(true);
        return;
    }

    enemyTurn();
}

function combatDefend() {
    const reduction = Math.floor(gameState.player.getDefensePower() * 0.25) + 2;
    addGameLog(`You brace yourself, reducing incoming damage by ${reduction}.`, 'player');
    enemyTurn(reduction);
}

function combatFlee() {
    const fleeChance = 0.35 + Math.min(gameState.player.speed * 0.01, 0.25);
    if (Math.random() < fleeChance) {
        addGameLog(`You successfully fled from combat!`);
        endCombat(false);
    } else {
        addGameLog(`Failed to flee!`, 'enemy');
        enemyTurn();
    }
}

function enemyTurn(defenseBonus = 0) {
    const enemy = gameState.player.currentEnemy;
    const player = gameState.player;
    
    // Check if player dodges
    if (Math.random() < player.getDodgeChance()) {
        addGameLog(`You dodged ${enemy.name}'s attack!`, 'success');
        updateCombatUI();
        return;
    }
    
    // Enemy damage calculation (simplified, no crit)
    const enemyMinDamage = Math.floor(enemy.attack * 0.7);
    const enemyMaxDamage = Math.floor(enemy.attack * 1.2);
    const baseDamage = enemyMinDamage + Math.floor(Math.random() * (enemyMaxDamage - enemyMinDamage));
    const playerDefense = player.getDefensePower();
    const actualDamage = Math.max(1, Math.floor(baseDamage - playerDefense * 0.5));
    
    player.hp -= actualDamage;
    player.damageTakenInCombat += actualDamage;

    addGameLog(`${enemy.name} attacks for ${actualDamage} damage!`, 'enemy');

    if (player.hp <= 0) {
        endCombat(false);
        return;
    }

    updateCombatUI();
}

function endCombat(victory) {
    gameState.player.inCombat = false;
    const enemy = gameState.player.currentEnemy;
    const currentLocation = gameState.player.currentLocation;
    const locationState = regionState[currentLocation];
    
    const enemyData = (enemy && GAME_DATA.enemies && GAME_DATA.enemies[enemy.id]) ? GAME_DATA.enemies[enemy.id] : 
                     (enemy && GAME_DATA.miniBosses && GAME_DATA.miniBosses[enemy.id]) ? GAME_DATA.miniBosses[enemy.id] :
                     (enemy && GAME_DATA.regionalBosses && GAME_DATA.regionalBosses[enemy.id]) ? GAME_DATA.regionalBosses[enemy.id] :
                     { exp: 0, gold: 0, drops: [] };

    if (victory) {
        if (enemy && enemy.id) {
            updateQuestProgressForEnemyKill(enemy.id);
            autoCompleteKillQuests();
        }

        const expReward = calculateEnemyExpReward(enemy);
        const goldReward = enemyData.gold || 0;
        const droppedItemId = (enemyData.drops && enemyData.drops.length > 0) ? enemyData.drops[Math.floor(Math.random() * enemyData.drops.length)] : null;

        gameState.pendingCombatRewards = {
            enemyName: enemy?.name || 'Enemy',
            enemyId: enemy?.id || null,
            exp: expReward,
            gold: goldReward,
            droppedItemId: droppedItemId,
            droppedItemName: droppedItemId ? GAME_DATA.items[droppedItemId]?.name : null
        };

        gameState.player.enemiesKilled++;

        // Dynamic mob system: remove defeated mob and increment counter
        if (locationState && enemy.spawnId) {
            const mobIndex = locationState.spawnedMobs.findIndex(m => m.spawnId === enemy.spawnId);
            if (mobIndex !== -1) {
                locationState.spawnedMobs.splice(mobIndex, 1);
            }
            locationState.kills++;
            
            // Show tier advancement notifications
            const tier = getRegionSpawnTier(currentLocation, locationState.kills);
            const prevTier = getRegionSpawnTier(currentLocation, locationState.kills - 1);
            
            if (tier !== prevTier) {
                if (tier === 'boss') {
                    addGameLog('🚨 WARNING: The final boss has appeared!', 'success');
                    playSound(1200, 600, 'sine');
                } else if (tier === 'miniBoss') {
                    addGameLog('🏆 A mighty mini-boss now stalks these lands!', 'success');
                    playSound(900, 400, 'sine');
                } else if (tier === 'elite') {
                    addGameLog('⭐ Elite foes now appear in this region!', 'info');
                }
            }
        }

        if (enemy && (enemy.miniBoss || enemy.boss)) {
            if (enemy.boss) {
                addGameLog(`LEGENDARY! You defeated the regional boss: ${enemy.name}!`, 'success');
                unlockAchievement('bossMaster');
            } else if (enemy.miniBoss) {
                addGameLog(`Mighty victory! You vanquished the mini-boss: ${enemy.name}!`, 'success');
                unlockAchievement('miniBossMaster');
            }
        } else {
            addGameLog(`Victory! ${enemy?.name || 'The foe'} has been defeated. Claim your rewards from the reward panel.`, 'success');
        }

        if (gameState.player.enemiesKilled === 1) unlockAchievement('firstBlood');
        if (enemy && enemy.name && enemy.name.toLowerCase().includes('dragon')) unlockAchievement('dragonSlayer');
        if (enemy && enemy.name === 'Shadow Lord') unlockAchievement('shadowLordVictory');

        gameState.player.checkHiddenClassUnlock();

        if (enemy && enemy.id === 'shadow_lord') {
            gameState.player.questProgress = gameState.player.questProgress || {};
            gameState.player.questProgress.defeat_shadow_lord = true;
            addGameLog('You have defeated the Shadow Lord. Return to Brother Isaiah to claim your reward.', 'success');
        }
    } else {
        addGameLog(`You were defeated...`, 'enemy');
        gameState.player.hp = Math.floor(gameState.player.maxHP / 2);
    }

    document.getElementById('combat-view').classList.add('hidden');
    document.getElementById('location-view').classList.remove('hidden');
    updateCombatUI();
    updateUI();
    showCombatVictoryModal();
    gameState.player.currentEnemy = null;
}

function addGameLog(message, type = 'neutral') {
    const logElement = document.createElement('div');
    logElement.className = `combat-log-entry ${type}`;
    logElement.textContent = message;
    document.getElementById('combat-log').appendChild(logElement);
    document.getElementById('combat-log').scrollTop = document.getElementById('combat-log').scrollHeight;
}

// ============ INVENTORY SCREEN ============
function updateInventoryScreen() {
    const inventoryList = document.getElementById('inventory-items-list');
    inventoryList.innerHTML = '';

    gameState.player.inventory.forEach(item => {
        const itemData = GAME_DATA.items[item.id];
        const itemSlot = document.createElement('div');
        itemSlot.className = 'item-slot';

        itemSlot.innerHTML = `
            <strong>${itemData.name}</strong> x${item.quantity}
            <br><small>Value: ${itemData.gold} gold</small>
        `;

        const actionButton = document.createElement('button');
        actionButton.className = 'btn btn-secondary inventory-action-btn';

        if (itemData.type === 'book') {
            actionButton.textContent = 'Read';
            actionButton.addEventListener('click', (event) => {
                event.stopPropagation();
                readBook(item.id);
            });
        } else if (itemData.effect) {
            actionButton.textContent = 'Use';
            actionButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const confirmUse = confirm(`Use ${itemData.name}?`);
                if (confirmUse) {
                    useItem(item.id);
                }
            });
        } else {
            actionButton.textContent = 'Inspect';
            actionButton.addEventListener('click', (event) => {
                event.stopPropagation();
                alert(`${itemData.name}: ${itemData.description || 'No description available.'}`);
            });
        }

        itemSlot.appendChild(actionButton);
        inventoryList.appendChild(itemSlot);
    });

    if (gameState.player.inventory.length === 0) {
        inventoryList.innerHTML = '<p>Inventory is empty</p>';
    }
}

function updateStatsScreen() {
    const player = gameState.player;
    
    // Primary stats with bonuses
    const stats = [
        { id: 'strength', value: player.strength },
        { id: 'stamina', value: player.stamina },
        { id: 'intelligence', value: player.intelligence },
        { id: 'speed', value: player.speed },
        { id: 'agility', value: player.agility },
        { id: 'luck', value: player.luck },
        { id: 'vitality', value: player.vitality },
        { id: 'wisdom', value: player.wisdom }
    ];
    
    stats.forEach(stat => {
        const bonus = player.getStatBonus(stat.id);
        document.getElementById(`stat-${stat.id}`).textContent = Math.floor(stat.value);
        const bonusElement = document.getElementById(`stat-${stat.id}-bonus`);
        if (bonusElement) {
            bonusElement.textContent = bonus > 0 ? `+${bonus}` : '';
            bonusElement.style.color = bonus > 0 ? '#ffd700' : '#888';
        }
    });
    
    // HP and Mana
    document.getElementById('stat-hp').textContent = `${player.hp}/${player.maxHP}`;
    document.getElementById('stat-mp').textContent = `${player.mp}/${player.maxMP}`;
    
    // Damage range
    const minDmg = player.getMinDamage();
    const maxDmg = player.getMaxDamage();
    document.getElementById('stat-damage').textContent = `${minDmg} - ${maxDmg}`;
    
    // Defense
    document.getElementById('stat-defense').textContent = Math.floor(player.getDefensePower());
    
    // Crit chance
    const critChance = (player.getCritChance() * 100).toFixed(1);
    document.getElementById('stat-crit-chance').textContent = `${critChance}%`;
    
    // Attack speed
    const atkSpeed = player.getAttackSpeed().toFixed(2);
    document.getElementById('stat-attack-speed').textContent = `${atkSpeed}x`;
    
    // Dodge chance
    const dodgeChance = (player.getDodgeChance() * 100).toFixed(1);
    document.getElementById('stat-dodge-chance').textContent = `${dodgeChance}%`;
    
    // Magic damage
    document.getElementById('stat-magic-damage').textContent = Math.floor(player.getMagicalDamage());
}

function readBook(bookId) {
    const bookData = GAME_DATA.items[bookId];
    const content = BOOK_CONTENT[bookId] || 'This book has beens etched in ancient script that is partially illegible.';

    showScreen('bookReader');
    document.getElementById('book-reader-title').textContent = bookData.name;
    document.getElementById('book-reader-content').textContent = content;

    // Track books read for achievement
    gameState.player.booksRead = gameState.player.booksRead || [];
    if (!gameState.player.booksRead.includes(bookId)) {
        gameState.player.booksRead.push(bookId);
        if (gameState.player.booksRead.length >= 5) {
            unlockAchievement('bookworm');
        }
    }

    // Grant skill bonuses based on book type
    applyBookSkillBonus(bookId);

    addGameLog(`Read ${bookData.name}`);
    playSuccessSound();
}

function applyBookSkillBonus(bookId) {
    const skillBonuses = {
        'spell_book': { skill: 'magic', bonus: 5, message: 'You feel your magical abilities strengthen!', stat: 'mp', value: 5 },
        'ancient_tome': { skill: 'knowledge', bonus: 3, message: 'Ancient wisdom fills your mind!', exp: 30 },
        'spell_scroll': { skill: 'magic', bonus: 3, message: 'You master a new incantation!', stat: 'mp', value: 3 },
        'ancient_scroll': { skill: 'perception', bonus: 4, message: 'Your senses sharpen with forbidden knowledge!', stat: 'defense', value: 2 },
        'warriors_codex': { skill: 'combat', bonus: 4, message: 'Battle tactics become clear to you!', stat: 'attack', value: 3 },
        'clerics_holy_scripture': { skill: 'healing', bonus: 4, message: 'Divine power flows through you!', unlock: 'advanced_healing' },
        'rogues_handbook': { skill: 'stealth', bonus: 4, message: 'Shadows welcome you as an ally!', unlock: 'backstab_upgrade' },
        'merchants_ledger': { skill: 'commerce', bonus: 3, message: 'You understand the flow of gold!', gold: 50 },
        'alchemists_formulary': { skill: 'alchemy', bonus: 4, message: 'Chemical secrets reveal themselves!', unlock: 'rare_potions' },
        'necromancers_grimoire': { skill: 'dark_magic', bonus: 5, message: 'Dark energies respond to your will!', curse: true },
        'druids_nature_lore': { skill: 'nature', bonus: 4, message: 'The wilderness speaks to you!', unlock: 'animal_communication' },
        'paladins_oath': { skill: 'holy_magic', bonus: 3, message: 'Holy light guides your blade!', unlock: 'undead_slayer' },
        'quest_tome_elder_lore': { skill: 'knowledge', bonus: 5, message: 'Prophecies unfold before your eyes!', quest: 'shadow_lord_weakness' },
        'quest_scroll_hidden_passages': { skill: 'perception', bonus: 3, message: 'Secret paths reveal themselves!', quest: 'hidden_passages' },
        'quest_codex_dragon_lore': { skill: 'combat', bonus: 4, message: 'Dragon-slaying wisdom is yours!', quest: 'dragonbane_sword' }
    };

    const bonus = skillBonuses[bookId];
    if (bonus) {
        // Initialize skill tree if not exists
        if (!gameState.player.skillTree) gameState.player.skillTree = {};
        if (!gameState.player.skillTree[bonus.skill]) gameState.player.skillTree[bonus.skill] = 0;
        
        gameState.player.skillTree[bonus.skill] += bonus.bonus;
        addGameLog(bonus.message, 'success');
        
        // Apply immediate stat bonuses
        if (bonus.stat === 'mp') {
            gameState.player.maxMP += bonus.value;
            gameState.player.mp = Math.min(gameState.player.mp + bonus.value, gameState.player.maxMP);
        } else if (bonus.stat === 'attack') {
            gameState.player.attack += bonus.value;
        } else if (bonus.stat === 'defense') {
            gameState.player.defense += bonus.value;
        } else if (bonus.exp) {
            gameState.player.gainExp(bonus.exp);
        } else if (bonus.gold) {
            gameState.player.gold += bonus.gold;
        }
        
        // Handle unlocks
        if (bonus.unlock) {
            if (!gameState.player.unlockedAbilities) gameState.player.unlockedAbilities = {};
            gameState.player.unlockedAbilities[bonus.unlock] = true;
            addGameLog(`Unlocked: ${bonus.unlock.replace(/_/g, ' ')}`, 'success');
        }
        
        // Handle quest progress
        if (bonus.quest) {
            if (!gameState.player.questProgress) gameState.player.questProgress = {};
            gameState.player.questProgress[bonus.quest] = true;
            addGameLog(`Quest clue discovered: ${bonus.quest.replace(/_/g, ' ')}`, 'success');
        }
        
        // Handle curses
        if (bonus.curse) {
            gameState.player.hp = Math.max(1, gameState.player.hp - 10);
            addGameLog('Dark magic takes its toll...', 'enemy');
        }
        
        updateUI();
    }
}

function scanForClues(type, targetId = null) {
    playClickSound();
    
    const clues = {
        map: {
            village: ['You notice strange markings on the well that might be ancient runes.', 'The blacksmith\'s forge has unusual symbols etched into the walls.'],
            forest: ['Deep in the woods, you spot what looks like a hidden path.', 'Animal tracks lead to a suspicious clearing.'],
            castle: ['The castle walls have faded inscriptions that could be important.', 'A loose stone in the dungeon might conceal something.'],
            library: ['Some books seem out of place on the shelves.', 'The librarian\'s desk has hidden compartments.'],
            mountain: ['Cave entrances show signs of recent activity.', 'Ancient carvings depict battles long forgotten.']
        },
        book: {
            'ancient_tome': ['Between the lines, you discover references to a "Crystal of Power" hidden in the mountains.', 'The text mentions a secret society that guards ancient knowledge.'],
            'quest_tome_elder_lore': ['You find a hidden prophecy about a hero who will unite the realms.', 'Clues point to the Shadow Lord\'s weakness being a specific artifact.'],
            'necromancers_grimoire': ['Warning: This book contains dangerous knowledge. Use with caution.', 'References to undead armies that could be summoned.'],
            'quest_scroll_hidden_passages': ['Detailed maps show secret entrances beneath the castle.', 'Instructions for finding the lost ancient tome.']
        }
    };

    let foundClues = [];
    
    if (type === 'map') {
        const locationClues = clues.map[gameState.player.currentLocation] || [];
        foundClues = locationClues;
        
        // Chance to find hidden items based on perception skill
        const perceptionSkill = gameState.player.skillTree?.perception || 0;
        if (Math.random() < (perceptionSkill * 0.1)) {
            foundClues.push('You discover a hidden cache with valuable items!');
            // Could add random item drops here
        }
    } else if (type === 'book' && targetId) {
        foundClues = clues.book[targetId] || ['No additional clues found in this text.'];
    }

    if (foundClues.length > 0) {
        addGameLog('🔍 Scanning reveals:', 'success');
        foundClues.forEach(clue => addGameLog(`• ${clue}`, 'neutral'));
        playSuccessSound();
    } else {
        addGameLog('No clues found.', 'neutral');
    }
}

function useItem(itemId) {
    const item = GAME_DATA.items[itemId];

    if (item.effect === 'heal') {
        gameState.player.heal(item.value);
        gameState.player.removeItem(itemId);
        addGameLog(`Used ${item.name}. Healed for ${item.value} HP`);
    } else if (item.effect === 'restore_mp') {
        gameState.player.restoreMana(item.value);
        gameState.player.removeItem(itemId);
        addGameLog(`Used ${item.name}. Restored ${item.value} MP`);
    }

    updateInventoryScreen();
    updateUI();
}

// ============ MAP SCREEN ============
function updateMapScreen() {
    const mapElement = document.getElementById('world-map');
    const detailsElement = document.getElementById('map-location-details');
    const bookListElement = document.getElementById('map-book-list');

    mapElement.textContent = `
 ╔═══════════════════════════════════════════╗
 ║    WORLD MAP - Chronicles of Aetheria    ║
 ╠═══════════════════════════════════════════╣
 ║                                           ║
 ║      [SKY TOWER]                          ║
 ║           |                               ║
 ║      [MOUNTAINS] ——— [FOREST] ——— [CAVE] ║
 ║           |              |                ║
 ║    [VILLAGE] ————— [CASTLE]               ║
 ║                          |                ║
 ║                     [DUNGEON]              ║
 ║                                           ║
 ║  Current Location: ${gameState.player.currentLocation.padEnd(25)}║
 ║                                           ║
 ╚═══════════════════════════════════════════╝
    `;

    // Location selection buttons
    let locationButtons = '<h3>Explore Nearby Locations</h3>';
    locationButtons += '<div class="map-location-list">';
    Object.entries(GAME_DATA.locations).forEach(([locId, loc]) => {
        locationButtons += `<button class="btn btn-secondary map-location-btn" data-location="${locId}">${loc.name}</button>`;
    });
    locationButtons += '</div>';
    detailsElement.innerHTML = locationButtons;

    detailsElement.querySelectorAll('.map-location-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const selected = btn.dataset.location;
            loadLocation(selected);
            updateMapScreen();
        });
    });

    // Show current location detail and books
    const currentLocation = GAME_DATA.locations[gameState.player.currentLocation] || GAME_DATA.locations.village;
    bookListElement.innerHTML = `<h3>${currentLocation.name}</h3><p>${currentLocation.description}</p>`;

    const bookItems = (currentLocation.items || [])
        .map(itemId => GAME_DATA.items[itemId])
        .filter(item => item && item.type === 'book');

    if (bookItems.length > 0) {
        bookListElement.innerHTML += '<h4>Books Available Here</h4>';
        bookItems.forEach(book => {
            const bookButton = document.createElement('button');
            bookButton.className = 'btn btn-primary';
            bookButton.textContent = `Read ${book.name}`;
            bookButton.addEventListener('click', () => readBook(book.id));
            bookListElement.appendChild(bookButton);
        });
    } else {
        bookListElement.innerHTML += '<h4>No books found in this location.</h4>';
    }
}

// ============ SAVE/LOAD SYSTEM ============
function getSavedGameForCurrentUser() {
    const rawSaves = localStorage.getItem('aetheria_saves');
    let saves = {};
    try {
        saves = rawSaves ? JSON.parse(rawSaves) : {};
    } catch (err) {
        console.error('Unable to parse saved games index', err);
        saves = {};
    }

    const save = saves[gameState.username];
    if (save && save.username === gameState.username) {
        return save;
    }

    const legacySave = localStorage.getItem('aetheria_save');
    if (legacySave) {
        try {
            const parsed = JSON.parse(legacySave);
            if (parsed.username === gameState.username) {
                return parsed;
            }
        } catch (err) {
            console.error('Unable to parse legacy save', err);
        }
    }
    return null;
}

function saveGame() {
    if (!confirm('Save your current progress?')) {
        return;
    }
    const saveData = {
        username: gameState.username,
        lastSaveTime: Date.now(),
        worldTime: worldTime ? {
            year: worldTime.year,
            month: worldTime.month,
            day: worldTime.day,
            hour: worldTime.hour,
            gameLoops: worldTime.gameLoops
        } : null,
        player: {
            name: gameState.player.name,
            classType: gameState.player.classType,
            hp: gameState.player.hp,
            maxHP: gameState.player.maxHP,
            mp: gameState.player.mp,
            maxMP: gameState.player.maxMP,
            attack: gameState.player.attack,
            defense: gameState.player.defense,
            speed: gameState.player.speed,
            level: gameState.player.level,
            exp: gameState.player.exp,
            gold: gameState.player.gold,
            inventory: gameState.player.inventory,
            currentLocation: gameState.player.currentLocation,
            quests: gameState.player.quests,
            unlockedClasses: gameState.player.unlockedClasses,
            locationsVisited: Array.from(gameState.player.locationsVisited || []),
            guild: gameState.player.guild || {},
            pet: gameState.player.pet || {},
            questProgress: gameState.player.questProgress || {},
            achievements: gameState.player.achievements || {},
            factionRep: gameState.player.factionRep || {},
            activeEnchantments: gameState.player.activeEnchantments || {},
            booksRead: gameState.player.booksRead || []
        }
    };

    const rawSaves = localStorage.getItem('aetheria_saves');
    let saves = {};
    try {
        saves = rawSaves ? JSON.parse(rawSaves) : {};
    } catch (err) {
        console.error('Unable to parse saved games index', err);
        saves = {};
    }
    saves[gameState.username] = saveData;
    localStorage.setItem('aetheria_saves', JSON.stringify(saves));
    localStorage.setItem('aetheria_save', JSON.stringify(saveData));
    
    // Check merchant achievement
    if (gameState.player.gold >= 10000) {
        unlockAchievement('merchant');
    }
    
    // Save to server if available
    if (gameState.isServerMode && gameState.userId) {
        fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: gameState.userId,
                playerId: gameState.playerId,
                playerData: saveData.player
            })
        }).then(res => res.json()).catch(err => console.log('Server save failed', err));
    }
    
    alert('Game saved successfully!');
    playSuccessSound();
}

function loadGame(savedData = null) {
    const save = savedData || getSavedGameForCurrentUser();
    if (!save) return;
    gameState.player = new Player(save.player.name, save.player.classType);
    
    // Initialize regional mob system
    initializeRegionalState();

    // Restore world time
    if (save.worldTime) {
        if (!worldTime) worldTime = new WorldTime();
        worldTime.year = save.worldTime.year;
        worldTime.month = save.worldTime.month;
        worldTime.day = save.worldTime.day;
        worldTime.hour = save.worldTime.hour;
        worldTime.gameLoops = save.worldTime.gameLoops;
        // Advance time based on real time elapsed
        if (save.lastSaveTime) {
            const elapsedMs = Date.now() - save.lastSaveTime;
            const elapsedHours = Math.min(Math.floor(elapsedMs / 1800000), 24); // 1 hour per 1800 seconds (2 game hours = 1 real hour)
            worldTime.advance(elapsedHours);
        }
    }

    // Restore player stats
    gameState.player.hp = save.player.hp;
    gameState.player.maxHP = save.player.maxHP;
    gameState.player.mp = save.player.mp;
    gameState.player.maxMP = save.player.maxMP;
    gameState.player.attack = save.player.attack;
    gameState.player.defense = save.player.defense;
    gameState.player.speed = save.player.speed;
    gameState.player.level = save.player.level;
    gameState.player.exp = save.player.exp;
    gameState.player.gold = save.player.gold;
    gameState.player.inventory = save.player.inventory || [];
    gameState.player.currentLocation = save.player.currentLocation;
    gameState.player.quests = save.player.quests || {};
    gameState.player.unlockedClasses = save.player.unlockedClasses || {};
    gameState.player.locationsVisited = new Set(save.player.locationsVisited || [gameState.player.currentLocation || 'village']);
    gameState.player.guild = save.player.guild || gameState.player.guild;
    gameState.player.pet = save.player.pet || gameState.player.pet;
    gameState.player.questProgress = save.player.questProgress || gameState.player.questProgress;
    gameState.player.achievements = save.player.achievements || gameState.player.achievements;
    gameState.player.factionRep = save.player.factionRep || gameState.player.factionRep;
    gameState.player.activeEnchantments = save.player.activeEnchantments || gameState.player.activeEnchantments;
    gameState.player.booksRead = save.player.booksRead || [];

    gameState.gameStarted = true;
    showScreen('mainGame');
    updateUI();
    loadLocation(gameState.player.currentLocation);
}

// ============ GUILD SYSTEM ============
function updateGuildScreen() {
    // Hide all sections first
    document.getElementById('guild-status').classList.remove('hidden');
    document.getElementById('guild-list-section').classList.add('hidden');
    document.getElementById('create-guild-section').classList.add('hidden');
    document.getElementById('guild-details-section').classList.add('hidden');
    document.getElementById('scouting-section').classList.add('hidden');

    // Update player's guild status
    updatePlayerGuildStatus();

    // Show appropriate navigation
    updateGuildNavigation();
}

function updatePlayerGuildStatus() {
    const statusDiv = document.getElementById('player-guild-info');

    fetch(`/api/player/${gameState.playerId}/guild`)
        .then(response => response.json())
        .then(guildData => {
            if (guildData) {
                statusDiv.innerHTML = `
                    <div class="guild-status-info">
                        <h4>${guildData.guild_name}</h4>
                        <p><strong>Rank:</strong> ${guildData.rank}</p>
                        <p><strong>Joined:</strong> ${new Date(guildData.joined_at).toLocaleDateString()}</p>
                        <p><strong>Guild Level:</strong> ${guildData.level}</p>
                        <p><strong>Guild Reputation:</strong> ${guildData.reputation}</p>
                    </div>
                `;
            } else {
                statusDiv.innerHTML = `
                    <div class="guild-status-info">
                        <p class="no-guild-message">You are not a member of any guild.</p>
                        <p>Join a guild to gain bonuses and access special features!</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching guild status:', error);
            statusDiv.innerHTML = '<p style="color: #e94560;">Error loading guild status.</p>';
        });
}

function updateGuildNavigation() {
    const createBtn = document.getElementById('create-guild-btn');
    const browseBtn = document.getElementById('browse-guilds-btn');

    // Check if player is in a guild
    fetch(`/api/player/${gameState.playerId}/guild`)
        .then(response => response.json())
        .then(guildData => {
            if (guildData) {
                createBtn.style.display = 'none';
                browseBtn.textContent = 'View My Guild';
                browseBtn.onclick = () => showGuildDetails(guildData.guild_id);
            } else {
                createBtn.style.display = 'inline-block';
                browseBtn.textContent = 'Browse Guilds';
                browseBtn.onclick = showGuildList;
            }
        })
        .catch(() => {
            createBtn.style.display = 'inline-block';
            browseBtn.textContent = 'Browse Guilds';
            browseBtn.onclick = showGuildList;
        });
}

function showGuildList() {
    document.getElementById('guild-status').classList.add('hidden');
    document.getElementById('guild-list-section').classList.remove('hidden');
    document.getElementById('create-guild-section').classList.add('hidden');
    document.getElementById('guild-details-section').classList.add('hidden');
    document.getElementById('scouting-section').classList.add('hidden');

    const guildListDiv = document.getElementById('guild-list');
    guildListDiv.innerHTML = '<p style="text-align: center; color: #b0b0b0;">Loading guilds...</p>';

    fetch('/api/guilds')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(guilds => {
            if (guilds.length === 0) {
                guildListDiv.innerHTML = '<p style="text-align: center; color: #b0b0b0;">No guilds available. Be the first to create one!</p>';
                return;
            }

            guildListDiv.innerHTML = '';
            guilds.forEach(guild => {
                const guildCard = document.createElement('div');
                guildCard.className = 'guild-card';
                guildCard.innerHTML = `
                    <div class="guild-name">${guild.emblem || '🏰'} ${guild.name}</div>
                    <div class="guild-description">${guild.description || 'A mysterious guild'}</div>
                    <div class="guild-stats">
                        <span class="guild-stat">👥 ${guild.member_count}/${guild.max_members || 50} members</span>
                        <span class="guild-stat">⭐ Level ${guild.level}</span>
                        <span class="guild-stat">🏆 ${guild.reputation} reputation</span>
                    </div>
                `;
                guildCard.onclick = () => showGuildDetails(guild.id);
                guildListDiv.appendChild(guildCard);
            });
        })
        .catch(error => {
            console.error('Error loading guilds:', error);
            guildListDiv.innerHTML = '<p style="text-align: center; color: #e94560;">Error loading guilds. Please try again later.</p>';
            addGameLog('Failed to load guild list', 'error');
        });
}

function showGuildDetails(guildId) {
    document.getElementById('guild-status').classList.add('hidden');
    document.getElementById('guild-list-section').classList.add('hidden');
    document.getElementById('create-guild-section').classList.add('hidden');
    document.getElementById('guild-details-section').classList.remove('hidden');
    document.getElementById('scouting-section').classList.add('hidden');

    fetch(`/api/guilds/${guildId}`)
        .then(response => response.json())
        .then(guild => {
            const nameElement = document.getElementById('guild-details-name');
            nameElement.textContent = `${guild.emblem || '🏰'} ${guild.name}`;
            nameElement.dataset.guildId = guild.id; // Store guild ID for buttons

            const infoDiv = document.getElementById('guild-details-info');
            infoDiv.innerHTML = `
                <p><strong>Description:</strong> ${guild.description || 'No description available'}</p>
                <p><strong>Specialization:</strong> ${guild.specialization}</p>
                <p><strong>Level:</strong> ${guild.level} ${guild.level < 5 ? `(Next level at ${guild.level * 1000} reputation)` : '(Max level reached!)'}</p>
                <p><strong>Members:</strong> ${guild.member_count}/${guild.max_members || 50}</p>
                <p><strong>Reputation:</strong> ${guild.reputation}</p>
                <p><strong>Leader:</strong> ${guild.leader_name || 'Unknown'}</p>
                <p><strong>Founded:</strong> ${new Date(guild.founded_date).toLocaleDateString()}</p>
            `;

            const membersDiv = document.getElementById('guild-members-list');
            membersDiv.innerHTML = '<h4>Members</h4>';
            if (guild.members && guild.members.length > 0) {
                guild.members.forEach(member => {
                    const memberDiv = document.createElement('div');
                    memberDiv.className = 'guild-member';
                    memberDiv.innerHTML = `
                        <span class="member-name">${member.player_name} (Level ${member.level})</span>
                        <span class="member-rank ${member.rank === 'leader' ? 'leader' : ''}">${member.rank}</span>
                    `;
                    membersDiv.appendChild(memberDiv);
                });
            } else {
                membersDiv.innerHTML += '<p>No members found.</p>';
            }

            // Update action buttons
            const joinBtn = document.getElementById('join-guild-btn');
            const leaveBtn = document.getElementById('leave-guild-btn');
            const scoutingBtn = document.getElementById('guild-scouting-btn');

            fetch(`/api/player/${gameState.playerId}/guild`)
                .then(response => response.json())
                .then(playerGuild => {
                    const disbandBtn = document.getElementById('disband-guild-btn');
                    
                    if (playerGuild && playerGuild.guild_id === guildId) {
                        joinBtn.style.display = 'none';
                        leaveBtn.style.display = playerGuild.rank === 'leader' ? 'none' : 'inline-block';
                        scoutingBtn.style.display = 'inline-block';
                        disbandBtn.style.display = playerGuild.rank === 'leader' ? 'inline-block' : 'none';
                    } else if (playerGuild) {
                        joinBtn.style.display = 'none';
                        leaveBtn.style.display = 'none';
                        scoutingBtn.style.display = 'none';
                        disbandBtn.style.display = 'none';
                    } else {
                        joinBtn.style.display = 'inline-block';
                        leaveBtn.style.display = 'none';
                        scoutingBtn.style.display = 'none';
                        disbandBtn.style.display = 'none';
                    }
                });
        })
        .catch(error => {
            console.error('Error loading guild details:', error);
            addGameLog('Error loading guild details', 'error');
        });
}

function showCreateGuildForm() {
    document.getElementById('guild-status').classList.add('hidden');
    document.getElementById('guild-list-section').classList.add('hidden');
    document.getElementById('create-guild-section').classList.remove('hidden');
    document.getElementById('guild-details-section').classList.add('hidden');
    document.getElementById('scouting-section').classList.add('hidden');
}

function createGuild() {
    const nameInput = document.getElementById('guild-name');
    const descriptionInput = document.getElementById('guild-description');
    const specializationInput = document.getElementById('guild-specialization');

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const specialization = specializationInput.value;

    // Client-side validation
    if (!name) {
        addGameLog('Guild name is required', 'error');
        nameInput.focus();
        return;
    }

    if (name.length < 3 || name.length > 50) {
        addGameLog('Guild name must be between 3 and 50 characters', 'error');
        nameInput.focus();
        return;
    }

    if (description.length > 200) {
        addGameLog('Guild description must be 200 characters or less', 'error');
        descriptionInput.focus();
        return;
    }

    // Disable form during submission
    const submitBtn = document.getElementById('confirm-create-guild-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    fetch('/api/guilds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: gameState.userId,
            playerId: gameState.playerId,
            name,
            description,
            specialization
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            addGameLog(`Guild "${name}" created successfully!`, 'success');
            // Clear form
            nameInput.value = '';
            descriptionInput.value = '';
            specializationInput.value = 'warriors';
            updateGuildScreen();
        } else {
            addGameLog(result.error || 'Failed to create guild', 'error');
        }
    })
    .catch(error => {
        console.error('Error creating guild:', error);
        addGameLog('Error creating guild', 'error');
    })
    .finally(() => {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    });
}

function joinGuild(guildId) {
    fetch(`/api/guilds/${guildId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: gameState.userId,
            playerId: gameState.playerId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            addGameLog('Successfully joined the guild!', 'success');
            updateGuildScreen();
        } else {
            addGameLog(result.error || 'Failed to join guild', 'error');
        }
    })
    .catch(error => {
        console.error('Error joining guild:', error);
        addGameLog('Error joining guild', 'error');
    });
}

function leaveGuild() {
    fetch(`/api/player/${gameState.playerId}/guild`)
        .then(response => response.json())
        .then(playerGuild => {
            if (!playerGuild) {
                addGameLog('You are not in a guild', 'error');
                return;
            }

            fetch(`/api/guilds/${playerGuild.guild_id}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: gameState.userId,
                    playerId: gameState.playerId
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    addGameLog('Left the guild successfully', 'success');
                    updateGuildScreen();
                } else {
                    addGameLog(result.error || 'Failed to leave guild', 'error');
                }
            });
        })
        .catch(error => {
            console.error('Error leaving guild:', error);
            addGameLog('Error leaving guild', 'error');
        });
}

function disbandGuild(guildId) {
    if (!confirm('Are you sure you want to disband this guild? This action cannot be undone and all members will be removed.')) {
        return;
    }

    fetch(`/api/guilds/${guildId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: gameState.userId,
            playerId: gameState.playerId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            addGameLog('Guild disbanded successfully', 'success');
            updateGuildScreen();
        } else {
            addGameLog(result.error || 'Failed to disband guild', 'error');
        }
    })
    .catch(error => {
        console.error('Error disbanding guild:', error);
        addGameLog('Error disbanding guild', 'error');
    });
}

function showScoutingMissions() {
    document.getElementById('guild-status').classList.add('hidden');
    document.getElementById('guild-list-section').classList.add('hidden');
    document.getElementById('create-guild-section').classList.add('hidden');
    document.getElementById('guild-details-section').classList.add('hidden');
    document.getElementById('scouting-section').classList.remove('hidden');

    fetch(`/api/player/${gameState.playerId}/guild`)
        .then(response => response.json())
        .then(playerGuild => {
            if (!playerGuild) {
                addGameLog('You must be in a guild to access scouting missions', 'error');
                updateGuildScreen();
                return;
            }

            fetch(`/api/guilds/${playerGuild.guild_id}/scouting`)
                .then(response => response.json())
                .then(scoutingData => {
                    updateScoutingDisplay(scoutingData);
                });
        })
        .catch(error => {
            console.error('Error loading scouting missions:', error);
            addGameLog('Error loading scouting missions', 'error');
        });
}

function updateScoutingDisplay(scoutingData) {
    const activeDiv = document.getElementById('active-scouting-missions');
    const availableDiv = document.getElementById('available-scouting-missions');

    // Active missions
    activeDiv.innerHTML = '<h4>Active Missions</h4>';
    if (scoutingData.activeMissions && scoutingData.activeMissions.length > 0) {
        scoutingData.activeMissions.forEach(mission => {
            const missionDiv = document.createElement('div');
            missionDiv.className = 'scouting-mission active';
            const endTime = new Date(mission.end_time);
            const now = new Date();
            const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000 / 60)); // minutes
            const isComplete = now >= endTime;

            missionDiv.innerHTML = `
                <div class="mission-name">${mission.mission_type} Mission</div>
                <div class="mission-description">${isComplete ? 'Mission complete! Ready to collect rewards.' : 'In progress...'}</div>
                <div class="mission-duration">${isComplete ? 'Ready to complete!' : `Time remaining: ${timeLeft} minutes`}</div>
                ${isComplete ? `<button class="btn" onclick="completeScoutingMission('${mission.id}')">Complete Mission</button>` : ''}
            `;
            activeDiv.appendChild(missionDiv);
        });
    } else {
        activeDiv.innerHTML += '<p>No active missions.</p>';
    }

    // Available missions
    availableDiv.innerHTML = '<h4>Available Missions</h4>';
    const specialization = scoutingData.specialization;
    const missions = GAME_DATA.scoutingMissions[specialization] || [];

    missions.forEach(mission => {
        const missionDiv = document.createElement('div');
        missionDiv.className = 'scouting-mission';
        missionDiv.innerHTML = `
            <div class="mission-name">${mission.name}</div>
            <div class="mission-description">${mission.description}</div>
            <div class="mission-rewards">Rewards: ${mission.rewards.gold} gold, ${mission.rewards.exp} exp, ${mission.rewards.reputation} reputation</div>
            <div class="mission-duration">Duration: ${mission.duration / 1000 / 60} minutes</div>
            <button class="btn" onclick="startScoutingMission('${mission.type}', ${mission.duration})">Start Mission</button>
        `;
        availableDiv.appendChild(missionDiv);
    });
}

function startScoutingMission(missionType, duration) {
    fetch(`/api/player/${gameState.playerId}/guild`)
        .then(response => response.json())
        .then(playerGuild => {
            if (!playerGuild) {
                addGameLog('You must be in a guild to start scouting missions', 'error');
                return;
            }

            fetch(`/api/guilds/${playerGuild.guild_id}/scouting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: gameState.userId,
                    playerId: gameState.playerId,
                    missionType,
                    duration
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    addGameLog('Scouting mission started!', 'success');
                    showScoutingMissions(); // Refresh the display
                } else {
                    addGameLog(result.error || 'Failed to start scouting mission', 'error');
                }
            });
        })
        .catch(error => {
            console.error('Error starting scouting mission:', error);
            addGameLog('Error starting scouting mission', 'error');
        });
}

function completeScoutingMission(missionId) {
    fetch(`/api/scouting/${missionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playerId: gameState.playerId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            addGameLog(`Scouting mission completed! Rewards: ${result.rewards.gold} gold, ${result.rewards.exp} exp`, 'success');
            // Update player stats
            gameState.player.gold += result.rewards.gold;
            gameState.player.exp += result.rewards.exp;
            updatePlayerStats();
            showScoutingMissions(); // Refresh the display
        } else {
            addGameLog(result.error || 'Failed to complete scouting mission', 'error');
        }
    })
    .catch(error => {
        console.error('Error completing scouting mission:', error);
        addGameLog('Error completing scouting mission', 'error');
    });
}

function joinGuild(guildId) {
    fetch(`/api/guilds/${guildId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: gameState.userId,
            playerId: gameState.playerId
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            addGameLog('Successfully joined the guild!', 'success');
            updateGuildScreen();
        } else {
            addGameLog(result.error || 'Failed to join guild', 'error');
        }
    })
    .catch(error => {
        console.error('Error joining guild:', error);
        addGameLog('Error joining guild', 'error');
    });
}

function leaveGuild() {
    fetch(`/api/player/${gameState.playerId}/guild`)
        .then(response => response.json())
        .then(playerGuild => {
            if (!playerGuild) {
                addGameLog('You are not in a guild', 'error');
                return;
            }

            fetch(`/api/guilds/${playerGuild.guild_id}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: gameState.userId,
                    playerId: gameState.playerId
                })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    addGameLog('Left the guild successfully', 'success');
                    updateGuildScreen();
                } else {
                    addGameLog(result.error || 'Failed to leave guild', 'error');
                }
            });
        })
        .catch(error => {
            console.error('Error leaving guild:', error);
            addGameLog('Error leaving guild', 'error');
        });
}

// ============ CRAFTING SYSTEM ============
function getIngredientAmount(itemId) {
    if (itemId === 'gold') return gameState.player.gold;
    return gameState.player.inventory.find(i => i.id === itemId)?.quantity || 0;
}

function playerHasIngredient(itemId, quantity) {
    if (itemId === 'gold') return gameState.player.gold >= quantity;
    return getIngredientAmount(itemId) >= quantity;
}

function canCraftRecipe(recipe) {
    return gameState.player.level >= recipe.level &&
           Object.entries(recipe.ingredients).every(([itemId, amount]) => playerHasIngredient(itemId, amount));
}

function updateCraftingScreen() {
    if (!gameState.player.crafting) {
        gameState.player.crafting = { selectedRecipeId: null, sortByAvailable: false };
    }

    if (typeof gameState.player.crafting.sortByAvailable !== 'boolean') {
        gameState.player.crafting.sortByAvailable = false;
    }

    const recipesList = document.getElementById('recipes-list');
    recipesList.innerHTML = '';

    if (!Array.isArray(GAME_DATA.recipes) || GAME_DATA.recipes.length === 0) {
        recipesList.innerHTML = '<p>No crafting recipes are available yet.</p>';
        return;
    }

    if (!gameState.player.crafting.selectedRecipeId) {
        gameState.player.crafting.selectedRecipeId = GAME_DATA.recipes[0].id;
    }

    const recipes = [...GAME_DATA.recipes];
    if (gameState.player.crafting.sortByAvailable) {
        recipes.sort((a, b) => {
            const aReady = canCraftRecipe(a) ? 0 : 1;
            const bReady = canCraftRecipe(b) ? 0 : 1;
            if (aReady !== bReady) return aReady - bReady;
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });
    } else {
        recipes.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
        });
    }

    recipes.forEach(recipe => {
        const recipeItem = document.createElement('div');
        const available = canCraftRecipe(recipe);
        const selected = gameState.player.crafting.selectedRecipeId === recipe.id;
        recipeItem.dataset.recipeId = recipe.id;
        recipeItem.className = `recipe-item ${available ? 'craftable' : 'locked'}${selected ? ' selected' : ''}`;
        recipeItem.innerHTML = `
            <div class="recipe-badge ${available ? 'ready-now' : ''}">${available ? '✓ Ready Now' : '⌛'}</div>
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-requirement">Requires level ${recipe.level}</div>
            <div class="recipe-status">${available ? 'Ready' : 'Missing ingredients'}</div>
        `;
        recipeItem.addEventListener('click', () => displayRecipeDetails(recipe.id));
        recipesList.appendChild(recipeItem);
    });

    const sortToggle = document.getElementById('sort-available-toggle');
    if (sortToggle) {
        sortToggle.checked = gameState.player.crafting.sortByAvailable;
    }

    displayRecipeDetails(gameState.player.crafting.selectedRecipeId);
}

function displayRecipeDetails(recipeId) {
    const recipe = GAME_DATA.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    gameState.player.crafting.selectedRecipeId = recipeId;
    const craftingInfo = document.getElementById('craft-details');
    const item = GAME_DATA.items[recipe.output] || { name: recipe.output };
    const canCraft = canCraftRecipe(recipe);

    let ingredientsHtml = '<div class="crafting-ingredients"><strong>Ingredients</strong>';
    Object.entries(recipe.ingredients).forEach(([itemId, amount]) => {
        const ingredientName = itemId === 'gold' ? 'Gold' : (GAME_DATA.items[itemId]?.name || itemId);
        const playerHas = getIngredientAmount(itemId);
        const color = playerHas >= amount ? '#00ff00' : '#ff5c5c';
        ingredientsHtml += `<div class="ingredient-row" style="color: ${color};">• ${ingredientName}: ${playerHas}/${amount}</div>`;
    });
    ingredientsHtml += '</div>';

    const itemDetails = [];
    if (item.type) itemDetails.push(`<span>Type: ${item.type}</span>`);
    if (item.attack) itemDetails.push(`<span>Attack: +${item.attack}</span>`);
    if (item.defense) itemDetails.push(`<span>Defense: +${item.defense}</span>`);
    if (item.mp) itemDetails.push(`<span>MP: +${item.mp}</span>`);
    if (item.effect) itemDetails.push(`<span>Effect: ${item.effect}</span>`);
    if (item.value) itemDetails.push(`<span>Value: ${item.value}</span>`);

    craftingInfo.innerHTML = `
        <div class="crafting-header">
            <h3>${recipe.name}</h3>
            <div class="crafting-subtitle">Creates: ${item.name}</div>
        </div>
        <div class="recipe-requirement">Requires Level ${recipe.level}</div>
        ${itemDetails.length ? `<div class="crafted-item-details">${itemDetails.join(' · ')}</div>` : ''}
        ${ingredientsHtml}
        <div class="crafting-status ${canCraft ? 'ready' : 'blocked'}">
            ${canCraft ? 'You can craft this item now.' : 'You are missing resources or level requirements.'}
        </div>
        <div class="crafting-tracker">Items crafted: ${gameState.player.itemsCrafted}</div>
    `;

    const craftBtn = document.getElementById('craft-btn');
    craftBtn.disabled = !canCraft;
    craftBtn.dataset.recipeId = recipeId;
    craftBtn.textContent = canCraft ? `Craft ${item.name}` : 'Cannot Craft';

    const recipeItems = document.querySelectorAll('.recipe-item');
    recipeItems.forEach(node => {
        node.classList.toggle('selected', node.dataset.recipeId === recipeId);
    });
}

function craftItem(recipeId) {
    const recipe = GAME_DATA.recipes.find(r => r.id === recipeId);
    if (!recipe || !canCraftRecipe(recipe)) {
        addGameLog('Unable to craft item. Check your level and ingredients.', 'error');
        return;
    }

    Object.entries(recipe.ingredients).forEach(([itemId, amount]) => {
        if (itemId === 'gold') {
            gameState.player.gold -= amount;
        } else {
            gameState.player.removeItem(itemId, amount);
        }
    });

    const outputQuantity = recipe.quantity || 1;
    gameState.player.addItem(recipe.output, outputQuantity);
    gameState.player.itemsCrafted++;
    addGameLog(`You crafted ${outputQuantity}x ${GAME_DATA.items[recipe.output]?.name || recipe.output}!`, 'success');

    if (gameState.player.itemsCrafted >= 10) unlockAchievement('masterCrafter');
    updateCraftingScreen();
}

// ============ ACHIEVEMENTS SYSTEM ============
function updateAchievementsScreen() {
    if (!gameState.player.achievements) {
        gameState.player.achievements = {};
    }

    const achievementsList = document.getElementById('achievements-list');
    achievementsList.innerHTML = '';
    
    Object.keys(GAME_DATA.achievements).forEach(achieveId => {
        const achievement = GAME_DATA.achievements[achieveId];
        const isUnlocked = gameState.player.achievements[achieveId] === true;
        
        const achieveItem = document.createElement('div');
        achieveItem.className = `achievement-item ${isUnlocked ? '' : 'locked'}`;
        achieveItem.innerHTML = `
            <div class="achievement-name">${isUnlocked ? '⭐' : '🔒'} ${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            ${isUnlocked ? `<div class="achievement-reward">✓ Unlocked</div>` : '<div class="achievement-reward">Locked</div>'}
        `;
        achievementsList.appendChild(achieveItem);
    });
}

function unlockAchievement(achieveId) {
    if (!gameState.player.achievements) {
        gameState.player.achievements = {};
    }
    
    if (!gameState.player.achievements[achieveId]) {
        gameState.player.achievements[achieveId] = true;
        const achievement = GAME_DATA.achievements[achieveId];
        addGameLog(`Achievement Unlocked: ${achievement.name}! +${achievement.reward} Gold`, 'success');
        gameState.player.gold += achievement.reward;
    }
}

// ============ PET SYSTEM ============
function updatePetScreen() {
    const petInfo = document.getElementById('pet-info');
    
    if (gameState.player.pet && gameState.player.pet.caught) {
        const petData = gameState.player.pet;
        const pet = GAME_DATA.pets.find(p => p.id === petData.petType);
        if (pet) {
            petInfo.innerHTML = `
                <div style="text-align: center; background: rgba(20, 40, 60, 0.8); padding: 20px; border-radius: 8px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">🐾</div>
                    <div class="pet-name">${petData.name}</div>
                    <div class="pet-specie">Specie: ${petData.specie}</div>
                    <div class="pet-grade">Grade: ${petData.grade}</div>
                    <div class="pet-stats">
                        <div>HP: ${petData.hp}</div>
                        <div>MP: ${petData.mp}</div>
                        <div>Attack: ${petData.attack}</div>
                        <div>Defense: ${petData.defense}</div>
                        <div>Speed: ${petData.speed}</div>
                        <div>Level: ${petData.level}</div>
                    </div>
                    <p style="color: #b0b0b0; margin-top: 10px;">${pet.description}</p>
                    <button class="btn" id="release-pet-btn" style="margin-top: 10px;">Release Pet</button>
                </div>
            `;
            document.getElementById('release-pet-btn').addEventListener('click', releasePet);
        }
    } else {
        petInfo.innerHTML = '<p style="color: #b0b0b0; text-align: center;">You have not caught a pet yet. Look for wild pets in the wilderness!</p>';
    }

    // Remove the pet list since catching is now in wild
    const petList = document.getElementById('pets-list');
    petList.innerHTML = '';
}

function catchPet(petId) {
    if (gameState.player.pet && gameState.player.pet.caught) {
        addGameLog('You already have a pet! Release it first.', 'error');
        return;
    }
    
    gameState.player.pet = { caught: true, petType: petId, level: 1, exp: 0 };
    const pet = GAME_DATA.pets[petId];
    addGameLog(`You caught a ${pet.name}!`, 'success');
    updatePetScreen();
}

function releasePet() {
    if (gameState.player.pet && gameState.player.pet.caught) {
        const pet = GAME_DATA.pets[gameState.player.pet.petType];
        gameState.player.pet = { caught: false, petType: null, level: 1, exp: 0 };
        addGameLog(`You released your ${pet.name}!`, 'success');
        updatePetScreen();
    }
}

// ============ ENCHANTMENTS SYSTEM ============
function updateEnchantmentsScreen() {
    const enchantmentsList = document.getElementById('enchantments-list');
    enchantmentsList.innerHTML = '<h3>Enchantments</h3>';
    
    Object.keys(GAME_DATA.enchantments).forEach(enchantId => {
        const enchantment = GAME_DATA.enchantments[enchantId];
        const enchantItem = document.createElement('div');
        enchantItem.className = 'recipe-item';
        enchantItem.innerHTML = `
            <div class="recipe-name">${enchantment.name}</div>
            <div class="recipe-requirement">Cost: ${enchantment.cost} gold</div>
        `;
        enchantItem.addEventListener('click', () => displayEnchantmentDetails(enchantId));
        enchantmentsList.appendChild(enchantItem);
    });
}

function displayEnchantmentDetails(enchantId) {
    const enchantment = GAME_DATA.enchantments[enchantId];
    const enchantmentInfo = document.getElementById('enchantment-details');
    
    const canEnchant = gameState.player.gold >= enchantment.cost;
    
    enchantmentInfo.innerHTML = `
        <h3>${enchantment.name}</h3>
        <div style="margin: 10px 0;">${enchantment.description}</div>
        <strong>Effects:</strong><br>
        ${Object.entries(enchantment.bonuses).map(([stat, value]) => `${stat}: +${value}`).join('<br>')}
        <div style="margin: 10px 0;"><strong>Cost:</strong> ${enchantment.cost} gold</div>
        <div style="margin: 10px 0;"><strong>Duration:</strong> ${enchantment.duration} minutes</div>
    `;
    
    const enchantBtn = document.getElementById('enchant-btn');
    enchantBtn.disabled = !canEnchant;
    if (canEnchant) {
        enchantBtn.replaceWith(enchantBtn.cloneNode(true));
        document.getElementById('enchant-btn').addEventListener('click', () => enchantItem(enchantId));
    }
}

function enchantItem(enchantId) {
    const enchantment = GAME_DATA.enchantments[enchantId];
    
    if (gameState.player.gold < enchantment.cost) {
        addGameLog('Not enough gold!', 'error');
        return;
    }
    
    gameState.player.gold -= enchantment.cost;
    
    // Apply enchantment bonuses temporarily
    if (!gameState.player.activeEnchantments) {
        gameState.player.activeEnchantments = {};
    }
    
    gameState.player.activeEnchantments[enchantId] = {
        bonuses: enchantment.bonuses,
        expiresAt: Date.now() + (enchantment.duration * 60 * 1000)
    };
    
    addGameLog(`Applied ${enchantment.name} enchantment!`, 'success');
    updateEnchantmentsScreen();
    updateUI();
}

function updateClassesScreen() {
    const currentClassInfo = document.getElementById('current-class-info');
    const classData = GAME_DATA.classes[gameState.player.classType] || GAME_DATA.hiddenClasses[gameState.player.classType];
    
    currentClassInfo.innerHTML = `
        <div style="text-align: center; background: rgba(20, 40, 60, 0.8); padding: 20px; border-radius: 8px;">
            <h4 style="color: #ffd700;">${classData.name}</h4>
            <p style="color: #b0b0b0;">${classData.description}</p>
            <div style="margin-top: 10px;">
                <strong>HP:</strong> ${classData.baseHP} | <strong>MP:</strong> ${classData.baseMP}<br>
                <strong>Attack:</strong> ${classData.baseAttack} | <strong>Defense:</strong> ${classData.baseDefense} | <strong>Speed:</strong> ${classData.baseSpeed}
            </div>
        </div>
    `;

    document.getElementById('prestige-level').textContent = gameState.player.prestige;
    document.getElementById('prestige-btn').addEventListener('click', prestigePlayer);

    const availableClassesList = document.getElementById('available-classes-list');
    availableClassesList.innerHTML = '';
    
    // Show base classes
    Object.keys(GAME_DATA.classes).forEach(classId => {
        const cls = GAME_DATA.classes[classId];
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.innerHTML = `
            <div class="class-name">${cls.name}</div>
            <div class="class-description">${cls.description}</div>
            <button class="btn" id="select-${classId}-btn" ${gameState.player.classType === classId ? 'disabled' : ''}>${gameState.player.classType === classId ? 'Current' : 'Select'}</button>
        `;
        availableClassesList.appendChild(classCard);
        if (gameState.player.classType !== classId) {
            document.getElementById(`select-${classId}-btn`).addEventListener('click', () => changeClass(classId));
        }
    });
    
    // Show unlocked hidden classes only if they are unlocked
    if (gameState.player.unlockedClasses) {
        Object.keys(gameState.player.unlockedClasses).forEach(classId => {
            if (gameState.player.unlockedClasses[classId] && GAME_DATA.hiddenClasses[classId]) {
                const cls = GAME_DATA.hiddenClasses[classId];
                const classCard = document.createElement('div');
                classCard.className = 'class-card hidden-class-unlock';
                classCard.innerHTML = `
                    <div class="class-name">⭐ ${cls.name} (Hidden)</div>
                    <div class="class-description">${cls.description}</div>
                    <div class="unlock-progress">${cls.specialAbility}</div>
                    <button class="btn" id="select-${classId}-btn" ${gameState.player.classType === classId ? 'disabled' : ''}>${gameState.player.classType === classId ? 'Current' : 'Select'}</button>
                `;
                availableClassesList.appendChild(classCard);
                if (gameState.player.classType !== classId) {
                    document.getElementById(`select-${classId}-btn`).addEventListener('click', () => changeClass(classId));
                }
            }
        });
    }
}

function resetGame() {
    gameState = { 
        player: null, 
        gameStarted: false,
        userId: gameState.userId,
        username: gameState.username,
        isServerMode: gameState.isServerMode
    };
    document.getElementById('character-name').value = '';

    document.querySelectorAll('.class-option').forEach(opt => opt.classList.remove('selected'));
    showScreen('login');
}

// Make startScoutingMission globally available for HTML onclick
window.startScoutingMission = startScoutingMission;
window.completeScoutingMission = completeScoutingMission;

// Periodic check for completed scouting missions and refresh active screen
setInterval(() => {
    // Only refresh if guild screen is active and scouting section is visible
    const guildScreen = document.getElementById('guild-screen');
    const scoutingSection = document.getElementById('scouting-section');

    if (gameState.playerId &&
        guildScreen &&
        !guildScreen.classList.contains('hidden') &&
        scoutingSection &&
        !scoutingSection.classList.contains('hidden')) {

        fetch(`/api/player/${gameState.playerId}/guild`)
            .then(response => response.json())
            .then(playerGuild => {
                if (playerGuild) {
                    fetch(`/api/guilds/${playerGuild.guild_id}/scouting`)
                        .then(response => response.json())
                        .then(scoutingData => {
                            // Check for newly completed missions
                            if (scoutingData.activeMissions) {
                                const now = new Date();
                                const hasNewCompletions = scoutingData.activeMissions.some(mission => {
                                    const endTime = new Date(mission.end_time);
                                    return now >= endTime && !mission.completed;
                                });

                                if (hasNewCompletions) {
                                    addGameLog('A scouting mission has completed!', 'success');
                                }
                            }
                            updateScoutingDisplay(scoutingData);
                        })
                        .catch(error => {
                            console.error('Error refreshing scouting missions:', error);
                        });
                }
            })
            .catch(error => {
                console.error('Error checking guild status for refresh:', error);
            });
    }
}, 10000); // Check every 10 seconds when scouting screen is active
