'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const t = localStorage.getItem('theme') as Theme | null;
      return (t as Theme) || 'system';
    } catch (e) {
      return 'system';
    }
  });

  const getSystemPref = () => (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';

  const resolved = theme === 'system' ? getSystemPref() : theme;

  useEffect(() => {
    // apply class to documentElement
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme, resolved]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved as 'light' | 'dark', setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
