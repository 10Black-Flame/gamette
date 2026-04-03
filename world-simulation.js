// Living World Simulation for Chronicles of Aetheria
// Handles time progression, NPC behavior, births, deaths, and random events

class WorldTime {
    constructor() {
        this.year = 1;
        this.month = 1;
        this.day = 1;
        this.hour = 6; // Start at morning
        this.gameLoops = 0; // Increment every 100ms
    }

    advance(hours = 1) {
        this.hour += hours;
        if (this.hour >= 24) {
            this.hour -= 24;
            this.day++;
            this.onDayChange();
        }
        if (this.day > 30) {
            this.day = 1;
            this.month++;
            this.onMonthChange();
        }
        if (this.month > 12) {
            this.month = 1;
            this.year++;
            this.onYearChange();
        }
    }

    onDayChange() {
        // Trigger daily events
        if (worldSimulation) {
            worldSimulation.processActiveEvents();
            worldSimulation.checkNPCDeaths();
        }
    }

    onMonthChange() {
        // Trigger monthly events
    }

    onYearChange() {
        // Trigger yearly events
    }

    toString() {
        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const season = this.getSeason();
        return `${monthNames[this.month]} ${this.day}, Year ${this.year} - ${this.getPeriod().name} (${this.hour}:00) | ${season}`;
    }

    getPeriod() {
        if (this.hour < 6) return GAME_DATA.timePeriods.night;
        if (this.hour < 12) return GAME_DATA.timePeriods.morning;
        if (this.hour < 18) return GAME_DATA.timePeriods.afternoon;
        return GAME_DATA.timePeriods.evening;
    }

    getSeason() {
        for (let season of GAME_DATA.seasons) {
            if (this.month >= season.monthStart && (this.month < season.monthStart + 3 || season.monthStart > 10)) {
                return season.name;
            }
        }
        return GAME_DATA.seasons[0].name;
    }
}

class NPCState {
    constructor(npcId, npcData) {
        this.id = npcId;
        this.name = npcData.name;
        this.age = GAME_DATA.npc_extended[npcId]?.age || 30;
        this.maxAge = 80 + Math.random() * 20;
        this.happiness = 0.5;
        this.health = 1.0;
        this.wealth = Math.random() * 500 + 100;
        this.relationship = 0;
        this.profession = GAME_DATA.npc_extended[npcId]?.profession || 'citizen';
        this.spouse = null;
        this.children = [];
        this.alive = true;
        this.deathDay = null;
        
        // New emotion system
        this.currentEmotion = 'neutral';
        this.emotionIntensity = 0.5;
        this.emotionDuration = 0;
        this.personalityTraits = npcData.personality ? [npcData.personality] : ['neutral'];
        this.npcType = this.determineNPCType(npcId);
        this.npcVariety = this.determineNPCVariety(npcId);
    }

    determineNPCType(npcId) {
        const npcData = GAME_DATA.npcs[npcId];
        if (npcData.type) {
            // Map existing types to new system
            const typeMapping = {
                'shopkeeper': 'merchant',
                'quest_giver': 'villager',
                'entertainer': 'entertainer',
                'guide': 'villager',
                'informant': 'villager'
            };
            return typeMapping[npcData.type] || 'villager';
        }
        return 'villager';
    }

    determineNPCVariety(npcId) {
        const npcType = this.npcType;
        if (GAME_DATA.npcTypes[npcType]) {
            const varieties = Object.keys(GAME_DATA.npcTypes[npcType].varieties);
            return varieties[Math.floor(Math.random() * varieties.length)];
        }
        return null;
    }

    updateEmotion() {
        // Emotion duration decreases
        if (this.emotionDuration > 0) {
            this.emotionDuration--;
            if (this.emotionDuration <= 0) {
                this.currentEmotion = 'neutral';
                this.emotionIntensity = 0.5;
            }
        }

        // Random emotion changes based on personality
        if (Math.random() < 0.1) { // 10% chance daily
            this.randomEmotionShift();
        }
    }

    setEmotion(emotion, intensity = 0.7, duration = 24) { // 24 hours default
        if (GAME_DATA.npcEmotions[emotion]) {
            this.currentEmotion = emotion;
            this.emotionIntensity = intensity;
            this.emotionDuration = duration;
        }
    }

    randomEmotionShift() {
        const npcType = this.npcType;
        const variety = this.npcVariety;
        
        if (variety && GAME_DATA.npcTypes[npcType]?.varieties[variety]?.emotionWeights) {
            const weights = GAME_DATA.npcTypes[npcType].varieties[variety].emotionWeights;
            const emotions = Object.keys(weights);
            
            // Weighted random selection
            let totalWeight = 0;
            for (let emotion of emotions) {
                totalWeight += weights[emotion];
            }
            
            let random = Math.random() * totalWeight;
            for (let emotion of emotions) {
                random -= weights[emotion];
                if (random <= 0) {
                    this.setEmotion(emotion, 0.4, 12); // Mild emotion for 12 hours
                    break;
                }
            }
        }
    }

    getEmotionDisplay() {
        const emotionData = GAME_DATA.npcEmotions[this.currentEmotion];
        return {
            icon: emotionData.icon,
            name: emotionData.name,
            modifier: emotionData.dialogueModifier,
            intensity: this.emotionIntensity
        };
    }

    age_annually() {
        this.age += 1;
        if (this.age > this.maxAge) {
            this.die('old age');
        }
        this.updateEmotion();
    }

    die(reason = 'unknown') {
        this.alive = false;
        this.deathDay = worldTime.toString();
        this.setEmotion('sad', 0.8, 168); // Grieve for a week (but they're dead, so this won't show)
    }

    canHaveChild() {
        return this.age >= 18 && this.age <= 45 && this.spouse !== null && this.alive;
    }

    updateMood() {
        this.happiness += (Math.random() - 0.5) * 0.1;
        this.happiness = Math.max(0, Math.min(1, this.happiness));
    }
}

class WorldSimulation {
    constructor() {
        this.npcStates = {};
        this.activeEvents = [];
        this.eventHistory = [];
        this.worldLogs = [];
        this.populationStats = {};
        this.initializeNPCs();
    }

    initializeNPCs() {
        // Create living state for each NPC
        for (let npcId in GAME_DATA.npcs) {
            this.npcStates[npcId] = new NPCState(npcId, GAME_DATA.npcs[npcId]);
        }
        this.updatePopulationStats();
    }

    processActiveEvents() {
        // Update active events
        this.activeEvents = this.activeEvents.filter(event => {
            event.duration--;
            return event.duration > 0;
        });

        // Apply event effects to NPCs
        this.applyEventEffects();

        // Check for new events
        this.checkForNewEvents();
    }

    applyEventEffects() {
        for (let event of this.activeEvents) {
            const eventData = GAME_DATA.events[event.id];
            if (eventData && eventData.npcReactions) {
                // Apply emotion changes to affected NPCs
                for (let npcId in eventData.npcReactions) {
                    if (this.npcStates[npcId]) {
                        const reaction = eventData.npcReactions[npcId];
                        this.npcStates[npcId].setEmotion(
                            reaction.emotion, 
                            0.8, // High intensity for event reactions
                            Math.min(event.duration, 48) // Up to 2 days
                        );
                    }
                }
            }
        }
    }

    checkForNewEvents() {
        for (let eventId in GAME_DATA.events) {
            const eventTemplate = GAME_DATA.events[eventId];
            
            // Check if event should trigger based on conditions
            if (this.shouldTriggerEvent(eventTemplate)) {
                this.triggerEvent(eventTemplate);
            }
        }
    }

    shouldTriggerEvent(eventTemplate) {
        const conditions = eventTemplate.triggerConditions;
        
        // Check probability
        if (conditions.probability && Math.random() > conditions.probability) {
            return false;
        }
        
        // Check player level
        if (conditions.playerLevel) {
            if (gameState?.player?.level < conditions.playerLevel.min || 
                gameState?.player?.level > conditions.playerLevel.max) {
                return false;
            }
        }
        
        // Check time-based conditions
        if (conditions.month && worldTime.month !== conditions.month) return false;
        if (conditions.day && worldTime.day !== conditions.day) return false;
        if (conditions.year && conditions.year.min && worldTime.year < conditions.year.min) return false;
        
        // Check time of day
        if (conditions.timeOfDay) {
            const currentPeriod = worldTime.getPeriod().name.toLowerCase();
            if (currentPeriod !== conditions.timeOfDay) return false;
        }
        
        // Check player stats
        if (conditions.enemiesKilled && gameState?.player?.enemiesKilled < conditions.enemiesKilled.min) return false;
        
        // Check population
        if (conditions.population && this.populationStats.total < conditions.population.min) return false;
        
        // Check random timing
        if (conditions.randomDays) {
            // Simple random check - could be improved with proper scheduling
            if (Math.random() > (1 / conditions.randomDays)) return false;
        }
        
        // Check guild conditions
        if (conditions.activeGuilds && gameState?.player?.guild?.joined) {
            // Simplified - just check if player is in a guild
            if (conditions.activeGuilds.min > 1) return false; // Would need guild count tracking
        }
        
        return true;
    }

    triggerEvent(eventTemplate) {
        const newEvent = {
            id: eventTemplate.id,
            name: eventTemplate.name,
            description: eventTemplate.description,
            type: eventTemplate.type,
            scope: eventTemplate.scope,
            duration: eventTemplate.duration || 24, // Default 1 day
            effects: eventTemplate.effects || {},
            startTime: worldTime.toString()
        };

        this.activeEvents.push(newEvent);
        this.eventHistory.push(newEvent);
        this.worldLogs.push(`[${worldTime.toString()}] 📰 ${newEvent.name}: ${newEvent.description}`);

        // Apply immediate effects
        this.applyImmediateEventEffects(eventTemplate);

        return newEvent;
    }

    applyImmediateEventEffects(eventTemplate) {
        // Apply effects based on event type
        if (eventTemplate.effects.npcHappiness) {
            for (let npcId in this.npcStates) {
                this.npcStates[npcId].happiness += eventTemplate.effects.npcHappiness;
                this.npcStates[npcId].happiness = Math.max(0, Math.min(1, this.npcStates[npcId].happiness));
            }
        }

        if (eventTemplate.effects.npcHealthPenalty) {
            for (let npcId in this.npcStates) {
                this.npcStates[npcId].health *= (1 - eventTemplate.effects.npcHealthPenalty);
                this.npcStates[npcId].health = Math.max(0.1, this.npcStates[npcId].health);
            }
        }

        // Set NPC emotions based on event reactions
        if (eventTemplate.npcReactions) {
            for (let npcId in eventTemplate.npcReactions) {
                if (this.npcStates[npcId]) {
                    const reaction = eventTemplate.npcReactions[npcId];
                    this.npcStates[npcId].setEmotion(reaction.emotion, 0.8, eventTemplate.duration);
                }
            }
        }
    }

    getRandomLocation() {
        const locations = Object.keys(GAME_DATA.locations);
        return locations[Math.floor(Math.random() * locations.length)];
    }

    spawnNPC() {
        // Create a new NPC (baby born)
        const npcId = `npc_born_${Date.now()}`;
        const newNPC = new NPCState(npcId, {
            name: this.generateRandomName() + ' (Baby)',
            description: 'A newborn infant'
        });
        newNPC.age = 0;
        this.npcStates[npcId] = newNPC;
        this.worldLogs.push(`👶 A baby named ${newNPC.name.replace(' (Baby)', '')} was born!`);
    }

    generateRandomName() {
        const names = ['Aldric', 'Beatrice', 'Cedric', 'Diana', 'Elara', 'Finnegan', 'Grace', 'Henry',
                       'Iris', 'James', 'Keira', 'Lancelot', 'Meredith', 'Nathan', 'Olivia', 'Percival'];
        return names[Math.floor(Math.random() * names.length)];
    }

    checkNPCDeaths() {
        const plague = this.activeEvents.find(e => e.type === 'plague');
        const deathChance = plague ? 0.01 : 0.001;

        for (let npcId in this.npcStates) {
            const npc = this.npcStates[npcId];
            if (npc.alive) {
                // Age-related death
                if (npc.age > npc.maxAge && Math.random() < 0.5) {
                    npc.die('old age');
                    this.worldLogs.push(`⚰️ ${npc.name} passed away at age ${npc.age}.`);
                }
                // Random death
                else if (Math.random() < deathChance) {
                    npc.die('accident');
                    this.worldLogs.push(`⚰️ ${npc.name} met an unfortunate end.`);
                }
            }
        }
        this.updatePopulationStats();
    }

    causePlague() {
        // Increase death chance for NPCs
        for (let npcId in this.npcStates) {
            const npc = this.npcStates[npcId];
            if (npc.alive && Math.random() < 0.3) {
                npc.health -= 0.3;
            }
        }
    }

    updatePopulationStats() {
        let alive = 0, dead = 0;
        for (let npc of Object.values(this.npcStates)) {
            if (npc.alive) alive++;
            else dead++;
        }
        this.populationStats = { alive, dead, total: alive + dead };
    }

    getNPCInfo(npcId) {
        const npc = this.npcStates[npcId];
        if (!npc) return null;
        return {
            name: npc.name,
            age: npc.age,
            alive: npc.alive,
            profession: npc.profession,
            happiness: Math.round(npc.happiness * 100),
            health: Math.round(npc.health * 100),
            wealth: Math.round(npc.wealth),
            deathDay: npc.deathDay
        };
    }

    getWorldStatus() {
        return {
            time: worldTime.toString(),
            season: worldTime.getSeason(),
            population: this.populationStats,
            activeEvents: this.activeEvents.length,
            logs: this.worldLogs.slice(-10) // Last 10 logs
        };
    }

    applyEffects() {
        // Apply effects from active events to gameplay
        let combinedEffects = {};
        for (let event of this.activeEvents) {
            Object.assign(combinedEffects, event.effects);
        }
        return combinedEffects;
    }
}

// Global instances
let worldTime = null;
let worldSimulation = null;

// Initialize world on game start
function initializeWorld() {
    worldTime = new WorldTime();
    worldSimulation = new WorldSimulation();
    console.log('🌍 World simulation initialized');
    updateWorldDisplay();
}

// Update world display in UI
function updateWorldDisplay() {
    const display = document.getElementById('world-time-display');
    if (display) {
        display.textContent = worldTime.toString();
    }
}

// Simulate world progression
function simulateWorldTick() {
    if (!worldTime) return;
    
    // Advance time every few game loops
    worldTime.gameLoops++;
    if (worldTime.gameLoops % 25 === 0) {
        worldTime.advance(1); // Advance 1 hour
        updateWorldDisplay();
        
        // Update world every in-game day
        if (worldTime.hour % 6 === 0) {
            worldSimulation.processActiveEvents();
        }
    }
}

// Get formatted world info for UI
function getWorldInfo() {
    if (!worldSimulation) return {};
    return worldSimulation.getWorldStatus();
}
