export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Placeholder: no DB, no sync yet
  return res.status(200).json({
    success: true,
    message: 'Sync skipped (no database configured)'
  });
}
