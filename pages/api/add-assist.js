import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    // Get teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      return res.status(500).json({ error: teamsError.message });
    }

    let updates = [];

    // Update team assists
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
          console.error("TEAM UPDATE ERROR:", error);
        }

        updates.push(data);
      }
    }

    console.log("Updating player_stats for:", playerId);

    // player_stats logic
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
          assists: (existingPlayer.assists || 0) + 1
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
          goals: 0,
          assists: 1
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
