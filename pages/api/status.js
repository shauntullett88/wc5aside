/**
 * pages/api/status.js
 * Simple status endpoint without database
 */

let teams = []; // reuse same in-memory idea if needed

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const hasApiKey = !!(
      process.env.API_FOOTBALL_KEY &&
      process.env.API_FOOTBALL_KEY !== 'YOUR_API_KEY_HERE'
    );

    return res.status(200).json({
      hasApiKey,
      playerCount: 5,       // static for now
      teamCount: teams.length,
      lastSync: null
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}