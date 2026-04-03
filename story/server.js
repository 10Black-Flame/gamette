// Server backend for Chronicles of Aetheria
// Run: node server.js
// Install dependencies first: npm install

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Database Setup
const db = new sqlite3.Database('game.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function initializeDatabase() {
    db.serialize(() => {
        // Create users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                password_hash TEXT NOT NULL,
                reset_token TEXT,
                reset_token_expires DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME
            )
        `);

        // Create players table
        db.run(`
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                player_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                class TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 100,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);

        // Create game_saves table
        db.run(`
            CREATE TABLE IF NOT EXISTS game_saves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                save_data TEXT NOT NULL,
                saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (player_id) REFERENCES players(player_id)
            )
        `);

        // Create world_state table
        db.run(`
            CREATE TABLE IF NOT EXISTS world_state (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                world_data TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create guilds table
        db.run(`
            CREATE TABLE IF NOT EXISTS guilds (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                emblem TEXT NOT NULL,
                description TEXT,
                leader_id INTEGER NOT NULL,
                founded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                member_count INTEGER DEFAULT 1,
                max_members INTEGER DEFAULT 50,
                reputation INTEGER DEFAULT 0,
                specialization TEXT,
                headquarters TEXT,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                gold INTEGER DEFAULT 0,
                FOREIGN KEY (leader_id) REFERENCES users(id)
            )
        `);

        // Create guild_members table
        db.run(`
            CREATE TABLE IF NOT EXISTS guild_members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                player_id TEXT NOT NULL,
                rank TEXT DEFAULT 'member',
                joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                contribution INTEGER DEFAULT 0,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (player_id) REFERENCES players(player_id),
                UNIQUE(guild_id, user_id)
            )
        `);

        // Create guild_scouting table
        db.run(`
            CREATE TABLE IF NOT EXISTS guild_scouting (
                id TEXT PRIMARY KEY,
                guild_id TEXT NOT NULL,
                player_id TEXT NOT NULL,
                user_id INTEGER NOT NULL,
                mission_type TEXT NOT NULL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME NOT NULL,
                completed INTEGER DEFAULT 0,
                completed_at DATETIME,
                rewards_claimed INTEGER DEFAULT 0,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (player_id) REFERENCES players(player_id)
            )
        `);

        // Create leaderboard view
        db.run(`
            CREATE VIEW IF NOT EXISTS leaderboard AS
            SELECT p.name, p.class, p.level, p.exp, p.gold, p.created_at, u.username
            FROM players p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.level DESC, p.exp DESC
            LIMIT 100
        `);
    });
}

// Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// ===== AUTHENTICATION ROUTES =====

// Register
app.post('/api/auth/register', (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    if (password !== confirmPassword) {
        res.status(400).json({ error: 'Passwords do not match' });
        return;
    }

    if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }

    const passwordHash = hashPassword(password);

    db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email || null, passwordHash],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    res.status(400).json({ error: 'Username already exists' });
                } else {
                    res.status(500).json({ error: err.message });
                }
            } else {
                res.json({ success: true, userId: this.lastID });
            }
        }
    );
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Missing username or password' });
        return;
    }

    const passwordHash = hashPassword(password);

    db.get(
        'SELECT id, username, email FROM users WHERE username = ? AND password_hash = ?',
        [username, passwordHash],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (row) {
                // Update last login
                db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [row.id]);
                
                res.json({
                    success: true,
                    userId: row.id,
                    username: row.username,
                    email: row.email
                });
            } else {
                res.status(401).json({ error: 'Invalid username or password' });
            }
        }
    );
});

// Request Password Reset
app.post('/api/auth/forgot-password', (req, res) => {
    const { username, email } = req.body;

    if (!username && !email) {
        res.status(400).json({ error: 'Please provide username or email' });
        return;
    }

    let query = 'SELECT id, username, email FROM users WHERE ';
    let params = [];

    if (username && email) {
        query += 'username = ? OR email = ?';
        params = [username, email];
    } else if (username) {
        query += 'username = ?';
        params = [username];
    } else {
        query += 'email = ?';
        params = [email];
    }

    db.get(query, params, (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            db.run(
                'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
                [resetToken, expiresAt.toISOString(), row.id],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    } else {
                        // In a real application, you would send this via email
                        // For this demo, we'll return it directly
                        res.json({
                            success: true,
                            message: 'Password reset token generated',
                            resetToken: resetToken,
                            note: 'In a real application, this token would be sent to your email'
                        });
                    }
                }
            );
        } else {
            // Don't reveal if user exists or not for security
            res.json({
                success: true,
                message: 'If an account with that username/email exists, a reset token has been generated',
                note: 'Check your email for the reset token (in demo mode, it\'s returned here)'
            });
        }
    });
});

// Reset Password
app.post('/api/auth/reset-password', (req, res) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    if (newPassword !== confirmPassword) {
        res.status(400).json({ error: 'Passwords do not match' });
        return;
    }

    if (newPassword.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
    }

    // Check if token is valid and not expired
    db.get(
        'SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > CURRENT_TIMESTAMP',
        [resetToken],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (row) {
                const newPasswordHash = hashPassword(newPassword);

                // Update password and clear reset token
                db.run(
                    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                    [newPasswordHash, row.id],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                        } else {
                            res.json({ success: true, message: 'Password reset successfully' });
                        }
                    }
                );
            } else {
                res.status(400).json({ error: 'Invalid or expired reset token' });
            }
        }
    );
});

// Get User's Players
app.get('/api/auth/players/:userId', (req, res) => {
    const { userId } = req.params;

    db.all(
        'SELECT player_id, name, class, level, exp, gold, created_at FROM players WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows || []);
            }
        }
    );
});

// ===== PLAYER/GAME ROUTES =====

// Save Game
app.post('/api/save', (req, res) => {
    const { userId, playerId, playerData } = req.body;

    if (!userId || !playerId) {
        res.status(400).json({ error: 'Missing userId or playerId' });
        return;
    }

    // Check if player exists
    db.get('SELECT * FROM players WHERE player_id = ? AND user_id = ?', [playerId, userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            // Create new player
            db.run(
                'INSERT INTO players (user_id, player_id, name, class, level, gold) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, playerId, playerData.name, playerData.classType, playerData.level, playerData.gold],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    saveDirect(playerId, playerData);
                }
            );
        } else {
            // Update existing player
            db.run(
                'UPDATE players SET level = ?, gold = ?, exp = ? WHERE player_id = ?',
                [playerData.level, playerData.gold, playerData.exp, playerId],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    saveDirect(playerId, playerData);
                }
            );
        }
    });

    function saveDirect(playerId, playerData) {
        db.run(
            'INSERT INTO game_saves (player_id, save_data) VALUES (?, ?)',
            [playerId, JSON.stringify(playerData)],
            (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({ success: true, message: 'Game saved successfully' });
                }
            }
        );
    }
});

// Load Game
app.get('/api/load/:playerId', (req, res) => {
    const { playerId } = req.params;

    db.get(
        'SELECT save_data FROM game_saves WHERE player_id = ? ORDER BY saved_at DESC LIMIT 1',
        [playerId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (row) {
                res.json(JSON.parse(row.save_data));
            } else {
                res.status(404).json({ error: 'No save found' });
            }
        }
    );
});

// Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
    db.all('SELECT * FROM leaderboard', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get Player Stats
app.get('/api/player/:playerId', (req, res) => {
    const { playerId } = req.params;

    db.get('SELECT * FROM players WHERE player_id = ?', [playerId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Player not found' });
        }
    });
});

// Delete Player (for testing)
app.delete('/api/player/:playerId', (req, res) => {
    const { playerId } = req.params;

    db.run('DELETE FROM game_saves WHERE player_id = ?', [playerId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        db.run('DELETE FROM players WHERE player_id = ?', [playerId], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true, message: 'Player deleted' });
            }
        });
    });
});

// ===== GUILD ROUTES =====

// Get All Guilds
app.get('/api/guilds', (req, res) => {
    db.all('SELECT id, guild_id, name, emblem, description, specialization, member_count, level, reputation FROM guilds ORDER BY member_count DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows.map(row => ({ ...row, id: row.guild_id })));
        }
    });
});

// Get Guild Details
app.get('/api/guilds/:guildId', (req, res) => {
    const { guildId } = req.params;

    db.get('SELECT * FROM guilds WHERE guild_id = ?', [guildId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            // Get guild members
            db.all(
                'SELECT gm.*, p.name as player_name, p.class, p.level FROM guild_members gm JOIN players p ON gm.player_id = p.player_id WHERE gm.guild_id = ? ORDER BY gm.rank DESC, gm.joined_at ASC',
                [guildId],
                (err, members) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    } else {
                        row.members = members;
                        row.id = row.guild_id; // Use guild_id as the external ID
                        res.json(row);
                    }
                }
            );
        } else {
            res.status(404).json({ error: 'Guild not found' });
        }
    });
});

// Create Guild
app.post('/api/guilds', (req, res) => {
    const { userId, playerId, name, description, specialization } = req.body;

    if (!userId || !playerId || !name) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    // Check if player is already in a guild
    db.get('SELECT guild_id FROM guild_members WHERE player_id = ?', [playerId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.status(400).json({ error: 'Player is already in a guild' });
            return;
        }

        // Check if guild name already exists
        db.get('SELECT guild_id FROM guilds WHERE name = ?', [name], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (row) {
                res.status(400).json({ error: 'Guild name already exists' });
                return;
            }

            // Create the guild
            const guildId = `guild_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            db.run(
                'INSERT INTO guilds (guild_id, name, emblem, description, specialization, leader_id, member_count, level, reputation) VALUES (?, ?, ?, ?, ?, ?, 1, 1, 0)',
                [guildId, name, '🏰', description || '', specialization || 'general', userId],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // Add player as guild leader
                    db.run(
                        'INSERT INTO guild_members (guild_id, user_id, player_id, rank, joined_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                        [guildId, userId, playerId, 'leader'],
                        (err) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                            } else {
                                res.json({ success: true, guildId, message: 'Guild created successfully' });
                            }
                        }
                    );
                }
            );
        });
    });
});

// Join Guild
app.post('/api/guilds/:guildId/join', (req, res) => {
    const { guildId } = req.params;
    const { userId, playerId } = req.body;

    if (!userId || !playerId) {
        res.status(400).json({ error: 'Missing userId or playerId' });
        return;
    }

    // Check if player is already in a guild
    db.get('SELECT guild_id FROM guild_members WHERE player_id = ?', [playerId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            res.status(400).json({ error: 'Player is already in a guild' });
            return;
        }

        // Check if guild exists and has space
        db.get('SELECT * FROM guilds WHERE guild_id = ?', [guildId], (err, guild) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (!guild) {
                res.status(404).json({ error: 'Guild not found' });
                return;
            }

            if (guild.member_count >= guild.max_members) {
                res.status(400).json({ error: 'Guild is full' });
                return;
            }

            // Add player to guild
            db.run(
                'INSERT INTO guild_members (guild_id, user_id, player_id, rank, joined_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [guildId, userId, playerId, 'member'],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // Update guild member count
                    db.run(
                        'UPDATE guilds SET member_count = member_count + 1 WHERE guild_id = ?',
                        [guildId],
                        (err) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                            } else {
                                res.json({ success: true, message: 'Joined guild successfully' });
                            }
                        }
                    );
                }
            );
        });
    });
});

// Leave Guild
app.post('/api/guilds/:guildId/leave', (req, res) => {
    const { guildId } = req.params;
    const { userId, playerId } = req.body;

    if (!userId || !playerId) {
        res.status(400).json({ error: 'Missing userId or playerId' });
        return;
    }

    // Check if player is in the guild
    db.get('SELECT rank FROM guild_members WHERE guild_id = ? AND player_id = ?', [guildId, playerId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(400).json({ error: 'Player is not in this guild' });
            return;
        }

        if (row.rank === 'leader') {
            res.status(400).json({ error: 'Guild leader cannot leave. Transfer leadership first or disband the guild.' });
            return;
        }

        // Remove player from guild
        db.run('DELETE FROM guild_members WHERE guild_id = ? AND player_id = ?', [guildId, playerId], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            // Update guild member count
            db.run(
                'UPDATE guilds SET member_count = member_count - 1 WHERE guild_id = ?',
                [guildId],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    } else {
                        res.json({ success: true, message: 'Left guild successfully' });
                    }
                }
            );
        });
    });
});

// Disband Guild
app.delete('/api/guilds/:guildId', (req, res) => {
    const { guildId } = req.params;
    const { userId, playerId } = req.body;

    if (!userId || !playerId) {
        res.status(400).json({ error: 'Missing userId or playerId' });
        return;
    }

    // Check if player is the guild leader
    db.get('SELECT rank FROM guild_members WHERE guild_id = ? AND player_id = ? AND user_id = ?', [guildId, playerId, userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row || row.rank !== 'leader') {
            res.status(403).json({ error: 'Only guild leaders can disband the guild' });
            return;
        }

        // Start transaction to safely disband guild
        db.serialize(() => {
            // Delete all guild members
            db.run('DELETE FROM guild_members WHERE guild_id = ?', [guildId], (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                // Delete all active scouting missions
                db.run('DELETE FROM guild_scouting WHERE guild_id = ?', [guildId], (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // Delete the guild
                    db.run('DELETE FROM guilds WHERE guild_id = ?', [guildId], (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                        } else {
                            res.json({ success: true, message: 'Guild disbanded successfully' });
                        }
                    });
                });
            });
        });
    });
});

// Get Player's Guild Info
app.get('/api/player/:playerId/guild', (req, res) => {
    const { playerId } = req.params;

    db.get(
        'SELECT gm.*, g.name as guild_name, g.description, g.specialization, g.level, g.reputation FROM guild_members gm JOIN guilds g ON gm.guild_id = g.id WHERE gm.player_id = ?',
        [playerId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(row || null);
            }
        }
    );
});

// Get Available Scouting Missions
app.get('/api/guilds/:guildId/scouting', (req, res) => {
    const { guildId } = req.params;

    // Get guild specialization to determine available missions
    db.get('SELECT specialization FROM guilds WHERE guild_id = ?', [guildId], (err, guild) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!guild) {
            res.status(404).json({ error: 'Guild not found' });
            return;
        }

        // Get active scouting missions for this guild
        db.all('SELECT * FROM guild_scouting WHERE guild_id = ? AND completed = 0', [guildId], (err, activeMissions) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({
                    specialization: guild.specialization,
                    activeMissions: activeMissions
                });
            }
        });
    });
});

// Start Scouting Mission
app.post('/api/guilds/:guildId/scouting', (req, res) => {
    const { guildId } = req.params;
    const { userId, playerId, missionType, duration } = req.body;

    if (!userId || !playerId || !missionType) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    // Check if player is in the guild
    db.get('SELECT rank FROM guild_members WHERE guild_id = ? AND player_id = ?', [guildId, playerId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(400).json({ error: 'Player is not in this guild' });
            return;
        }

        // Check if player already has an active scouting mission
        db.get('SELECT id FROM guild_scouting WHERE player_id = ? AND completed = 0', [playerId], (err, activeMission) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (activeMission) {
                res.status(400).json({ error: 'Player already has an active scouting mission' });
                return;
            }

            // Start the scouting mission
            const missionId = `scout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const endTime = new Date(Date.now() + (duration || 3600000)); // Default 1 hour

            db.run(
                'INSERT INTO guild_scouting (id, guild_id, user_id, player_id, mission_type, start_time, end_time, completed) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 0)',
                [missionId, guildId, userId, playerId, missionType, endTime.toISOString()],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    } else {
                        res.json({ success: true, missionId, message: 'Scouting mission started' });
                    }
                }
            );
        });
    });
});

// Complete Scouting Mission
app.post('/api/scouting/:missionId/complete', (req, res) => {
    const { missionId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
        res.status(400).json({ error: 'Missing playerId' });
        return;
    }

    // Check if mission exists and belongs to player
    db.get('SELECT * FROM guild_scouting WHERE id = ? AND player_id = ? AND completed = 0', [missionId, playerId], (err, mission) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!mission) {
            res.status(404).json({ error: 'Mission not found or already completed' });
            return;
        }

        // Check if mission is ready to complete
        const now = new Date();
        const endTime = new Date(mission.end_time);

        if (now < endTime) {
            res.status(400).json({ error: 'Mission is not yet complete' });
            return;
        }

        // Mark mission as completed and calculate rewards
        const rewards = calculateScoutingRewards(mission.mission_type);

        db.run(
            'UPDATE guild_scouting SET completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [missionId],
            (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                // Update guild reputation
                db.run(
                    'UPDATE guilds SET reputation = reputation + ? WHERE guild_id = ?',
                    [rewards.reputation, mission.guild_id],
                    (err) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                        } else {
                            res.json({
                                success: true,
                                rewards: rewards,
                                message: 'Scouting mission completed successfully'
                            });
                        }
                    }
                );
            }
        );
    });
});

// Helper function to calculate scouting rewards
function calculateScoutingRewards(missionType) {
    const baseRewards = {
        exploration: { gold: 100, exp: 50, reputation: 10 },
        combat: { gold: 150, exp: 75, reputation: 15 },
        gathering: { gold: 80, exp: 40, reputation: 8 },
        diplomacy: { gold: 120, exp: 60, reputation: 12 },
        research: { gold: 90, exp: 45, reputation: 9 },
        defense: { gold: 130, exp: 65, reputation: 13 }
    };

    const reward = baseRewards[missionType] || baseRewards.exploration;

    // Add some randomness
    const multiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

    return {
        gold: Math.floor(reward.gold * multiplier),
        exp: Math.floor(reward.exp * multiplier),
        reputation: Math.floor(reward.reputation * multiplier)
    };
}

// Start Server
app.listen(PORT, () => {
    console.log(`\n╔═══════════════════════════════════════════╗`);
    console.log(`║  Chronicles of Aetheria Server Running   ║`);
    console.log(`║  Server: http://localhost:${PORT}            ║`);
    console.log(`║  Game: http://localhost:${PORT}/story.html    ║`);
    console.log(`╚═══════════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
