export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-enterprise-dark">
      <div className="max-w-md w-full bg-enterprise-card p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
        <h1 className="text-3xl font-extrabold text-white mb-2">SJ 32Core ERP</h1>
        <p className="text-slate-400 mb-6 text-sm">Enterprise OS with Steve AI Integration</p>
        
        <div className="space-y-4">
          <a 
            href="/dashboard" 
            className="block w-full py-3 px-4 bg-enterprise-accent hover:bg-blue-600 text-white font-semibold rounded-xl transition duration-200"
          >
            Owner & Staff Login
          </a>
          <div className="text-xs text-slate-500 mt-4">
            Secured with 7-Tier RBAC & Supabase RLS
          </div>
        </div>
      </div>
    </main>
  );
}
