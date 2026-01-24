import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Garante que o diretório existe
const dbPath = "./data/catbot.sqlite";
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Users table: one row per Discord user
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  apiKey TEXT NOT NULL,
  mode TEXT DEFAULT 'all',
  communities TEXT DEFAULT '["*"]',
  aggressive INTEGER DEFAULT 0,
  autoEnabled INTEGER DEFAULT 1,
  entered INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  lastActivity INTEGER DEFAULT (strftime('%s','now')),
  createdAt INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS raffle_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  raffleSlug TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  timestamp INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_auto ON users(autoEnabled);
CREATE INDEX IF NOT EXISTS idx_raffle_history_user ON raffle_history(userId);
CREATE INDEX IF NOT EXISTS idx_raffle_history_slug ON raffle_history(raffleSlug);
`);

export default db;

export function getUser(userId) {
  return db.prepare(`
    SELECT id, apiKey, mode, communities, aggressive, autoEnabled, entered, wins
    FROM users 
    WHERE id = ?
  `).get(userId);
}

export function getAutoUsers() {
  return db.prepare(`
    SELECT id, apiKey, mode, communities, aggressive, autoEnabled, entered, wins
    FROM users
    WHERE autoEnabled = 1 
    AND apiKey IS NOT NULL 
    AND apiKey != ''
    ORDER BY lastActivity DESC
  `).all();
}

export function updateUserApiKey(userId, apiKey) {
  db.prepare(`
    INSERT OR REPLACE INTO users (id, apiKey, lastActivity) 
    VALUES (?, ?, strftime('%s','now'))
  `).run(userId, apiKey);
}

export function updateUserSettings(userId, settings) {
  const { mode, communities, aggressive, autoEnabled } = settings;
  
  db.prepare(`
    UPDATE users 
    SET mode = COALESCE(?, mode),
        communities = COALESCE(?, communities),
        aggressive = COALESCE(?, aggressive),
        autoEnabled = COALESCE(?, autoEnabled),
        lastActivity = strftime('%s','now')
    WHERE id = ?
  `).run(mode, communities, aggressive, autoEnabled, userId);
}

export function bumpEntered(userId, by = 1) {
  db.prepare(`
    UPDATE users 
    SET entered = COALESCE(entered, 0) + ?,
        lastActivity = strftime('%s','now')
    WHERE id = ?
  `).run(by, userId);
}

export function bumpWins(userId, by = 1) {
  db.prepare(`
    UPDATE users 
    SET wins = COALESCE(wins, 0) + ?,
        lastActivity = strftime('%s','now')
    WHERE id = ?
  `).run(by, userId);
}

export function logRaffleAttempt(userId, raffleSlug, status, message = "") {
  db.prepare(`
    INSERT INTO raffle_history (userId, raffleSlug, status, message)
    VALUES (?, ?, ?, ?)
  `).run(userId, raffleSlug, status, message);
}

export function getUserStats(userId) {
  return db.prepare(`
    SELECT 
      entered,
      wins,
      (SELECT COUNT(*) FROM raffle_history WHERE userId = ? AND status = 'success') as successes,
      (SELECT COUNT(*) FROM raffle_history WHERE userId = ? AND status = 'failed') as failures,
      (SELECT COUNT(*) FROM raffle_history WHERE userId = ?) as totalAttempts
    FROM users 
    WHERE id = ?
  `).get(userId, userId, userId, userId);
}
