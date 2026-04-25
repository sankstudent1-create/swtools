'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Wallet, ShieldCheck, ArrowLeft, Loader2, CreditCard } from 'lucide-react'

declare global {
  interface Window {
    Razorpay?: any
  }
}

const PRICING_PLANS = [
  { amount: 99, credits: 100, tag: 'Starter' },
  { amount: 199, credits: 250, tag: 'Best Value', popular: true },
  { amount: 499, credits: 700, tag: 'Pro' },
]

export default function TopupPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const [amount, setAmount] = useState<number>(199)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Verify Razorpay script is available
  useEffect(() => {
    const checkScript = setInterval(() => {
      if (window.Razorpay) {
        setScriptLoaded(true)
        clearInterval(checkScript)
      }
    }, 500)
    return () => clearInterval(checkScript)
  }, [])

  const startTopup = async () => {
    setBusy(true)
    setError(null)

    try {
      // Ensure session exists (creates cookies)
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }

      const res = await fetch('/api/wallet/topup/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_inr: amount }),
      })

      if (res.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        setError(j?.error || 'Failed to create order')
        return
      }

      const j = await res.json()

      if (!window.Razorpay) {
        setError('Razorpay checkout script not loaded')
        return
      }

      const options = {
        key: j.key_id,
        amount: j.amount_paise,
        currency: j.currency,
        order_id: j.order_id,
        name: 'SW Tools',
        description: 'Wallet Topup',
        handler: () => {
          // Final crediting happens by webhook. Just bring user back.
          window.location.href = '/dashboard'
        },
        theme: { color: '#10b981' },
      }

      const rz = new window.Razorpay(options)
      rz.open()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Topup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Payment
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Top Up Your Wallet
          </h1>
          <p className="text-white/40 mt-2">Choose a plan or enter a custom amount to add credits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {PRICING_PLANS.map((plan) => (
            <button
              key={plan.amount}
              onClick={() => setAmount(plan.amount)}
              className={`relative ui-modal-shell p-6 text-left transition-all duration-300 group ${
                amount === plan.amount 
                  ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/50' 
                  : 'hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">
                  Most Popular
                </div>
              )}
              <div className="text-xs font-bold text-white/40 uppercase mb-1">{plan.tag}</div>
              <div className="text-2xl font-bold mb-1">₹{plan.amount}</div>
              <div className="text-sm text-white/60">{plan.credits} Credits</div>
            </button>
          ))}
        </div>

        <div className="ui-modal-shell p-8 max-w-xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Custom Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">₹</span>
                <input
                  className="ui-input pl-8 text-lg font-mono"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                />
              </div>
              <p className="mt-2 text-[11px] text-white/30 italic italic">Approx. {amount * 1.25} credits will be added</p>
            </div>

            {error ? (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </div>
            ) : null}

            <button 
              className="ui-btn-primary w-full py-4 text-base flex items-center justify-center gap-2 relative overflow-hidden group shadow-xl shadow-blue-500/10 disabled:opacity-50" 
              onClick={startTopup} 
              disabled={busy || amount <= 0 || !scriptLoaded}
            >
              {busy ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Initializing Secure Checkout...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Pay ₹{amount} with Razorpay
                </>
              )}
            </button>

            <div className="flex flex-col gap-3 items-center text-center">
              <p className="text-[10px] text-white/30 leading-relaxed max-w-xs">
                Payments are processed securely via Razorpay. Credits are added instantly after verification.
              </p>
              <div className="flex items-center gap-4 grayscale opacity-40">
                {/* Placeholder for payment icons */}
                <div className="h-4 w-12 bg-white/10 rounded" />
                <div className="h-4 w-12 bg-white/10 rounded" />
                <div className="h-4 w-12 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
