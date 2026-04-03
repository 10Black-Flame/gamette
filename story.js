// Main Game Engine for Chronicles of Aetheria

class Player {
    constructor(name, classType) {
        this.name = name;
        this.classType = classType;
        const classData = GAME_DATA.classes[classType];
        
        this.maxHP = classData.baseHP;
        this.hp = this.maxHP;
        this.maxMP = classData.baseMP;
        this.mp = this.maxMP;
        this.attack = classData.baseAttack;
        this.defense = classData.baseDefense;
        this.speed = classData.baseSpeed;
        
        this.level = 1;
        this.exp = 0;
        this.expToLevel = 500;
        this.gold = 100;
        
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
        this.expToLevel = Math.floor(this.expToLevel * 1.1);
        
        this.maxHP += 10;
        this.hp = this.maxHP;
        this.maxMP += 5;
        this.mp = this.maxMP;
        this.attack += 2;
        this.defense += 1;
        
        addGameLog(`Level Up! You are now level ${this.level}!`, 'success');
        playLevelUpSound();
        
        // Check level-based achievements
        if (this.level >= 5) unlockAchievement('risingHero');
        if (this.level >= 10) unlockAchievement('legendaryHero');
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

    takeDamage(damage) {
        const actualDamage = Math.max(damage - Math.floor(this.defense / 2), 1);
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
        
        // Paladin: Reach level 10 with Warrior
        if (this.classType === 'warrior' && this.level >= 10 && !this.unlockedClasses) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.paladin = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Paladin! You can now switch to this class.', 'success');
        }
        
        // Necromancer: Defeat 50 enemies
        if (this.enemiesKilled >= 50 && !this.unlockedClasses) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.necromancer = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Necromancer! You can now switch to this class.', 'success');
        }
        
        // Druid: Visit forest 10 times
        if (this.locationsVisited.has('forest') && !this.unlockedClasses) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.druid = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Druid! You can now switch to this class.', 'success');
        }
        
        // Shadow Assassin: Kill 20 enemies without taking damage
        if (this.damageTakenInCombat === 0 && this.enemiesKilled >= 20 && !this.unlockedClasses) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.shadowAssassin = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Shadow Assassin! You can now switch to this class.', 'success');
        }
        
        // Demon Hunter: Already checked in levelUp
        if (this.level >= 15 && !this.unlockedClasses) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.demonHunter = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Demon Hunter! You can now switch to this class.', 'success');
        }
        
        // Time Mage: Survive 100 days (need world time tracking)
        if (worldTime && worldTime.totalDays >= 100 && !this.unlockedClasses) {
            this.unlockedClasses = this.unlockedClasses || {};
            this.unlockedClasses.timeMage = true;
            unlockAchievement('secretRevealed');
            addGameLog('Hidden class unlocked: Time Mage! You can now switch to this class.', 'success');
        }
        
        // Warlock: Use 100 spells
        if (this.spellsCast >= 100 && !this.unlockedClasses) {
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
    isServerMode: false // Set to true if server is running
};

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
    const savedData = localStorage.getItem('aetheria_save');
    if (!savedData) return false;

    try {
        const save = JSON.parse(savedData);
        if (save.player && save.player.name && save.username === gameState.username) {
            const load = confirm(`Saved game found for ${save.player.name}. Load it now?`);
            if (load) {
                loadGame();
                return true;
            }
        }
    } catch (err) {
        console.error('Unable to parse saved game data', err);
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
        player: null
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
    document.getElementById('pet-btn').addEventListener('click', () => showScreen('pet'));
    document.getElementById('enchantments-btn').addEventListener('click', () => showScreen('enchantments'));
    document.getElementById('classes-btn').addEventListener('click', () => showScreen('classes'));
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Close Buttons
    document.getElementById('close-inventory-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-quests-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-map-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('scan-map-btn').addEventListener('click', () => scanForClues('map'));
    document.getElementById('close-guild-btn').addEventListener('click', () => showScreen('mainGame'));
    document.getElementById('close-crafting-btn').addEventListener('click', () => showScreen('mainGame'));
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

    // Update Enemies
    if (location.enemies && location.enemies.length > 0) {
        location.enemies.forEach(enemyId => {
            const enemy = GAME_DATA.enemies[enemyId];
            if (enemy) {
                const enemyElement = createEnemyElement(enemy);
                npcsList.appendChild(enemyElement);
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
    
    element.innerHTML = `
        <div class="npc-item-header">${npc.name}${intelligenceIcon}${emotionDisplay}</div>
        <div class="npc-item-description">${npc.description}${personalityText}${npcInfo}</div>
    `;
    element.addEventListener('click', () => interactWithNPC(npc));
    return element;
}

function createEnemyElement(enemy) {
    const element = document.createElement('div');
    element.className = 'npc-item';
    element.style.borderColor = '#e94560';
    element.innerHTML = `
        <div class="npc-item-header" style="color: #e94560;">⚔️ ${enemy.name}</div>
        <div class="npc-item-description">HP: ${enemy.hp} | Attack: ${enemy.attack}</div>
    `;
    element.addEventListener('click', () => startCombat(enemy));
    return element;
}

function createItemElement(item) {
    const element = document.createElement('div');
    element.className = 'item-item';
    element.innerHTML = `
        <div><strong>${item.name}</strong></div>
        <div>Value: ${item.gold} gold</div>
    `;
    element.addEventListener('click', () => pickUpItem(item));
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
        openShop(npc);
        return;
    } else if (npc.type === 'quest_giver') {
        if (offerQuestToPlayer(npc)) return;
    }
    
    alert(`${npc.name}${emotionModifier}: "${dialogue}"`);
}

function openShop(npc) {
    document.getElementById('shop-name').textContent = `${npc.name}'s Shop`;
    const shopItemsList = document.getElementById('shop-items-list');
    shopItemsList.innerHTML = '';

    let shopItems = [];
    if (npc.offers === 'rest') shopItems = ['herb', 'mushroom'];
    else if (npc.offers === 'equipment') shopItems = ['sword', 'shield', 'dark_armor'];
    else if (npc.offers === 'potions') shopItems = ['herb', 'mushroom', 'mana_potion'];

    shopItems.forEach(itemId => {
        const item = GAME_DATA.items[itemId];
        if (item) {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            shopItem.innerHTML = `
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-price">${item.gold} gold</div>
            `;
            shopItem.addEventListener('click', () => buyItem(item));
            shopItemsList.appendChild(shopItem);
        }
    });

    document.getElementById('player-gold').textContent = gameState.player.gold;
    showScreen('shop');
}

function buyItem(item) {
    if (gameState.player.gold >= item.gold) {
        gameState.player.gold -= item.gold;
        gameState.player.addItem(item.id);
        addGameLog(`Bought ${item.name} for ${item.gold} gold`);
        updateUI();
    } else {
        alert('Not enough gold!');
    }
}

function pickUpItem(item) {
    gameState.player.addItem(item.id);
    const location = GAME_DATA.locations[gameState.player.currentLocation];
    location.items = location.items.filter(id => id !== item.id);
    addGameLog(`Picked up ${item.name}`);
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
            gameState.player.quests[questId] = {
                id: questId,
                status: 'completed',
                completed: true,
                giver: npc.id || null
            };
            rewardQuest(questId);
            addGameLog(`System quest completed: ${quest.title}`, 'success');
            return true;
        }

        const accept = confirm(`${npc.name}: "${quest.description}"
Do you accept the quest \"${quest.title}\"?`);
        if (!accept) {
            return true;
        }

        gameState.player.quests[questId] = {
            id: questId,
            status: 'accepted',
            completed: false,
            giver: npc.id || null
        };
        addGameLog(`Accepted quest: ${quest.title}`, 'success');
        updateQuestsScreen();
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
    updateUI();
    updateQuestsScreen();
}

function rewardQuest(questId) {
    const quest = GAME_DATA.quests[questId];
    if (!quest) return;
    if (quest.reward) {
        gameState.player.gold += quest.reward;
    }
    if (quest.rewardItem) {
        gameState.player.addItem(quest.rewardItem, 1);
        addGameLog(`Received item: ${GAME_DATA.items[quest.rewardItem].name}`, 'success');
    }
}

function checkQuestCompletion(questId) {
    if (!gameState.player.quests[questId]) return false;
    const quest = GAME_DATA.quests[questId];
    if (!quest) return false;

    switch (questId) {
        case 'defeat_shadow_lord':
            return gameState.player.questProgress?.defeat_shadow_lord === true;
        case 'find_ancient_tome':
            return gameState.player.inventory.some(item => item.id === 'ancient_tome');
        case 'deliver_message':
            return gameState.player.currentLocation === 'forest';
        case 'translate_ancient_text':
            return gameState.player.questProgress?.translate_ancient_text === true;
        default:
            return false;
    }
}

function updateQuestsScreen() {
    const questsList = document.getElementById('quests-list');
    questsList.innerHTML = '';

    const activeQuests = Object.values(gameState.player.quests || {}).filter(q => q.status === 'accepted' || q.completed);
    if (activeQuests.length === 0) {
        questsList.innerHTML = '<p>No accepted quests yet. Talk to quest givers to accept new tasks.</p>';
        return;
    }

    activeQuests.forEach(playerQuest => {
        const quest = GAME_DATA.quests[playerQuest.id];
        if (!quest) return;
        const questItem = document.createElement('div');
        questItem.className = playerQuest.completed ? 'quest-item completed' : 'quest-item';
        questItem.innerHTML = `
            <div class="quest-title">${quest.title} ${playerQuest.completed ? '✓' : ''}</div>
            <div class="quest-description">${quest.description}</div>
            <div class="quest-status">Status: ${playerQuest.completed ? 'Completed' : 'Accepted'}</div>
            <div class="quest-reward">Reward: ${quest.reward} gold</div>
        `;
        questsList.appendChild(questItem);
    });
}

// ============ COMBAT SYSTEM ============
function startCombat(enemy) {
    gameState.player.inCombat = true;
    gameState.player.currentEnemy = JSON.parse(JSON.stringify(enemy));
    gameState.player.currentEnemy.hp = enemy.hp;
    gameState.player.damageTakenInCombat = 0; // Reset damage tracking

    document.getElementById('location-view').classList.add('hidden');
    document.getElementById('combat-view').classList.remove('hidden');
    document.getElementById('enemy-name').textContent = enemy.name;

    addGameLog(`Combat started with ${enemy.name}!`);
    updateCombatUI();
}

function updateCombatUI() {
    const enemy = gameState.player.currentEnemy;
    const player = gameState.player;

    // Update health bars
    const playerHealthPercent = Math.max(0, Math.min(100, (player.hp / player.maxHP) * 100));
    const enemyMaxHP = GAME_DATA.enemies[enemy.id]?.hp || enemy.hp || 1;
    const enemyHealthPercent = Math.max(0, Math.min(100, (enemy.hp / enemyMaxHP) * 100));

    document.getElementById('player-health-bar').style.width = playerHealthPercent + '%';
    document.getElementById('enemy-health-bar').style.width = enemyHealthPercent + '%';

    document.getElementById('player-health-text').textContent = `${player.hp}/${player.maxHP}`;
    document.getElementById('enemy-health-text').textContent = `${enemy.hp}/${GAME_DATA.enemies[enemy.id].hp}`;
}

function combatAttack() {
    playClickSound();
    const damage = Math.floor(gameState.player.attack + Math.random() * 5);
    gameState.player.currentEnemy.hp = Math.max(0, gameState.player.currentEnemy.hp - damage);

    addGameLog(`You attacked for ${damage} damage!`, 'player');
    updateCombatUI();

    if (gameState.player.currentEnemy.hp <= 0) {
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

    gameState.player.mp -= 15;
    gameState.player.spellsCast++;
    const damage = Math.floor(gameState.player.attack * 1.5 + Math.random() * 10);
    gameState.player.currentEnemy.hp = Math.max(0, gameState.player.currentEnemy.hp - damage);

    addGameLog(`You cast a spell dealing ${damage} damage!`, 'player');
    updateCombatUI();

    if (gameState.player.currentEnemy.hp <= 0) {
        endCombat(true);
        return;
    }

    enemyTurn();
}

function combatDefend() {
    const reduction = 5;
    addGameLog(`You take a defensive stance, reducing damage by ${reduction}!`, 'player');
    enemyTurn(reduction);
}

function combatFlee() {
    const fleeChance = 0.4;
    if (Math.random() < fleeChance) {
        addGameLog(`You successfully fled from combat!`);
        endCombat(false);
    } else {
        addGameLog(`Failed to flee!`);
        enemyTurn();
    }
}

function enemyTurn(defenseBonus = 0) {
    const enemy = gameState.player.currentEnemy;
    const damage = Math.floor(enemy.attack + Math.random() * 3) - defenseBonus;
    const actualDamage = gameState.player.takeDamage(damage);

    addGameLog(`${enemy.name} attacks for ${actualDamage} damage!`, 'enemy');

    if (gameState.player.hp <= 0) {
        endCombat(false);
        return;
    }

    updateCombatUI();
}

function endCombat(victory) {
    gameState.player.inCombat = false;
    const enemy = gameState.player.currentEnemy;

    if (victory) {
        const rewards = GAME_DATA.enemies[enemy.id];
        gameState.player.gainExp(rewards.exp);
        gameState.player.gold += rewards.gold;
        gameState.player.enemiesKilled++;

        addGameLog(`Victory! You gained ${rewards.exp} exp and ${rewards.gold} gold!`, 'success');

        // Random item drop
        if (rewards.drops && rewards.drops.length > 0) {
            const droppedItem = rewards.drops[Math.floor(Math.random() * rewards.drops.length)];
            gameState.player.addItem(droppedItem);
            addGameLog(`You found: ${GAME_DATA.items[droppedItem].name}`);
            gameState.player.treasuresFound++;
        }

        // Achievement checks
        if (gameState.player.enemiesKilled === 1) unlockAchievement('firstBlood');
        if (enemy.name.toLowerCase().includes('dragon')) unlockAchievement('dragonSlayer');
        if (enemy.name === 'Shadow Lord') unlockAchievement('shadowLordVictory');
        
        gameState.player.checkHiddenClassUnlock();

        // Check quest completion
        if (enemy.name === 'Shadow Lord') {
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

        // Display a read button for books
        if (itemData.type === 'book') {
            itemSlot.innerHTML = `
                <strong>${itemData.name}</strong> x${item.quantity}
                <br><small>Book</small>
                <br><button class="btn btn-secondary read-book-btn">Read</button>
            `;
            const readBtn = itemSlot.querySelector('.read-book-btn');
            readBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                readBook(item.id);
            });
        } else {
            itemSlot.innerHTML = `
                <strong>${itemData.name}</strong> x${item.quantity}
                <br><small>Value: ${itemData.gold} gold</small>
            `;
            itemSlot.addEventListener('click', () => useItem(item.id));
        }

        inventoryList.appendChild(itemSlot);
    });

    if (gameState.player.inventory.length === 0) {
        inventoryList.innerHTML = '<p>Inventory is empty</p>';
    }
}

function readBook(bookId) {
    const bookData = GAME_DATA.items[bookId];
    const content = BOOK_CONTENT[bookId] || 'This book has beens etched in ancient script that is partially illegible.';

    showScreen('bookReader');
    document.getElementById('book-reader-title').textContent = bookData.name;
    document.getElementById('book-reader-content').textContent = content;

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
function saveGame() {
    if (!confirm('Save your current progress?')) {
        return;
    }
    const saveData = {
        username: gameState.username,
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
            unlockedClasses: gameState.player.unlockedClasses
        }
    };

    // Save locally
    localStorage.setItem('aetheria_save', JSON.stringify(saveData));
    
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

function loadGame() {
    const savedData = localStorage.getItem('aetheria_save');
    if (savedData) {
        const save = JSON.parse(savedData);
        gameState.player = new Player(save.player.name, save.player.classType);

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
        gameState.player.inventory = save.player.inventory;
        gameState.player.currentLocation = save.player.currentLocation;
        gameState.player.quests = save.player.quests;
        gameState.player.unlockedClasses = save.player.unlockedClasses || {};

        gameState.gameStarted = true;
        showScreen('mainGame');
        updateUI();
        loadLocation(save.player.currentLocation);
    }
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
function updateCraftingScreen() {
    if (!gameState.player.crafting) {
        gameState.player.crafting = { recipes: [] };
    }

    const recipesList = document.getElementById('recipes-list');
    recipesList.innerHTML = '<h3>Recipes</h3>';
    
    Object.keys(GAME_DATA.recipes).forEach(recipeId => {
        const recipe = GAME_DATA.recipes[recipeId];
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        recipeItem.innerHTML = `
            <div class="recipe-name">${recipe.name}</div>
            <div class="recipe-requirement">Level ${recipe.requiredLevel}</div>
        `;
        recipeItem.addEventListener('click', () => displayRecipeDetails(recipeId));
        recipesList.appendChild(recipeItem);
    });
}

function displayRecipeDetails(recipeId) {
    const recipe = GAME_DATA.recipes[recipeId];
    const craftingInfo = document.getElementById('craft-details');
    
    const canCraft = gameState.player.level >= recipe.requiredLevel && 
                     recipe.ingredients.every(ing => {
                         const item = gameState.player.inventory.find(i => i.id === ing.itemId);
                         return item && item.quantity >= ing.quantity;
                     });
    
    let ingredientsHtml = '<strong>Ingredients:</strong><br>';
    recipe.ingredients.forEach(ing => {
        const item = GAME_DATA.items[ing.itemId];
        const playerHas = gameState.player.inventory.find(i => i.id === ing.itemId)?.quantity || 0;
        const color = playerHas >= ing.quantity ? '#00ff00' : '#ff0000';
        ingredientsHtml += `<div style="color: ${color};">• ${item.name} (${playerHas}/${ing.quantity})</div>`;
    });

    craftingInfo.innerHTML = `
        <h3>${recipe.name}</h3>
        <div class="recipe-requirement">Level ${recipe.requiredLevel}</div>
        <div style="margin: 10px 0;">${ingredientsHtml}</div>
        <strong>Creates:</strong> ${GAME_DATA.items[recipe.createsItem].name}
    `;
    
    const craftBtn = document.getElementById('craft-btn');
    craftBtn.disabled = !canCraft;
    if (canCraft) {
        craftBtn.replaceWith(craftBtn.cloneNode(true));
        document.getElementById('craft-btn').addEventListener('click', () => craftItem(recipeId));
    }
}

function craftItem(recipeId) {
    const recipe = GAME_DATA.recipes[recipeId];
    
    // Consume ingredients
    recipe.ingredients.forEach(ing => {
        gameState.player.removeItem(ing.itemId, ing.quantity);
    });
    
    // Create item
    gameState.player.addItem(recipe.createsItem, recipe.quantity);
    gameState.player.itemsCrafted++;
    addGameLog(`You crafted ${recipe.quantity}x ${GAME_DATA.items[recipe.createsItem].name}!`, 'success');
    
    // Check crafting achievement
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
    
    if (gameState.player.pet.caught) {
        const pet = GAME_DATA.pets[gameState.player.pet.petType];
        petInfo.innerHTML = `
            <div style="text-align: center; background: rgba(20, 40, 60, 0.8); padding: 20px; border-radius: 8px;">
                <div style="font-size: 3em; margin-bottom: 10px;">${pet.emoji}</div>
                <div class="pet-name">${pet.name}</div>
                <div class="pet-rarity" style="margin: 10px 0;">⭐ ${pet.rarity}</div>
                <div class="pet-description">Level ${gameState.player.pet.level}</div>
                <p style="color: #b0b0b0; margin-top: 10px;">${pet.description}</p>
                <button class="btn" id="release-pet-btn" style="margin-top: 10px;">Release Pet</button>
            </div>
        `;
        document.getElementById('release-pet-btn').addEventListener('click', releasePet);
    } else {
        petInfo.innerHTML = '<p style="color: #b0b0b0; text-align: center;">You have not caught a pet yet.</p>';
    }

    const petList = document.getElementById('pets-list');
    petList.innerHTML = '';
    petList.className = 'pet-grid';
    
    Object.keys(GAME_DATA.pets).forEach(petId => {
        const pet = GAME_DATA.pets[petId];
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        petCard.innerHTML = `
            <div class="pet-emoji">${pet.emoji}</div>
            <div class="pet-name">${pet.name}</div>
            <div class="pet-rarity">⭐ ${pet.rarity}</div>
            <button class="btn" id="catch-${petId}-btn" style="margin-top: 8px; width: 100%;">Catch</button>
        `;
        petList.appendChild(petCard);
        document.getElementById(`catch-${petId}-btn`).addEventListener('click', () => catchPet(petId));
    });
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
