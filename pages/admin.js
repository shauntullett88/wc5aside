import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data.players || []));
  }, []);

  // ✅ FIXED: now takes full player
  async function addGoal(player) {
    await fetch('/api/add-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: player.id,
        name: player.name,
        team: player.team,
        position: player.position
      }),
    });

    alert(player.name + " goal added ✅");
  }

  // ✅ FIXED: also pass full player object
  async function addAssist(player) {
    await fetch('/api/add-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: player.id,
        name: player.name,
        team: player.team,
        position: player.position
      }),
    });

    alert(player.name + " assist added ✅");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — Add Goal / Assist</h1>

      {players.map(player => (
        <div key={player.id} style={{ marginBottom: 10 }}>
          {player.name} ({player.team})

          {/* ✅ Goal button */}
          <button
            onClick={() => addGoal(player)}  // ✅ FIXED
            style={{ marginLeft: 10 }}
          >
            ⚽ Goal
          </button>

          {/* ✅ Assist button */}
          <button
            onClick={() => addAssist(player)} // ✅ FIXED
            style={{ marginLeft: 5 }}
          >
            🅰️ Assist
          </button>
        </div>
      ))}
    </div>
  );
}