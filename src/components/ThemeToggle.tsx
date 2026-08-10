"use client";

import React, { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string>("system");

  useEffect(() => {
    try {
      const t = localStorage.getItem("sj_theme") || "system";
      setTheme(t);
    } catch (e) {
      setTheme("system");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // follow system
      const prefers = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefers) root.classList.add("dark");
      else root.classList.remove("dark");
    }
    try {
      localStorage.setItem("sj_theme", theme);
    } catch (e) {}
  }, [theme]);

  return (
    <div className="min-h-full">
      {children}
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </div>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded shadow">
      <select
        aria-label="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-transparent text-sm outline-none"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
