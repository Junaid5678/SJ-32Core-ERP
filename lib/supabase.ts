// Browser client (public) and server helper export suggestions
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true },
});

// Server-only helper for privileged queries (use only on server; never expose service_role key to browser)
export function createServerSupabaseClientForAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in environment for server admin client.');
  }
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    // Note: service role client should be used only server-side
    auth: { persistSession: false },
  });
}
