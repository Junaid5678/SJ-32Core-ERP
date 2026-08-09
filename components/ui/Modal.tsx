'use client';

import React from 'react';

export default function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-lg p-6 z-10 w-full max-w-2xl">
        {title && <h3 className="font-semibold text-lg mb-3">{title}</h3>}
        <div>{children}</div>
        <div className="mt-4 text-right">
          <button className="px-3 py-2 bg-indigo-600 rounded" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
