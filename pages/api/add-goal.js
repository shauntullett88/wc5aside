import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { playerId, name, team, position } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // player_stats logic — runs first, no longer depends on the team loop below
    const { data: existingPlayer, error: fetchError } = await supabase
      .from('player_stats')
      .select('*')
      .eq('id', String(playerId))
      .maybeSingle();

    if (fetchError) {
      console.error("FETCH ERROR:", fetchError);
    }

    if (existingPlayer) {
      const { error: updateError } = await supabase
        .from('player_stats')
        .update({
          goals: (existingPlayer.goals || 0) + 1,
          name,
          team,
          position
        })
        .eq('id', String(playerId));

      if (updateError) {
        console.error("UPDATE ERROR:", updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from('player_stats')
        .insert([{
          id: String(playerId),
          name,
          team,
          position,
          goals: 1,
          assists: 0
        }]);

      if (insertError) {
        console.error("INSERT ERROR:", insertError);
      }
    }

    // Update team totals for any team that has this player rostered
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      return res.status(500).json({ error: teamsError.message });
    }

    let updatedTeams = [];

    for (const teamRow of teams || []) {
      if (teamRow.player_ids.map(id => Number(id)).includes(playerId)) {
        const { data, error } = await supabase
          .from('teams')
          .update({
            totalGoals: (teamRow.totalGoals || 0) + 1
          })
          .eq('id', teamRow.id)
          .select()
          .single();

        if (error) {
          console.error("TEAM UPDATE ERROR:", error);
        }

        updatedTeams.push(data);
      }
    }

    return res.status(200).json({
      success: true,
      updatedTeams
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}