"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User, Wallet, History, CreditCard, ArrowUpRight, 
  ArrowDownLeft, FileText, Settings, LogOut, ShieldCheck,
  ChevronRight, Sparkles, LayoutDashboard, Search, Filter,
  ExternalLink, Download, Clock, Zap
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentUsage, setRecentUsage] = useState<any[]>([]);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // 1. Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);

        // 2. Fetch Recent Usage Logs
        const { data: usage } = await supabase
          .from('usage_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentUsage(usage || []);

        // 3. Fetch Generated Files
        const { data: files } = await supabase
          .from('user_files')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
        setUserFiles(files || []);
      }
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/icon-192.png" alt="Loading" className="w-4 h-4 opacity-50" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      {/* Dynamic Glow Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/10 blur-[100px] mix-blend-screen animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar - Pro Design */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#07090f]/80 backdrop-blur-2xl border-r border-white/[0.05] p-8 hidden lg:flex flex-col z-20">
        <Link href="/" className="flex items-center gap-3.5 mb-14 px-2 group">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
            <img src="/icon-192.png" alt="SWTools" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tighter">SW<span className="text-white/40 font-light">Tools</span></span>
        </Link>

        <nav className="flex-grow space-y-1.5">
          <Link href="/dashboard" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-bold">Overview</span>
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-bold">Wallet & Top-up</span>
          </Link>
          <Link href="/dashboard/files" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-bold">My Documents</span>
          </Link>
          <Link href="/dashboard/history" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
            <History className="w-5 h-5" />
            <span className="text-sm font-bold">Billing History</span>
          </Link>
        </nav>

        <div className="pt-8 border-t border-white/[0.05] space-y-6">
          <div className="px-4 py-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05]">
             <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Support ID</p>
                    <p className="text-[11px] font-bold text-white/60">#SW-{profile?.id?.slice(0, 6)}</p>
                </div>
             </div>
             <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Get Help</button>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 p-4 md:p-10 lg:p-16 relative z-10">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight italic">Control Center</h1>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">Live</div>
            </div>
            <p className="text-white/30 text-sm font-medium tracking-wide">Manage your assets, track tool usage, and monitor transactions.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.08]">
             <Link href="/dashboard/wallet" className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 transition-all shadow-2xl">
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-black tracking-tight">{profile?.wallet_balance || 0} <span className="text-[10px] opacity-40 uppercase ml-0.5">Credits</span></span>
             </Link>
             <Link href="/dashboard" className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center hover:bg-white/[0.1] transition-all">
                <User className="w-5 h-5 text-white/50" />
             </Link>
          </div>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {/* Credit Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-blue-500/20 group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <CreditCard className="w-24 h-24" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Balance</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-6xl font-black italic tracking-tighter">{profile?.wallet_balance || 0}</h2>
                        <span className="text-white/40 text-sm font-black uppercase tracking-widest">Credits</span>
                    </div>
                </div>
                <Link href="/dashboard/wallet" className="mt-12 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-center hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                    Refill Wallet <ArrowUpRight className="w-4 h-4" />
                </Link>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700">
                <Sparkles className="w-64 h-64" />
            </div>
            <div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Usage Overview</p>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white/60">Documents Generated</span>
                        <span className="text-xl font-black italic">{userFiles.length}</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white/60">AI Tokens Used</span>
                        <span className="text-xl font-black italic">840K</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                    </div>
                </div>
            </div>
          </div>

          {/* Pro Badge Card */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
             <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center shadow-2xl mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-10 h-10 text-white" />
             </div>
             <h3 className="text-2xl font-black italic mb-2 tracking-tight">Enterprise Access</h3>
             <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest mb-8">Verified Premium User</p>
             <button className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 hover:text-blue-300 transition-colors border-b border-blue-500/20 pb-1">Account Details</button>
          </div>
        </div>

        {/* Data Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          {/* Recent Usage Logs */}
          <section>
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-xl font-black italic flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Usage
              </h3>
              <Link href="/dashboard/history" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">View All Logs</Link>
            </div>
            <div className="space-y-3">
              {recentUsage.length > 0 ? recentUsage.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-5 rounded-[1.8rem] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/30 group-hover:text-blue-400 group-hover:border-blue-500/20 transition-all shadow-inner">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-[13px] tracking-tight">{log.tool_id.toUpperCase().replace(/-/g, ' ')}</h4>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">
                        {new Date(log.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-400 font-black text-sm italic">-{log.credits_spent} CR</span>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center rounded-[2rem] bg-white/[0.01] border border-dashed border-white/5">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">No recent usage found</p>
                </div>
              )}
            </div>
          </section>

          {/* User Files Section */}
          <section>
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-xl font-black italic flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500" />
                Latest Assets
              </h3>
              <Link href="/dashboard/files" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Storage Manager</Link>
            </div>
            <div className="space-y-3">
              {userFiles.length > 0 ? userFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-5 rounded-[1.8rem] bg-white/[0.02] border border-white/[0.05] group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all">
                  <div className="flex items-center gap-5 overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/30 group-hover:text-indigo-400 group-hover:border-indigo-500/20 transition-all shadow-inner shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-black text-[13px] tracking-tight truncate pr-4">{file.file_name}</h4>
                      <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5 italic">{file.tool_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center rounded-[2rem] bg-white/[0.01] border border-dashed border-white/5">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">No generated files yet</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
