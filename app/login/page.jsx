'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // ya '../../lib/supabase' project structure ke mutabiq

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState('owner'); // 'owner' ya 'staff'
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login & Signup for Owner

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [staffId, setStaffId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Owner Login / Signup
  const handleOwnerAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // 1. Sign Up Owner
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        // Check if Super Admin email
        const role = email === 'ja024477@gmail.com' ? 'super_admin' : 'company_owner';

        // 2. Create Tenant & Profile entry can be handled or redirected to subscription
        if (role === 'super_admin') {
          router.push('/dashboard');
        } else {
          router.push('/subscription'); // Naya owner subscription page par jayega
        }
      } else {
        // Login Owner
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Check role or redirect to dashboard
        if (email === 'ja024477@gmail.com') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Staff ID Login
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Profiles table mein human_readable_id se user ko dhoondna
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('human_readable_id', staffId.trim())
        .single();

      if (error || !profile) {
        throw new Error('Invalid Staff ID or Staff member not found.');
      }

      // Note: Staff password verification custom logic ya Supabase auth link ke zariye hogi
      // Filhaal hum profile verify karke dashboard par bhej rahe hain
      localStorage.setItem('current_staff', JSON.stringify(profile));
      router.push('/dashboard');

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">SJ 32Core ERP</h1>
          <p className="text-slate-400 text-sm mt-1">Universal Enterprise Operating System</p>
        </div>

        {/* Tab Switcher: Owner vs Staff */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => { setLoginType('owner'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginType === 'owner' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Company Owner / Admin
          </button>
          <button
            type="button"
            onClick={() => { setLoginType('staff'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              loginType === 'staff' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Staff / Employee ID
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs mb-4">
            {errorMsg}
          </div>
        )}

        {/* OWNER / ADMIN LOGIN & SIGNUP FORM */}
        {loginType === 'owner' ? (
          <form onSubmit={handleOwnerAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., SJ Craft Resin Art"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Company Account' : 'Login to Dashboard'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-indigo-400 hover:underline"
              >
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        ) : (
          /* STAFF ID LOGIN FORM */
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Staff ID</label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g., SJC-LHR01-CASH-001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Enter the unique staff ID provided by your company owner.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-sm"
            >
              {loading ? 'Verifying ID...' : 'Staff Login'}
            </button>
          </form>
        )}

      </div>
    </main>
  );
                }
