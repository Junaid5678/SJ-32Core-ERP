"use client";

import React, { useEffect, useState } from 'react';
import EngineShell from '../_engineShell';
import { supabase } from '../../src/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // verify session; if not present, redirect to /login
    async function check() {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) {
          router.push('/login');
          return;
        }
        if (mounted) setLoading(false);
      } catch (e) {
        router.push('/login');
      }
    }
    check();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.push('/login');
    });

    return () => {
      mounted = false;
      try { listener?.subscription.unsubscribe(); } catch (e) {}
    };
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;

  return <EngineShell>{children}</EngineShell>;
}
