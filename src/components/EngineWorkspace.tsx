"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function EngineWorkspace({ engineKey }: { engineKey: string }) {
  const [rows, setRows] = useState<Array<any>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data, error } = await supabase.from('engine_events').select('*').eq('engine', engineKey).order('created_at', { ascending: false }).limit(100);
        if (error) {
          // table might not exist yet; swallow error for demo
          console.warn('engine_events select error', error.message);
          setRows([]);
        } else if (mounted) {
          setRows(data || []);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    // subscribe to realtime inserts for engine_events for this engine
    const channel = supabase.channel('public:engine_events').on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'engine_events', filter: `engine=eq.${engineKey}` },
      (payload) => {
        setRows((r) => [payload.new, ...r]);
      }
    ).subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch (e) { /* ignore */ }
    };
  }, [engineKey]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await supabase.from('engine_events').insert([{ engine: engineKey, payload: input }]);
      setInput('');
    } catch (err) {
      console.warn('insert error', err);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Create a new ${engineKey} event`} className="flex-1 px-3 py-2 border rounded" />
          <button className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
        </form>
      </div>

      <div className="space-y-2">
        {loading && <div className="text-sm text-slate-500">Loading recent events...</div>}
        {rows.length === 0 && !loading && <div className="text-sm text-slate-500">No events yet for this engine.</div>}
        {rows.map((r: any, idx: number) => (
          <div key={r.id || idx} className="p-3 bg-white dark:bg-slate-800 rounded shadow">
            <div className="text-sm text-slate-400">{new Date(r.created_at || Date.now()).toLocaleString()}</div>
            <div className="mt-1">{r.payload || JSON.stringify(r)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
