"use client";

import React, { useState } from 'react';
import { supabase } from '../../src/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // In a real flow, create tenant record and associate owner; here we redirect to subscription
      router.push('/subscription');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-xl font-semibold">Create your company account</h1>
          <form onSubmit={handleSignup} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm text-slate-600">Company name</label>
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center justify-between">
              <button disabled={loading} className="px-4 py-2 bg-emerald-500 text-white rounded">{loading ? 'Creating...' : 'Create company'}</button>
              <a href="/login" className="text-sm text-indigo-600">Already have an account?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
