// Tenant helpers: keep tenant_email checking centralized.
// TODO: Replace getUserEmailFromSession with your auth helper (Supabase auth, NextAuth, or custom).
import { supabase } from './supabaseClient';

export async function getUserEmailFromSession() {
  // Example for browser session; in server components you may use cookies or supabase-auth-helpers
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.email ?? null;
  } catch (e) {
    // In server environments or when auth is not available, return null
    return null;
  }
}

export async function requireTenantEmailOrThrow() {
  const email = await getUserEmailFromSession();
  if (!email) throw new Error('Not authenticated');
  return email;
}

export function tenantFilter(query: any, tenantEmail: string) {
  // query is supabase client table ref
  return query.eq('tenant_email', tenantEmail);
}
