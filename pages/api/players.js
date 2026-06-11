export default async function handler(req, res) {
  try {

    // ✅ Top 5 teams (example IDs)
    const TOP_TEAMS = [2, 3, 6, 10, 16]; // France, Brazil, Spain, England, Mexico

    let playersMap = {};

    // ✅ Get recent matches (reliable source of players)
    const fixturesRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?last=20`,
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY,
          'x-apisports-host': process.env.API_FOOTBALL_HOST,
        },
      }
    );

    const fixturesData = await fixturesRes.json();

    for (const fixture of fixturesData.response || []) {

      const teams = fixture.teams;

      // ✅ Only include top teams
      if (
        !TOP_TEAMS.includes(teams.home.id) &&
        !TOP_TEAMS.includes(teams.away.id)
      ) continue;

      // ✅ Get events (this gives us real players)
      const eventsRes = await fetch(
        `https://v3.football.api-sports.io/fixtures/events?fixture=${fixture.fixture.id}`,
        {
          headers: {
            'x-apisports-key': process.env.API_FOOTBALL_KEY,
            'x-apisports-host': process.env.API_FOOTBALL_HOST,
          },
        }
      );

      const eventsData = await eventsRes.json();

      for (const event of eventsData.response || []) {

        if (!event.player) continue;

        const playerId = event.player.id;
        const playerName = event.player.name;

        // ✅ Save unique players
        if (!playersMap[playerId]) {
          playersMap[playerId] = {
            id: playerId,
            name: playerName,
            team: event.team.name,
            position: 'Attacker', // fallback (API doesn't give position here)
          };
        }
      }
    }

    const players = Object.values(playersMap);

    return res.status(200).json({ players });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}