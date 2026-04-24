"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  User, Wallet, History, CreditCard, ArrowUpRight, 
  ArrowDownLeft, FileText, Settings, LogOut, ShieldCheck,
  ChevronRight, Sparkles, LayoutDashboard
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/[0.02] border-r border-white/[0.05] p-6 hidden lg:flex flex-col">
        <Link href="/" className="flex items-center gap-3 mb-12 px-2">
          <img src="/icon-192.png" alt="SWTools" className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tighter">SW<span className="text-white/40">Tools</span></span>
        </Link>

        <nav className="flex-grow space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] text-white border border-white/[0.05]">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Overview</span>
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.03] transition-all">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium">Wallet</span>
          </Link>
          <Link href="/dashboard/history" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.03] transition-all">
            <History className="w-5 h-5" />
            <span className="text-sm font-medium">History</span>
          </Link>
          <Link href="/dashboard/files" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.03] transition-all">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">My Files</span>
          </Link>
        </nav>

        <div className="pt-6 border-t border-white/[0.05]">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-black">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}</p>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/dashboard/wallet" className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Wallet className="w-4 h-4" />
                <span className="font-bold">{profile?.wallet_balance || 0} CR</span>
             </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <CreditCard className="w-12 h-12" />
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-2">Total Credits</p>
            <h2 className="text-4xl font-black italic">{profile?.wallet_balance || 0}</h2>
            <button className="mt-6 text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 group">
              Top up now <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-12 h-12" />
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-2">Tools Used</p>
            <h2 className="text-4xl font-black italic">12</h2>
            <p className="mt-6 text-xs text-white/20 font-medium italic">3 new tools added this week</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-2">Account Status</p>
            <h2 className="text-4xl font-black italic text-blue-400">PRO</h2>
            <p className="mt-6 text-xs text-white/20 font-medium italic">Verified User</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <button className="text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">View All History</button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Letterpad Generated</h4>
                    <p className="text-xs text-white/30 mt-0.5 italic">24 April 2026 • 07:45 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-rose-400 font-black text-sm">-5 CR</span>
                  <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
