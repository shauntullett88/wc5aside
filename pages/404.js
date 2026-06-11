import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useTheme } from './_app';

export default function NotFound() {
  const { dark } = useTheme();
  return (
    <div className={dark ? 'pitch-bg min-h-screen text-white' : 'bg-slate-50 min-h-screen text-slate-900'}>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <div className="text-6xl mb-4">⚽</div>
        <h1 className={`text-4xl font-black mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>404</h1>
        <p className={`mb-6 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>This page is offside.</p>
        <Link href="/" className="px-6 py-2 bg-pitch-600 text-white font-bold rounded-xl hover:bg-pitch-500 transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
