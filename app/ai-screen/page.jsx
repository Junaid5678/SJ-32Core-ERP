'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AIScreenComponent() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseLog, setResponseLog] = useState(null);

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      // 1. Get current authenticated user session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        alert('Unauthorized: Please login first.');
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      const isSuperAdmin = userEmail === 'ja024478@gmail.com';

      // 2. Fetch user profile / tenant mapping from Supabase database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id, role, staff_id')
        .eq('id', session.user.id)
        .single();

      // 3. Build rich context payload for Steve (n8n Webhook)
      const userContext = {
        userId: session.user.id,
        email: userEmail,
        role: isSuperAdmin ? 'super_admin' : (profileData?.role || 'company_owner'),
        tenantId: isSuperAdmin ? 'GLOBAL_SUPER_ADMIN_TENANT' : (profileData?.tenant_id || null),
        staffId: profileData?.staff_id || 'SA-001',
        permissions: isSuperAdmin ? ['ALL_ENGINES_ACCESS'] : ['TENANT_SCOPED_ACCESS']
      };

      const webhookPayload = {
        eventType: 'AI_QUERY_SUBMITTED',
        tenantId: userContext.tenantId,
        userContext: userContext,
        payload: {
          userQuery: query,
          timestamp: new Date().toISOString()
        }
      };

      // 4. Send request to our backend webhook route (/api/webhook/steve)
      const res = await fetch('/api/webhook/steve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STEVE_WEBHOOK_SECRET || ''}` 
        },
        body: JSON.stringify(webhookPayload)
      });

      const result = await res.json();
      setResponseLog(result);

    } catch (err) {
      console.error('AI Screen Error:', err);
      setResponseLog({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-900 text-white rounded-xl shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">SJ 32Core ERP - AI Screen (Steve Gateway)</h2>
      <p className="text-sm text-slate-400 mb-6">
        Aap yahan koi bhi multi-intent query likh sakte hain jo aapke business data aur 32 universal engines ko securely query karegi.
      </p>

      <form onSubmit={handleAISubmit} className="space-y-4">
        <div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Misal ke taur par: 'Mujhe pichle 7 din ki total sales aur resin art stock ki report do'..."
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 text-white"
            rows={4}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing with Steve...' : 'Ask Steve AI'}
        </button>
      </form>

      {responseLog && (
        <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <h3 className="text-sm font-semibold text-emerald-300 mb-2">Webhook Response Log:</h3>
          <pre className="text-xs text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded">
            {JSON.stringify(responseLog, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}


