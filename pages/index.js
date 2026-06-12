/**
 * pages/index.js
 * Team Selection / Lock-in Page
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
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterPos, setFilterPos] = useState('All');
  const [search, setSearch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [lockedTeam, setLockedTeam] = useState(null);

  // ✅ Load players
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

  // ✅ Filter
  const filteredPlayers = allPlayers.filter(p => {
    if (filterTeam !== 'All' && p.team !== filterTeam) return false;
    if (filterPos !== 'All' && !p.position.includes(filterPos)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ✅ Name submit
  async function handleNameSubmit(e) {
    e.preventDefault();
    const name = username.trim();

    if (name.length < 2) {
      setUsernameError('Name must be at least 2 characters');
      return;
    }

    setCheckingUser(true);

    try {
      const res = await fetch(`/api/teams?username=${encodeURIComponent(name)}`);

      if (res.ok) {
        const data = await res.json();
        setLockedTeam(data);
        setStep('locked');
      } else {
        setStep('pick');
      }

    } catch {
      setUsernameError('Network error');
    } finally {
      setCheckingUser(false);
    }
  }

  // ✅ Player selection rules
  function togglePlayer(player) {
    setSelected(prev => {
      const exists = prev.find(p => p.id === player.id);

      if (exists) {
        return prev.filter(p => p.id !== player.id);
      }

      if (prev.length >= MAX_PLAYERS) return prev;

      const mids = prev.filter(p => p.position === 'Midfielder').length;
      const atts = prev.filter(p => p.position === 'Forward').length;
      const sameTeam = prev.filter(p => p.team === player.team).length;

      if (player.position === 'Midfielder' && mids >= 3) {
        alert("Max 3 midfielders");
        return prev;
      }

      if (player.position === 'Forward' && atts >= 3) {
        alert("Max 3 attackers");
        return prev;
      }

      if (sameTeam >= 2) {
        alert("Max 2 players per team");
        return prev;
      }

      return [...prev, player];
    });
  }

  // ✅ Lock in
  async function handleLockIn() {

    if (selected.length !== MAX_PLAYERS) {
      setSubmitError(`Pick exactly ${MAX_PLAYERS} players`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, playerIds: selected.map(p => p.id) })
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

  const bg = dark ? 'bg-black text-white min-h-screen' : 'bg-white text-black min-h-screen';

  return (
    <>
      <Head>
        <title>WC6Aside</title>
      </Head>

      <div className={bg}>
        <Navbar />

        <main className="max-w-6xl mx-auto p-6">

          {/* NAME */}
          {step === 'name' && (
            <form onSubmit={handleNameSubmit}>
              <input value={username} onChange={e => setUsername(e.target.value)} />
              <button>{checkingUser ? 'Checking...' : 'Continue'}</button>
            </form>
          )}

          {/* PICK */}
          {step === 'pick' && (
            <>
              <h2>{selected.length}/6 selected</h2>

              <div>
                {filteredPlayers.map(p => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    selected={selected.some(s => s.id === p.id)}
                    onClick={() => togglePlayer(p)}
                  />
                ))}
              </div>

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

          {/* CONFIRM */}
          {step === 'confirm' && (
            <div>
              <h2>Confirm Team</h2>

              <p>Pick exactly 6 players</p>

              {selected.map(p => (
                <div key={p.id}>{p.name}</div>
              ))}

              {submitError && <p>{submitError}</p>}

              <button onClick={() => setStep('pick')}>Back</button>

              <button onClick={handleLockIn}>
                {submitting ? 'Locking...' : 'Confirm'}
              </button>
            </div>
          )}

          {/* LOCKED */}
          {step === 'locked' && lockedTeam && (
            <div>
              <h2>{lockedTeam.username}</h2>

              {lockedTeam.players?.map(p => (
                <div key={p.id}>{p.name}</div>
              ))}

              <Link href="/leaderboard">View Leaderboard</Link>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
