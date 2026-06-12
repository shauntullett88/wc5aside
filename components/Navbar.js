import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '../pages/_app';

export default function Navbar() {
  const router = useRouter();
  const { dark, toggle } = useTheme();

  const navBase = `relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`;
  const active  = `${navBase} bg-pitch-600 text-white`;
  const inactive = `${navBase} text-slate-400 hover:text-white hover:bg-white/10`;

  return (
    <nav className={`sticky top-0 z-50 border-b ${
      dark
        ? 'bg-slate-950/90 border-white/10 text-white'
        : 'bg-white/90 border-slate-200 text-slate-900'
    } backdrop-blur-md`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <div className={`font-black text-base leading-none tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
              WC6<span className="text-pitch-500">Aside</span>
            </div>
            <div className={`text-[10px] tracking-widest uppercase ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Fantasy 2026
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link href="/" className={router.pathname === '/' ? active : inactive}>
            Pick Team
          </Link>
          <Link href="/leaderboard" className={router.pathname === '/leaderboard' ? active : inactive}>
            Leaderboard
          </Link>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className={`p-2 rounded-lg transition-all ${
            dark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500'
          }`}
          title="Toggle theme"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}
