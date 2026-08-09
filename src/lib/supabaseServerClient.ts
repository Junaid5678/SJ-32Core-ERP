import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !serviceKey) {
  console.warn('Supabase server client initialized without URL or service key. Ensure SUPABASE_SERVICE_ROLE is set in the environment.');
}

export const supabaseServer = createClient(url, serviceKey, {
  auth: { persistSession: false },
});
