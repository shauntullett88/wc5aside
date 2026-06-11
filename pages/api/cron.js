/**
 * pages/api/cron.js
 * POST /api/cron  — triggers a goal sync from API-Football
 *
 * POLLING SETUP:
 *   The client leaderboard calls this every 10 minutes automatically.
 *   You can also set up an external cron (e.g. cron-job.org, Vercel Cron)
 *   to POST to /api/cron every 10 minutes for truly background syncing.
 *
 * SECURITY:
 *   Optionally protect with CRON_SECRET env var — set it and pass as
 *   Authorization: Bearer <secret> header from your cron job.
 */

import { syncGoals } from '../../lib/syncGoals.js';
import { getLastSync } from '../../lib/db.js';

// In-memory lock to prevent concurrent syncs
let syncInProgress = false;

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional secret check
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Prevent concurrent syncs
  if (syncInProgress) {
    return res.status(200).json({ message: 'Sync already in progress', skipped: true });
  }

  // Check if API key is configured
  if (!process.env.API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY === 'YOUR_API_KEY_HERE') {
    return res.status(200).json({
      message: 'API key not configured — using mock data. Set API_FOOTBALL_KEY in .env.local to enable live sync.',
      apiKeyMissing: true,
    });
  }

  syncInProgress = true;
  try {
    const result    = await syncGoals();
    const lastSync  = getLastSync();
    return res.status(200).json({ ...result, lastSync });
  } catch (err) {
    console.error('[/api/cron]', err);
    return res.status(500).json({ error: err.message });
  } finally {
    syncInProgress = false;
  }
}
