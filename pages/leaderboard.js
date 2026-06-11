/**
 * pages/leaderboard.js
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useTheme } from './_app';

const REFRESH_INTERVAL = 10 * 60 * 1000;

export default function LeaderboardPage() {
  const { dark } = useTheme();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      const sorted = (data.teams || []).sort((a, b) => (b.totalGoals || 0) - (a.totalGoals || 0));
setTeams(sorted);
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <>
      <Head>
        <title>Leaderboard</title>
      </Head>

      <div className={dark ? 'bg-black text-white min-h-screen' : 'bg-white text-black min-h-screen'}>
        <Navbar />

        <main className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard</h1>

          {loading && <p>Loading...</p>}

          {error && <p className="text-red-500">{error}</p>}

          {!loading && teams.length === 0 && (
            <p>No teams yet</p>
          )}

          {!loading && teams.length > 0 && (
            <div className="overflow-x-auto">
  <table className="w-full text-sm border-collapse">
    <thead>
      <tr className="border-b bg-gray-100 dark:bg-gray-800">
        <th className="p-2 text-left">Pos</th>
        <th className="p-2 text-left">Team</th>
        <th className="p-2 text-left">Goals</th>
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

          <td className="p-2">
            {team.username}
          </td>

          <td className="p-2 font-bold">
            {team.totalGoals || 0}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
          )}

          <div className="mt-6">
            <Link href="/" className="text-blue-500 underline">
              ← Back to team selection
            </Link>
          </div>

        </main>
      </div>
    </>
  );
}
