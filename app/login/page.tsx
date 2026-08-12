'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const SUPER_ADMIN_EMAILS = ['ja024478@gmail.com'];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // When using auth-helpers, cookies will be set by the library on successful sign-in.
    // Choose destination based on role
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
    router.push(isSuperAdmin ? '/dashboard/admin' : '/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input name="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full mb-2 p-2 border rounded" />
        <input name="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" className="w-full mb-2 p-2 border rounded" />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded">Sign in</button>
        {errorMsg && <p className="mt-2 text-red-600">{errorMsg}</p>}
      </form>
    </div>
  );
}
