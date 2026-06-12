/**
 * pages/index.js
 */

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import PlayerCard from '../components/PlayerCard';
import { useTheme } from './_app';

const MAX_PLAYERS = 6;

export default function SelectionPage() {
  const { dark } = useTheme();

  const [step, setStep] = useState('name');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUser, setCheckingUser] = useState(false);

  const [allPlayers, setAllPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lockedTeam, setLockedTeam] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      const players = data.players || [];

      setAllPlayers(players);
      setTeams([...new Set(players.map(p => p.team))]);

    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 'pick') fetchPlayers();
  }, [step]);

  function togglePlayer(player) {
    setSelected(prev => {
      const exists = prev.find(p => p.id === player.id);

      if (exists) return prev.filter(p => p.id !== player.id);

      if (prev.length >= MAX_PLAYERS) return prev;

      return [...prev, player];
    });
  }

  // ✅ ✅ FIXED FUNCTION
  async function handleLockIn() {

    // ✅ FIX: ensure exactly 6 players
    if (selected.length !== MAX_PLAYERS) {
      setSubmitError(`You must pick exactly ${MAX_PLAYERS} players`);
      return;
    }

    if (typeof window !== 'undefined' && localStorage.getItem('teamLocked')) {
      alert('You have already created a team!');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, playerIds: selected.map(p => p.id) }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('teamLocked', 'true');

      setLockedTeam(data);
      setStep('locked');

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Pick Team</title>
      </Head>

      <main>

        {step === 'pick' && (
          <>
            <h2>{selected.length}/6 selected</h2>

            {allPlayers.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                selected={selected.some(p => p.id === player.id)}
                onClick={() => togglePlayer(player)}
              />
            ))}

            <button
              onClick={() => {
                if (selected.length !== MAX_PLAYERS) {
                  alert(`Pick exactly ${MAX_PLAYERS} players`);
                  return;
                }
                setStep('confirm');
              }}
            >
              Lock In
            </button>
          </>
        )}

        {step === 'confirm' && (
          <div>
            <h2>Confirm Team</h2>

            {selected.map(p => (
              <div key={p.id}>{p.name}</div>
            ))}

            {submitError && <p>{submitError}</p>}

            <button onClick={() => setStep('pick')}>
              Back
            </button>

            {/* ✅ FIXED BUTTON */}
            <button
              onClick={handleLockIn}
              disabled={submitting}
            >
              {submitting ? 'Locking in...' : 'Confirm'}
            </button>
          </div>
        )}

      </main>
    </>
  );
}