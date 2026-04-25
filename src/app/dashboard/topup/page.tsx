'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { ShieldCheck, ArrowLeft, Loader2, QrCode, Copy, Send, CheckCircle2 } from 'lucide-react'

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

  const [creditsPerInr, setCreditsPerInr] = useState<number>(1)
  const [utr, setUtr] = useState('')
  const [submitBusy, setSubmitBusy] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadRate() {
      try {
        const res = await fetch('/api/wallet/topup/rate', { method: 'GET' })
        const j = await res.json().catch(() => null)
        if (!cancelled && res.ok) {
          const v = Number(j?.credits_per_inr)
          if (Number.isFinite(v) && v > 0) setCreditsPerInr(v)
        }
      } catch {
        // ignore
      }
    }
    loadRate()
    return () => {
      cancelled = true
    }
  }, [])

  const UPI_ID = 'swinfosystems@nyes'

  const upiLink = useMemo(() => {
    const am = Number.isFinite(amount) && amount > 0 ? amount.toFixed(2) : '0.00'
    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: 'SW Info Systems',
      am,
      cu: 'INR',
      tn: 'SW Tools Wallet Topup',
    })
    return `upi://pay?${params.toString()}`
  }, [amount])

  const qrUrl = useMemo(() => {
    const data = encodeURIComponent(upiLink)
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`
  }, [upiLink])

  const submitUtr = async () => {
    setSubmitBusy(true)
    setError(null)
    setSubmitMsg(null)
    try {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }

      const res = await fetch('/api/wallet/topup/manual-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount_inr: amount, utr: utr.trim() }),
      })

      if (res.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/dashboard/topup')}`
        return
      }

      const j = await res.json().catch(() => null)
      if (!res.ok) {
        setError(j?.error || 'Failed to submit request')
        return
      }

      setSubmitMsg('Submitted. We will verify and approve your topup manually.')
      setUtr('')
    } finally {
      setSubmitBusy(false)
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
            Manual Verification
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Top Up Your Wallet
          </h1>
          <p className="text-white/40 mt-2">Pay via UPI, then submit UTR for manual approval</p>
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
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Pay to UPI</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="font-mono text-sm text-white/80 break-all">{UPI_ID}</div>
                <button
                  type="button"
                  className="ui-btn-secondary px-3 py-2 text-xs inline-flex items-center gap-2"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(UPI_ID)
                      setSubmitMsg('UPI ID copied')
                    } catch {
                      setSubmitMsg('Copy failed')
                    }
                  }}
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Custom Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">₹</span>
                <input
                  className="ui-input pl-8 text-lg font-mono"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e: any) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                />
              </div>
              <p className="mt-2 text-[11px] text-white/30 italic italic">Approx. {amount * creditsPerInr} credits will be added</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-white/60" />
                  Dynamic QR
                </div>
                <a
                  className="text-xs text-blue-400 hover:text-blue-300"
                  href={upiLink}
                >
                  Open in UPI app
                </a>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <img src={qrUrl} alt="UPI QR" className="rounded-xl border border-white/10" />
              </div>
              <div className="mt-3 text-[11px] text-white/30 break-all">
                UPI link: <span className="font-mono text-white/50">{upiLink}</span>
              </div>
            </div>

            {error ? (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </div>
            ) : null}

            {submitMsg ? (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {submitMsg}
              </div>
            ) : null}

            <div className="mt-2 p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="text-sm font-semibold text-white">Submit UTR for approval</div>
              <div className="text-xs text-white/50 leading-relaxed">
                After you pay, copy the UTR/Transaction reference from your UPI app and submit below. We will verify manually and then approve your wallet topup.
              </div>
              <input
                className="ui-input font-mono"
                value={utr}
                onChange={(e: any) => setUtr(String(e.target.value))}
                placeholder="Enter UTR / Transaction Reference"
              />
              <button
                className="ui-btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={submitBusy || busy || !utr.trim() || amount <= 0}
                onClick={submitUtr}
              >
                {submitBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit UTR
                  </>
                )}
              </button>
              <div className="text-[11px] text-white/30">
                Current conversion rate: <span className="font-mono text-white/50">{creditsPerInr}</span> credits per ₹1
              </div>
            </div>

            <div className="flex flex-col gap-3 items-center text-center">
              <p className="text-[10px] text-white/30 leading-relaxed max-w-xs">
                Payments are made via UPI. Credits are added after manual verification and approval.
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
