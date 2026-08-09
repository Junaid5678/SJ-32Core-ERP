'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isSuperAdminByEmail } from '@/lib/admin';

export default function SettingsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [platformQuota, setPlatformQuota] = useState({ ai_daily_limit: 100000, active_tenants_limit: 5000 });

  useEffect(() => {
    async function init() {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email ?? null;
        setUserEmail(email);
        const ok = await isSuperAdminByEmail(email);
        setAuthorized(ok);
        if (ok) await fetchTenants();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchTenants() {
    try {
      const { data, error } = await supabase.from('tenants').select('*').order('id', { ascending: true });
      if (error) throw error;
      setTenants(data ?? []);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="p-6">Checking permissions...</div>;
  if (!authorized) return <div className="p-6 text-red-400">Access denied — Super Admins only.</div>;

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Platform Settings — Super Admin</h1>

      <section className="mb-6 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <h2 className="font-semibold mb-2">Platform Quotas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-950 rounded">
            <label className="text-xs text-slate-400">Daily AI Token Limit</label>
            <div className="text-xl font-bold text-indigo-400">{platformQuota.ai_daily_limit.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded">
            <label className="text-xs text-slate-400">Max Active Tenants</label>
            <div className="text-xl font-bold text-emerald-400">{platformQuota.active_tenants_limit.toLocaleString()}</div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <h2 className="font-semibold mb-2">Tenants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tenants.map((t) => (
            <div key={t.id} className="p-3 bg-slate-950 rounded border border-slate-800">
              <div className="text-sm font-semibold">{t.name || t.tenant_email}</div>
              <div className="text-xs text-slate-400">{t.tenant_email}</div>
              <div className="mt-2 text-xs text-slate-300">Subscription Plan: {t.plan_id || '—'}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
