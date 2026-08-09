import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isSuperAdminByEmail } from '@/lib/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !isSuperAdminByEmail(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
export async function POST(request) {
  try {
    const body = await request.json();
    const { adminEmail, name, price, ai_tokens, enabled_engines } = body;
    if (!adminEmail) return NextResponse.json({ error: 'adminEmail required' }, { status: 400 });

    const ok = await isSuperAdminByEmail(adminEmail);
    if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { data, error } = await supabaseServer.from('subscription_plans').insert([{ name, price, ai_tokens, enabled_engines }]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { adminEmail, id, ...rest } = body;
    if (!adminEmail) return NextResponse.json({ error: 'adminEmail required' }, { status: 400 });
    const ok = await isSuperAdminByEmail(adminEmail);
    if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabaseServer.from('subscription_plans').update(rest).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { adminEmail, id } = body;
    if (!adminEmail) return NextResponse.json({ error: 'adminEmail required' }, { status: 400 });
    const ok = await isSuperAdminByEmail(adminEmail);
    if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabaseServer.from('subscription_plans').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
