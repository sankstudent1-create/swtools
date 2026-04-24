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
      
      {/* Sidebar - Consistent with Dashboard */}
      <aside className="w-72 bg-[#07090f] border-r border-white/5 p-8 hidden lg:flex flex-col fixed h-full">
        <Link href="/dashboard" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <img src="/icon-192.png" alt="Logo" className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl">SW<span className="text-white/40">Tools</span></span>
        </Link>
        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/dashboard/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Wallet className="w-5 h-5" /> Wallet
          </Link>
          <Link href="/dashboard/files" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all">
            <FileText className="w-5 h-5" /> My Files
          </Link>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-72 p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black mb-2 tracking-tight">Credit <span className="text-blue-500">Wallet</span></h1>
              <p className="text-white/40">Top up your account to access premium AI features and downloads.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 text-center">
              <div className="text-3xl font-black text-blue-400">{profile?.credits || 0}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1 font-bold">Available Credits</div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {packages.map((pkg: any, i: number) => (
              <div key={i} className="group relative rounded-3xl p-8 bg-white/[0.03] border border-white/10 hover:border-blue-500/50 transition-all hover:translate-y-[-4px]">
                <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Package {i+1}</div>
                <div className="text-5xl font-black mb-2 tracking-tighter">{pkg.credits} <span className="text-lg text-white/30">CR</span></div>
                <div className="text-xl font-bold text-white/60 mb-8">₹{pkg.price}</div>
                <button 
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-black font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(59,130,246,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Purchase Now'}
                </button>
              </div>
            ))}
          </div>

          <section className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <History className="w-6 h-6 text-blue-500" /> Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {history.length > 0 ? history.map((log, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <div className="font-bold text-white/80 capitalize">{log.tool_id.replace(/-/g, ' ')}</div>
                      <div className="text-xs text-white/30">{new Date(log.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-rose-400 font-mono font-bold">-{log.credits_spent} CR</div>
                </div>
              )) : (
                <div className="p-12 text-center text-white/20 italic">No recent activity found.</div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
