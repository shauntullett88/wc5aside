import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data.players || []));
  }, []);

  async function addGoal(playerId) {
    await fetch('/api/add-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });

    alert("Goal added ✅");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — Add Goal</h1>

      {players.map(player => (
        <div key={player.id} style={{ marginBottom: 10 }}>
          {player.name} ({player.team})
          <button
            onClick={() => addGoal(player.id)}
            style={{ marginLeft: 10 }}
          >
            + Goal
          </button>
        </div>
      ))}
    </div>
  );
}
``