/**
 * lib/syncGoals.js
 * Background goal sync logic — runs every 10 minutes via the /api/cron endpoint.
 *
 * SYNC PROCESS:
 *   1. Fetch all finished/live World Cup fixtures from API-Football
 *   2. For each fixture, fetch match events
 *   3. For each event:
 *      a. Check it's type === 'Goal' AND detail !== 'Own Goal'
 *      b. Check we haven't already processed this (fixture_id + event_index) combo
 *      c. If player is in our DB, increment their goal count
 *      d. Mark the event as processed to prevent double-counting
 *   4. Log the sync run
 *
 * DEDUPLICATION STRATEGY:
 *   The processed_events table stores (fixture_id, event_index) pairs.
 *   Since event positions in a fixture's event array are stable once the
 *   match ends, this reliably prevents any goal being counted twice.
 */

import {
  fetchLiveAndFinishedFixtures,
  fetchFixtureEvents,
  extractValidGoals,
} from './apiFootball.js';

import {
  incrementPlayerGoal,
  isEventProcessed,
  markEventProcessed,
  logSync,
  getPlayers,
} from './db.js';

// In-memory cache to avoid re-fetching fixture lists on every cron tick
let lastFixtureFetch = 0;
let cachedFixtures   = [];
const FIXTURE_CACHE_MS = 30 * 60 * 1000; // Re-fetch fixture list every 30 min

export async function syncGoals() {
  console.log('[SyncGoals] Starting goal sync at', new Date().toISOString());

  let fixturesChecked = 0;
  let goalsAdded      = 0;

  try {
    // Step 1: Get finished/live fixtures (with cache)
    const now = Date.now();
    if (now - lastFixtureFetch > FIXTURE_CACHE_MS || cachedFixtures.length === 0) {
      console.log('[SyncGoals] Fetching fresh fixture list from API-Football...');
      cachedFixtures   = await fetchLiveAndFinishedFixtures();
      lastFixtureFetch = now;
      console.log(`[SyncGoals] Found ${cachedFixtures.length} finished/live fixtures`);
    } else {
      console.log(`[SyncGoals] Using cached fixture list (${cachedFixtures.length} fixtures)`);
    }

    // Build a set of player IDs currently in our database for fast lookup
    const knownPlayers = new Set(
      getPlayers().map(p => p.id)
    );

    // Step 2: Process each fixture
    for (const fixture of cachedFixtures) {
      const fixtureId = fixture.fixture?.id;
      if (!fixtureId) continue;

      fixturesChecked++;

      let events;
      try {
        events = await fetchFixtureEvents(fixtureId);
      } catch (err) {
        console.warn(`[SyncGoals] Failed to fetch events for fixture ${fixtureId}:`, err.message);
        continue;
      }

      // Step 3: Extract only valid goals (own-goal exclusion happens inside extractValidGoals)
      const goals = extractValidGoals(events);

      for (const goal of goals) {
        const { index, playerId } = goal;

        // Step 3b: Skip if already processed (deduplication)
        if (isEventProcessed(fixtureId, index)) continue;

        // Step 3c: Only count if this player is in our fantasy player pool
        if (knownPlayers.has(playerId)) {
          incrementPlayerGoal(playerId);
          goalsAdded++;
          console.log(
            `[SyncGoals] +1 goal → player ${playerId} (${goal.playerName}) ` +
            `in fixture ${fixtureId} at minute ${goal.minute}`
          );
        }

        // Step 3d: Always mark as processed even if player isn't in our pool
        // This prevents re-checking this event on future ticks
        markEventProcessed(fixtureId, index, playerId);
      }

      // Small delay between fixture event requests to be a good API citizen
      await sleep(200);
    }

    // Step 4: Log the sync
    logSync(fixturesChecked, goalsAdded);
    console.log(
      `[SyncGoals] Sync complete. Checked ${fixturesChecked} fixtures, added ${goalsAdded} goals.`
    );

    return { success: true, fixturesChecked, goalsAdded };

  } catch (err) {
    console.error('[SyncGoals] Fatal sync error:', err);
    return { success: false, error: err.message };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
