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

    // ✅ Loop through teams and add assist if player is in team
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

    return res.status(200).json({
      success: true,
      updatedTeams: updates
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
``