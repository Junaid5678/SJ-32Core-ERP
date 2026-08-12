import React from 'react';

export default function Sidebar({ allowedEngines }: { allowedEngines: string }) {
  // Render a 32-engine sidebar (interactive). For demonstration, engines are clickable links.
  const engines = Array.from({ length: 32 }).map((_, i) => ({ id: i + 1, name: `Engine ${i + 1}` }));
  const filtered = allowedEngines === 'all' ? engines : engines.slice(0, 12);

  return (
    <aside className="w-72 bg-gray-50 border-r min-h-screen p-4">
      <h3 className="font-bold mb-4">Engines</h3>
      <ul>
        {filtered.map((e) => (
          <li key={e.id} className="mb-2">
            <a href={`/dashboard/engines/${e.id}`} className="text-indigo-700 hover:underline">{e.name}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
