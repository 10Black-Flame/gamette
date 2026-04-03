-- Database schema for Catch the Box game
-- This creates tables for storing player information and high scores

-- Create the database (if using SQLite, this is optional)
-- CREATE DATABASE IF NOT EXISTS catch_the_box;

-- Users table to store player information
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scores table to store game scores
CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER NOT NULL,
    time_taken INTEGER, -- in seconds
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- High scores view for easy querying
CREATE VIEW IF NOT EXISTS high_scores AS
SELECT
    u.username,
    s.score,
    s.time_taken,
    s.played_at
FROM scores s
LEFT JOIN users u ON s.user_id = u.id
ORDER BY s.score DESC, s.time_taken ASC;

-- Insert some sample data
INSERT INTO users (username, email) VALUES
('Player1', 'player1@example.com'),
('Player2', 'player2@example.com');

INSERT INTO scores (user_id, score, time_taken) VALUES
(1, 25, 30),
(1, 30, 30),
(2, 20, 30);

-- Query to get top 10 high scores
-- SELECT * FROM high_scores LIMIT 10;