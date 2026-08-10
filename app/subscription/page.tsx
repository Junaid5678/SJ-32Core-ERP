"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const router = useRouter();
  const [plan, setPlan] = useState('starter');

  function handleSelect(e: React.FormEvent) {
    e.preventDefault();
    // Persist selection to local storage for UI gating in this demo.
    try { localStorage.setItem('sj_plan', plan); } catch(e){}
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="card">
          <h1 className="text-xl font-semibold">Choose a subscription plan</h1>
          <form onSubmit={handleSelect} className="mt-4 space-y-4">
            <label className="block">
              <input type="radio" name="plan" value="starter" checked={plan==='starter'} onChange={() => setPlan('starter')} />
              <span className="ml-2">Starter — Free — 1 branch — Limited engines</span>
            </label>
            <label className="block">
              <input type="radio" name="plan" value="pro" checked={plan==='pro'} onChange={() => setPlan('pro')} />
              <span className="ml-2">Pro — $49/mo — 5 branches — Most engines</span>
            </label>
            <label className="block">
              <input type="radio" name="plan" value="enterprise" checked={plan==='enterprise'} onChange={() => setPlan('enterprise')} />
              <span className="ml-2">Enterprise — Custom — Unlimited — All engines</span>
            </label>
            <div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">Continue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
