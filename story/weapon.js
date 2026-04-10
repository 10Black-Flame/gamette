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
    } = {}) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.damage = damage;
        this.attackSpeed = attackSpeed;
        this.rarity = rarity;
        this.element = element;
        this.durability = durability ?? this.getDefaultDurability(rarity);
        this.stats = {
            strength,
            agility,
            intelligence,
        };
        this.effects = Array.isArray(effects) ? [...effects] : [];
        this.description = description;
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
