// Server-side admin helpers
import { supabaseServer } from './supabaseServerClient';

export async function isSuperAdminByEmail(email: string | null) {
  if (!email) return false;
  // Try common roles table names
  const tables = ['user_roles', 'roles', 'admin_roles'];
  for (const t of tables) {
    try {
      const { data, error } = await supabaseServer
        .from(t)
        .select('role,email')
        .or(`email.eq.${email},user_email.eq.${email}`)
        .limit(1);

      if (error) continue;
      if (data && data.length > 0) {
        const row = data[0] as any;
        const role = (row.role || row.roles || row.name || '').toLowerCase();
        if (role === 'super_admin' || role === 'superadmin' || role === 'admin') return true;
      }
    } catch (e) {
      // ignore and continue
    }
  }

  // Fallback: check a 'admins' table
  try {
    const { data, error } = await supabaseServer.from('admins').select('email').eq('email', email).limit(1);
    if (!error && data && data.length > 0) return true;
  } catch (e) {}

  return false;
}
