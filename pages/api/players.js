/**
 * pages/api/players.js
 * Simple version without database
 */

export default function handler(req, res) {
  const players = [
    { id: 1, name: "Kylian Mbappe", team: "France", position: "Forward", goals: 0 },
    { id: 2, name: "Harry Kane", team: "England", position: "Forward", goals: 0 },
    { id: 3, name: "Lionel Messi", team: "Argentina", position: "Forward", goals: 0 },
    { id: 4, name: "Kevin De Bruyne", team: "Belgium", position: "Midfielder", goals: 0 },
    { id: 5, name: "Jude Bellingham", team: "England", position: "Midfielder", goals: 0 }
  ];

  const { position, team, search } = req.query;

  let filtered = players;

  // Filter by position
  if (position && position !== 'All') {
    filtered = filtered.filter(p =>
      p.position.toLowerCase().includes(position.toLowerCase())
    );
  }

  // Filter by team
  if (team && team !== 'All') {
    filtered = filtered.filter(p =>
      p.team.toLowerCase() === team.toLowerCase()
    );
  }

  // Search by name
  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q)
    );
  }

  const teams = [...new Set(players.map(p => p.team))];

  res.status(200).json({ players: filtered, teams });
}
