/**
 * pages/leaderboard.js
 */

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useTheme } from './_app';

// ✅ Flags
const TEAM_FLAGS = {
  Brazil: '🇧🇷',
  France: '🇫🇷',
  Spain: '🇪🇸',
  Germany: '🇩🇪',
  Argentina: '🇦🇷',
  England: '🏴',
  Portugal: '🇵🇹',
  Mexico: '🇲🇽'
};

export default function LeaderboardPage() {
  const { dark } = useTheme();

  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      // ✅ Fetch teams
      const res = await fetch('/api/teams');
      const data = await res.json();

      const sortedTeams = (data.teams || []).sort((a, b) =>
        ((b.totalGoals || 0) * 2 + (b.totalAssists || 0)) -
        ((a.totalGoals || 0) * 2 + (a.totalAssists || 0))
      );

      setTeams(sortedTeams);

      // ✅ Fetch players
      const resPlayers = await fetch('/api/player-stats');
      const dataPlayers = await resPlayers.json();

      const sortedPlayers = (dataPlayers.players || []).sort((a, b) =>
        ((b.goals || 0) * 2 + (b.assists || 0)) -
        ((a.goals || 0) * 2 + (a.assists || 0))
      );

      setPlayers(sortedPlayers);

    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Leaderboard</title>
      </Head>

      <div className={dark ? 'bg-black text-white min-h-screen' : 'bg-white text-black min-h-screen'}>
        <Navbar />

        {/* ✅ SPLIT LAYOUT */}
        <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ✅ TEAM LEADERBOARD */}
          <div>
            <h1 className="text-2xl font-bold mb-4">
              🏆 Leaderboard (Goals + Assists)
            </h1>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && teams.length === 0 && <p>No teams yet</p>}

            {!loading && teams.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-left">Pos</th>
                      <th className="p-2 text-left">Team</th>
                      <th className="p-2 text-left">Goals</th>
                      <th className="p-2 text-left">Assists</th>
                      <th className="p-2 text-left">Points</th>
                    </tr>
                  </thead>

                  <tbody>
                    {teams.map((team, index) => (
                      <tr
                        key={index}
                        className={`border-b ${
                          index === 0 ? 'bg-green-100 dark:bg-green-900 font-bold' : ''
                        }`}
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{team.username}</td>
                        <td className="p-2">{team.totalGoals || 0}</td>
                        <td className="p-2">{team.totalAssists || 0}</td>
                        <td className="p-2 font-bold">
                          {(team.totalGoals || 0) * 2 + (team.totalAssists || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ✅ TOP PLAYERS */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              🔥 Top Players
            </h2>

            {players.length === 0 && <p>No player stats yet</p>}

            {players.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-left">Player</th>
                      <th className="p-2 text-left">Goals</th>
                      <th className="p-2 text-left">Assists</th>
                      <th className="p-2 text-left">Points</th>
                    </tr>
                  </thead>

                  <tbody>
                    {players.slice(0, 5).map((p, index) => (
                      <tr
                        key={p.id}
                        className={`border-b ${
                          index === 0 ? 'bg-green-100 dark:bg-green-900 font-bold' : ''
                        }`}
                      >
                        <td className="p-2">
                          {TEAM_FLAGS[p.team] || ''} {p.name || p.id}
                          {p.position ? ` (${p.position})` : ''}
                        </td>
                        <td className="p-2">{p.goals || 0}</td>
                        <td className="p-2">{p.assists || 0}</td>
                        <td className="p-2 font-bold">
                          {(p.goals || 0) * 2 + (p.assists || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ✅ BACK LINK */}
          <div className="lg:col-span-2 mt-4">
            <Link href="/" className="text-blue-500 underline">
              ← Back to team selection
            </Link>
          </div>

        </main>
      </div>
    </>
  );
}