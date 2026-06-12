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

  const [step, setStep] = useState('pick');
  const [username, setUsername] = useState('');

  const [allPlayers, setAllPlayers] = useState([]);
  const [selected, setSelected] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchPlayers = useCallback(async () => {
    const res = await fetch('/api/players');
    const data = await res.json();
    setAllPlayers(data.players || []);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, []);

  function togglePlayer(player) {
    setSelected(prev => {
      const exists = prev.find(p => p.id === player.id);
      if (exists) return prev.filter(p => p.id !== player.id);
      if (prev.length >= MAX_PLAYERS) return prev;
      return [...prev, player];
    });
  }

  // ✅ ✅ FIXED HERE (ONLY CHANGE)
  async function handleLockIn() {
    if (selected.length !== MAX_PLAYERS) {
      setSubmitError(`You must pick exactly ${MAX_PLAYERS} players`);
      return;
    }

    setSubmitting(true);

    try {
      await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerIds: selected.map(p => p.id) }),
      });

    } catch (err) {
      setSubmitError('Failed to lock team');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Pick Team</title>
      </Head>

      <main style={{ padding: 20 }}>
        <h2>{selected.length}/6 selected</h2>

        {allPlayers.map(p => (
          <div key={p.id}>
            <button onClick={() => togglePlayer(p)}>
              {p.name}
            </button>
          </div>
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

        {step === 'confirm' && (
          <div>
            <h3>Confirm</h3>

            {submitError && <p>{submitError}</p>}

            <button onClick={handleLockIn} disabled={submitting}>
              {submitting ? 'Locking...' : 'Confirm'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
