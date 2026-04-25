"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User, Wallet, History, CreditCard, ArrowUpRight, 
  ArrowDownLeft, FileText, Settings, LogOut, ShieldCheck,
  ChevronRight, Sparkles, LayoutDashboard, Search, Filter,
  ExternalLink, Download, Clock, Zap, Calculator
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [recentUsage, setRecentUsage] = useState<any[]>([]);
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      try {
        // Fetch Recent Usage Logs and Generated Files in parallel
        const [usageResult, filesResult] = await Promise.all([
          supabase
            .from('usage_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('user_files')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3)
        ]);
        
        if (usageResult.error && usageResult.error.code !== 'PGRST116') {
          console.error('Usage logs fetch error:', usageResult.error.message);
        }
        setRecentUsage(usageResult.data || []);
        
        if (filesResult.error && filesResult.error.code !== 'PGRST116') {
          console.error('User files fetch error:', filesResult.error.message);
        }
        setUserFiles(filesResult.data || []);

      } catch (err: any) {
        console.error('Dashboard load error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    if (!authLoading) {
      if (!user) {
        window.location.href = '/auth';
      } else {
        loadDashboardData();
      }
    }
  }, [user, authLoading]);

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

  if (error) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-black text-rose-400 mb-4">Dashboard Error</h2>
        <p className="text-white/60 text-sm mb-6">{error}</p>
        <div className="space-y-3">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 rounded-xl bg-rose-500 text-white font-black uppercase tracking-widest hover:bg-rose-400 transition-all"
          >
            Retry
          </button>
          <button 
            onClick={handleSignOut}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 flex">
      {/* Sidebar - Pro Design */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#07090f]/80 backdrop-blur-2xl border-r border-white/[0.05] p-8 hidden lg:flex flex-col z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <img src="/icon-192.png" alt="Logo" className="w-7 h-7" />
          </div>
          <div>
            <div className="font-black text-xl tracking-tighter">SW<span className="text-blue-500">TOOLS</span></div>
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Dashboard</div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-bold text-sm">Overview</span>
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-sm">Wallet & Billing</span>
          </Link>
          <Link href="/dashboard/files" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-sm">My Files</span>
          </Link>
          <div className="pt-8 pb-4 px-5">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Premium Tools</div>
          </div>
          <Link href="/tools/letterpad-generator" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm">Letterpad Gen</span>
          </Link>
        </nav>

        <button 
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
        >
          <Zap className="w-5 h-5 rotate-180" />
          <span className="font-bold text-sm">Sign Out</span>
        </button>
      </aside>

      <main className="flex-1 lg:ml-72 p-6 lg:p-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Welcome back, <span className="text-blue-500">{profile?.full_name?.split(' ')[0] || 'User'}</span>!</h1>
            <p className="text-white/40 font-medium">Here's what's happening with your tools today.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 pr-8 flex items-center gap-4 hover:bg-white/[0.05] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-black italic leading-none text-emerald-400">{profile?.wallet_balance || 0}</div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Credits Available</div>
              </div>
            </div>
          </div>
        </header>

        {/* Auth Debug Section (Hidden by default, visible for troubleshooting) */}
        <div className="mb-8 p-4 bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
          <details className="cursor-pointer group">
            <summary className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 group-open:mb-4">
              <ShieldCheck className="w-3 h-3" />
              Diagnostic Info (Auth State)
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-mono p-2">
              <div className="space-y-1">
                <div className="text-white/40 uppercase font-black tracking-widest border-b border-white/5 pb-1 mb-2">User Details</div>
                <div><span className="text-blue-500">ID:</span> {user?.id || 'null'}</div>
                <div><span className="text-blue-500">Email:</span> {user?.email || 'null'}</div>
                <div><span className="text-blue-500">Auth Loading:</span> {authLoading ? 'true' : 'false'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-emerald-500 uppercase font-black tracking-widest border-b border-white/5 pb-1 mb-2">Profile Details</div>
                <div><span className="text-emerald-500">ID:</span> {profile?.id || 'null'}</div>
                <div><span className="text-emerald-500">Balance:</span> {profile?.wallet_balance ?? 'null'}</div>
                <div><span className="text-emerald-500">Full Name:</span> {profile?.full_name || 'null'}</div>
              </div>
            </div>
          </details>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-blue-600 rounded-[2.5rem] p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-pointer shadow-2xl shadow-blue-600/20">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-24 h-24 fill-white" />
            </div>
            <h3 className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-4">Quick Action</h3>
            <h2 className="text-3xl font-black text-white leading-tight mb-8">Generate official<br/>Letterpad now</h2>
            <Link href="/tools/letterpad-generator" className="inline-flex items-center gap-3 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">
              Launch Tool <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.05] transition-all flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full uppercase tracking-widest">Premium</span>
            </div>
            <h3 className="text-xl font-black mb-2 italic text-white/90">GDS Leave App</h3>
            <p className="text-white/40 text-sm font-medium mb-8 leading-relaxed">Official quadruplicate format for BPM/ABPM leave requests.</p>
            <Link href="/tools/gds-leave" className="mt-auto text-sm font-black text-white hover:text-blue-400 transition-colors flex items-center gap-2 group">
              Open Tool <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.05] transition-all flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Calculator className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full uppercase tracking-widest">India Post</span>
            </div>
            <h3 className="text-xl font-black mb-2 italic text-white/90">TD Commission</h3>
            <p className="text-white/40 text-sm font-medium mb-8 leading-relaxed">Auto-calculate BPM incentive bills for TD accounts.</p>
            <Link href="/tools/td-commission" className="mt-auto text-sm font-black text-white hover:text-blue-400 transition-colors flex items-center gap-2 group">
              Open Tool <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
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
              <Link href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">View All Logs</Link>
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
