import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {

  // ✅ GET
  if (req.method === 'GET') {
    const { username } = req.query;

    if (username) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (!data) {
        return res.status(404).json({ error: 'Team not found' });
      }

      return res.status(200).json({
        team: data,
        players: [],
        totalGoals: data.totalGoals || 0
      });
    }

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('totalGoals', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ teams: data });
  }


  // ✅ POST
  if (req.method === 'POST') {
    const { username, playerIds } = req.body || {};

    if (!username || username.length < 2) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    if (!Array.isArray(playerIds) || playerIds.length !== 5) {
      return res.status(400).json({ error: 'Pick exactly 5 players' });
    }

    // ✅ Check if username already exists
    const { data: existing } = await supabase
      .from('teams')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Username already used' });
    }

    // ✅ INSERT INTO SUPABASE
    const { data, error } = await supabase
      .from('teams')
      .insert([
        {
          username,
          player_ids: playerIds,
          totalGoals: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      team: data,
      players: [],
      message: 'Team locked in!'
    });
  }


  return res.status(405).json({ error: 'Method not allowed' });
}