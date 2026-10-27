const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'badminton.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    singles_rating INTEGER DEFAULT 1200,
    doubles_rating INTEGER DEFAULT 1200,
    singles_wins INTEGER DEFAULT 0,
    singles_losses INTEGER DEFAULT 0,
    doubles_wins INTEGER DEFAULT 0,
    doubles_losses INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    highest_singles_rating INTEGER DEFAULT 1200,
    highest_doubles_rating INTEGER DEFAULT 1200,
    avatar_color TEXT DEFAULT '#10B981',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_mode TEXT NOT NULL CHECK(match_mode IN ('singles', 'doubles')),
    team_a_p1_id INTEGER NOT NULL REFERENCES players(id),
    team_a_p2_id INTEGER REFERENCES players(id),
    team_b_p1_id INTEGER NOT NULL REFERENCES players(id),
    team_b_p2_id INTEGER REFERENCES players(id),
    winner_team TEXT NOT NULL CHECK(winner_team IN ('A', 'B')),
    team_a_games_won INTEGER NOT NULL DEFAULT 0,
    team_b_games_won INTEGER NOT NULL DEFAULT 0,
    games_data TEXT NOT NULL,
    rating_delta_a INTEGER NOT NULL,
    rating_delta_b INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rating_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    match_mode TEXT NOT NULL,
    old_rating INTEGER NOT NULL,
    new_rating INTEGER NOT NULL,
    delta INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default players if empty so the app has immediate rich data to showcase
const countPlayers = db.prepare('SELECT COUNT(*) as count FROM players').get();
if (countPlayers.count === 0) {
  const seedPlayers = [
    { name: 'Sarthak Jadhav', singles_rating: 1680, doubles_rating: 1350, singles_wins: 24, singles_losses: 3, current_streak: 6, avatar_color: '#3B82F6' },
    { name: 'Yogesh Shekade', singles_rating: 1640, doubles_rating: 1410, singles_wins: 21, singles_losses: 5, current_streak: 3, avatar_color: '#EF4444' },
    { name: 'Harsh Kurade', singles_rating: 1670, doubles_rating: 1420, singles_wins: 23, singles_losses: 4, current_streak: 4, avatar_color: '#F59E0B' },
    { name: 'Adarsh Mulik', singles_rating: 1590, doubles_rating: 1380, singles_wins: 18, singles_losses: 6, current_streak: 2, avatar_color: '#8B5CF6' },
    { name: 'Kirti Patil', singles_rating: 1320, doubles_rating: 1720, doubles_wins: 26, doubles_losses: 2, current_streak: 8, avatar_color: '#10B981' },
    { name: 'Dikshant Bedekar', singles_rating: 1310, doubles_rating: 1710, doubles_wins: 25, doubles_losses: 3, current_streak: 8, avatar_color: '#06B6D4' }
  ];

  const insertPlayer = db.prepare(`
    INSERT INTO players (name, singles_rating, doubles_rating, singles_wins, singles_losses, doubles_wins, doubles_losses, current_streak, highest_singles_rating, highest_doubles_rating, avatar_color)
    VALUES (@name, @singles_rating, @doubles_rating, @singles_wins, @singles_losses, @doubles_wins, @doubles_losses, @current_streak, @singles_rating, @doubles_rating, @avatar_color)
  `);

  const insertSeed = db.transaction((players) => {
    for (const p of players) {
      insertPlayer.run({
        singles_wins: 0,
        singles_losses: 0,
        doubles_wins: 0,
        doubles_losses: 0,
        current_streak: 0,
        ...p
      });
    }
  });

  insertSeed(seedPlayers);
  console.log('Seeded initial players into database.');
}

module.exports = db;
