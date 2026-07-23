'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const close = () => setMenuOpen(false);

  const links = [
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/planner', label: '📅 Planner' },
    { to: '/ai-explainer', label: '🤖 AI Explainer' },
    { to: '/flashcards', label: '🃏 Flashcards' },
    { to: '/timer', label: '⏱️ Pomodoro' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-400">
        <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-lg shadow-md">L</span>
        <span>Learnozi</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {links.map((l) => (
          <Link
            key={l.to}
            href={l.to}
            className={`transition-colors hover:text-indigo-400 ${pathname === l.to ? 'text-indigo-400 font-semibold' : 'text-slate-300'}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-4 text-sm font-medium">
        {user ? (
          <>
            <span className="text-slate-300">👤 {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-slate-300 hover:text-white px-3 py-1.5">
              Login
            </Link>
            <Link href="/signup" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-md transition-colors shadow">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
