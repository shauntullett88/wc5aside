export default async function handler(req, res) {
  try {

    // ✅ Correct team IDs
    const TEAMS = [
      { id: 2, name: "France" },
      { id: 10, name: "England" },
      { id: 3, name: "Brazil" },
      { id: 13, name: "Argentina" },
      { id: 6, name: "Spain" }
    ];

    let players = [];

    for (const team of TEAMS) {

      const response = await fetch(
        `https://v3.football.api-sports.io/players/squads?team=${team.id}`,
        {
          headers: {
            'x-apisports-key': process.env.API_FOOTBALL_KEY,
            'x-apisports-host': process.env.API_FOOTBALL_HOST,
          },
        }
      );

      const data = await response.json();

      const squad = data.response?.[0]?.players || [];

      // ✅ Only add if squad exists
      if (squad.length > 0) {

        for (const player of squad) {

          players.push({
            id: player.id,
            name: player.name,
            team: team.name,
            position: player.position
          });
        }
      }
    }

    return res.status(200).json({ players });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}