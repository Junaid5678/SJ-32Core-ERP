import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const q = body.q;

  const email = session.user?.email ?? '';
  const { data: quotas } = await supabase.from('public.ai_quotas').select('*').eq('tenant_email', email).limit(1);
  const quota = quotas?.[0];
  if (quota && quota.quota_limit <= (quota.quota_used || 0)) {
    return NextResponse.json({ error: 'AI quota exceeded' }, { status: 403 });
  }

  // Replace with actual AI call
  const answer = `Steve says: (placeholder answer for "${q}")`;

  if (quota) {
    await supabase.from('public.ai_quotas').update({ quota_used: (quota.quota_used || 0) + 1 }).eq('id', quota.id);
  }

  return NextResponse.json({ answer });
}
