'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../src/lib/supabaseClient';
import { supabaseServer } from '../../../../src/lib/supabaseServerClient';
import { isSuperAdminByEmail } from '../../../../src/lib/admin';
import { ENGINES } from '../../../../src/lib/engines';

type Plan = {
  id?: number;
  name: string;
  price: number;
  ai_tokens: number;
  enabled_engines: string[];
};

export default function SubscriptionsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newPlan, setNewPlan] = useState<Plan>({ name: '', price: 0, ai_tokens: 0, enabled_engines: [] });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // client session
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email ?? null;
        setUserEmail(email);

        // server-side check for role via admin helper (uses service key)
        const ok = await isSuperAdminByEmail(email);
        setAuthorized(ok);
        if (ok) await fetchPlans();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function fetchPlans() {
    const { data, error } = await supabase.from('subscription_plans').select('*').order('id', { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setPlans(data ?? []);
  }

  async function createPlan() {
    try {
      const { data, error } = await supabase.from('subscription_plans').insert([newPlan]).select();
      if (error) throw error;
      setNewPlan({ name: '', price: 0, ai_tokens: 0, enabled_engines: [] });
      await fetchPlans();
    } catch (e: any) {
      alert('Error creating plan: ' + e.message);
    }
  }

  async function updatePlan(plan: Plan) {
    try {
      if (!plan.id) return;
      const { error } = await supabase.from('subscription_plans').update(plan).eq('id', plan.id);
      if (error) throw error;
      await fetchPlans();
    } catch (e: any) {
      alert('Error updating plan: ' + e.message);
    }
  }

  async function deletePlan(planId?: number) {
    if (!planId || !confirm('Delete this plan?')) return;
    try {
      const { error } = await supabase.from('subscription_plans').delete().eq('id', planId);
      if (error) throw error;
      await fetchPlans();
    } catch (e: any) {
      alert('Error deleting plan: ' + e.message);
    }
  }

  if (loading) return <div className="p-6">Checking permissions...</div>;
  if (!authorized) return <div className="p-6 text-red-400">Access denied — Super Admins only.</div>;

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Subscription Plans — Super Admin</h1>

      <section className="mb-6 bg-slate-900 p-4 rounded-lg border border-slate-800">
        <h2 className="font-semibold mb-2">Create new plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input className="p-2 bg-slate-800 rounded" placeholder="Plan name" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} />
          <input className="p-2 bg-slate-800 rounded" type="number" placeholder="Price" value={String(newPlan.price)} onChange={e => setNewPlan({ ...newPlan, price: parseFloat(e.target.value || '0') })} />
          <input className="p-2 bg-slate-800 rounded" type="number" placeholder="AI tokens" value={String(newPlan.ai_tokens)} onChange={e => setNewPlan({ ...newPlan, ai_tokens: parseInt(e.target.value || '0') })} />
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 bg-indigo-600 rounded" onClick={createPlan}>Create</button>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xs text-slate-400">Select engines enabled for this plan after creating it via the edit action.</p>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Existing Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-slate-900 p-4 rounded border border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-slate-400">Rs. {plan.price} • AI tokens: {plan.ai_tokens}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-rose-600 rounded" onClick={() => deletePlan(plan.id)}>Delete</button>
                </div>
              </div>

              <div className="mt-3 text-sm">
                <label className="block text-xs text-slate-300 mb-1">Enabled Engines</label>
                <div className="grid grid-cols-2 gap-1 max-h-40 overflow-auto">
                  {ENGINES.map(e => (
                    <label key={e.slug} className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={(plan.enabled_engines || []).includes(e.slug)} onChange={async (ev) => {
                        const checked = ev.target.checked;
                        const next = new Set(plan.enabled_engines || [] as string[]);
                        if (checked) next.add(e.slug); else next.delete(e.slug);
                        const updated = { ...plan, enabled_engines: Array.from(next) } as any;
                        await updatePlan(updated);
                      }} />
                      <span>{e.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
