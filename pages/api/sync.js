import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {

    // ✅ Get all teams
    const { data: teams } = await supabase.from('teams').select('*');

    if (!teams) {
      return res.status(500).json({ error: 'No teams found' });
    }

let goalsAdded = 0;
let debug = [];

    // ✅ Fetch fixtures
    const fixturesRes = await fetch(
      `https://v3.football.api-sports.io/fixtures?last=5`,
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY,
          'x-apisports-host': process.env.API_FOOTBALL_HOST,
        },
      }
    );

    const fixturesData = await fixturesRes.json();

    for (const fixture of fixturesData.response || []) {
      const fixtureId = fixture.fixture.id;

      // ✅ Fetch events for this fixture
      const eventsRes = await fetch(
        `https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`,
        {
          headers: {
            'x-apisports-key': process.env.API_FOOTBALL_KEY,
            'x-apisports-host': process.env.API_FOOTBALL_HOST,
          },
        }
      );

      const eventsData = await eventsRes.json();

      for (const event of eventsData.response || []) {
debug.push({ event });

        if (event.type === 'Goal' && event.player) {

  const playerId = event.player.id;
  const eventTime = event.time.elapsed;

  debug.push({
    scorer: event.player.name,
    playerId: playerId
  });


          // ✅ CHECK if already processed
          const { data: existingGoal } = await supabase
            .from('processed_goals')
            .select('*')
            .eq('fixture_id', fixtureId)
            .eq('player_id', playerId)
            .eq('event_time', eventTime)
            .maybeSingle();

          if (existingGoal) continue; // ✅ skip duplicates

          // ✅ Store goal to prevent duplicates
          await supabase.from('processed_goals').insert([
            {
              fixture_id: fixtureId,
              player_id: playerId,
              event_time: eventTime,
            }
          ]);

          // ✅ Update teams that have this player
          for (const team of teams) {
            if (team.player_ids.map(id => Number(id)).includes(playerId)) {

              await supabase
                .from('teams')
                .update({
                  totalGoals: (team.totalGoals || 0) + 1,
                })
                .eq('id', team.id);

              goalsAdded++;
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      goalsAdded,
      debug,
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}