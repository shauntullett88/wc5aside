/**
 * pages/api/admin/seed.js
 * POST /api/admin/seed
 *
 * Seeds players from API-Football into the database.
 * If API key is missing or request fails, falls back to mock data.
 *
 * Run once before the tournament starts, then rely on /api/cron for goal updates.
 */

import { fetchSquadForTeam } from '../../../lib/apiFootball.js';
import { upsertPlayer } from '../../../lib/db.js';
import { TOP_WC_TEAMS } from '../../../lib/apiFootball.js';
import { seedMockPlayersIntoDB } from '../../../lib/mockPlayers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const hasApiKey = process.env.API_FOOTBALL_KEY &&
                    process.env.API_FOOTBALL_KEY !== 'YOUR_API_KEY_HERE';

  // Fallback to mock data if no API key
  if (!hasApiKey) {
    seedMockPlayersIntoDB(upsertPlayer);
    return res.status(200).json({
      message: 'Seeded with MOCK data (no API key). Set API_FOOTBALL_KEY in .env.local for real players.',
      playersSeeded: 'mock',
    });
  }

  // Real API seed
  const results = { seeded: 0, errors: [] };

  for (const wct of TOP_WC_TEAMS) {
    try {
      console.log(`[Seed] Fetching squad for ${wct.name} (ID: ${wct.id})...`);
      const squad = await fetchSquadForTeam(wct.id);

      for (const p of squad) {
        upsertPlayer({
          id:          p.id,
          name:        p.name,
          team:        wct.name,
          team_id:     wct.id,
          position:    p.position,
          goals:       0,
          photo_url:   p.photo || null,
          nationality: p.nationality || null,
        });
        results.seeded++;
      }

      // Respect API rate limits (small delay between team requests)
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.warn(`[Seed] Failed for ${wct.name}:`, err.message);
      results.errors.push({ team: wct.name, error: err.message });
    }
  }

  return res.status(200).json({
    message: `Seeded ${results.seeded} players from API-Football`,
    ...results,
  });
}
