import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { playerId, name, team, position } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'Missing playerId' });
    }

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      return res.status(500).json({ error: teamsError.message });
    }

    let updatedTeams = [];

    // Update team goals
    for (const team of teams || []) {
      if (team.player_ids.map(id => Number(id)).includes(playerId)) {
        const { data, error } = await supabase
          .from('teams')
          .update({
  goals: (existingPlayer.goals || 0) + 1,
  name,
  team,
  position
})
          .eq('id', team.id)
          .select()
          .single();

        if (error) {
          console.error("TEAM UPDATE ERROR:", error);
        }

        updatedTeams.push(data);
      }
    }

    console.log("Updating player_stats (goal) for:", playerId);

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
          goals: (existingPlayer.goals || 0) + 1
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

    return res.status(200).json({
      success: true,
      updatedTeams
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}