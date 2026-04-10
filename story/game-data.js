// Game World Data for Chronicles of Aetheria

const GAME_DATA = {
    // Class Definitions - Enhanced with more stats and abilities
    classes: {
        warrior: {
            name: 'Warrior',
            baseHP: 120,
            baseMP: 20,
            baseAttack: 15,
            baseDefense: 8,
            baseSpeed: 5,
            baseStrength: 16,
            baseStamina: 15,
            baseIntelligence: 8,
            baseSpeed: 10,
            baseAgility: 10,
            baseLuck: 9,
            baseVitality: 12,
            baseWisdom: 8,
            description: 'A strong melee fighter with high durability',
            abilities: ['power_strike', 'shield_bash', 'battle_cry'],
            growth: { hp: 8, mp: 1, attack: 3, defense: 2, speed: 1 }
        },
        mage: {
            name: 'Mage',
            baseHP: 80,
            baseMP: 50,
            baseAttack: 8,
            baseDefense: 3,
            baseSpeed: 8,
            baseStrength: 9,
            baseStamina: 10,
            baseIntelligence: 18,
            baseSpeed: 12,
            baseAgility: 11,
            baseLuck: 10,
            baseVitality: 8,
            baseWisdom: 16,
            description: 'Master of elemental magic',
            abilities: ['fireball', 'ice_shield', 'teleport'],
            growth: { hp: 4, mp: 5, attack: 1, defense: 1, speed: 2 }
        },
        rogue: {
            name: 'Rogue',
            baseHP: 90,
            baseMP: 15,
            baseAttack: 14,
            baseDefense: 5,
            baseSpeed: 12,
            baseStrength: 13,
            baseStamina: 11,
            baseIntelligence: 10,
            baseSpeed: 16,
            baseAgility: 17,
            baseLuck: 12,
            baseVitality: 9,
            baseWisdom: 9,
            description: 'Swift and deadly assassin',
            abilities: ['backstab', 'poison_dart', 'smoke_bomb'],
            growth: { hp: 5, mp: 1, attack: 2, defense: 1, speed: 3 }
        },
        cleric: {
            name: 'Cleric',
            baseHP: 100,
            baseMP: 40,
            baseAttack: 10,
            baseDefense: 10,
            baseSpeed: 6,
            baseStrength: 11,
            baseStamina: 13,
            baseIntelligence: 14,
            baseSpeed: 9,
            baseAgility: 10,
            baseLuck: 11,
            baseVitality: 13,
            baseWisdom: 15,
            description: 'Holy healer with protective spells',
            abilities: ['heal', 'divine_shield', 'purify'],
            growth: { hp: 6, mp: 3, attack: 1, defense: 2, speed: 1 }
        },
        // New classes
        paladin: {
            name: 'Paladin',
            baseHP: 110,
            baseMP: 35,
            baseAttack: 13,
            baseDefense: 12,
            baseSpeed: 7,
            description: 'Holy knight with divine powers',
            abilities: ['holy_strike', 'divine_protection', 'judgment'],
            growth: { hp: 7, mp: 2, attack: 2, defense: 3, speed: 1 },
            requirements: { level: 10, class: 'warrior' }
        },
        necromancer: {
            name: 'Necromancer',
            baseHP: 85,
            baseMP: 60,
            baseAttack: 9,
            baseDefense: 4,
            baseSpeed: 6,
            description: 'Dark mage who commands the undead',
            abilities: ['raise_dead', 'death_touch', 'bone_shield'],
            growth: { hp: 4, mp: 6, attack: 1, defense: 1, speed: 1 },
            requirements: { kills: 50 }
        },
        druid: {
            name: 'Druid',
            baseHP: 95,
            baseMP: 45,
            baseAttack: 11,
            baseDefense: 7,
            baseSpeed: 9,
            description: 'Nature guardian with shapeshifting abilities',
            abilities: ['entangle', 'healing_touch', 'wild_shape'],
            growth: { hp: 5, mp: 4, attack: 2, defense: 2, speed: 2 },
            requirements: { locations: ['forest'] }
        },
        shadowAssassin: {
            name: 'Shadow Assassin',
            baseHP: 88,
            baseMP: 20,
            baseAttack: 16,
            baseDefense: 6,
            baseSpeed: 15,
            description: 'Master of stealth and assassination',
            abilities: ['shadow_step', 'fatal_blow', 'vanish'],
            growth: { hp: 4, mp: 1, attack: 3, defense: 1, speed: 4 },
            requirements: { damageFree: 20 }
        },
        demonHunter: {
            name: 'Demon Hunter',
            baseHP: 105,
            baseMP: 30,
            baseAttack: 14,
            baseDefense: 9,
            baseSpeed: 11,
            description: 'Elite warrior who hunts demonic forces',
            abilities: ['demon_slayer', 'holy_fire', 'exorcism'],
            growth: { hp: 6, mp: 2, attack: 3, defense: 2, speed: 2 },
            requirements: { level: 15 }
        },
        timeMage: {
            name: 'Time Mage',
            baseHP: 82,
            baseMP: 55,
            baseAttack: 7,
            baseDefense: 4,
            baseSpeed: 10,
            description: 'Manipulator of time and space',
            abilities: ['slow_time', 'rewind', 'time_bubble'],
            growth: { hp: 4, mp: 5, attack: 1, defense: 1, speed: 2 },
            requirements: { days: 100 }
        },
        warlock: {
            name: 'Warlock',
            baseHP: 90,
            baseMP: 48,
            baseAttack: 12,
            baseDefense: 5,
            baseSpeed: 8,
            description: 'Pact-bound mage with dark powers',
            abilities: ['eldritch_blast', 'demon_summon', 'soul_drain'],
            growth: { hp: 5, mp: 4, attack: 2, defense: 1, speed: 1 },
            requirements: { spells: 100 }
        }
    },

    // Locations
    locations: {
        village: {
            id: 'village',
            name: 'Aldermere Village',
            description: 'A peaceful village nestled in a green valley. Smoke rises from chimneys and the aroma of freshly baked bread fills the air. The village square has an inn, a blacksmith, an alchemist shop, and a small temple. Children play in the streets while merchants hawk their wares.',
            npcs: ['innkeeper', 'blacksmith', 'alchemist', 'priest', 'merchant', 'guard', 'farmer', 'bard', 'mayor', 'quest_board'],
            items: ['bread', 'apple'],
            exits: {
                forest: 'Head north to Dark Forest',
                mountains: 'Head east to Rocky Mountains',
                castle: 'Head west to Ruined Castle',
                library: 'Visit the Grand Library',
                workshop: 'Go to Inventor\'s Workshop',
                marketplace: 'Visit the bustling Marketplace',
                tavern: 'Enter the local Tavern'
            },
            danger: 1,
            level: 1
        },
        library: {
            id: 'library',
            name: 'Grand Library',
            description: 'A magnificent library with towering bookshelves filled with ancient tomes. The air smells of old paper and leather. Scholars quietly study at wooden tables.',
            npcs: ['librarian', 'scholar'],
            items: ['ancient_tome', 'spell_scroll'],
            exits: { village: 'Return to village' }
        },
        workshop: {
            id: 'workshop',
            name: 'Inventor\'s Workshop',
            description: 'A cluttered workshop filled with strange devices, half-finished inventions, and the smell of oil and metal. Gears and springs litter the workbenches.',
            npcs: ['inventor'],
            items: ['gadget', 'mechanical_part'],
            exits: { village: 'Return to village' }
        },
        forest: {
            id: 'forest',
            name: 'Dark Forest',
            description: 'A thick forest with ancient trees towering overhead. The canopy blocks out most sunlight, casting the forest floor in shadow. You hear the sounds of wildlife echoing through the trees.',
            npcs: ['herbalist', 'hunter'],
            enemies: ['goblin', 'goblin', 'wolf'],
            items: ['herb', 'mushroom'],
            wildPets: ['wolf', 'sprite'],
            exits: { village: 'Return to village', mountains: 'Head east to Rocky Mountains', cave: 'Enter dark cave' }
        },
        cave: {
            id: 'cave',
            name: 'Goblin Cavern',
            description: 'A damp cavern reeking of creatures. Stalactites hang from the ceiling and puddles of murky water cover the ground. You hear growling echoing in the darkness.',
            npcs: [],
            enemies: ['goblin', 'goblin', 'goblinWarrior', 'goblinWarrior'],
            items: ['gold', 'sword', 'shield'],
            exits: { forest: 'Exit to forest' }
        },
        mountains: {
            id: 'mountains',
            name: 'Rocky Mountains',
            description: 'Towering peaks covered in snow. The air is thin and cold. Mountain paths twist and turn, leading in many directions. You can see eagles soaring overhead.',
            npcs: [],
            enemies: ['wolf', 'wolf', 'mountain_troll'],
            items: ['ore', 'silver_ore'],
            wildPets: ['golem'],
            exits: { village: 'Return to village', forest: 'Return to forest', tower: 'Climb to Sky Tower' }
        },
        tower: {
            id: 'tower',
            name: 'Sky Tower',
            description: 'An ancient magical tower reaching into the clouds. Arcane energy crackles around the crystalline walls. This appears to be a very dangerous place.',
            npcs: [],
            enemies: ['arcane_golem', 'shadow_mage'],
            items: ['staff', 'mana_crystal'],
            wildPets: ['phoenix'],
            exits: { mountains: 'Descend to mountains' }
        },
        castle: {
            id: 'castle',
            name: 'Ruined Castle',
            description: 'The crumbling remains of a great fortress. Stone walls are covered in vines and moss. The courtyard is overgrown with weeds. You sense an evil presence here.',
            npcs: ['noble'],
            enemies: ['skeleton', 'skeleton', 'dark_knight'],
            items: ['cursed_ring', 'ancient_scroll'],
            exits: { village: 'Return to village', dungeon: 'Descend to castle dungeon' }
        },
        dungeon: {
            id: 'dungeon',
            name: 'Castle Dungeon',
            description: 'Deep underground chambers filled with decay and darkness. The sound of dripping water echoes off stone walls. Chains hang from walls, evidence of prisoners long forgotten.',
            npcs: ['thief'],
            enemies: ['shadow_beast', 'shadow_beast', 'shadow_lord'],
            items: ['treasure_chest', 'ancient_key'],
            wildPets: ['shadow_cat'],
            exits: { castle: 'Ascend to castle' }
        }
    },

    // NPCs
    npcs: {
        innkeeper: {
            id: 'innkeeper',
            name: 'Old Marta',
            description: 'The warm-hearted innkeeper. She greets adventurers with a smile.',
            dialogue: 'Welcome to the inn! Would you like to rest for the night? It will restore your health for 50 gold.',
            type: 'shopkeeper',
            offers: 'rest',
            personality: 'kind',
            intelligence: 'average'
        },
        blacksmith: {
            id: 'blacksmith',
            name: 'Thorin Ironforge',
            description: 'A burly blacksmith with a beard singed from the forge.',
            dialogue: 'Greetings! I craft the finest weapons and armor in all the realm!',
            type: 'shopkeeper',
            offers: 'equipment',
            personality: 'gruff',
            intelligence: 'average'
        },
        alchemist: {
            id: 'alchemist',
            name: 'Elara Moonwhisper',
            description: 'A mysterious alchemist surrounded by strange bottles and potions.',
            dialogue: 'Welcome to my shop of wonders. I have potions for any ailment.',
            type: 'shopkeeper',
            offers: 'potions',
            personality: 'mysterious',
            intelligence: 'genius'
        },
        priest: {
            id: 'priest',
            name: 'Brother Isaiah',
            description: 'A wise priest of the temple, radiating holy light.',
            dialogue: 'May the blessings of the gods be upon you, traveler. You look like you need healing.',
            type: 'quest_giver',
            quest: 'defeat_shadow_lord',
            personality: 'wise',
            intelligence: 'high',
            specialInteraction: {
                type: 'class_unlock',
                classId: 'paladin',
                requirements: { level: 10, classType: 'warrior' },
                dialogue: 'Ah, a warrior with a pure heart! The path of the Paladin awaits you. Will you embrace the holy light?',
                reward: 'paladin_oath'
            }
        },
        // Additional Characters
        librarian: {
            id: 'librarian',
            name: 'Archmage Eldrin Voss',
            description: 'The ancient librarian of the Grand Library, surrounded by towering bookshelves.',
            dialogue: 'Ah, a seeker of knowledge! The tomes here contain wisdom from ages past. What mysteries do you wish to uncover?',
            type: 'quest_giver',
            quest: 'find_ancient_tome',
            personality: 'scholarly',
            intelligence: 'genius',
            specialInteraction: {
                type: 'item_offer',
                itemId: 'spell_book',
                requirements: { level: 5 },
                dialogue: 'I see you have a thirst for knowledge. This ancient spell book has been gathering dust. Would you like to take it?',
                reward: 'spell_book'
            }
        },
        merchant: {
            id: 'merchant',
            name: 'Silas Goldworth',
            description: 'A shrewd merchant with a keen eye for valuable items.',
            dialogue: 'Everything has a price, my friend. What treasures do you bring to trade?',
            type: 'shopkeeper',
            offers: 'trade',
            personality: 'shrewd',
            intelligence: 'high'
        },
        guard: {
            id: 'guard',
            name: 'Captain Thorne',
            description: 'A stern village guard, always vigilant for threats.',
            dialogue: 'Stay out of trouble, adventurer. The roads are dangerous these days.',
            type: 'quest_giver',
            quest: 'clear_goblin_camp',
            personality: 'stern',
            intelligence: 'average'
        },
        herbalist: {
            id: 'herbalist',
            name: 'Sister Liora',
            description: 'A gentle herbalist who tends to the village gardens.',
            dialogue: 'Nature provides all we need, if we know where to look. Would you like some healing herbs?',
            type: 'shopkeeper',
            offers: 'herbs',
            personality: 'gentle',
            intelligence: 'high'
        },
        inventor: {
            id: 'inventor',
            name: 'Professor Cogsworth',
            description: 'A brilliant inventor with wild hair and grease-stained clothes.',
            dialogue: 'Eureka! My latest invention will revolutionize adventuring! Care him to test it?',
            type: 'quest_giver',
            quest: 'test_invention',
            personality: 'eccentric',
            intelligence: 'genius'
        },
        bard: {
            id: 'bard',
            name: 'Melody Starweaver',
            description: 'A traveling bard with a lute and tales of heroic deeds.',
            dialogue: 'Gather round, friends! Let me sing you a tale of bravery and magic!',
            type: 'entertainer',
            offers: 'stories',
            personality: 'cheerful',
            intelligence: 'high'
        },
        noble: {
            id: 'noble',
            name: 'Lady Arabella',
            description: 'A refined noblewoman with impeccable manners.',
            dialogue: 'How delightful to meet such a distinguished adventurer. Might I interest you in some courtly matters?',
            type: 'quest_giver',
            quest: 'deliver_message',
            personality: 'refined',
            intelligence: 'genius'
        },
        hunter: {
            id: 'hunter',
            name: 'Ranger Kael',
            description: 'A skilled hunter who knows every trail in the forest.',
            dialogue: 'The forest whispers secrets to those who listen. What path do you seek?',
            type: 'guide',
            offers: 'guidance',
            personality: 'observant',
            intelligence: 'high'
        },
        thief: {
            id: 'thief',
            name: 'Shadow',
            description: 'A mysterious figure who appears and disappears like smoke.',
            dialogue: 'Information has its price. What do you wish to know?',
            type: 'informant',
            offers: 'information',
            personality: 'mysterious',
            intelligence: 'genius'
        },
        farmer: {
            id: 'farmer',
            name: 'Farmer Giles',
            description: 'A simple farmer with calloused hands and a warm smile.',
            dialogue: 'Hard work and good soil - that\'s the secret to a good harvest.',
            type: 'villager',
            offers: 'food',
            personality: 'simple',
            intelligence: 'average'
        },
        scholar: {
            id: 'scholar',
            name: 'Dr. Magnus Blackwood',
            description: 'A brilliant scholar studying ancient artifacts.',
            dialogue: 'The past holds many secrets. Some should remain buried, others... well, that\'s why I\'m here.',
            type: 'quest_giver',
            quest: 'translate_ancient_text',
            personality: 'analytical',
            intelligence: 'genius'
        },
        quest_board: {
            id: 'quest_board',
            name: 'Quest Board',
            description: 'A weathered wooden board nailed to the village notice post, covered in pinned parchments.',
            dialogue: 'Various quests and tasks are posted here for adventurers willing to help the village.',
            type: 'quest_board',
            personality: 'neutral',
            intelligence: 'none'
        }
    },

    // Enemies
    enemies: {
        goblin: {
            id: 'goblin',
            name: 'Goblin',
            level: 1,
            hp: 20,
            mp: 5,
            attack: 5,
            defense: 2,
            speed: 6,
            exp: 50,
            gold: 10,
            drops: ['herb', 'mushroom', 'small_coin']
        },
        goblinWarrior: {
            id: 'goblinWarrior',
            name: 'Goblin Warrior',
            level: 2,
            hp: 35,
            mp: 5,
            attack: 8,
            defense: 4,
            speed: 5,
            exp: 100,
            gold: 25,
            drops: ['gold', 'iron_ore']
        },
        wolf: {
            id: 'wolf',
            name: 'Wolf',
            level: 2,
            hp: 30,
            mp: 0,
            attack: 7,
            defense: 3,
            speed: 8,
            exp: 75,
            gold: 15,
            drops: ['wolf_fur', 'meat']
        },
        mountain_troll: {
            id: 'mountain_troll',
            name: 'Mountain Troll',
            level: 4,
            hp: 60,
            mp: 10,
            attack: 12,
            defense: 6,
            speed: 3,
            exp: 200,
            gold: 100,
            drops: ['ore', 'troll_bone']
        },
        skeleton: {
            id: 'skeleton',
            name: 'Skeleton',
            level: 2,
            hp: 25,
            mp: 15,
            attack: 6,
            defense: 3,
            speed: 4,
            exp: 60,
            gold: 20,
            drops: ['bone', 'cursed_ring']
        },
        dark_knight: {
            id: 'dark_knight',
            name: 'Dark Knight',
            level: 5,
            hp: 80,
            mp: 20,
            attack: 15,
            defense: 10,
            speed: 7,
            exp: 300,
            gold: 150,
            drops: ['dark_armor', 'cursed_sword']
        },
        arcane_golem: {
            id: 'arcane_golem',
            name: 'Arcane Golem',
            level: 6,
            hp: 70,
            mp: 30,
            attack: 10,
            defense: 12,
            speed: 2,
            exp: 250,
            gold: 200,
            drops: ['mana_crystal', 'golem_core']
        },
        shadow_mage: {
            id: 'shadow_mage',
            name: 'Shadow Mage',
            level: 6,
            hp: 50,
            mp: 40,
            attack: 12,
            defense: 5,
            speed: 10,
            exp: 280,
            gold: 180,
            drops: ['spell_book', 'mana_potion']
        },
        shadow_beast: {
            id: 'shadow_beast',
            name: 'Shadow Beast',
            level: 5,
            hp: 55,
            mp: 20,
            attack: 11,
            defense: 7,
            speed: 9,
            exp: 220,
            gold: 120,
            drops: ['shadow_essence', 'dark_gem']
        },
        shadow_lord: {
            id: 'shadow_lord',
            name: 'Shadow Lord',
            level: 10,
            hp: 150,
            mp: 60,
            attack: 20,
            defense: 12,
            speed: 8,
            exp: 1000,
            gold: 500,
            drops: ['lord_crown', 'ancient_staff', 'legendary_amulet']
        }
    },

    // Regional Mob Pools & Dynamic Spawning System
    regionMobPools: {
        forest: {
            name: 'Dark Forest',
            commonMobs: ['goblin', 'wolf'],
            eliteMobs: ['goblin_sentinel', 'dire_wolf'],
            miniBoss: 'forest_warlord',
            regionalBoss: 'forest_ancient',
            killThresholds: { elite: 8, miniBoss: 15, boss: 25 }
        },
        cave: {
            name: 'Goblin Cavern',
            commonMobs: ['goblin', 'goblinWarrior'],
            eliteMobs: ['goblin_captain', 'goblin_shaman'],
            miniBoss: 'goblin_king',
            regionalBoss: 'cave_tyrant',
            killThresholds: { elite: 8, miniBoss: 16, boss: 28 }
        },
        mountains: {
            name: 'Rocky Mountains',
            commonMobs: ['wolf', 'mountain_troll'],
            eliteMobs: ['dire_wolf', 'ice_troll'],
            miniBoss: 'mountain_giant',
            regionalBoss: 'yeti_lord',
            killThresholds: { elite: 10, miniBoss: 18, boss: 30 }
        },
        tower: {
            name: 'Sky Tower',
            commonMobs: ['arcane_golem', 'shadow_mage'],
            eliteMobs: ['arcane_guardian', 'shadow_sorcerer'],
            miniBoss: 'arcane_lord',
            regionalBoss: 'tower_sentinel',
            killThresholds: { elite: 7, miniBoss: 14, boss: 22 }
        },
        castle: {
            name: 'Ruined Castle',
            commonMobs: ['skeleton', 'dark_knight'],
            eliteMobs: ['cursed_knight', 'death_knight'],
            miniBoss: 'castle_commander',
            regionalBoss: 'dark_overlord',
            killThresholds: { elite: 9, miniBoss: 17, boss: 26 }
        },
        dungeon: {
            name: 'Castle Dungeon',
            commonMobs: ['shadow_beast', 'skeleton'],
            eliteMobs: ['shadow_demon', 'death_warden'],
            miniBoss: 'shadow_prince',
            regionalBoss: 'shadow_lord',
            killThresholds: { elite: 10, miniBoss: 19, boss: 32 }
        }
    },

    // Elite mob variants (stat multipliers and rewards)
    eliteMobVariants: {
        goblin_sentinel: {
            baseId: 'goblin',
            name: 'Goblin Sentinel',
            statMultiplier: 1.4,
            expMultiplier: 2.2,
            goldMultiplier: 1.8,
            elite: true
        },
        dire_wolf: {
            baseId: 'wolf',
            name: 'Dire Wolf',
            statMultiplier: 1.5,
            expMultiplier: 2.3,
            goldMultiplier: 1.9,
            elite: true
        },
        goblin_captain: {
            baseId: 'goblinWarrior',
            name: 'Goblin Captain',
            statMultiplier: 1.45,
            expMultiplier: 2.4,
            goldMultiplier: 2,
            elite: true
        },
        goblin_shaman: {
            baseId: 'goblin',
            name: 'Goblin Shaman',
            statMultiplier: 1.35,
            expMultiplier: 2.1,
            goldMultiplier: 1.9,
            elite: true
        },
        ice_troll: {
            baseId: 'mountain_troll',
            name: 'Ice Troll',
            statMultiplier: 1.6,
            expMultiplier: 2.8,
            goldMultiplier: 2.2,
            elite: true
        },
        arcane_guardian: {
            baseId: 'arcane_golem',
            name: 'Arcane Guardian',
            statMultiplier: 1.55,
            expMultiplier: 2.6,
            goldMultiplier: 2.1,
            elite: true
        },
        shadow_sorcerer: {
            baseId: 'shadow_mage',
            name: 'Shadow Sorcerer',
            statMultiplier: 1.5,
            expMultiplier: 2.5,
            goldMultiplier: 2,
            elite: true
        },
        cursed_knight: {
            baseId: 'dark_knight',
            name: 'Cursed Knight',
            statMultiplier: 1.5,
            expMultiplier: 2.5,
            goldMultiplier: 2.1,
            elite: true
        },
        death_knight: {
            baseId: 'skeleton',
            name: 'Death Knight',
            statMultiplier: 1.6,
            expMultiplier: 2.7,
            goldMultiplier: 2.2,
            elite: true
        },
        shadow_demon: {
            baseId: 'shadow_beast',
            name: 'Shadow Demon',
            statMultiplier: 1.65,
            expMultiplier: 2.9,
            goldMultiplier: 2.3,
            elite: true
        },
        death_warden: {
            baseId: 'skeleton',
            name: 'Death Warden',
            statMultiplier: 1.55,
            expMultiplier: 2.6,
            goldMultiplier: 2.1,
            elite: true
        }
    },

    // Mini-bosses
    miniBosses: {
        forest_warlord: {
            id: 'forest_warlord',
            name: 'Forest Warlord',
            level: 4,
            hp: 80,
            mp: 20,
            attack: 14,
            defense: 7,
            speed: 7,
            exp: 450,
            gold: 200,
            drops: ['iron_ore', 'wolf_fur', 'skill_tome'],
            miniBoss: true
        },
        goblin_king: {
            id: 'goblin_king',
            name: 'Goblin King',
            level: 5,
            hp: 95,
            mp: 15,
            attack: 16,
            defense: 8,
            speed: 6,
            exp: 520,
            gold: 250,
            drops: ['gold', 'iron_ore', 'goblin_crown'],
            miniBoss: true
        },
        mountain_giant: {
            id: 'mountain_giant',
            name: 'Mountain Giant',
            level: 6,
            hp: 110,
            mp: 25,
            attack: 18,
            defense: 9,
            speed: 4,
            exp: 610,
            gold: 300,
            drops: ['ore', 'troll_bone', 'giant_fist'],
            miniBoss: true
        },
        arcane_lord: {
            id: 'arcane_lord',
            name: 'Arcane Lord',
            level: 7,
            hp: 100,
            mp: 50,
            attack: 16,
            defense: 8,
            speed: 9,
            exp: 680,
            gold: 320,
            drops: ['mana_crystal', 'spell_book', 'arcane_core'],
            miniBoss: true
        },
        castle_commander: {
            id: 'castle_commander',
            name: 'Castle Commander',
            level: 7,
            hp: 105,
            mp: 30,
            attack: 17,
            defense: 11,
            speed: 7,
            exp: 650,
            gold: 310,
            drops: ['dark_armor', 'cursed_sword', 'commander_insignia'],
            miniBoss: true
        },
        shadow_prince: {
            id: 'shadow_prince',
            name: 'Shadow Prince',
            level: 8,
            hp: 120,
            mp: 45,
            attack: 18,
            defense: 10,
            speed: 9,
            exp: 750,
            gold: 350,
            drops: ['shadow_essence', 'dark_gem', 'prince_crown'],
            miniBoss: true
        }
    },

    // Regional Bosses
    regionalBosses: {
        forest_ancient: {
            id: 'forest_ancient',
            name: 'Ancient Forest Spirit',
            level: 8,
            hp: 130,
            mp: 40,
            attack: 17,
            defense: 9,
            speed: 8,
            exp: 800,
            gold: 400,
            drops: ['lord_crown', 'forest_staff', 'ancient_amulet'],
            boss: true
        },
        cave_tyrant: {
            id: 'cave_tyrant',
            name: 'Tyrant of the Caverns',
            level: 9,
            hp: 140,
            mp: 35,
            attack: 19,
            defense: 10,
            speed: 6,
            exp: 900,
            gold: 450,
            drops: ['lord_crown', 'ancient_staff', 'legendary_amulet'],
            boss: true
        },
        yeti_lord: {
            id: 'yeti_lord',
            name: 'Yeti Lord',
            level: 9,
            hp: 150,
            mp: 30,
            attack: 20,
            defense: 11,
            speed: 7,
            exp: 950,
            gold: 500,
            drops: ['legendary_amulet', 'ice_core', 'yeti_pelt'],
            boss: true
        },
        tower_sentinel: {
            id: 'tower_sentinel',
            name: 'Tower Sentinel',
            level: 9,
            hp: 135,
            mp: 60,
            attack: 18,
            defense: 12,
            speed: 10,
            exp: 920,
            gold: 480,
            drops: ['ancient_staff', 'mana_crystal', 'arcane_scepter'],
            boss: true
        },
        dark_overlord: {
            id: 'dark_overlord',
            name: 'Dark Overlord',
            level: 10,
            hp: 145,
            mp: 50,
            attack: 21,
            defense: 13,
            speed: 8,
            exp: 980,
            gold: 520,
            drops: ['lord_crown', 'ancient_staff', 'legendary_amulet'],
            boss: true
        }
    },

    // Shops
    shops: {
        general_store: {
            id: 'general_store',
            name: 'General Store',
            keeper: 'merchant',
            baseInventory: ['herb', 'mushroom', 'meat', 'iron_ore', 'bone', 'wolf_fur'],
            rareInventory: ['mana_crystal', 'shadow_essence', 'dark_gem', 'mechanical_part'],
            rareChance: 0.15 // 15% chance for rare items to appear
        },
        blacksmith_shop: {
            id: 'blacksmith_shop',
            name: 'Blacksmith\'s Forge',
            keeper: 'blacksmith',
            baseInventory: ['sword', 'shield', 'iron_ore', 'ore', 'silver_ore', 'troll_bone'],
            rareInventory: ['cursed_sword', 'dark_armor', 'giant_fist', 'forest_staff', 'arcane_scepter'],
            rareChance: 0.12
        },
        alchemist_shop: {
            id: 'alchemist_shop',
            name: 'Alchemy Emporium',
            keeper: 'alchemist',
            baseInventory: ['herb', 'mushroom', 'mana_potion', 'mana_crystal', 'shadow_essence'],
            rareInventory: ['ancient_staff', 'legendary_amulet', 'arcane_core', 'ice_core'],
            rareChance: 0.18
        },
        treasure_merchant: {
            id: 'treasure_merchant',
            name: 'Curiosity Merchant',
            keeper: 'merchant',
            baseInventory: ['treasure_chest', 'spell_book', 'ancient_scroll', 'spell_scroll'],
            rareInventory: ['lord_crown', 'ancient_staff', 'legendary_amulet', 'prince_crown', 'commander_insignia'],
            rareChance: 0.10
        }
    },

    // Items
    items: {
        herb: { id: 'herb', name: 'Healing Herb', type: 'consumable', effect: 'heal', value: 20, gold: 5 },
        mushroom: { id: 'mushroom', name: 'Glowing Mushroom', type: 'consumable', effect: 'restore_mp', value: 15, gold: 8 },
        small_coin: { id: 'small_coin', name: 'Small Coin', type: 'currency', gold: 1 },
        gold: { id: 'gold', name: 'Gold Coins', type: 'currency', gold: 50 },
        sword: { id: 'sword', name: 'Iron Sword', type: 'weapon', attack: 10, gold: 100 },
        shield: { id: 'shield', name: 'Wooden Shield', type: 'armor', defense: 5, gold: 80 },
        iron_ore: { id: 'iron_ore', name: 'Iron Ore', type: 'material', gold: 30 },
        ore: { id: 'ore', name: 'Mountain Ore', type: 'material', gold: 40 },
        silver_ore: { id: 'silver_ore', name: 'Silver Ore', type: 'material', gold: 60 },
        wolf_fur: { id: 'wolf_fur', name: 'Wolf Fur', type: 'material', gold: 25 },
        meat: { id: 'meat', name: 'Raw Meat', type: 'consumable', effect: 'heal', value: 30, gold: 15 },
        bone: { id: 'bone', name: 'Bone', type: 'material', gold: 10 },
        cursed_ring: { id: 'cursed_ring', name: 'Cursed Ring', type: 'equipment', defense: -2, gold: 0 },
        troll_bone: { id: 'troll_bone', name: 'Troll Bone', type: 'material', gold: 80 },
        staff: { id: 'staff', name: 'Mage Staff', type: 'weapon', attack: 8, mp: 20, gold: 150 },
        mana_crystal: { id: 'mana_crystal', name: 'Mana Crystal', type: 'material', gold: 100 },
        ore: { id: 'ore', name: 'Mountain Ore', type: 'material', gold: 40 },
        ancient_scroll: { id: 'ancient_scroll', name: 'Ancient Scroll', type: 'quest_item', gold: 0 },
        treasure_chest: { id: 'treasure_chest', name: 'Treasure Chest', type: 'container', gold: 300 },
        ancient_key: { id: 'ancient_key', name: 'Ancient Key', type: 'quest_item', gold: 0 },
        dark_armor: { id: 'dark_armor', name: 'Dark Armor', type: 'armor', defense: 12, gold: 200 },
        cursed_sword: { id: 'cursed_sword', name: 'Cursed Sword', type: 'weapon', attack: 16, gold: 250 },
        spell_book: { id: 'spell_book', name: 'Spell Book', type: 'book', gold: 150 },
        mana_potion: { id: 'mana_potion', name: 'Mana Potion', type: 'consumable', effect: 'restore_mp', value: 50, gold: 80 },
        ancient_tome: { id: 'ancient_tome', name: 'Ancient Tome', type: 'book', gold: 200 },
        spell_scroll: { id: 'spell_scroll', name: 'Spell Scroll', type: 'book', gold: 120 },
        warriors_codex: { id: 'warriors_codex', name: 'Warrior\'s Codex', type: 'book', gold: 180 },
        clerics_holy_scripture: { id: 'clerics_holy_scripture', name: 'Holy Scripture', type: 'book', gold: 160 },
        rogues_handbook: { id: 'rogues_handbook', name: 'Rogue\'s Handbook', type: 'book', gold: 140 },
        merchants_ledger: { id: 'merchants_ledger', name: 'Merchant\'s Ledger', type: 'book', gold: 130 },
        alchemists_formulary: { id: 'alchemists_formulary', name: 'Alchemist\'s Formulary', type: 'book', gold: 170 },
        necromancers_grimoire: { id: 'necromancers_grimoire', name: 'Necromancer\'s Grimoire', type: 'book', gold: 250 },
        druids_nature_lore: { id: 'druids_nature_lore', name: 'Nature Lore', type: 'book', gold: 190 },
        paladins_oath: { id: 'paladins_oath', name: 'Paladin\'s Oath', type: 'book', gold: 210 },
        quest_tome_elder_lore: { id: 'quest_tome_elder_lore', name: 'Tome of Elder Lore', type: 'book', gold: 300 },
        quest_scroll_hidden_passages: { id: 'quest_scroll_hidden_passages', name: 'Scroll of Hidden Passages', type: 'book', gold: 220 },
        quest_codex_dragon_lore: { id: 'quest_codex_dragon_lore', name: 'Codex of Dragon Lore', type: 'book', gold: 280 },
        gadget: { id: 'gadget', name: 'Strange Gadget', type: 'quest_item', gold: 150 },
        mechanical_part: { id: 'mechanical_part', name: 'Mechanical Part', type: 'material', gold: 75 },
        shadow_essence: { id: 'shadow_essence', name: 'Shadow Essence', type: 'material', gold: 120 },
        dark_gem: { id: 'dark_gem', name: 'Dark Gem', type: 'material', gold: 150 },
        lord_crown: { id: 'lord_crown', name: 'Crown of Shadows', type: 'equipment', defense: 15, gold: 500 },
        ancient_staff: { id: 'ancient_staff', name: 'Ancient Staff', type: 'weapon', attack: 20, mp: 40, gold: 600 },
        legendary_amulet: { id: 'legendary_amulet', name: 'Legendary Amulet', type: 'equipment', defense: 10, gold: 700 },
        skill_tome: { id: 'skill_tome', name: 'Skill Tome', type: 'quest_item', gold: 150 },
        goblin_crown: { id: 'goblin_crown', name: 'Goblin Crown', type: 'equipment', defense: 3, gold: 80 },
        giant_fist: { id: 'giant_fist', name: 'Giant\'s Fist', type: 'weapon', attack: 18, gold: 200 },
        arcane_core: { id: 'arcane_core', name: 'Arcane Core', type: 'material', gold: 250 },
        commander_insignia: { id: 'commander_insignia', name: 'Commander\'s Insignia', type: 'equipment', defense: 5, gold: 120 },
        prince_crown: { id: 'prince_crown', name: 'Prince\'s Crown', type: 'equipment', defense: 8, gold: 300 },
        forest_staff: { id: 'forest_staff', name: 'Staff of the Forest', type: 'weapon', attack: 17, mp: 30, gold: 400 },
        ice_core: { id: 'ice_core', name: 'Ice Core', type: 'material', gold: 200 },
        yeti_pelt: { id: 'yeti_pelt', name: 'Yeti Pelt', type: 'material', gold: 180 },
        arcane_scepter: { id: 'arcane_scepter', name: 'Arcane Scepter', type: 'weapon', attack: 19, mp: 35, gold: 450 }
    },

    // Quests
    quests: {
        explore_cave: {
            id: 'explore_cave',
            title: 'Explore the Cave',
            description: 'There are goblins in the cave near the forest. Investigate and clear them out.',
            reward: 500,
            expReward: 200,
            autoCompleteOnKill: true,
            required: false,
            startLocation: 'village'
        },
        defeat_troll: {
            id: 'defeat_troll',
            title: 'Slay the Mountain Troll',
            description: 'A dangerous troll terrorizes the mountain pass. The village needs your help to defeat it.',
            reward: 1000,
            expReward: 350,
            autoCompleteOnKill: true,
            required: false,
            startLocation: 'mountains'
        },
        defeat_shadow_lord: {
            id: 'defeat_shadow_lord',
            title: 'Defeat the Shadow Lord',
            description: 'Evil lurks in the castle dungeon. Brother Isaiah believes only a true hero can stop it.',
            reward: 2000,
            expReward: 1000,
            autoCompleteOnKill: true,
            required: true,
            startLocation: 'dungeon',
            type: 'system'
        },
        find_ancient_tome: {
            id: 'find_ancient_tome',
            title: 'Find the Ancient Tome',
            description: 'Archmage Eldrin Voss needs a rare ancient tome that was stolen from the library. It might be in the goblin cave.',
            reward: 800,
            required: false,
            startLocation: 'library',
            type: 'system'
        },
        test_invention: {
            id: 'test_invention',
            title: 'Test the Invention',
            description: 'Professor Cogsworth has created a new device that needs field testing. Help him test it in the forest.',
            reward: 600,
            required: false,
            startLocation: 'workshop'
        },
        deliver_message: {
            id: 'deliver_message',
            title: 'Deliver Important Message',
            description: 'Lady Arabella needs you to deliver a sealed message to the herbalist in the forest. Be discreet!',
            reward: 400,
            required: false,
            startLocation: 'castle'
        },
        translate_ancient_text: {
            id: 'translate_ancient_text',
            title: 'Translate Ancient Text',
            description: 'Dr. Magnus Blackwood has discovered ancient runes in the castle ruins. Help him decipher their meaning.',
            reward: 1200,
            required: false,
            startLocation: 'library'
        },
        clear_goblin_camp: {
            id: 'clear_goblin_camp',
            title: 'Clear the Goblin Camp',
            description: 'Captain Thorne reports increased goblin activity near the forest. Clear them out to protect the village.',
            reward: 700,
            expReward: 250,
            autoCompleteOnKill: true,
            required: false,
            startLocation: 'village'
        }
    },

    // Spells
    spells: {
        fireball: {
            name: 'Fireball',
            cost: 15,
            damage: 20,
            description: 'Hurl a ball of fire at the enemy'
        },
        heal: {
            name: 'Heal',
            cost: 10,
            healing: 30,
            description: 'Restore your health'
        },
        lightning: {
            name: 'Lightning Bolt',
            cost: 20,
            damage: 25,
            description: 'Strike the enemy with lightning'
        },
        shield_spell: {
            name: 'Magical Shield',
            cost: 12,
            defense: 10,
            description: 'Create a magical shield for protection'
        }
    },

    // NPC Extended Data for Living World
    npc_extended: {
        innkeeper: {
            age: 45,
            relationship: 0,
            profession: 'innkeeper',
            personality: 'warm',
            family: [],
            skills: ['cooking', 'hospitality']
        },
        blacksmith: {
            age: 52,
            relationship: 0,
            profession: 'blacksmith',
            personality: 'gruff',
            family: [],
            skills: ['forging', 'combat']
        },
        alchemist: {
            age: 67,
            relationship: 0,
            profession: 'alchemist',
            personality: 'mysterious',
            family: [],
            skills: ['alchemy', 'herbalism']
        },
        priest: {
            age: 60,
            relationship: 0,
            profession: 'cleric',
            personality: 'wise',
            family: [],
            skills: ['healing', 'blessing']
        }
    },

    // World Events System
    events: [
        {
            id: 'goblin_invasion',
            name: 'Goblin Invasion!',
            description: 'Goblins have invaded the dark forest. More enemies spawn here.',
            type: 'invasion',
            location: 'forest',
            probability: 0.0001,
            duration: 3,
            effects: { enemyMultiplier: 1.5 }
        },
        {
            id: 'treasure_found',
            name: 'Treasure Discovery!',
            description: 'A treasure has been discovered in one of the locations!',
            type: 'item_discovery',
            location: 'random',
            probability: 0.0002,
            duration: 1,
            reward: 'treasure_chest'
        },
        {
            id: 'npc_birth',
            name: 'New Life!',
            description: 'A baby is born in the village!',
            type: 'npc_birth',
            location: 'village',
            probability: 0.00001,
            duration: null
        },
        {
            id: 'plague',
            name: 'Plague Outbreak!',
            description: 'A plague has swept through the village. Caution advised.',
            type: 'plague',
            location: 'village',
            probability: 0.00005,
            duration: 5,
            effects: { npcDeathChance: 0.1 }
        },
        {
            id: 'good_harvest',
            name: 'Bountiful Harvest!',
            description: 'The harvest was exceptional this year. Item prices are lower.',
            type: 'economic',
            location: 'village',
            probability: 0.0001,
            duration: 2,
            effects: { itemPriceMult: 0.8 }
        },
        {
            id: 'meteor_shower',
            name: 'Meteor Shower!',
            description: 'Meteors are falling from the sky in the mountains!',
            type: 'natural',
            location: 'mountains',
            probability: 0.00008,
            duration: 1,
            effects: { enemyAppear: 'arcane_golem' }
        },
        {
            id: 'peace_festival',
            name: 'Peace Festival!',
            description: 'The realm is celebrating a time of peace. NPCs are happier.',
            type: 'celebration',
            location: 'village',
            probability: 0.0001,
            duration: 3,
            effects: { npcHappiness: 0.2 }
        }
    ],

    // Time Periods in the game world
    timePeriods: {
        morning: { hour: 0, name: '🌅 Morning', weatherMult: 1.0 },
        afternoon: { hour: 6, name: '☀️ Afternoon', weatherMult: 1.0 },
        evening: { hour: 12, name: '🌆 Evening', weatherMult: 1.1 },
        night: { hour: 18, name: '🌙 Night', weatherMult: 0.8 }
    },

    // Seasons affect the world
    seasons: [
        { name: '🌸 Spring', monthStart: 2, temperament: 'growing', eventChance: 1.0 },
        { name: '☀️ Summer', monthStart: 5, temperament: 'active', eventChance: 1.3 },
        { name: '🍂 Autumn', monthStart: 8, temperament: 'calm', eventChance: 0.9 },
        { name: '❄️ Winter', monthStart: 11, temperament: 'harsh', eventChance: 0.7 }
    ],

    // Hidden Classes (unlocked by completing special requirements)
    hiddenClasses: {
        paladin: {
            name: 'Paladin',
            rarity: 'rare',
            unlockRequirement: 'Reach level 10 with Warrior',
            baseHP: 130,
            baseMP: 30,
            baseAttack: 14,
            baseDefense: 12,
            baseSpeed: 4,
            description: 'Holy warrior with divine protection and blessing powers',
            specialAbility: 'Divine Shield - Create unbreakable protection'
        },
        necromancer: {
            name: 'Necromancer',
            rarity: 'epic',
            unlockRequirement: 'Defeat Shadow Lord with Mage',
            baseHP: 85,
            baseMP: 60,
            baseAttack: 9,
            baseDefense: 4,
            baseSpeed: 7,
            description: 'Master of death magic and undead servants',
            specialAbility: 'Summon Undead - Raise skeletal minions'
        },
        druid: {
            name: 'Druid',
            rarity: 'rare',
            unlockRequirement: 'Visit all 7 locations',
            baseHP: 100,
            baseMP: 45,
            baseAttack: 11,
            baseDefense: 8,
            baseSpeed: 8,
            description: 'Nature-bound spellcaster with animal bond',
            specialAbility: 'Nature\'s Wrath - Command the forces of nature'
        },
        shadowAssassin: {
            name: 'Shadow Assassin',
            rarity: 'rare',
            unlockRequirement: 'Reach level 20 as Rogue',
            baseHP: 95,
            baseMP: 25,
            baseAttack: 18,
            baseDefense: 4,
            baseSpeed: 16,
            description: 'Master of darkness and instant kills',
            specialAbility: 'Shadow Clone - Multiply your strikes'
        },
        demonHunter: {
            name: 'Demon Hunter',
            rarity: 'epic',
            unlockRequirement: 'Defeat 100 enemies',
            baseHP: 115,
            baseMP: 35,
            baseAttack: 17,
            baseDefense: 9,
            baseSpeed: 10,
            description: 'Hardened fighter specialized in demon slaying',
            specialAbility: 'Demon Mark - Curse enemies with weakness'
        },
        timeMage: {
            name: 'Time Mage',
            rarity: 'legendary',
            unlockRequirement: 'Reach level 30 with Mage',
            baseHP: 75,
            baseMP: 75,
            baseAttack: 7,
            baseDefense: 3,
            baseSpeed: 12,
            description: 'Manipulator of temporal forces',
            specialAbility: 'Time Loop - Rewind time to undo actions'
        },
        warlock: {
            name: 'Warlock',
            rarity: 'epic',
            unlockRequirement: 'Acquire 5 cursed items',
            baseHP: 90,
            baseMP: 55,
            baseAttack: 12,
            baseDefense: 5,
            baseSpeed: 9,
            description: 'Dark pact maker with forbidden knowledge',
            specialAbility: 'Infernal Contract - Trade health for power'
        }
    },

    // Guild System
    guilds: [
        {
            id: 'dragon_slayers',
            name: 'Dragon Slayers',
            emblem: '🐉',
            level: 1,
            maxMembers: 20,
            perks: { attackBonus: 0.05, expBonus: 0.1 },
            description: 'Elite warriors dedicated to slaying dragons',
            questLine: 'defeat_bosses'
        },
        {
            id: 'arcane_circle',
            name: 'Arcane Circle',
            emblem: '✨',
            level: 1,
            maxMembers: 20,
            perks: { mpBonus: 0.1, spellDamage: 0.08 },
            description: 'Mages united in pursuit of magical mastery',
            questLine: 'spell_mastery'
        },
        {
            id: 'shadow_rebels',
            name: 'Shadow Rebels',
            emblem: '🗡️',
            level: 1,
            maxMembers: 15,
            perks: { speedBonus: 0.1, criticalChance: 0.05 },
            description: 'Rogues and assassins working in the shadows',
            questLine: 'stealth_missions'
        },
        {
            id: 'holy_order',
            name: 'Holy Order',
            emblem: '✝️',
            level: 1,
            maxMembers: 20,
            perks: { defenseBonus: 0.08, healingBonus: 0.1 },
            description: 'Devoted protectors bound by holy oaths',
            questLine: 'protection_duty'
        },
        {
            id: 'merchant_league',
            name: 'Merchant League',
            emblem: '💰',
            level: 1,
            maxMembers: 30,
            perks: { goldBonus: 0.2, priceDiscount: 0.15 },
            description: 'Traders and merchants seeking fortune',
            questLine: 'trading_routes'
        }
    ],

    // Guild Perks by Level
    guildPerks: [
        { level: 1, name: 'Basic Bonus', bonusMultiplier: 1.0 },
        { level: 2, name: 'Greater Bonus', bonusMultiplier: 1.25 },
        { level: 3, name: 'Superior Bonus', bonusMultiplier: 1.5 },
        { level: 4, name: 'Epic Bonus', bonusMultiplier: 2.0 },
        { level: 5, name: 'Legendary Bonus', bonusMultiplier: 3.0 }
    ],

    // Crafting Recipes
    recipes: [
        { id: 'iron_sword', name: 'Iron Sword Recipe', ingredients: { iron_ore: 5, gold: 50 }, output: 'sword', level: 1 },
        { id: 'steel_sword', name: 'Steel Sword Recipe', ingredients: { iron_ore: 8, silver_ore: 3, gold: 150 }, output: 'cursed_sword', level: 5 },
        { id: 'mana_potion_recipe', name: 'Mana Potion', ingredients: { mushroom: 2, mana_crystal: 1, gold: 30 }, output: 'mana_potion', level: 3 },
        { id: 'healing_salve', name: 'Healing Salve', ingredients: { herb: 3, wolf_fur: 2, gold: 25 }, output: 'herb', level: 2 },
        { id: 'enchanted_armor', name: 'Enchanted Armor', ingredients: { dark_armor: 1, mana_crystal: 5, gold: 300 }, output: 'dark_armor', level: 8 },
        { id: 'legendary_bow', name: 'Legendary Bow', ingredients: { silver_ore: 10, mana_crystal: 8, shadow_essence: 5, gold: 1000 }, output: 'ancient_staff', level: 10 }
    ],

    // Enchantments
    enchantments: {
        flameBurst: { name: 'Flame Burst', level: 1, cost: 100, bonus: { attack: 5 }, description: 'Adds 5% fire damage' },
        frostbite: { name: 'Frostbite', level: 2, cost: 250, bonus: { defense: 3, speed: 2 }, description: 'Slows enemies' },
        lifeSteal: { name: 'Life Steal', level: 3, cost: 500, bonus: { attack: 8 }, description: 'Drain enemy health on hit' },
        shieldBarrier: { name: 'Shield Barrier', level: 2, cost: 200, bonus: { defense: 10 }, description: 'Reflects 10% damage' },
        swiftness: { name: 'Swiftness', level: 1, cost: 150, bonus: { speed: 5 }, description: 'Move faster' },
        purification: { name: 'Purification', level: 3, cost: 400, bonus: { defense: 5, maxHP: 20 }, description: 'Remove curses' }
    },

    // Achievements
    achievements: [
        { id: 'first_blood', name: 'First Blood', description: 'Defeat your first enemy', reward: 100 },
        { id: 'dragon_slayer', name: 'Dragon Slayer', description: 'Defeat all bosses', reward: 1000 },
        { id: 'level_10', name: 'Rising Hero', description: 'Reach level 10', reward: 500 },
        { id: 'level_50', name: 'Legendary Hero', description: 'Reach level 50', reward: 5000 },
        { id: 'treasure_hunter', name: 'Treasure Hunter', description: 'Find 10 treasures', reward: 750 },
        { id: 'world_explorer', name: 'World Explorer', description: 'Visit all 7 locations', reward: 2000 },
        { id: 'master_crafter', name: 'Master Crafter', description: 'Craft 10 items', reward: 1500 },
        { id: 'shadow_lord_victory', name: 'World Savior', description: 'Defeat the Shadow Lord', reward: 3000 },
        { id: 'perfect_guild', name: 'Guild Master', description: 'Join a guild and reach level 10', reward: 2000 },
        { id: 'unlock_hidden_class', name: 'Secret Revealed', description: 'Unlock a hidden class', reward: 1000 },
        { id: 'first_quest', name: 'Quest Beginner', description: 'Complete your first quest', reward: 200 },
        { id: 'pet_catcher', name: 'Pet Catcher', description: 'Catch your first pet', reward: 300 },
        { id: 'bookworm', name: 'Bookworm', description: 'Read 5 books', reward: 400 },
        { id: 'merchant', name: 'Merchant', description: 'Earn 10,000 gold', reward: 1000 },
        { id: 'spell_master', name: 'Spell Master', description: 'Cast 100 spells', reward: 800 },
        { id: 'survivor', name: 'Survivor', description: 'Survive 50 combats without fleeing', reward: 600 },
        { id: 'guild_leader', name: 'Guild Leader', description: 'Create your own guild', reward: 1500 },
        { id: 'enchantment_expert', name: 'Enchantment Expert', description: 'Apply 10 enchantments', reward: 700 },
        { id: 'dungeon_crawler', name: 'Dungeon Crawler', description: 'Clear 5 dungeons', reward: 1200 },
        { id: 'prestige_achiever', name: 'Prestige Achiever', description: 'Reach prestige level 1', reward: 5000 }
    ],

    // Pet Companions
    pets: [
        { 
            id: 'wolf', 
            name: 'Wolf', 
            specie: 'Canine', 
            grade: 'Common', 
            hp: 50, 
            mp: 20, 
            attack: 10, 
            defense: 5, 
            speed: 15, 
            rarity: 'common', 
            bonus: { attack: 5, speed: 2 }, 
            description: 'Loyal wolf companion' 
        },
        { 
            id: 'phoenix', 
            name: 'Phoenix', 
            specie: 'Avian', 
            grade: 'Rare', 
            hp: 80, 
            mp: 60, 
            attack: 15, 
            defense: 10, 
            speed: 20, 
            rarity: 'rare', 
            bonus: { attack: 8, maxHP: 30, fire_resist: 0.2 }, 
            description: 'Legendary fire bird' 
        },
        { 
            id: 'dragon', 
            name: 'Dragon', 
            specie: 'Draconic', 
            grade: 'Epic', 
            hp: 150, 
            mp: 100, 
            attack: 25, 
            defense: 20, 
            speed: 10, 
            rarity: 'epic', 
            bonus: { attack: 15, defense: 10, speed: 5 }, 
            description: 'Most powerful companion' 
        },
        { 
            id: 'sprite', 
            name: 'Fairy Sprite', 
            specie: 'Fey', 
            grade: 'Rare', 
            hp: 40, 
            mp: 80, 
            attack: 5, 
            defense: 5, 
            speed: 25, 
            rarity: 'rare', 
            bonus: { mp: 20, magic_damage: 0.1 }, 
            description: 'Magical fairy ally' 
        },
        { 
            id: 'golem', 
            name: 'Stone Golem', 
            specie: 'Construct', 
            grade: 'Rare', 
            hp: 120, 
            mp: 0, 
            attack: 20, 
            defense: 25, 
            speed: 5, 
            rarity: 'rare', 
            bonus: { defense: 15, maxHP: 50 }, 
            description: 'Unbreakable defender' 
        },
        { 
            id: 'shadow_cat', 
            name: 'Shadow Cat', 
            specie: 'Feline', 
            grade: 'Epic', 
            hp: 60, 
            mp: 40, 
            attack: 18, 
            defense: 8, 
            speed: 30, 
            rarity: 'epic', 
            bonus: { speed: 8, stealth: 0.5, critical: 0.1 }, 
            description: 'Silent assassin' 
        }
    ],

    // Factions (Reputation System)
    factions: [
        { id: 'kingdom', name: '👑 Kingdom', description: 'Serve the royal throne', color: '#ffd700' },
        { id: 'thieves_guild', name: '🗡️ Thieves Guild', description: 'Work with the underworld', color: '#8b008b' },
        { id: 'nature_circle', name: '🌿 Nature Circle', description: 'Protect forests and wildlife', color: '#228b22' },
        { id: 'shadow_council', name: '🌑 Shadow Council', description: 'Embrace the darkness', color: '#2f4f4f' },
        { id: 'dragon_cult', name: '🐉 Dragon Cult', description: 'Worship ancient dragons', color: '#8b0000' }
    ],

    // Prestige/Reincarnation Unlocks
    prestiges: [
        { level: 1, name: 'Ascendant', bonus: { allStats: 0.1, maxLevel: 150 } },
        { level: 2, name: 'Transcendent', bonus: { allStats: 0.25, maxLevel: 200 } },
        { level: 3, name: 'Eternal', bonus: { allStats: 0.5, maxLevel: 300 } }
    ],

    // Titles (earned through achievements)
    titles: [
        { id: 'slayer', name: 'Slayer', requirement: 'Kill 100 enemies' },
        { id: 'explorer', name: 'Explorer', requirement: 'Visit all locations' },
        { id: 'legendary', name: 'Legendary', requirement: 'Reach level 99' },
        { id: 'hero', name: 'Hero', requirement: 'Save the world' },
        { id: 'shadow_master', name: 'Shadow Master', requirement: 'Unlock Shadow Assassin' },
        { id: 'grand_mage', name: 'Grand Mage', requirement: 'Master all spells' }
    ],

    // Dungeons (special instances)
    dungeons: [
        { 
            id: 'goblin_den', 
            name: 'Goblin\'s Den', 
            minLevel: 1, 
            enemies: ['goblin', 'goblinWarrior'], 
            boss: 'goblinWarrior',
            loot: ['gold', 'iron_ore', 'sword'],
            difficulty: 'Easy'
        },
        { 
            id: 'troll_cave', 
            name: 'Troll\'s Cave', 
            minLevel: 15, 
            enemies: ['wolf', 'mountain_troll'], 
            boss: 'mountain_troll',
            loot: ['ore', 'troll_bone', 'shield'],
            difficulty: 'Medium'
        },
        { 
            id: 'shadow_realm', 
            name: 'Shadow Realm', 
            minLevel: 40, 
            enemies: ['shadow_beast', 'shadow_mage'], 
            boss: 'shadow_lord',
            loot: ['lord_crown', 'ancient_staff', 'legendary_amulet'],
            difficulty: 'Legendary'
        }
    ],

    // Skill Trees (Basic)
    skillTrees: {
        warrior: [
            { name: 'Power Strike', level: 1, bonus: { attack: 5 } },
            { name: 'Iron Skin', level: 5, bonus: { defense: 8 } },
            { name: 'Whirlwind', level: 10, bonus: { attack: 10, speed: 3 } }
        ],
        mage: [
            { name: 'Fireball Mastery', level: 1, bonus: { spellDamage: 10 } },
            { name: 'Mana Shield', level: 5, bonus: { mp: 30, defense: 5 } },
            { name: 'Arcane Explosion', level: 10, bonus: { spellDamage: 25 } }
        ],
        rogue: [
            { name: 'Backstab', level: 1, bonus: { critical: 0.1 } },
            { name: 'Stealth Mastery', level: 5, bonus: { stealth: 0.3 } },
            { name: 'Shadow Steps', level: 10, bonus: { speed: 8, critical: 0.2 } }
        ],
        cleric: [
            { name: 'Holy Prayer', level: 1, bonus: { healing: 20 } },
            { name: 'Divine Protection', level: 5, bonus: { defense: 10 } },
            { name: 'Resurrection', level: 10, bonus: { maxHP: 50 } }
        ]
    },

    // Events System
    events: {
        // Regional Events (affect specific locations)
        goblin_raid: {
            id: 'goblin_raid',
            name: 'Goblin Raid',
            type: 'regional',
            scope: 'forest',
            triggerConditions: {
                playerLevel: { min: 1, max: 15 },
                timeOfDay: 'night',
                probability: 0.3 // 30% chance when conditions met
            },
            duration: 168, // hours (1 week)
            description: 'Goblins are raiding the forest! Increased enemy spawns and danger.',
            effects: {
                enemySpawnRate: 2.0, // Double enemy spawns
                enemyDamageMultiplier: 1.2,
                locationDanger: 'high'
            },
            npcReactions: {
                guard: { emotion: 'alert', dialogue: 'Stay vigilant! Goblins are attacking!' },
                herbalist: { emotion: 'fearful', dialogue: 'Oh no, the forest is not safe!' },
                hunter: { emotion: 'determined', dialogue: 'Time to hunt some goblins!' }
            }
        },
        festival_of_lights: {
            id: 'festival_of_lights',
            name: 'Festival of Lights',
            type: 'regional',
            scope: 'village',
            triggerConditions: {
                month: 12, // December
                day: 25,
                probability: 1.0 // Always triggers
            },
            duration: 24, // hours
            description: 'The annual Festival of Lights brings joy and celebration to the village!',
            effects: {
                npcHappiness: 0.3, // +30% happiness
                shopDiscounts: 0.2, // 20% off all items
                specialEvents: ['fireworks', 'feast']
            },
            npcReactions: {
                innkeeper: { emotion: 'joyful', dialogue: 'Welcome to the Festival! Enjoy the celebrations!' },
                bard: { emotion: 'excited', dialogue: 'Let me play you a festive tune!' },
                merchant: { emotion: 'happy', dialogue: 'Special festival prices today!' }
            }
        },
        merchant_caravan: {
            id: 'merchant_caravan',
            name: 'Merchant Caravan',
            type: 'regional',
            scope: 'village',
            triggerConditions: {
                randomDays: 30, // Every ~30 days
                probability: 0.4
            },
            duration: 48, // hours
            description: 'A merchant caravan has arrived with rare goods from distant lands!',
            effects: {
                specialShop: 'caravan_goods',
                npcWealth: 0.2 // Temporary wealth boost
            },
            npcReactions: {
                merchant: { emotion: 'excited', dialogue: 'My caravan has arrived! Rare treasures await!' },
                guard: { emotion: 'vigilant', dialogue: 'Extra security for the caravan.' }
            }
        },

        // Worldwide Events
        dragon_awakening: {
            id: 'dragon_awakening',
            name: 'Dragon Awakening',
            type: 'worldwide',
            scope: 'global',
            triggerConditions: {
                playerLevel: { min: 20 },
                enemiesKilled: { min: 100 },
                probability: 0.1
            },
            duration: 720, // hours (30 days)
            description: 'Ancient dragons are awakening! The world trembles as these mighty beasts return.',
            effects: {
                globalEnemyLevel: 5, // +5 levels to all enemies
                specialEncounters: ['dragon_scout', 'dragon_egg'],
                weatherEffects: 'stormy'
            },
            npcReactions: {
                librarian: { emotion: 'concerned', dialogue: 'The ancient texts speak of dragon prophecies...' },
                noble: { emotion: 'worried', dialogue: 'This could mean war with the dragons!' },
                priest: { emotion: 'solemn', dialogue: 'We must pray for protection from these ancient evils.' }
            }
        },
        great_tournament: {
            id: 'great_tournament',
            name: 'Great Tournament',
            type: 'worldwide',
            scope: 'global',
            triggerConditions: {
                year: { min: 2 },
                month: 6, // June
                probability: 1.0
            },
            duration: 168, // hours (1 week)
            description: 'Warriors from across the realm gather for the annual Great Tournament!',
            effects: {
                tournamentMode: true,
                specialNPCs: ['tournament_master', 'champion_warrior'],
                increasedRewards: 1.5
            },
            npcReactions: {
                guard: { emotion: 'proud', dialogue: 'Our champion will bring honor to the village!' },
                bard: { emotion: 'inspired', dialogue: 'Epic tales will be made at this tournament!' },
                blacksmith: { emotion: 'busy', dialogue: 'Everyone needs better weapons for the tournament!' }
            }
        },
        plague_outbreak: {
            id: 'plague_outbreak',
            name: 'Plague Outbreak',
            type: 'worldwide',
            scope: 'global',
            triggerConditions: {
                population: { min: 50 },
                randomDays: 180, // Every ~6 months
                probability: 0.15
            },
            duration: 336, // hours (2 weeks)
            description: 'A mysterious plague spreads through the land, affecting health and trade.',
            effects: {
                npcHealthPenalty: 0.3, // -30% health
                tradePenalty: 0.5, // -50% trade efficiency
                specialItems: ['cure_potion', 'herbal_remedy']
            },
            npcReactions: {
                priest: { emotion: 'compassionate', dialogue: 'We must help the afflicted and pray for healing.' },
                herbalist: { emotion: 'determined', dialogue: 'I\'ll work day and night to find a cure!' },
                innkeeper: { emotion: 'worried', dialogue: 'Business is suffering from this terrible plague.' }
            }
        },

        // Guild-related Events
        guild_war: {
            id: 'guild_war',
            name: 'Guild War',
            type: 'regional',
            scope: 'village',
            triggerConditions: {
                activeGuilds: { min: 2 },
                guildRivalry: { min: 50 },
                probability: 0.2
            },
            duration: 168, // hours
            description: 'Two powerful guilds have declared war! The village becomes a battleground.',
            effects: {
                pvpEnabled: true,
                guildBonuses: 1.3, // +30% guild member stats
                neutralZone: false
            },
            npcReactions: {
                guard: { emotion: 'stern', dialogue: 'Guild wars bring chaos. Stay out of the fighting!' },
                merchant: { emotion: 'nervous', dialogue: 'War is bad for business...' },
                noble: { emotion: 'intrigued', dialogue: 'Such conflicts can be... profitable.' }
            }
        },

        // Small-scale Events
        thieves_guild_meeting: {
            id: 'thieves_guild_meeting',
            name: 'Secret Meeting',
            type: 'regional',
            scope: 'village',
            triggerConditions: {
                timeOfDay: 'midnight',
                playerAlignment: 'neutral',
                probability: 0.1
            },
            duration: 2, // hours
            description: 'Whispers of a secret thieves\' guild meeting in the shadows.',
            effects: {
                specialEncounter: 'thief_contact',
                stealthOpportunities: true
            },
            npcReactions: {
                thief: { emotion: 'mysterious', dialogue: 'The shadows hold many secrets tonight...' }
            }
        },
        magical_storm: {
            id: 'magical_storm',
            name: 'Magical Storm',
            type: 'regional',
            scope: 'mountains',
            triggerConditions: {
                weather: 'storm',
                moonPhase: 'full',
                probability: 0.25
            },
            duration: 12, // hours
            description: 'Arcane energies surge through the mountains, causing magical anomalies.',
            effects: {
                randomEnchantments: true,
                spellPower: 1.5,
                magicalCreatures: ['mana_beast', 'crystal_golem']
            },
            npcReactions: {
                inventor: { emotion: 'excited', dialogue: 'Such magical energy! I must harness it!' },
                scholar: { emotion: 'fascinated', dialogue: 'This storm could reveal ancient secrets!' }
            }
        },
        harvest_festival: {
            id: 'harvest_festival',
            name: 'Harvest Festival',
            type: 'regional',
            scope: 'village',
            triggerConditions: {
                month: 9, // September
                day: 15,
                probability: 1.0
            },
            duration: 48, // hours
            description: 'The annual harvest festival celebrates the bounty of the land.',
            effects: {
                foodAbundance: true,
                npcHappiness: 0.2,
                specialRecipes: ['harvest_pie', 'seasonal_stew']
            },
            npcReactions: {
                farmer: { emotion: 'proud', dialogue: 'Look at this bountiful harvest!' },
                innkeeper: { emotion: 'cheerful', dialogue: 'Come celebrate with food and drink!' },
                herbalist: { emotion: 'content', dialogue: 'Nature provides so generously.' }
            }
        }
    },

    // NPC Emotions and Personality System
    npcEmotions: {
        // Base emotions
        neutral: {
            name: 'Neutral',
            icon: '😐',
            dialogueModifier: '',
            behaviorModifier: {}
        },
        happy: {
            name: 'Happy',
            icon: '😊',
            dialogueModifier: 'with a warm smile',
            behaviorModifier: { friendliness: 0.2, generosity: 0.1 }
        },
        sad: {
            name: 'Sad',
            icon: '😢',
            dialogueModifier: 'with a heavy heart',
            behaviorModifier: { friendliness: -0.1, generosity: -0.2 }
        },
        angry: {
            name: 'Angry',
            icon: '😠',
            dialogueModifier: 'with barely contained rage',
            behaviorModifier: { friendliness: -0.3, aggression: 0.2 }
        },
        fearful: {
            name: 'Fearful',
            icon: '😨',
            dialogueModifier: 'trembling with fear',
            behaviorModifier: { helpfulness: -0.2, caution: 0.3 }
        },
        excited: {
            name: 'Excited',
            icon: '🤩',
            dialogueModifier: 'bubbling with excitement',
            behaviorModifier: { energy: 0.3, talkativeness: 0.2 }
        },
        determined: {
            name: 'Determined',
            icon: '💪',
            dialogueModifier: 'with steely resolve',
            behaviorModifier: { courage: 0.3, persistence: 0.2 }
        },
        confused: {
            name: 'Confused',
            icon: '😕',
            dialogueModifier: 'looking bewildered',
            behaviorModifier: { helpfulness: -0.1, decisiveness: -0.2 }
        },
        suspicious: {
            name: 'Suspicious',
            icon: '🤨',
            dialogueModifier: 'eyeing you warily',
            behaviorModifier: { trust: -0.3, caution: 0.2 }
        },
        joyful: {
            name: 'Joyful',
            icon: '😄',
            dialogueModifier: 'beaming with joy',
            behaviorModifier: { friendliness: 0.3, generosity: 0.2 }
        },
        worried: {
            name: 'Worried',
            icon: '😰',
            dialogueModifier: 'with concern etched on their face',
            behaviorModifier: { caution: 0.2, helpfulness: 0.1 }
        },
        proud: {
            name: 'Proud',
            icon: '🦚',
            dialogueModifier: 'standing tall with pride',
            behaviorModifier: { confidence: 0.3, leadership: 0.2 }
        },
        compassionate: {
            name: 'Compassionate',
            icon: '🤗',
            dialogueModifier: 'with genuine care',
            behaviorModifier: { empathy: 0.3, helpfulness: 0.2 }
        },
        mysterious: {
            name: 'Mysterious',
            icon: '🕵️',
            dialogueModifier: 'with an enigmatic air',
            behaviorModifier: { secrecy: 0.3, intrigue: 0.2 }
        },
        alert: {
            name: 'Alert',
            icon: '🚨',
            dialogueModifier: 'scanning their surroundings',
            behaviorModifier: { vigilance: 0.3, caution: 0.2 }
        },
        busy: {
            name: 'Busy',
            icon: '🏃',
            dialogueModifier: 'hurriedly attending to tasks',
            behaviorModifier: { impatience: 0.2, efficiency: 0.1 }
        },
        content: {
            name: 'Content',
            icon: '😌',
            dialogueModifier: 'looking satisfied',
            behaviorModifier: { peacefulness: 0.2, stability: 0.1 }
        },
        intrigued: {
            name: 'Intrigued',
            icon: '🤔',
            dialogueModifier: 'with curiosity sparked',
            behaviorModifier: { interest: 0.3, attentiveness: 0.2 }
        },
        solemn: {
            name: 'Solemn',
            icon: '🙏',
            dialogueModifier: 'with grave seriousness',
            behaviorModifier: { reverence: 0.2, thoughtfulness: 0.1 }
        },
        inspired: {
            name: 'Inspired',
            icon: '✨',
            dialogueModifier: 'with creative spark',
            behaviorModifier: { creativity: 0.3, motivation: 0.2 }
        },
        nervous: {
            name: 'Nervous',
            icon: '😬',
            dialogueModifier: 'fidgeting anxiously',
            behaviorModifier: { anxiety: 0.2, caution: 0.1 }
        },
        stern: {
            name: 'Stern',
            icon: '😤',
            dialogueModifier: 'with a firm expression',
            behaviorModifier: { authority: 0.2, discipline: 0.1 }
        },
        vigilant: {
            name: 'Vigilant',
            icon: '👀',
            dialogueModifier: 'keeping watchful eyes',
            behaviorModifier: { awareness: 0.3, caution: 0.1 }
        },
        fascinated: {
            name: 'Fascinated',
            icon: '🔍',
            dialogueModifier: 'completely absorbed',
            behaviorModifier: { curiosity: 0.3, focus: 0.2 }
        }
    },

    // NPC Types/Varieties with enhanced behaviors
    npcTypes: {
        merchant: {
            baseType: 'shopkeeper',
            varieties: {
                honest_trader: {
                    name: 'Honest Trader',
                    traits: ['trustworthy', 'fair', 'knowledgeable'],
                    emotionWeights: { happy: 0.3, content: 0.2, busy: 0.2 },
                    dialogueStyle: 'professional'
                },
                shrewd_businessman: {
                    name: 'Shrewd Businessman',
                    traits: ['calculating', 'ambitious', 'persuasive'],
                    emotionWeights: { suspicious: 0.2, excited: 0.2, determined: 0.2 },
                    dialogueStyle: 'persuasive'
                },
                traveling_salesman: {
                    name: 'Traveling Salesman',
                    traits: ['charismatic', 'adventurous', 'storyteller'],
                    emotionWeights: { excited: 0.3, happy: 0.2, mysterious: 0.1 },
                    dialogueStyle: 'enthusiastic'
                }
            }
        },
        guard: {
            baseType: 'protector',
            varieties: {
                veteran_soldier: {
                    name: 'Veteran Soldier',
                    traits: ['disciplined', 'experienced', 'loyal'],
                    emotionWeights: { stern: 0.3, alert: 0.2, proud: 0.2 },
                    dialogueStyle: 'authoritative'
                },
                rookie_guard: {
                    name: 'Rookie Guard',
                    traits: ['eager', 'inexperienced', 'enthusiastic'],
                    emotionWeights: { nervous: 0.2, excited: 0.2, determined: 0.2 },
                    dialogueStyle: 'eager'
                },
                corrupt_official: {
                    name: 'Corrupt Official',
                    traits: ['deceitful', 'greedy', 'cunning'],
                    emotionWeights: { suspicious: 0.3, nervous: 0.2, mysterious: 0.1 },
                    dialogueStyle: 'evasive'
                }
            }
        },
        priest: {
            baseType: 'spiritual',
            varieties: {
                devout_follower: {
                    name: 'Devout Follower',
                    traits: ['faithful', 'compassionate', 'wise'],
                    emotionWeights: { solemn: 0.3, compassionate: 0.2, content: 0.2 },
                    dialogueStyle: 'spiritual'
                },
                scholarly_theologian: {
                    name: 'Scholarly Theologian',
                    traits: ['learned', 'analytical', 'thoughtful'],
                    emotionWeights: { intrigued: 0.2, content: 0.2, fascinated: 0.2 },
                    dialogueStyle: 'intellectual'
                },
                miracle_worker: {
                    name: 'Miracle Worker',
                    traits: ['mystical', 'healing', 'inspired'],
                    emotionWeights: { inspired: 0.3, joyful: 0.2, compassionate: 0.2 },
                    dialogueStyle: 'mystical'
                }
            }
        },
        entertainer: {
            baseType: 'performer',
            varieties: {
                traveling_bard: {
                    name: 'Traveling Bard',
                    traits: ['charismatic', 'musical', 'storyteller'],
                    emotionWeights: { excited: 0.3, happy: 0.2, inspired: 0.2 },
                    dialogueStyle: 'poetic'
                },
                street_performer: {
                    name: 'Street Performer',
                    traits: ['energetic', 'creative', 'optimistic'],
                    emotionWeights: { joyful: 0.3, excited: 0.2, content: 0.1 },
                    dialogueStyle: 'lively'
                },
                mysterious_minstrel: {
                    name: 'Mysterious Minstrel',
                    traits: ['enigmatic', 'talented', 'secretive'],
                    emotionWeights: { mysterious: 0.3, intrigued: 0.2, solemn: 0.1 },
                    dialogueStyle: 'cryptic'
                }
            }
        },
        scholar: {
            baseType: 'intellectual',
            varieties: {
                ancient_librarian: {
                    name: 'Ancient Librarian',
                    traits: ['knowledgeable', 'patient', 'methodical'],
                    emotionWeights: { content: 0.3, intrigued: 0.2, fascinated: 0.2 },
                    dialogueStyle: 'scholarly'
                },
                eccentric_inventor: {
                    name: 'Eccentric Inventor',
                    traits: ['creative', 'unpredictable', 'brilliant'],
                    emotionWeights: { excited: 0.3, confused: 0.2, inspired: 0.2 },
                    dialogueStyle: 'rambling'
                },
                noble_academic: {
                    name: 'Noble Academic',
                    traits: ['refined', 'ambitious', 'analytical'],
                    emotionWeights: { proud: 0.2, intrigued: 0.2, determined: 0.2 },
                    dialogueStyle: 'formal'
                }
            }
        }
    },

    // Guild System
    guilds: {
        // Pre-existing guilds that players can join
        warriors_guild: {
            id: 'warriors_guild',
            name: 'Order of the Iron Blade',
            emblem: '⚔️',
            description: 'A brotherhood of warriors dedicated to honor, strength, and protection of the realm.',
            leader: 'Grandmaster Thorne',
            founded: 'Year 1',
            memberCount: 0,
            maxMembers: 50,
            reputation: 100,
            specialization: 'combat',
            requirements: { level: 5, class: 'warrior' },
            headquarters: 'village'
        },
        mages_guild: {
            id: 'mages_guild',
            name: 'Arcane Brotherhood',
            emblem: '🔮',
            description: 'Masters of magic who seek to understand and harness the arcane forces of the world.',
            leader: 'Archmage Valeria',
            founded: 'Year 1',
            memberCount: 0,
            maxMembers: 30,
            reputation: 100,
            specialization: 'magic',
            requirements: { level: 5, class: 'mage' },
            headquarters: 'library'
        },
        rogues_guild: {
            id: 'rogues_guild',
            name: 'Shadow Collective',
            emblem: '🗡️',
            description: 'A network of skilled operatives who operate in the shadows, gathering information and striking from the darkness.',
            leader: 'Master Shadow',
            founded: 'Year 1',
            memberCount: 0,
            maxMembers: 25,
            reputation: 50,
            specialization: 'stealth',
            requirements: { level: 8, alignment: 'neutral' },
            headquarters: 'dungeon'
        },
        clerics_guild: {
            id: 'clerics_guild',
            name: 'Divine Order',
            emblem: '✝️',
            description: 'Servants of the divine who heal the wounded, banish evil, and spread the light of faith.',
            leader: 'High Priestess Elowen',
            founded: 'Year 1',
            memberCount: 0,
            maxMembers: 40,
            reputation: 100,
            specialization: 'healing',
            requirements: { level: 5, class: 'cleric' },
            headquarters: 'village'
        },
        merchants_guild: {
            id: 'merchants_guild',
            name: 'Golden Caravan',
            emblem: '💰',
            description: 'A coalition of traders and merchants who control the flow of goods across the realm.',
            leader: 'Lord Goldworth',
            founded: 'Year 1',
            memberCount: 0,
            maxMembers: 60,
            reputation: 75,
            specialization: 'trade',
            requirements: { gold: 1000 },
            headquarters: 'village'
        },
        hunters_guild: {
            id: 'hunters_guild',
            name: 'Wilderness Wardens',
            emblem: '🏹',
            description: 'Protectors of the wild who track dangerous beasts and maintain balance with nature.',
            leader: 'Ranger Captain Kael',
            founded: 'Year 1',
            memberCount: 0,
            maxMembers: 35,
            reputation: 80,
            specialization: 'ranged',
            requirements: { level: 3 },
            headquarters: 'forest'
        }
    },

    // Guild Perks by Level
    guildPerks: {
        1: {
            name: 'Initiate',
            hpBonus: 5,
            mpBonus: 2,
            attackBonus: 1,
            defenseBonus: 1,
            speedBonus: 0,
            goldBonus: 10,
            description: 'Basic guild membership benefits'
        },
        2: {
            name: 'Apprentice',
            hpBonus: 10,
            mpBonus: 5,
            attackBonus: 2,
            defenseBonus: 2,
            speedBonus: 1,
            goldBonus: 25,
            description: 'Improved guild benefits'
        },
        3: {
            name: 'Journeyman',
            hpBonus: 15,
            mpBonus: 8,
            attackBonus: 3,
            defenseBonus: 3,
            speedBonus: 2,
            goldBonus: 50,
            description: 'Advanced guild benefits'
        },
        4: {
            name: 'Expert',
            hpBonus: 20,
            mpBonus: 12,
            attackBonus: 4,
            defenseBonus: 4,
            speedBonus: 3,
            goldBonus: 75,
            description: 'Expert guild benefits'
        },
        5: {
            name: 'Master',
            hpBonus: 25,
            mpBonus: 15,
            attackBonus: 5,
            defenseBonus: 5,
            speedBonus: 4,
            goldBonus: 100,
            description: 'Master guild benefits'
        }
    },

    // Guild Specializations and Abilities
    guildSpecializations: {
        combat: {
            name: 'Combat Mastery',
            abilities: {
                battleHardened: 'Increased damage against enemies',
                tacticalCommand: 'Can coordinate group combat',
                weaponMastery: 'Bonus damage with weapons'
            },
            scoutingFocus: 'enemy_detection'
        },
        magic: {
            name: 'Arcane Mastery',
            abilities: {
                manaReserve: 'Increased maximum MP',
                spellPower: 'Spells deal more damage',
                arcaneKnowledge: 'Can identify magical items'
            },
            scoutingFocus: 'magical_anomalies'
        },
        stealth: {
            name: 'Shadow Arts',
            abilities: {
                stealthMastery: 'Harder to detect',
                trapDisarming: 'Can detect and disarm traps',
                informationNetwork: 'Access to underworld contacts'
            },
            scoutingFocus: 'hidden_passages'
        },
        healing: {
            name: 'Divine Healing',
            abilities: {
                regeneration: 'Passive HP regeneration',
                blessingOfProtection: 'Temporary defense boost',
                purification: 'Can remove negative effects'
            },
            scoutingFocus: 'healing_herbs'
        },
        trade: {
            name: 'Merchant Mastery',
            abilities: {
                bargainHunter: 'Better prices when buying',
                salesMaster: 'Higher prices when selling',
                caravanProtection: 'Reduced travel dangers'
            },
            scoutingFocus: 'trade_routes'
        },
        ranged: {
            name: 'Ranger Skills',
            abilities: {
                eagleEye: 'Increased ranged accuracy',
                survivalist: 'Bonus in wilderness areas',
                beastMaster: 'Can tame wild animals'
            },
            scoutingFocus: 'wildlife_tracking'
        }
    },

    // Guild Scouting Missions
    scoutingMissions: {
        enemy_detection: {
            name: 'Enemy Patrol',
            description: 'Scout for enemy movements and potential threats',
            duration: 4, // hours
            difficulty: 'medium',
            rewards: {
                exp: 200,
                gold: 50,
                items: ['enemy_intel']
            },
            requirements: { guildLevel: 2 }
        },
        magical_anomalies: {
            name: 'Arcane Survey',
            description: 'Investigate reports of strange magical phenomena',
            duration: 6,
            difficulty: 'hard',
            rewards: {
                exp: 300,
                gold: 75,
                items: ['mana_crystal', 'arcane_scroll']
            },
            requirements: { guildLevel: 3 }
        },
        hidden_passages: {
            name: 'Secret Paths',
            description: 'Map out hidden tunnels and secret passages',
            duration: 8,
            difficulty: 'hard',
            rewards: {
                exp: 400,
                gold: 100,
                items: ['hidden_map', 'secret_key']
            },
            requirements: { guildLevel: 4 }
        },
        healing_herbs: {
            name: 'Herbal Expedition',
            description: 'Search for rare medicinal plants and herbs',
            duration: 3,
            difficulty: 'easy',
            rewards: {
                exp: 150,
                gold: 40,
                items: ['rare_herb', 'healing_salve']
            },
            requirements: { guildLevel: 1 }
        },
        trade_routes: {
            name: 'Caravan Escort',
            description: 'Escort merchant caravans and map safe trade routes',
            duration: 12,
            difficulty: 'medium',
            rewards: {
                exp: 250,
                gold: 150,
                items: ['trade_manifest', 'caravan_token']
            },
            requirements: { guildLevel: 2 }
        },
        wildlife_tracking: {
            name: 'Beast Hunt',
            description: 'Track and study dangerous wildlife in the wilderness',
            duration: 5,
            difficulty: 'medium',
            rewards: {
                exp: 180,
                gold: 60,
                items: ['beast_hide', 'tracking_notes']
            },
            requirements: { guildLevel: 2 }
        }
    }
};
