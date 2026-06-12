import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // ✅ Get all teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      return res.status(500).json({ error: teamsError.message });
    }

    let updates = [];

    // ✅ Update team assists
    for (const team of teams || []) {
      if (team.player_ids.map(id => Number(id)).includes(playerId)) {

        const { data, error } = await supabase
          .from('teams')
          .update({
            totalAssists: (team.totalAssists || 0) + 1
          })
          .eq('id', team.id)
          .select()
          .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        updates.push(data);
      }
    }

    // ✅ NEW: update player_stats (for top players leaderboard)
    const { data: existingPlayer } = await supabase
      .from('player_stats')
      .select('*')
      .eq('id', playerId)
      .maybeSingle();

    if (existingPlayer) {
      await supabase
        .from('player_stats')
        .update({
          assists: (existingPlayer.assists || 0) + 1
        })
        .eq('id', playerId);
    } else {
      await supabase
        .from('player_stats')
        .insert([
          {
            id: playerId,
            goals: 0,
            assists: 1
          }
        ]);
    }

    return res.status(200).json({
      success: true,
      updatedTeams: updates
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
