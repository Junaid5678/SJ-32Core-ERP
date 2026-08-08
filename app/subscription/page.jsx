'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch subscription plans from Supabase database
  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        // Agar database mein abhi plans entries nahi hain toh default universal tiers dikha do
        if (!data || data.length === 0) {
          setPlans([
            { id: 'trial', plan_name: '7-Day Free Trial', price: '0', description: 'Full access to all 32 engines for testing.' },
            { id: 'starter', plan_name: 'Starter Tier', price: '$29', description: '1 Business setup with core universal engines.' },
            { id: 'business', plan_name: 'Business Tier', price: '$79', description: '1 Business + 1 Branch with advanced engines.' },
            { id: 'enterprise', plan_name: 'Enterprise Tier', price: 'Custom', description: 'Multi-business custom setups & unlimited branches.' }
          ]);
        } else {
          setPlans(data);
        }
      } catch (err) {
        console.error('Error fetching plans:', err.message);
        // Fallback default plans incase of db error
        setPlans([
          { id: 'trial', plan_name: '7-Day Free Trial', price: '0', description: 'Full access to all 32 engines for testing.' },
          { id: 'starter', plan_name: 'Starter Tier', price: '$29', description: '1 Business setup with core universal engines.' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const handleSelectPlan = async (plan) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        router.push('/login');
        return;
      }

      // Tenant subscription mapping save kar sakte hain yahan
      // Filhaal plan select karke seedha dashboard par bhej rahe hain
      localStorage.setItem('selected_tier', JSON.stringify(plan));
      router.push('/dashboard');

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">Choose Your Subscription Tier</h1>
        <p className="text-slate-400 text-sm md:text-base">Select the perfect tier to unlock the power of SJ 32Core ERP Universal Engines for your business.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs mb-8 max-w-md w-full text-center">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm animate-pulse">Loading available subscription tiers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-indigo-500 transition-all"
            >
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{plan.plan_name}</h3>
                <div className="text-3xl font-black text-indigo-400 mb-4">
                  {plan.price === '0' ? 'Free' : plan.price}
                  <span className="text-xs font-normal text-slate-400 ml-1">/month</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                  {plan.description || 'Full enterprise access with multi-currency and inventory support.'}
                </p>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSelectPlan(plan)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-xs uppercase tracking-wider"
              >
                {submitting ? 'Processing...' : 'Select Plan & Proceed'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
      }

