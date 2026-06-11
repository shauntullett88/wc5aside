import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=1&season=2026`,
      {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY,
          'x-apisports-host': process.env.API_FOOTBALL_HOST,
        },
      }
    );

    const data = await response.json();

    let goalsAdded = 0;

    const { data: teams } = await supabase.from('teams').select('*');

    for (const fixture of data.response || []) {
      const events = fixture.events || [];

      for (const event of events) {
        if (event.type === 'Goal' && event.player) {
          const scorerId = event.player.id;

          for (const team of teams) {
            if (team.player_ids.includes(scorerId)) {
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

    return res.status(200).json({ success: true, goalsAdded });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}