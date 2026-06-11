/**
 * lib/apiFootball.js
 * Thin wrapper around API-Football (v3.football.api-sports.io).
 *
 * All requests go through fetchFromAPI(), which:
 *   - Attaches the API key header
 *   - Handles rate-limit headers (100 req/day on free tier)
 *   - Returns the parsed JSON response body
 *
 * HOW TO SET YOUR API KEY:
 *   1. Sign up at https://www.api-football.com/
 *   2. Copy your key from your dashboard
 *   3. Paste it into .env.local as: API_FOOTBALL_KEY=your_key_here
 *   4. Restart the dev server
 */

const BASE_URL = `https://${process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io'}`;
const API_KEY  = process.env.API_FOOTBALL_KEY;

// FIFA World Cup league ID on API-Football
// 2026 World Cup: league ID 1, season 2026
const WC_LEAGUE_ID = parseInt(process.env.WORLD_CUP_LEAGUE_ID || '1');
const WC_SEASON    = parseInt(process.env.WORLD_CUP_SEASON    || '2026');

// Top World Cup seeded nations (team IDs in API-Football for reference)
// These are approximate — confirm via /teams endpoint once you have API access
export const TOP_WC_TEAMS = [
  { id: 10,  name: 'Brazil'      },
  { id: 9,   name: 'Spain'       },
  { id: 26,  name: 'France'      },
  { id: 13,  name: 'Germany'     },
  { id: 18,  name: 'Portugal'    },
  { id: 12,  name: 'Argentina'   },
  { id: 21,  name: 'England'     },
  { id: 34,  name: 'Netherlands' },
  { id: 768, name: 'Morocco'     },
  { id: 858, name: 'USA'         },
  { id: 29,  name: 'Italy'       },
  { id: 24,  name: 'Croatia'     },
  { id: 775, name: 'Senegal'     },
  { id: 6,   name: 'Japan'       },
  { id: 803, name: 'Mexico'      },
  { id: 756, name: 'Uruguay'     },
];

async function fetchFromAPI(endpoint, params = {}) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('API_FOOTBALL_KEY is not set. Please add it to .env.local');
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key':  API_KEY,
      'x-rapidapi-host': process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
    },
    // 10 second timeout via AbortController
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API-Football ${res.status}: ${body}`);
  }

  const json = await res.json();

  // The API wraps everything in { response: [...], errors: {...} }
  if (json.errors && Object.keys(json.errors).length > 0) {
    const errMsg = Object.values(json.errors).join(', ');
    throw new Error(`API-Football error: ${errMsg}`);
  }

  return json.response ?? json;
}

// ── Players ──────────────────────────────────────────────────────────────────

/**
 * Fetch all midfielders + forwards for a given team in the World Cup.
 * API-Football paginates players (20 per page), so we loop until done.
 */
export async function fetchSquadForTeam(teamId) {
  // /players/squads returns the full squad without pagination
  const response = await fetchFromAPI('players/squads', { team: teamId });
  if (!response || !response[0]) return [];

  const squad = response[0].players || [];

  // Filter to midfielders and forwards only
  return squad.filter(p => {
    const pos = (p.position || '').toLowerCase();
    return pos.includes('midfielder') || pos.includes('forward') ||
           pos.includes('attacker')   || pos === 'mf' || pos === 'fw';
  });
}

/**
 * Fetch players with stats for the World Cup (useful for goal counts as fallback).
 * Returns players matching position filters.
 */
export async function fetchPlayersWithStats(teamId, page = 1) {
  return fetchFromAPI('players', {
    team:   teamId,
    league: WC_LEAGUE_ID,
    season: WC_SEASON,
    page,
  });
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Fetch all World Cup fixtures (past, present, upcoming).
 * We use these to know which fixture IDs to poll for events.
 */
export async function fetchWorldCupFixtures() {
  return fetchFromAPI('fixtures', {
    league: WC_LEAGUE_ID,
    season: WC_SEASON,
  });
}

/**
 * Fetch fixtures that are finished or in-progress (status: FT, AET, PEN, 1H, 2H, ET, P, BT).
 * These are the ones that might have goal events we need to process.
 */
export async function fetchLiveAndFinishedFixtures() {
  const all = await fetchWorldCupFixtures();
  return all.filter(f => {
    const status = f.fixture?.status?.short || '';
    // Include finished + live statuses
    return ['FT','AET','PEN','1H','2H','ET','P','BT','HT'].includes(status);
  });
}

// ── Match Events ─────────────────────────────────────────────────────────────

/**
 * Fetch all events for a single fixture.
 * Returns an array of event objects.
 *
 * Goal filtering logic (CRITICAL):
 *   - We ONLY count events where event.type === 'Goal'
 *   - We EXCLUDE events where event.detail === 'Own Goal'
 *   - This is enforced here AND in the sync worker for double safety
 */
export async function fetchFixtureEvents(fixtureId) {
  return fetchFromAPI('fixtures/events', { fixture: fixtureId });
}

/**
 * Extract valid goals from a fixture's events array.
 * Returns array of { playerId, playerName, teamId, minute }
 *
 * OWN GOAL EXCLUSION: if event.detail is 'Own Goal', skip it entirely.
 * The player who "scores" an own goal is on the opposing team and
 * should never receive credit in our system.
 */
export function extractValidGoals(events) {
  const goals = [];
  events.forEach((event, index) => {
    // Must be a Goal event
    if (event.type !== 'Goal') return;

    // EXCLUDE own goals — this is the critical safety check
    if (event.detail === 'Own Goal') return;

    // Must have a scorer
    const playerId = event.player?.id;
    if (!playerId) return;

    goals.push({
      index,        // position in events array (used for deduplication key)
      playerId,
      playerName: event.player.name || 'Unknown',
      teamId: event.team?.id,
      minute: event.time?.elapsed || 0,
    });
  });
  return goals;
}

export { WC_LEAGUE_ID, WC_SEASON };
