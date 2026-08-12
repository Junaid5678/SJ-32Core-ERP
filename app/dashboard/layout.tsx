// Server component (Next.js app router)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Sidebar from '../../components/Sidebar';
import AskSteve from '../../components/AskSteve';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, return children (middleware should have redirected unauthenticated users)
  if (!session) {
    return <>{children}</>;
  }

  const userEmail = session.user?.email ?? '';

  // Fetch subscription & roles (server-side). Query public schema explicitly.
  const { data: subs } = await supabase.from('public.subscriptions').select('plan,status,starts_at,ends_at').eq('tenant_email', userEmail).limit(1);
  const subscription = subs?.[0] ?? null;

  // Fetch user roles
  const { data: roles } = await supabase.from('public.user_roles').select('role_id').eq('user_email', userEmail);

  // Determine engines accessible by subscription and roles (simple mapping)
  const allowedEngines = subscription?.plan === 'enterprise' ? 'all' : 'standard';

  return (
    <div className="flex min-h-screen">
      <Sidebar allowedEngines={allowedEngines} />
      <div className="flex-1 relative">
        {children}
        <AskSteve />
      </div>
    </div>
  );
}
