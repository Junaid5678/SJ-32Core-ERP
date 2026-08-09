'use client';

import React, { useEffect, useState } from 'react';

export default function Toast({ message, duration = 3000 }: { message?: string; duration?: number }) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [message]);

  if (!visible || !message) return null;
  return (
    <div className="fixed right-4 bottom-4 z-50 bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}
