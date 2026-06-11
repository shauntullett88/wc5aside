import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { data: teams } = await supabase.from('teams').select('*');

    if (!teams || teams.length === 0) {
      return res.status(200).json({ message: 'No teams found' });
    }

    const team = teams[0];

    await supabase
      .from('teams')
      .update({
        totalGoals: (team.totalGoals || 0) + 1,
      })
      .eq('id', team.id);

    return res.status(200).json({
      success: true,
      message: 'Test goal added 🎉',
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}