import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // ✅ Find teams that have this player
    const { data: teams } = await supabase.from('teams').select('*');

    let updatedTeams = [];

    for (const team of teams || []) {
      if (team.player_ids.includes(playerId)) {
        const { data } = await supabase
          .from('teams')
          .update({
            totalGoals: (team.totalGoals || 0) + 1
          })
          .eq('id', team.id)
          .select()
          .single();

        updatedTeams.push(data);
      }
    }

    return res.status(200).json({
      success: true,
      updatedTeams
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
