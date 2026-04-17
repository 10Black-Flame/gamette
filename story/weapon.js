export class Weapon {
    constructor({
        id,
        name,
        type,
        damage = 0,
        attackSpeed = 1,
        rarity = "common", // common, rare, epic, legendary
        element = null, // fire, lightning, ice, poison, dark, etc
        durability,
        stats: {
            strength = 0,
            agility = 0,
            intelligence = 0,
        } = {},
        effects = [],
        description = "",
        levelRequired = 1,
        allowedClasses = [],
    } = {}) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.damage = damage;
        this.attackSpeed = attackSpeed;
        this.rarity = rarity;
        this.element = element;
        this.maxDurability = durability ?? this.getDefaultDurability(rarity);
        this.currentDurability = this.maxDurability;
        this.stats = {
            strength,
            agility,
            intelligence,
        };
        this.effects = Array.isArray(effects) ? [...effects] : [];
        this.description = description;
        this.levelRequired = levelRequired;
        this.allowedClasses = Array.isArray(allowedClasses) ? allowedClasses : [];
        this.enchantmentSlots = this.getEnchantmentSlots(rarity);
        this.enchantments = [];
    }

    getDefaultDurability(rarity) {
        if (rarity === "legendary") {
            return Infinity;
        }

        const durabilityByRarity = {
            common: 100,
            rare: 125,
            epic: 150,
        };

        return durabilityByRarity[rarity] ?? 100;
    }

    getEnchantmentSlots(rarity) {
        const slotsByRarity = {
            common: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
        };
        return slotsByRarity[rarity] ?? 1;
    }

    canBeUsedBy(playerClass) {
        if (this.allowedClasses.length === 0) {
            return true; // Available to all classes by default
        }
        return this.allowedClasses.includes(playerClass);
    }

    canBeEquippedByPlayer(player) {
        if (player.level < this.levelRequired) {
            return false;
        }
        return this.canBeUsedBy(player.classType);
    }

    getDurabilityPercent() {
        if (this.maxDurability === Infinity) {
            return 100;
        }
        return Math.floor((this.currentDurability / this.maxDurability) * 100);
    }

    getDurabilityStatus() {
        const percent = this.getDurabilityPercent();
        if (percent === 100) return "Perfect";
        if (percent >= 75) return "Good";
        if (percent >= 50) return "Fair";
        if (percent >= 25) return "Poor";
        return "Critical";
    }

    degrade(amount = 1) {
        if (this.maxDurability === Infinity) {
            return { success: true, currentDurability: Infinity };
        }
        
        this.currentDurability = Math.max(0, this.currentDurability - amount);
        return { success: true, currentDurability: this.currentDurability };
    }

    repair(amount = null) {
        if (this.maxDurability === Infinity) {
            return { success: true, currentDurability: Infinity };
        }

        if (amount === null) {
            this.currentDurability = this.maxDurability;
        } else {
            this.currentDurability = Math.min(this.maxDurability, this.currentDurability + amount);
        }

        return { success: true, currentDurability: this.currentDurability };
    }

    addEnchantment(enchantmentData) {
        if (this.enchantments.length >= this.enchantmentSlots) {
            return { success: false, reason: "no_slots_available" };
        }

        if (this.enchantments.find(e => e.id === enchantmentData.id)) {
            return { success: false, reason: "already_enchanted" };
        }

        this.enchantments.push({
            id: enchantmentData.id,
            name: enchantmentData.name,
            rarity: enchantmentData.rarity,
            stats: enchantmentData.stats,
            effects: enchantmentData.effects,
        });

        return { success: true, enchantmentCount: this.enchantments.length };
    }

    removeEnchantment(enchantmentId) {
        const index = this.enchantments.findIndex(e => e.id === enchantmentId);
        if (index === -1) {
            return { success: false, reason: "enchantment_not_found" };
        }

        this.enchantments.splice(index, 1);
        return { success: true, enchantmentCount: this.enchantments.length };
    }

    getTotalStats() {
        const totalStats = { ...this.stats };
        
        // Add stats from enchantments
        this.enchantments.forEach(ench => {
            if (ench.stats) {
                Object.keys(ench.stats).forEach(stat => {
                    totalStats[stat] = (totalStats[stat] || 0) + ench.stats[stat];
                });
            }
        });

        return totalStats;
    }
}

export const WEAPON_DEFINITIONS = {
    // ================= COMMON WEAPONS =================
    // Common items should be the most numerous and easiest to find.

    wooden_sword: {
        id: "wooden_sword",
        name: "Wooden Sword",
        type: "melee",
        damage: 5,
        attackSpeed: 1.5,
        rarity: "common",
        element: null,
        stats: { strength: 1, agility: 0, intelligence: 0 },
        effects: [],
        description: "A basic training sword."
    },

    rusty_sword: {
        id: "rusty_sword",
        name: "Rusty Sword",
        type: "melee",
        damage: 6,
        attackSpeed: 1.4,
        rarity: "common",
        element: null,
        stats: { strength: 1, agility: 0, intelligence: 0 },
        effects: [],
        description: "Old but still usable."
    },

    bronze_dagger: {
        id: "bronze_dagger",
        name: "Bronze Dagger",
        type: "melee",
        damage: 5,
        attackSpeed: 2.0,
        rarity: "common",
        element: null,
        stats: { strength: 0, agility: 2, intelligence: 0 },
        effects: [],
        description: "A light weapon for quick attacks."
    },

    training_staff: {
        id: "training_staff",
        name: "Training Staff",
        type: "magic",
        damage: 6,
        attackSpeed: 1.3,
        rarity: "common",
        element: null,
        stats: { strength: 0, agility: 0, intelligence: 2 },
        effects: [],
        description: "A staff used by beginner mages."
    },

    short_bow: {
        id: "short_bow",
        name: "Short Bow",
        type: "ranged",
        damage: 7,
        attackSpeed: 1.5,
        rarity: "common",
        element: null,
        stats: { strength: 0, agility: 2, intelligence: 0 },
        effects: [],
        description: "A simple and reliable bow."
    },

    iron_sword: {
        id: "iron_sword",
        name: "Iron Sword",
        type: "melee",
        damage: 10,
        attackSpeed: 1.2,
        rarity: "common",
        element: null,
        stats: { strength: 2, agility: 0, intelligence: 0 },
        effects: [],
        description: "A basic iron sword."
    },

    iron_shield: {
        id: "iron_shield",
        name: "Iron Shield",
        type: "defense",
        damage: 4,
        attackSpeed: 0.8,
        rarity: "common",
        element: null,
        stats: { strength: 3, agility: 0, intelligence: 0 },
        effects: [{ type: "block_boost", percent: 0.1 }],
        description: "A sturdy shield that can also be used to bash enemies."
    },

    hunter_knife: {
        id: "hunter_knife",
        name: "Hunter Knife",
        type: "melee",
        damage: 6,
        attackSpeed: 1.9,
        rarity: "common",
        element: null,
        stats: { strength: 0, agility: 2, intelligence: 0 },
        effects: [],
        description: "A quick blade used by scouts and hunters."
    },

    oak_spear: {
        id: "oak_spear",
        name: "Oak Spear",
        type: "melee",
        damage: 8,
        attackSpeed: 1.3,
        rarity: "common",
        element: null,
        stats: { strength: 1, agility: 1, intelligence: 0 },
        effects: [],
        description: "A simple spear carved from strong oak."
    },

    simple_wand: {
        id: "simple_wand",
        name: "Simple Wand",
        type: "magic",
        damage: 7,
        attackSpeed: 1.4,
        rarity: "common",
        element: null,
        stats: { strength: 0, agility: 0, intelligence: 2 },
        effects: [],
        description: "A basic wand for apprentice spellcasters."
    },

    stone_hammer: {
        id: "stone_hammer",
        name: "Stone Hammer",
        type: "melee",
        damage: 9,
        attackSpeed: 1.0,
        rarity: "common",
        element: null,
        stats: { strength: 2, agility: 0, intelligence: 0 },
        effects: [],
        description: "A crude but heavy hammer."
    },

    leather_whip: {
        id: "leather_whip",
        name: "Leather Whip",
        type: "melee",
        damage: 6,
        attackSpeed: 1.8,
        rarity: "common",
        element: null,
        stats: { strength: 0, agility: 2, intelligence: 0 },
        effects: [],
        description: "A flexible weapon with decent reach."
    },

    // ================= RARE WEAPONS =================
    // Rare items are fewer than common items.

    fire_blade: {
        id: "fire_blade",
        name: "Fire Blade",
        type: "melee",
        damage: 18,
        attackSpeed: 1.0,
        rarity: "rare",
        element: "fire",
        stats: { strength: 4, agility: 1, intelligence: 0 },
        effects: [{ type: "burn", chance: 0.3, damage: 5 }],
        description: "A sword engulfed in flames."
    },

    frost_dagger: {
        id: "frost_dagger",
        name: "Frost Dagger",
        type: "melee",
        damage: 13,
        attackSpeed: 2.1,
        rarity: "rare",
        element: "ice",
        stats: { strength: 0, agility: 3, intelligence: 0 },
        effects: [{ type: "freeze", chance: 0.25, duration: 2 }],
        description: "A swift dagger that can freeze its target."
    },

    storm_bow: {
        id: "storm_bow",
        name: "Storm Bow",
        type: "ranged",
        damage: 15,
        attackSpeed: 1.4,
        rarity: "rare",
        element: "lightning",
        stats: { strength: 1, agility: 3, intelligence: 0 },
        effects: [{ type: "shock", chance: 0.3, damage: 6 }],
        description: "A bow charged with lightning."
    },

    poison_blade: {
        id: "poison_blade",
        name: "Poison Blade",
        type: "melee",
        damage: 14,
        attackSpeed: 1.6,
        rarity: "rare",
        element: "poison",
        stats: { strength: 1, agility: 2, intelligence: 0 },
        effects: [{ type: "poison", chance: 0.3, damage: 5, duration: 4 }],
        description: "A blade coated in deadly poison."
    },

    arcane_staff: {
        id: "arcane_staff",
        name: "Arcane Staff",
        type: "magic",
        damage: 17,
        attackSpeed: 1.1,
        rarity: "rare",
        element: "arcane",
        stats: { strength: 0, agility: 0, intelligence: 4 },
        effects: [{ type: "mana_burn", chance: 0.3, damage: 8 }],
        description: "A staff filled with arcane power."
    },

    wind_spear: {
        id: "wind_spear",
        name: "Wind Spear",
        type: "melee",
        damage: 15,
        attackSpeed: 1.5,
        rarity: "rare",
        element: "wind",
        stats: { strength: 2, agility: 2, intelligence: 0 },
        effects: [{ type: "speed_boost", chance: 0.2 }],
        description: "A spear that moves with the wind."
    },

    earth_hammer: {
        id: "earth_hammer",
        name: "Earth Hammer",
        type: "melee",
        damage: 18,
        attackSpeed: 0.9,
        rarity: "rare",
        element: "earth",
        stats: { strength: 4, agility: 0, intelligence: 0 },
        effects: [{ type: "stun", chance: 0.25, duration: 1 }],
        description: "A heavy hammer with crushing force."
    },

    light_blade: {
        id: "light_blade",
        name: "Light Blade",
        type: "melee",
        damage: 15,
        attackSpeed: 1.5,
        rarity: "rare",
        element: "light",
        stats: { strength: 2, agility: 1, intelligence: 1 },
        effects: [{ type: "holy_strike", chance: 0.3, damage: 7 }],
        description: "A sword glowing with holy energy."
    },

    // ================= EPIC WEAPONS =================
    // Epic items are fewer than rare items.

    shadow_dagger: {
        id: "shadow_dagger",
        name: "Shadow Dagger",
        type: "melee",
        damage: 12,
        attackSpeed: 2.0,
        rarity: "epic",
        element: "dark",
        stats: { strength: 1, agility: 5, intelligence: 1 },
        effects: [{ type: "crit_boost", percent: 0.2 }],
        description: "Fast and deadly."
    },

    dragon_blade: {
        id: "dragon_blade",
        name: "Dragon Blade",
        type: "melee",
        damage: 25,
        attackSpeed: 1.1,
        rarity: "epic",
        element: "fire",
        stats: { strength: 5, agility: 1, intelligence: 0 },
        effects: [{ type: "burn", chance: 0.4, damage: 10, duration: 3 }],
        description: "A blade forged in dragon fire."
    },

    storm_hammer: {
        id: "storm_hammer",
        name: "Storm Hammer",
        type: "melee",
        damage: 28,
        attackSpeed: 0.9,
        rarity: "epic",
        element: "lightning",
        stats: { strength: 6, agility: 0, intelligence: 0 },
        effects: [{ type: "shock", chance: 0.4, damage: 10 }],
        description: "A hammer that strikes like thunder."
    },

    frost_staff: {
        id: "frost_staff",
        name: "Frost Staff",
        type: "magic",
        damage: 23,
        attackSpeed: 1.2,
        rarity: "epic",
        element: "ice",
        stats: { strength: 0, agility: 0, intelligence: 6 },
        effects: [{ type: "freeze", chance: 0.35, duration: 2 }],
        description: "A staff radiating freezing magic."
    },

    void_blade: {
        id: "void_blade",
        name: "Void Blade",
        type: "melee",
        damage: 24,
        attackSpeed: 1.6,
        rarity: "epic",
        element: "void",
        stats: { strength: 3, agility: 3, intelligence: 2 },
        effects: [{ type: "lifesteal", percent: 0.15 }],
        description: "A weapon that consumes the life of its victims."
    },

    assassin_blade: {
        id: "assassin_blade",
        name: "Assassin Blade",
        type: "melee",
        damage: 22,
        attackSpeed: 2.3,
        rarity: "epic",
        element: "dark",
        stats: { strength: 2, agility: 5, intelligence: 0 },
        effects: [{ type: "crit_boost", percent: 0.3 }],
        description: "A weapon built for silent kills."
    },

    // ================= LEGENDARY WEAPONS =================
    // Legendary items are the rarest and should be the fewest.

    dragon_slayer: {
        id: "dragon_slayer",
        name: "Dragon Slayer",
        type: "melee",
        damage: 35,
        attackSpeed: 0.8,
        rarity: "legendary",
        element: "fire",
        stats: { strength: 7, agility: 0, intelligence: 0 },
        effects: [{ type: "burn", chance: 0.5, damage: 15, duration: 4 }],
        description: "A legendary blade said to kill dragons."
    },

    phoenix_staff: {
        id: "phoenix_staff",
        name: "Phoenix Staff",
        type: "magic",
        damage: 30,
        attackSpeed: 1.2,
        rarity: "legendary",
        element: "fire",
        stats: { strength: 0, agility: 0, intelligence: 8 },
        effects: [{ type: "burn", chance: 0.6, damage: 12, duration: 4 }],
        description: "A staff blazing with reborn flames."
    },

    celestial_bow: {
        id: "celestial_bow",
        name: "Celestial Bow",
        type: "ranged",
        damage: 28,
        attackSpeed: 1.7,
        rarity: "legendary",
        element: "light",
        stats: { strength: 1, agility: 6, intelligence: 2 },
        effects: [{ type: "holy_strike", chance: 0.4, damage: 15 }],
        description: "A divine bow that fires radiant arrows."
    }
};

export function createWeapon(weaponId) {
    const data = WEAPON_DEFINITIONS[weaponId];

    if (!data) {
        console.error("Weapon not found:", weaponId);
        return null;
    }

    return new Weapon(data);
}

window.WeaponSystem = {
    Weapon,
    WEAPON_DEFINITIONS,
    createWeapon,
};

// ============ ENCHANTMENT SYSTEM ============
export class Enchantment {
    constructor({
        id,
        name,
        description,
        rarity = "common",
        stats = {},
        effects = [],
        cost = 100,
        levelRequired = 1,
    } = {}) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.rarity = rarity;
        this.stats = stats;
        this.effects = effects;
        this.cost = cost;
        this.levelRequired = levelRequired;
        this.appliedToWeapon = null;
    }
}

export const ENCHANTMENT_DEFINITIONS = {
    // Common Enchantments (Slot 1)
    sharpness_1: {
        id: "sharpness_1",
        name: "Sharpness I",
        description: "+2 Damage",
        rarity: "common",
        stats: {},
        effects: [{ type: "damage_boost", amount: 2 }],
        cost: 50,
        levelRequired: 1,
    },

    swiftness_1: {
        id: "swiftness_1",
        name: "Swiftness I",
        description: "+0.2 Attack Speed",
        rarity: "common",
        stats: {},
        effects: [{ type: "speed_boost", amount: 0.2 }],
        cost: 50,
        levelRequired: 1,
    },

    fortitude_1: {
        id: "fortitude_1",
        name: "Fortitude I",
        description: "+1 Strength",
        rarity: "common",
        stats: { strength: 1 },
        effects: [],
        cost: 40,
        levelRequired: 1,
    },

    agility_1: {
        id: "agility_1",
        name: "Agility I",
        description: "+1 Agility",
        rarity: "common",
        stats: { agility: 1 },
        effects: [],
        cost: 40,
        levelRequired: 1,
    },

    intellect_1: {
        id: "intellect_1",
        name: "Intellect I",
        description: "+1 Intelligence",
        rarity: "common",
        stats: { intelligence: 1 },
        effects: [],
        cost: 40,
        levelRequired: 1,
    },

    // Rare Enchantments (Slot 2)
    sharpness_2: {
        id: "sharpness_2",
        name: "Sharpness II",
        description: "+4 Damage, +5% Crit",
        rarity: "rare",
        stats: {},
        effects: [{ type: "damage_boost", amount: 4 }, { type: "crit_boost", percent: 0.05 }],
        cost: 200,
        levelRequired: 10,
    },

    life_steal: {
        id: "life_steal",
        name: "Life Steal",
        description: "Heal 10% of damage dealt",
        rarity: "rare",
        stats: {},
        effects: [{ type: "lifesteal", percent: 0.1 }],
        cost: 300,
        levelRequired: 15,
    },

    flame_enchant: {
        id: "flame_enchant",
        name: "Flame",
        description: "Fire damage on hit",
        rarity: "rare",
        stats: {},
        effects: [{ type: "burn", chance: 0.25, damage: 8 }],
        cost: 250,
        levelRequired: 12,
    },

    frost_enchant: {
        id: "frost_enchant",
        name: "Frost",
        description: "Slow enemy on hit",
        rarity: "rare",
        stats: {},
        effects: [{ type: "freeze", chance: 0.2, duration: 1 }],
        cost: 250,
        levelRequired: 12,
    },

    thunder_enchant: {
        id: "thunder_enchant",
        name: "Thunder",
        description: "Chain lightning effects",
        rarity: "rare",
        stats: {},
        effects: [{ type: "shock", chance: 0.3, damage: 12 }],
        cost: 280,
        levelRequired: 14,
    },

    // Epic Enchantments (Slot 3)
    sharpness_3: {
        id: "sharpness_3",
        name: "Sharpness III",
        description: "+8 Damage, +10% Crit",
        rarity: "epic",
        stats: {},
        effects: [{ type: "damage_boost", amount: 8 }, { type: "crit_boost", percent: 0.1 }],
        cost: 500,
        levelRequired: 20,
    },

    vampirism: {
        id: "vampirism",
        name: "Vampirism",
        description: "Heal 25% of damage dealt",
        rarity: "epic",
        stats: {},
        effects: [{ type: "lifesteal", percent: 0.25 }],
        cost: 600,
        levelRequired: 25,
    },

    chaos: {
        id: "chaos",
        name: "Chaos",
        description: "Random elemental damage",
        rarity: "epic",
        stats: {},
        effects: [{ type: "chaos_damage", chance: 0.4, damageRange: [5, 20] }],
        cost: 700,
        levelRequired: 28,
    },

    divine: {
        id: "divine",
        name: "Divine",
        description: "+15% Holy Damage",
        rarity: "epic",
        stats: { intelligence: 2, strength: 2 },
        effects: [{ type: "holy_strike", chance: 0.35, damage: 15 }],
        cost: 750,
        levelRequired: 30,
    },
};

export function createEnchantment(enchantmentId) {
    const data = ENCHANTMENT_DEFINITIONS[enchantmentId];
    if (!data) {
        console.error("Enchantment not found:", enchantmentId);
        return null;
    }
    return new Enchantment(data);
}

// Add enchantment system to window for access
window.EnchantmentSystem = {
    Enchantment,
    ENCHANTMENT_DEFINITIONS,
    createEnchantment,
};