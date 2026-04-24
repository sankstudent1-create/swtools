"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Users, Wallet, History, CreditCard, ShieldCheck, 
  Settings, LogOut, LayoutDashboard, Search, 
  BarChart3, Database, Lock, AlertTriangle, ChevronRight,
  TrendingUp, Activity, UserPlus, Zap
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    async function checkAdminAndLoadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Strict Admin Check (Replace with your actual admin email)
      if (user?.email !== 'admin@swtools.in' && user?.email !== 'sankstudent1@gmail.com') {
        window.location.href = '/dashboard';
        return;
      }

      setIsAdmin(true);

      // 1. Fetch System Config (Pricing/Costs)
      const { data: configData } = await supabase
        .from('system_config')
        .select('*');
      setConfig(configData);

      // 2. Fetch User Stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(profiles || []);

      // 3. Fetch Aggregate Stats
      const totalBalance = profiles?.reduce((sum, p) => sum + (p.wallet_balance || 0), 0);
      setStats({
        totalUsers: profiles?.length || 0,
        totalBalance: totalBalance || 0,
        activeTools: 4
      });

      setLoading(false);
    }
    checkAdminAndLoadData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/5 border-t-amber-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      {/* Sidebar - Admin Design */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-[#090705]/80 backdrop-blur-2xl border-r border-amber-500/10 p-8 hidden lg:flex flex-col z-20 shadow-[20px_0_100px_rgba(0,0,0,0.5)]">
        <Link href="/" className="flex items-center gap-3.5 mb-14 px-2 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center group-hover:border-amber-500/50 transition-all duration-500 shadow-2xl">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-2xl font-black tracking-tighter">SW<span className="text-amber-500/40 font-light">Admin</span></span>
        </Link>

        <nav className="flex-grow space-y-1.5">
          <Link href="/admin" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/5">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-bold">Admin Overview</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold">User Management</span>
          </Link>
          <Link href="/admin/transactions" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-bold">Financials</span>
          </Link>
          <Link href="/admin/config" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-bold">System Config</span>
          </Link>
        </nav>

        <div className="pt-8 border-t border-white/[0.05]">
          <Link href="/dashboard" className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-white/40 hover:text-white hover:bg-white/[0.03] transition-all mb-4">
             <LayoutDashboard className="w-5 h-5" />
             <span className="text-sm font-bold">User View</span>
          </Link>
          <button className="flex items-center gap-3.5 px-5 py-4 rounded-2xl text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full border border-transparent hover:border-rose-500/20">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Terminal Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-72 p-4 md:p-10 lg:p-16 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black tracking-tight italic uppercase">System Root</h1>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest">Admin Mode</div>
            </div>
            <p className="text-white/30 text-sm font-medium tracking-wide">Dynamic control over pricing, users, and server-side assets.</p>
          </div>
        </header>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Total Users', val: stats.totalUsers, icon: Users, color: 'text-blue-400' },
            { label: 'Circulating Credits', val: stats.totalBalance, icon: Database, color: 'text-amber-400' },
            { label: 'Active Tools', val: stats.activeTools, icon: Activity, color: 'text-emerald-400' },
            { label: 'System Health', val: '99.9%', icon: ShieldCheck, color: 'text-indigo-400' },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 group hover:bg-white/[0.05] transition-all">
                <div className={`p-3 rounded-xl bg-white/5 w-fit mb-6 ${s.color} group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-5 h-5" />
                </div>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{s.label}</p>
                <h2 className="text-3xl font-black italic">{s.val}</h2>
            </div>
          ))}
        </div>

        {/* User Management Table Section */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] overflow-hidden mb-16">
            <div className="p-8 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
                <h3 className="text-xl font-black italic uppercase tracking-tight">Registered Entities</h3>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input type="text" placeholder="Search UUID or Name..." className="bg-black border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-amber-500/50" />
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-white/20 uppercase tracking-widest bg-white/[0.01]">
                            <th className="px-8 py-5">User Profile</th>
                            <th className="px-8 py-5">Wallet Balance</th>
                            <th className="px-8 py-5">Created At</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-[10px] font-black">
                                            {u.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-white/80">{u.full_name || 'Anonymous User'}</p>
                                            <p className="text-[10px] font-mono text-white/20">{u.id.slice(0, 18)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-amber-500 font-black italic">{u.wallet_balance} CR</span>
                                </td>
                                <td className="px-8 py-6 text-xs text-white/40 font-medium italic">
                                    {new Date(u.created_at).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Active</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <button className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-amber-500 transition-colors">Edit Ledger</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Dynamic Config Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-10">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        Tool Monetization
                    </h3>
                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500/60 hover:text-amber-500 transition-all border border-amber-500/20 px-4 py-2 rounded-xl">Update Rates</button>
                </div>
                <div className="space-y-4">
                    {config?.find((c: any) => c.key === 'tool_costs')?.value && Object.entries(config.find((c: any) => c.key === 'tool_costs').value).map(([key, val]: any) => (
                        <div key={key} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white/50">{key.replace(/_/g, ' ')}</span>
                            <span className="text-lg font-black italic">{val} CR</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-10">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                        Credit Packages
                    </h3>
                    <button className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500/60 hover:text-blue-500 transition-all border border-blue-500/20 px-4 py-2 rounded-xl">Edit Bundles</button>
                </div>
                <div className="space-y-4">
                    {config?.find((c: any) => c.key === 'credit_packages')?.value && config.find((c: any) => c.key === 'credit_packages').value.map((pkg: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-white/50">{pkg.credits} CR Bundle</span>
                            </div>
                            <span className="text-lg font-black italic">₹{pkg.price}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </main>
    </div>
  );
}
