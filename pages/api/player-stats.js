import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*');

    if (error) {
      console.error("PLAYER STATS ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      players: data || []
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}