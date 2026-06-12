import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // ✅ Get all teams
    const { data: teams } = await supabase.from('teams').select('*');

    let updatedTeams = [];

    // ✅ Update team goals
    for (const team of teams || []) {
      if (team.player_ids.map(id => Number(id)).includes(playerId)) {

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

    // ✅ NEW: update player_stats (for top players leaderboard)
    const { data: existingPlayer } = await supabase
      .from('player_stats')
      .select('*')
      .eq('id', String(playerId))
      .maybeSingle();

    if (existingPlayer) {
      await supabase
        .from('player_stats')
        .update({
          goals: (existingPlayer.goals || 0) + 1
        })
        .eq('id', playerId);
    } else {
      await supabase
        .from('player_stats')
        .insert([
          {
            id: String(playerId),
            goals: 1,
            assists: 0
          }
        ]);
    }

    return res.status(200).json({
      success: true,
      updatedTeams
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
