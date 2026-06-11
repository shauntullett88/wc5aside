let teams = [];

export default function handler(req, res) {
  // GET
  if (req.method === 'GET') {
    const { username } = req.query;

    if (username) {
      const team = teams.find(t => t.username === username);

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      return res.status(200).json({ team, players: [], totalGoals: 0 });
    }

    return res.status(200).json({ teams });
  }

  // POST
  if (req.method === 'POST') {
    const { username, playerIds } = req.body || {};

    if (!username || username.length < 2) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    if (!Array.isArray(playerIds) || playerIds.length !== 5) {
      return res.status(400).json({ error: 'Pick exactly 5 players' });
    }

    const existing = teams.find(t => t.username === username);
    if (existing) {
      return res.status(409).json({ error: 'Username already used' });
    }

    const newTeam = {
      username,
      player_ids: playerIds,
      locked: true
    };

    teams.push(newTeam);

    return res.status(201).json({
      team: newTeam,
      players: [],
      message: 'Team locked in!'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
