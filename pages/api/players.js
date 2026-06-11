export default async function handler(req, res) {
  try {

    const TOP_TEAMS = [2, 3, 6, 10, 13]; // France, Brazil, Spain, England, Argentina

    let allPlayers = [];
    let teamsSet = new Set();

    for (const teamId of TOP_TEAMS) {

      const response = await fetch(
        `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
        {
          headers: {
            'x-apisports-key': process.env.API_FOOTBALL_KEY,
            'x-apisports-host': process.env.API_FOOTBALL_HOST,
          },
        }
      );

      const data = await response.json();

      const teamName = data.response[0]?.team.name;
      const squad = data.response[0]?.players || [];

      if (teamName) teamsSet.add(teamName);

      for (const player of squad) {

        if (
          player.position === 'Midfielder' ||
          player.position === 'Forward' ||
          player.position === 'Attacker'
        ) {
          allPlayers.push({
            id: player.id,
            name: player.name,
            team: teamName,
            position: player.position,
            goals: 0
          });
        }
      }
    }

    return res.status(200).json({
      players: allPlayers,
      teams: Array.from(teamsSet),
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}