import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { playerId, name, team, position } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // ✅ Get teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      return res.status(500).json({ error: teamsError.message });
    }

    let updates = [];

    // ✅ Update team assists
    for (const teamRow of teams || []) {
      if (teamRow.player_ids.map(id => Number(id)).includes(playerId)) {

        const { data, error } = await supabase
          .from('teams')
          .update({
            totalAssists: (teamRow.totalAssists || 0) + 1 ✅
          })
          .eq('id', teamRow.id)
          .select()
          .single();

        if (error) {
          console.error("TEAM UPDATE ERROR:", error);
        }

        updates.push(data);
      }
    }

    // ✅ player_stats logic
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
          assists: (existingPlayer.assists || 0) + 1,
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
          goals: 0, ✅
          assists: 1 ✅
        }]);

      if (insertError) {
        console.error("INSERT ERROR:", insertError);
      }
    }

    return res.status(200).json({
      success: true,
      updatedTeams: updates
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}