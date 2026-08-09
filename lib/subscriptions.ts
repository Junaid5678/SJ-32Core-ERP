import { supabase } from './supabase';
import { supabaseServer } from './supabaseServerClient';
import { ENGINES } from './engines';

// Returns enabled engine slugs for a tenant. Prefers server-side call when available.
export async function getEnabledEnginesForTenant(tenantEmail: string | null) {
  if (!tenantEmail) return ENGINES.filter(e => e.defaultEnabled).map(e => e.slug);

  try {
    // Try to fetch tenant subscription mapping
    const { data: assignment, error: assignErr } = await supabase
      .from('tenant_subscriptions')
      .select('plan_id')
      .eq('tenant_email', tenantEmail)
      .single();

    if (assignErr || !assignment) {
      // fallback to default enabled engines
      return ENGINES.filter(e => e.defaultEnabled).map(e => e.slug);
    }

    const planId = assignment.plan_id;
    const { data: plan, error: planErr } = await supabase
      .from('subscription_plans')
      .select('enabled_engines')
      .eq('id', planId)
      .single();

    if (planErr || !plan) return ENGINES.filter(e => e.defaultEnabled).map(e => e.slug);

    const enabled = plan.enabled_engines || [];
    // ensure returned slugs are valid
    return ENGINES.filter(e => enabled.includes(e.slug)).map(e => e.slug);
  } catch (e) {
    // On any failure return defaults
    return ENGINES.filter(e => e.defaultEnabled).map(e => e.slug);
  }
}
