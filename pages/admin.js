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
      body: JSON.stringify({
  playerId,
  name: player.name,
  team: player.team,
  position: player.position
}),
    });

    alert("Goal added ✅");
  }

  // ✅ NEW: Assist function
  async function addAssist(playerId) {
    await fetch('/api/add-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });

    alert("Assist added ✅");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — Add Goal / Assist</h1>

      {players.map(player => (
        <div key={player.id} style={{ marginBottom: 10 }}>
          {player.name} ({player.team})

          {/* ✅ Goal button */}
          <button
            onClick={() => addGoal(player.id)}
            style={{ marginLeft: 10 }}
          >
            ⚽ Goal
          </button>

          {/* ✅ Assist button (NEW) */}
          <button
            onClick={() => addAssist(player.id)}
            style={{ marginLeft: 5 }}
          >
            🅰️ Assist
          </button>
        </div>
      ))}
    </div>
  );
}