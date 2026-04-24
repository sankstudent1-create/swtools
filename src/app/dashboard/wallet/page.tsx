"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Wallet, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  History
} from 'lucide-react';

export default function WalletPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState<number>(49);
  const [creditPackages, setCreditPackages] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);

        // Fetch Dynamic Packages from System Config
        const { data: config } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'credit_packages')
          .single();
        
        if (config?.value) {
          setCreditPackages(config.value);
          // Set initial topup amount to the first package's price
          if (config.value.length > 0) {
            setTopupAmount(config.value[0].price);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Back to Dashboard */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-10 transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Wallet Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Wallet className="w-24 h-24" />
              </div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Available Balance</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-5xl font-black italic">{profile?.wallet_balance || 0}</h2>
                <span className="text-white/40 text-sm font-bold tracking-widest">CR</span>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">Secure Transactions</span>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold">Instant Top-up</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-6">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-white/40" />
                    Quick History
                </h3>
                <div className="space-y-3">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-widest text-center py-10 border border-dashed border-white/5 rounded-2xl">
                        No transactions yet
                    </div>
                </div>
            </div>
          </div>

          {/* Right: Top-up Options */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 sm:p-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Top-up Wallet</h2>
              <p className="text-white/40 text-sm mb-10">Choose a credit package to boost your workflow efficiency.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {creditPackages.map((pkg) => (
                  <button
                    key={pkg.price}
                    onClick={() => setTopupAmount(pkg.price)}
                    className={`relative p-6 rounded-[2rem] border transition-all text-left group ${
                      topupAmount === pkg.price 
                        ? 'bg-white border-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.1)]' 
                        : 'bg-white/[0.03] border-white/[0.08] text-white hover:bg-white/[0.05] hover:border-white/[0.15]'
                    }`}
                  >
                    {pkg.popular && (
                        <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                            Most Popular
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            topupAmount === pkg.price ? 'bg-black border-black' : 'border-white/20'
                        }`}>
                            {topupAmount === pkg.price && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-2xl font-black italic leading-none">{pkg.credits} CR</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${topupAmount === pkg.price ? 'text-black/50' : 'text-white/30'}`}>
                            {pkg.bonus > 0 ? `Incl. ${pkg.bonus} Bonus` : 'Standard Package'}
                        </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-current/10 flex items-baseline gap-1">
                        <span className="text-sm font-bold opacity-60">₹</span>
                        <span className="text-xl font-black leading-none">{pkg.price}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Summary</p>
                      <h4 className="text-lg font-bold">Total: ₹{topupAmount} for {creditPackages.find(p => p.price === topupAmount)?.credits} Credits</h4>
                  </div>
                  <button className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/10 group">
                    Pay via Razorpay
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale filter invert">
                  <img src="https://cdn.brandfetch.io/idcE0OdG8i/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1667569122597" alt="Razorpay" className="h-4 object-contain" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/100px-UPI-Logo-vector.svg.png" alt="UPI" className="h-3 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
