// Game Configuration File
// Adjust these settings to customize the game experience

const GAME_CONFIG = {
    // Difficulty Settings
    difficulty: {
        name: 'normal', // 'easy', 'normal', 'hard'
        enemyDamageMultiplier: 1.0,
        enemyHPMultiplier: 1.0,
        expReward: 1.0,
        goldReward: 1.0
    },

    // Combat Settings
    combat: {
        enemyTurnDelay: 800, // milliseconds before enemy attacks
        combatLogSize: 500, // height of combat log in pixels
        criticalChance: 0.1, // 10% chance for critical hit
        criticalDamageMultiplier: 1.5
    },

    // UI Settings
    ui: {
        showFPS: false,
        animationSpeed: 0.3, // seconds
        soundEnabled: false, // future feature
        musicVolume: 0.7
    },

    // Economy Settings
    economy: {
        startingGold: 100,
        vendorMarkup: 1.5, // 50% markup on item prices
        sellValue: 0.4 // 40% of buy price
    },

    // Progression Settings
    progression: {
        baseExpToLevel: 500,
        expFormula: 1.1, // multiplier for next level requirement
        maxLevel: 99,
        levelUpHPGain: 10,
        levelUpMPGain: 5,
        levelUpAttackGain: 2,
        levelUpDefenseGain: 1
    },

    // World Settings
    world: {
        startingLocation: 'village',
        dayNightCycle: false, // future feature
        weatherSystem: false, // future feature
        enemyRespawn: true,
        respawnTime: 300000 // 5 minutes
    },

    // Feature Flags
    features: {
        crafting: false, // future feature
        guilds: false, // future feature
        pvp: false, // future feature
        multiplayer: false, // future feature
        achievements: false, // future feature
        leaderboard: true
    }
};

// Apply difficulty settings
function applyDifficulty() {
    const difficultySettings = {
        easy: {
            enemyDamageMultiplier: 0.7,
            enemyHPMultiplier: 0.8,
            expReward: 1.25,
            goldReward: 1.25
        },
        normal: {
            enemyDamageMultiplier: 1.0,
            enemyHPMultiplier: 1.0,
            expReward: 1.0,
            goldReward: 1.0
        },
        hard: {
            enemyDamageMultiplier: 1.3,
            enemyHPMultiplier: 1.2,
            expReward: 1.5,
            goldReward: 0.8
        }
    };

    return difficultySettings[GAME_CONFIG.difficulty.name] || difficultySettings.normal;
}
