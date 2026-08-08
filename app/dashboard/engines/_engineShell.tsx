'use client';
import React from 'react';

interface EngineShellProps {
  title: string;
  subtitle?: string;
  accent?: 'indigo' | 'emerald' | 'rose' | 'slate';
  children: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * EngineShell: consistent engine header, actions, responsive container, dark theme
 */
export default function EngineShell({ title, subtitle, accent='indigo', children, actions }: EngineShellProps) {
  const accentClass = {
    indigo: 'text-indigo-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    slate: 'text-slate-400',
  }[accent];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-900 text-slate-100">
      <header className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold ${accentClass} break-words`}>{title}</h1>
            {subtitle && <p className="text-sm text-slate-300 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      </header>

      <main className="space-y-6">
        {children}
      </main>
    </div>
  );
}
