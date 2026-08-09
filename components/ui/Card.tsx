'use client';

import React from 'react';

export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}
