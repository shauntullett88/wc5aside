/**
 * PlayerCard.js
 * Displays a single player with name, team, position badge.
 * Supports selected/disabled states for the team-selection page.
 */

const POSITION_COLORS = {
  'Forward':    { bg: 'bg-rose-500/20',   text: 'text-rose-400',   border: 'border-rose-500/30'   },
  'Attacker':   { bg: 'bg-rose-500/20',   text: 'text-rose-400',   border: 'border-rose-500/30'   },
  'Midfielder': { bg: 'bg-amber-500/20',  text: 'text-amber-400',  border: 'border-amber-500/30'  },
};

const TEAM_FLAGS = {
  'Brazil':      '🇧🇷', 'France':     '🇫🇷', 'Spain':       '🇪🇸',
  'Germany':     '🇩🇪', 'Argentina':  '🇦🇷', 'England':     '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Portugal':    '🇵🇹', 'Netherlands':'🇳🇱', 'Morocco':     '🇲🇦',
  'USA':         '🇺🇸', 'Japan':      '🇯🇵', 'Italy':       '🇮🇹',
  'Croatia':     '🇭🇷', 'Uruguay':    '🇺🇾', 'Mexico':      '🇲🇽',
  'Senegal':     '🇸🇳',
};

export default function PlayerCard({ player, selected, disabled, onClick, showGoals = false }) {
  const posColors = POSITION_COLORS[player.position] || POSITION_COLORS['Midfielder'];
  const flag      = TEAM_FLAGS[player.team] || '🌍';

  let cardClass = `player-card glass rounded-xl p-3 border transition-all `;
  if (selected) {
    cardClass += 'selected border-pitch-500 ';
  } else if (disabled) {
    cardClass += 'disabled border-white/5 ';
  } else {
    cardClass += 'border-white/10 hover:border-white/25 ';
  }

  return (
    <div className={cardClass} onClick={!disabled ? onClick : undefined}>
      <div className="flex items-start justify-between gap-2">
        {/* Player avatar / initials */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          selected ? 'bg-pitch-600 text-white' : 'bg-white/10 text-slate-300'
        }`}>
          {player.photo_url ? (
            <img src={player.photo_url} alt={player.name} className="w-full h-full rounded-lg object-cover" />
          ) : (
            getInitials(player.name)
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className={`font-semibold text-sm truncate ${selected ? 'text-pitch-400' : 'text-white'}`}>
            {player.name}
          </div>

          {/* Team + flag */}
          <div className="text-xs text-slate-500 mt-0.5 truncate">
            {flag} {player.team}
          </div>
        </div>

        {/* Position badge + goal count */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${posColors.bg} ${posColors.text} ${posColors.border}`}>
            {player.position === 'Forward' || player.position === 'Attacker' ? 'FWD' : 'MID'}
          </span>
          {showGoals && (
            <span className={`text-xs font-bold ${player.goals > 0 ? 'text-pitch-400' : 'text-slate-600'}`}>
              {player.goals > 0 ? `⚽ ${player.goals}` : '—'}
            </span>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="mt-2 flex items-center gap-1 text-pitch-400 text-xs font-medium">
          <span>✓</span> Selected
        </div>
      )}
    </div>
  );
}

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}
