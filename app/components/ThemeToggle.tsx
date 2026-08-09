'use client';

import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme, toggle, resolvedTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={`px-2 py-1 rounded ${resolvedTheme === 'light' ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-300'}`}
        aria-label="Set light theme"
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-2 py-1 rounded ${theme === 'system' ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-300'}`}
        aria-label="Use system theme"
      >
        🖥️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-2 py-1 rounded ${resolvedTheme === 'dark' ? 'bg-slate-800 text-white' : 'bg-transparent text-slate-300'}`}
        aria-label="Set dark theme"
      >
        🌙
      </button>
      <button
        onClick={toggle}
        className="ml-2 px-2 py-1 rounded bg-indigo-600 text-white text-xs"
        aria-label="Toggle theme"
      >
        Toggle
      </button>
    </div>
  );
}
