"use client";

import React, { useState } from 'react';
import { supabase } from '../../src/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Redirect based on role / tenant - placeholder: go to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-xl font-semibold">Sign in to SJ ERP</h1>
          <form onSubmit={handleLogin} className="mt-4 space-y-3">
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
              <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">{loading ? 'Signing in...' : 'Sign in'}</button>
              <a href="/signup" className="text-sm text-indigo-600">Create account</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
