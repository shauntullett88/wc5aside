/**
 * pages/index.js
 * Team Selection / Lock-in Page
 *
 * Flow:
 *   1. User enters name → checks if already locked in
 *   2. User browses/filters/searches midfielders & forwards
 *   3. User picks exactly 6 players (no duplicate)
 *   4. Confirmation dialog: "Are you sure? You cannot change your team after locking in."
 *   5. POST /api/teams → team is locked permanently
 *   6. Display locked team summary
 */

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import PlayerCard from '../components/PlayerCard';
import { useTheme } from './_app';

const MAX_PLAYERS = 6;

const TEAM_FLAGS = {
  'Brazil':'🇧🇷','France':'🇫🇷','Spain':'🇪🇸','Germany':'🇩🇪',
  'Argentina':'🇦🇷','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Netherlands':'🇳🇱',
  'Morocco':'🇲🇦','USA':'🇺🇸','Japan':'🇯🇵','Italy':'🇮🇹',
  'Croatia':'🇭🇷','Uruguay':'🇺🇾','Mexico':'🇲🇽','Senegal':'🇸🇳',
};

export default function SelectionPage() {
  const { dark } = useTheme();

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]             = useState('name');    // name | pick | confirm | locked
  const [username, setUsername]     = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUser, setCheckingUser]   = useState(false);

  const [allPlayers, setAllPlayers] = useState([]);
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loadError, setLoadError]   = useState('');

  const [selected, setSelected]     = useState([]);   // array of player objects
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterPos, setFilterPos]   = useState('All');
  const [search, setSearch]         = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState('');
  const [lockedTeam, setLockedTeam] = useState(null);

  // ── Load players from API ──────────────────────────────────────────────────
  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res  = await fetch('/api/players');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load players');
      const players = data.players || [];

setAllPlayers(players);

// ✅ BUILD TEAMS FROM PLAYERS
const uniqueTeams = [...new Set(players.map(p => p.team))];
setTeams(uniqueTeams);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (step === 'pick') fetchPlayers(); }, [step]);

  // ── Filtered players ───────────────────────────────────────────────────────
  const filteredPlayers = allPlayers.filter(p => {
    if (filterTeam !== 'All' && p.team !== filterTeam) return false;
    if (filterPos  !== 'All' && !p.position.toLowerCase().includes(filterPos.toLowerCase())) return false;
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── Check if username already locked ──────────────────────────────────────
  async function handleNameSubmit(e) {
    e.preventDefault();
    const name = username.trim();
    if (name.length < 2) { setUsernameError('Name must be at least 2 characters'); return; }
    setCheckingUser(true);
    setUsernameError('');
    try {
      const res = await fetch(`/api/teams?username=${encodeURIComponent(name)}`);
      if (res.ok) {
        // Already has a locked team — show it
        const data = await res.json();
        setLockedTeam({ ...data.team, players: data.players, totalGoals: data.totalGoals });
        setStep('locked');
      } else if (res.status === 404) {
        // New user — go to pick
        setStep('pick');
      } else {
        const data = await res.json();
        setUsernameError(data.error || 'Error checking username');
      }
    } catch {
      setUsernameError('Network error — please try again');
    } finally {
      setCheckingUser(false);
    }
  }

  // ── Toggle player selection ────────────────────────────────────────────────
function togglePlayer(player) {
  setSelected(prev => {
    const already = prev.find(p => p.id === player.id);

    // ✅ Remove player if already selected
    if (already) return prev.filter(p => p.id !== player.id);

    // ✅ Max 6 players
    if (prev.length >= 6) return prev;

    // ✅ Count positions
    const midfielders = prev.filter(p => p.position === "Midfielder").length;
    const forwards = prev.filter(p => p.position === "Forward").length;

    // ✅ Count players from same team
    const sameTeamCount = prev.filter(p => p.team === player.team).length;

    // ✅ Enforce rules
    if (player.position === "Midfielder" && midfielders >= 3) {
      alert("You can only select max 3 midfielders");
      return prev;
    }

    if (player.position === "Forward" && forwards >= 3) {
      alert("You can only select max 3 forwards");
      return prev;
    }

    if (sameTeamCount >= 2) {
      alert("You can only select max 2 players from the same team");
      return prev;
    }

    return [...prev, player];
  });
}

  // ── Lock-in flow ───────────────────────────────────────────────────────────
  async function handleLockIn() {

  // ✅ Prevent multiple teams (1 per browser)
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
        body: JSON.stringify({
          username: username.trim(),
          playerIds: selected.map(p => p.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to lock team');localStorage.setItem('teamLocked', 'true');
      setLockedTeam({ ...data.team, players: data.players, totalGoals: 0 });
      setStep('locked');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Theming ────────────────────────────────────────────────────────────────
  const bg    = dark ? 'pitch-bg min-h-screen text-white' : 'bg-slate-50 min-h-screen text-slate-900';
  const card  = dark ? 'glass rounded-2xl border border-white/10' : 'bg-white rounded-2xl border border-slate-200 shadow-sm';
  const input = dark
    ? 'bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:border-pitch-500'
    : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-pitch-500';
  const label = dark ? 'text-slate-300' : 'text-slate-700';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Pick Your Team — WC6Aside Fantasy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className={bg}>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-8">

          {/* ── STEP: Name Entry ── */}
          {step === 'name' && (
            <div className="max-w-md mx-auto animate-slide-up">
              {/* Hero */}
              <div className="text-center mb-10">
                <div className="text-5xl mb-3">⚽</div>
                <h1 className={`text-4xl font-black mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                  WC6<span className="text-pitch-500">Aside</span>
                </h1>
                <p className={`text-lg ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Pick 6 players. Score goals + assists. Win it all.
                </p>
                <div className={`mt-4 inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full ${
                  dark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  <span>🏆</span> FIFA World Cup 2026 · Winner Takes All
                </div>
              </div>

              <div className={`${card} p-6`}>
                <h2 className={`text-xl font-bold mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Enter your name to get started
                </h2>
                <p className={`text-sm mb-5 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                  This will be your identity on the leaderboard.
                </p>

                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${label}`}>Your Name</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setUsernameError(''); }}
                      placeholder="e.g. Alex Ferguson"
                      maxLength={40}
                      className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${input}`}
                      autoFocus
                    />
                    {usernameError && (
                      <p className="text-rose-400 text-xs mt-1.5">{usernameError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!username.trim() || checkingUser}
                    className="w-full py-3 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                  >
                    {checkingUser ? 'Checking...' : 'Continue →'}
                  </button>
                </form>
              </div>

              {/* Rules summary */}
              <div className={`mt-6 ${card} p-5 space-y-3`}>
                <h3 className={`font-semibold text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>How it works</h3>
                {[
                  ['🎯', 'Pick exactly 6 players — 3 midfielders & 3 forwards'],
                  ['⚖️', 'Max 2 players allowed per national team'],
                  ['🔒', 'Your team is locked permanently after confirmation'],
                  ['⚽', 'Your score = total goals your players score at the World Cup'],
                  ['🚫', 'Own goals NEVER count'],
                  ['🏆', 'Highest total goals wins everything'],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0">{icon}</span>
                    <span className={dark ? 'text-slate-400' : 'text-slate-600'}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP: Player Selection ── */}
          {step === 'pick' && (
            <div className="animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                    Hi {username}! Pick your 6 players
                  </h2>
                  <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Midfielders & forwards only · No duplicates
                  </p>
                </div>
                <div className={`text-3xl font-black ${selected.length === MAX_PLAYERS ? 'text-pitch-400' : dark ? 'text-white' : 'text-slate-900'}`}>
                  {selected.length}/{MAX_PLAYERS}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: player browser */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Filters */}
                  <div className={`${card} p-4 space-y-3`}>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search players..."
                      className={`w-full px-3 py-2 rounded-lg text-sm outline-none transition-all ${input}`}
                    />
                    <div className="flex gap-2 flex-wrap">
                      <select
                        value={filterTeam}
                        onChange={e => setFilterTeam(e.target.value)}
                        className={`px-3 py-2 rounded-lg text-sm outline-none flex-1 min-w-[120px] ${input}`}
                      >
                        <option value="All">All Teams</option>
                        {teams.map(t => (
                          <option key={t} value={t}>{TEAM_FLAGS[t] || ''} {t}</option>
                        ))}
                      </select>
                      <select
                        value={filterPos}
                        onChange={e => setFilterPos(e.target.value)}
                        className={`px-3 py-2 rounded-lg text-sm outline-none flex-1 min-w-[120px] ${input}`}
                      >
                        <option value="All">All Positions</option>
                        <option value="Midfielder">Midfielder</option>
                        <option value="Forward">Forward / Attacker</option>
                      </select>
                    </div>
                    <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {filteredPlayers.length} players
                    </p>
                  </div>

                  {/* Player grid */}
                  {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Array(8).fill(0).map((_, i) => (
                        <div key={i} className={`h-20 rounded-xl shimmer ${dark ? 'bg-white/5' : 'bg-slate-100'}`} />
                      ))}
                    </div>
                  ) : loadError ? (
                    <div className={`${card} p-6 text-center`}>
                      <p className="text-rose-400 mb-3">{loadError}</p>
                      <button onClick={fetchPlayers} className="text-sm text-pitch-400 hover:underline">
                        Retry
                      </button>
                    </div>
                  ) : filteredPlayers.length === 0 ? (
                    <div className={`${card} p-8 text-center ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                      No players match your filters
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                      {filteredPlayers.map(player => {
                        const isSelected = selected.some(p => p.id === player.id);
                        const atLimit    = selected.length >= MAX_PLAYERS && !isSelected;
                        return (
                          <PlayerCard
                            key={player.id}
                            player={player}
                            selected={isSelected}
                            disabled={atLimit}
                            onClick={() => togglePlayer(player)}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right: selected players panel */}
                <div className="space-y-3">
                  <div className={`${card} p-4`}>
                    <h3 className={`font-bold mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
                      Your Team
                    </h3>

                    {/* Slots */}
                    <div className="space-y-2">
                      {Array(MAX_PLAYERS).fill(0).map((_, i) => {
                        const p = selected[i];
                        return p ? (
                          <div
                            key={p.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-pitch-600/20 border border-pitch-600/40 cursor-pointer hover:bg-pitch-600/30 transition-all"
                            onClick={() => togglePlayer(p)}
                          >
                            <span className="text-pitch-400 font-bold text-xs w-4">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                              <div className="text-[10px] text-slate-400">{p.team}</div>
                            </div>
                            <span className="text-slate-500 hover:text-rose-400 text-xs">✕</span>
                          </div>
                        ) : (
                          <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border border-dashed ${
                            dark ? 'border-white/15' : 'border-slate-200'
                          }`}>
                            <span className={`font-bold text-xs w-4 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{i + 1}</span>
                            <span className={`text-xs ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Empty slot</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Lock button */}
                    <button
                      onClick={() => setStep('confirm')}
                      disabled={selected.length !== MAX_PLAYERS}
                      className="mt-4 w-full py-3 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
                    >
                      {selected.length === MAX_PLAYERS
                        ? '🔒 Lock In My Team'
                        : `Select ${MAX_PLAYERS - selected.length} more player${MAX_PLAYERS - selected.length !== 1 ? 's' : ''}`}
                    </button>
                  </div>

                  {/* Tip */}
                  <div className={`${card} p-3 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    💡 Tap a selected player to remove them. Your team is locked permanently after confirmation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: Confirmation Dialog ── */}
          {step === 'confirm' && (
            <div className="max-w-lg mx-auto animate-slide-up">
              <div className={`${card} p-8 text-center`}>
                <div className="text-5xl mb-4">🔒</div>
                <h2 className={`text-2xl font-black mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
                  Lock in your team?
                </h2>
                <p className={`text-sm mb-6 ${dark ? 'text-rose-400' : 'text-rose-500'} font-medium`}>
                  ⚠️ Are you sure? You cannot change your team after locking in.
                </p>

                {/* Team preview */}
                <div className={`rounded-xl p-4 mb-6 text-left space-y-2 ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {username}'s Team
                  </div>
                  {selected.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 text-sm">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        dark ? 'bg-pitch-600 text-white' : 'bg-pitch-100 text-pitch-700'
                      }`}>{i + 1}</span>
                      <span className={`font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>{p.name}</span>
                      <span className={`text-xs ml-auto ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{p.team}</span>
                    </div>
                  ))}
                </div>

                {submitError && (
                  <p className="text-rose-400 text-sm mb-4">{submitError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('pick'); setSubmitError(''); }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                      dark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    ← Go Back
                  </button>
                  <button
                    onClick={handleLockIn}
                    disabled={submitting}
                    className="flex-1 py-3 bg-pitch-600 hover:bg-pitch-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm"
                  >
                    {submitting ? 'Locking in...' : '🔒 Confirm Lock-In'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: Locked Team View ── */}
          {step === 'locked' && lockedTeam && (
            <div className="max-w-lg mx-auto animate-slide-up">
              <div className={`${card} p-8`}>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3">🏆</div>
                  <h2 className={`text-2xl font-black mb-1 ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {lockedTeam.username}'s Team
                  </h2>
                  <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${
                    dark ? 'bg-pitch-600/20 text-pitch-400 border border-pitch-600/30' : 'bg-pitch-50 text-pitch-700 border border-pitch-200'
                  }`}>
                    🔒 Team Locked
                  </div>
                </div>

                {/* Players */}
                <div className="space-y-3 mb-6">
                  {lockedTeam.players.map((p, i) => (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                      dark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-100'
                    }`}>
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        dark ? 'bg-pitch-600 text-white' : 'bg-pitch-600 text-white'
                      }`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>{p.name}</div>
                        <div className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{p.team} · {p.position}</div>
                      </div>
                      <span className={`font-bold text-sm ${p.goals > 0 ? 'text-pitch-400' : dark ? 'text-slate-600' : 'text-slate-300'}`}>
                        {p.goals > 0 ? `⚽ ${p.goals}` : '0'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total goals */}
                <div className={`text-center py-3 rounded-xl mb-6 ${dark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className={`text-3xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {lockedTeam.players.reduce((s, p) => s + (p.goals || 0), 0)}
                  </div>
                  <div className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Total Goals</div>
                </div>

                <Link
                  href="/leaderboard"
                  className="block w-full py-3 bg-pitch-600 hover:bg-pitch-500 text-white font-bold rounded-xl transition-all text-center text-sm"
                >
                  View Live Leaderboard →
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
