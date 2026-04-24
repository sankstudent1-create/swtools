'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, CreditCard, ChevronRight, Zap, 
  History, ShieldCheck, Loader2, ArrowUpRight, LayoutDashboard, FileText
} from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

export default function WalletPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadWalletData() {
      const { data: config } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'credit_packages')
        .single();
      if (config?.value) setPackages(config.value);

      if (user) {
        const { data: usage } = await supabase
          .from('usage_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        setHistory(usage || []);
      }
    }
    loadWalletData();
  }, [user]);

  const handlePurchase = async (pkg: any) => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Create Order on Backend
      const res = await fetch('/api/payments/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: pkg.price,
          credits: pkg.credits,
          userId: user.id
        })
      });

      const order = await res.json();

      if (!order.id) throw new Error("Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "SW Tools",
        description: `Purchase ${pkg.credits} Credits`,
        order_id: order.id,
        handler: async function (response: any) {
          // 2. Verify on backend via webhook or direct call
          const verifyRes = await fetch('/api/webhooks/razorpay', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              metadata: {
                user_id: user.id,
                credits: pkg.credits
              }
            })
          });
          
          if (verifyRes.ok) {
            window.location.reload();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: { color: "#3B82F6" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      alert(`Payment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
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
          <Link href="/dashboard" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-bold text-sm">Overview</span>
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Wallet className="w-5 h-5" />
            <span className="font-bold text-sm">Wallet & Billing</span>
          </Link>
          <Link href="/dashboard/files" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <FileText className="w-5 h-5" />
            <span className="font-bold text-sm">My Files</span>
          </Link>
          <div className="pt-8 pb-4 px-5">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Premium Tools</div>
          </div>
          <Link href="/tools/letterpad-generator" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Zap className="w-5 h-5 text-purple-400" />
            <span className="font-bold text-sm">Letterpad Gen</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-72 p-6 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black mb-2 tracking-tighter">Credit <span className="text-blue-500">Wallet</span></h1>
              <p className="text-white/40 font-medium">Top up your account to access premium features.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 pr-12 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Wallet className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <div className="text-4xl font-black italic leading-none text-blue-400">{profile?.wallet_balance || 0}</div>
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Available Credits</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {packages.map((pkg: any, i: number) => (
              <div key={i} className="group relative rounded-[2.5rem] p-10 bg-white/[0.03] border border-white/10 hover:border-blue-500/50 transition-all hover:translate-y-[-8px] flex flex-col overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all"></div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Package {i+1}</div>
                <div className="text-6xl font-black mb-2 tracking-tighter italic">{pkg.credits} <span className="text-xl text-white/20 not-italic ml-[-8px]">CR</span></div>
                <div className="text-2xl font-bold text-white/60 mb-10">₹{pkg.price}</div>
                <ul className="space-y-4 mb-10 flex-1">
                  <li className="flex items-center gap-3 text-sm text-white/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Instant activation
                  </li>
                  <li className="flex items-center gap-3 text-sm text-white/50">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> No expiry date
                  </li>
                </ul>
                <button 
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading}
                  className="w-full py-5 rounded-[1.5rem] bg-blue-500 hover:bg-blue-400 text-black font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Purchase <ArrowUpRight className="w-5 h-5" /></>}
                </button>
              </div>
            ))}
          </div>

          <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-4 italic">
                <History className="w-8 h-8 text-blue-500" /> Transaction History
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {history.length > 0 ? history.map((log, i) => (
                <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
                      <Zap className="w-6 h-6 text-white/40" />
                    </div>
                    <div>
                      <div className="font-black text-xl text-white/80 capitalize tracking-tight">{log.tool_id.replace(/-/g, ' ')}</div>
                      <div className="text-xs text-white/30 font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="text-rose-500 font-black text-xl italic">-{log.credits_spent} CR</div>
                </div>
              )) : (
                <div className="p-24 text-center">
                  <History className="w-16 h-16 text-white/5 mx-auto mb-6" />
                  <p className="text-white/20 italic font-medium text-lg">Your transaction history will appear here.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
