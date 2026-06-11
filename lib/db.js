/**
 * lib/db.js
 * SQLite database layer using better-sqlite3 (synchronous, no async overhead).
 * Tables:
 *   players  – cached player data from API-Football with running goal totals
 *   teams    – user fantasy teams (locked after submission)
 *   events   – processed match event IDs to prevent double-counting goals
 *   sync_log – tracks the last successful data sync
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'fantasy.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    // Enable WAL mode for better concurrent read performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  const database = db;

  // Players table — stores API-Football player data with goal totals
  database.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id          INTEGER PRIMARY KEY,   -- API-Football player ID
      name        TEXT    NOT NULL,
      team        TEXT    NOT NULL,
      team_id     INTEGER NOT NULL,
      position    TEXT    NOT NULL,      -- 'Midfielder' or 'Forward'
      goals       INTEGER NOT NULL DEFAULT 0,
      photo_url   TEXT,
      nationality TEXT,
      updated_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `);

  // Fantasy teams table — one row per user, locked after creation
  database.exec(`
    CREATE TABLE IF NOT EXISTS fantasy_teams (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      username     TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      player_ids   TEXT    NOT NULL,    -- JSON array of 5 player IDs
      locked       INTEGER NOT NULL DEFAULT 1,  -- always locked after insert
      created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );
  `);

  // Processed events — prevents re-counting goals if we re-poll the same fixture
  database.exec(`
    CREATE TABLE IF NOT EXISTS processed_events (
      fixture_id  INTEGER NOT NULL,
      event_index INTEGER NOT NULL,    -- position in the events array for that fixture
      player_id   INTEGER NOT NULL,
      PRIMARY KEY (fixture_id, event_index)
    );
  `);

  // Sync log — records when we last successfully pulled from the API
  database.exec(`
    CREATE TABLE IF NOT EXISTS sync_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      synced_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      fixtures   INTEGER NOT NULL DEFAULT 0,   -- how many fixtures were checked
      goals_added INTEGER NOT NULL DEFAULT 0
    );
  `);
}

// ── Player helpers ──────────────────────────────────────────────────────────

export function upsertPlayer(player) {
  const stmt = getDb().prepare(`
    INSERT INTO players (id, name, team, team_id, position, goals, photo_url, nationality, updated_at)
    VALUES (@id, @name, @team, @team_id, @position, @goals, @photo_url, @nationality, strftime('%s','now'))
    ON CONFLICT(id) DO UPDATE SET
      name       = excluded.name,
      team       = excluded.team,
      team_id    = excluded.team_id,
      position   = excluded.position,
      photo_url  = excluded.photo_url,
      nationality= excluded.nationality,
      updated_at = strftime('%s','now')
  `);
  stmt.run(player);
}

export function getPlayers(positionFilter) {
  const database = getDb();
  if (positionFilter) {
    return database.prepare(
      `SELECT * FROM players WHERE position = ? ORDER BY team, name`
    ).all(positionFilter);
  }
  return database.prepare(
    `SELECT * FROM players WHERE position IN ('Midfielder','Forward','Attacker') ORDER BY team, name`
  ).all();
}

export function getPlayersByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return getDb().prepare(
    `SELECT * FROM players WHERE id IN (${placeholders})`
  ).all(...ids);
}

export function incrementPlayerGoal(playerId) {
  getDb().prepare(
    `UPDATE players SET goals = goals + 1, updated_at = strftime('%s','now') WHERE id = ?`
  ).run(playerId);
}

// ── Fantasy team helpers ────────────────────────────────────────────────────

export function createTeam(username, playerIds) {
  // Validate exactly 5 players
  if (playerIds.length !== 5) throw new Error('Must select exactly 5 players');
  const stmt = getDb().prepare(`
    INSERT INTO fantasy_teams (username, player_ids, locked)
    VALUES (?, ?, 1)
  `);
  stmt.run(username.trim(), JSON.stringify(playerIds));
}

export function getTeamByUsername(username) {
  const team = getDb().prepare(
    `SELECT * FROM fantasy_teams WHERE username = ? COLLATE NOCASE`
  ).get(username);
  if (team) team.player_ids = JSON.parse(team.player_ids);
  return team;
}

export function getAllTeams() {
  const teams = getDb().prepare(
    `SELECT * FROM fantasy_teams ORDER BY created_at ASC`
  ).all();
  return teams.map(t => ({ ...t, player_ids: JSON.parse(t.player_ids) }));
}

// ── Event deduplication helpers ─────────────────────────────────────────────

export function isEventProcessed(fixtureId, eventIndex) {
  return !!getDb().prepare(
    `SELECT 1 FROM processed_events WHERE fixture_id = ? AND event_index = ?`
  ).get(fixtureId, eventIndex);
}

export function markEventProcessed(fixtureId, eventIndex, playerId) {
  try {
    getDb().prepare(`
      INSERT OR IGNORE INTO processed_events (fixture_id, event_index, player_id)
      VALUES (?, ?, ?)
    `).run(fixtureId, eventIndex, playerId);
  } catch (_) {}
}

// ── Sync log ────────────────────────────────────────────────────────────────

export function logSync(fixtures, goalsAdded) {
  getDb().prepare(
    `INSERT INTO sync_log (fixtures, goals_added) VALUES (?, ?)`
  ).run(fixtures, goalsAdded);
}

export function getLastSync() {
  return getDb().prepare(
    `SELECT * FROM sync_log ORDER BY synced_at DESC LIMIT 1`
  ).get();
}

export default getDb;
