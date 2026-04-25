'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Settings, Save, ArrowLeft, Loader2, Cpu, Globe, Zap, ShieldCheck } from 'lucide-react'

export default function AdminSettingsPage() {
  const [creditsPerInr, setCreditsPerInr] = useState<number>(1)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings/credits-per-inr', { method: 'GET' })
        const j = await res.json().catch(() => null)

        if (res.ok) {
          const v = Number(j?.credits_per_inr)
          if (Number.isFinite(v) && v > 0) setCreditsPerInr(v)
        } else {
          setMsg({ text: j?.error || 'Failed to load current settings', type: 'error' })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const save = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/settings/credits-per-inr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits_per_inr: creditsPerInr }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) {
        setMsg({ text: j?.error || 'Failed to save', type: 'error' })
        return
      }
      setMsg({ text: 'Global configuration synchronized successfully', type: 'success' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              <Cpu className="w-3 h-3" />
              Core Engine
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <Globe className="w-3 h-3" />
              Global Scope
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white">
            System <span className="text-purple-400 italic">Settings</span>
          </h1>
          <p className="text-white/40 mt-2 text-lg leading-relaxed">Adjust the fundamental parameters of the SW Tools ecosystem.</p>
        </div>

        <div className="ui-modal-shell p-10 bg-white/[0.01] backdrop-blur-xl border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center animate-pulse">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
              <div className="text-white/20 font-bold uppercase tracking-widest text-xs">Accessing System Registry...</div>
            </div>
          ) : (
            <div className="space-y-12 relative z-10">
              {/* Parameter Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white uppercase tracking-widest">Credit Multiplier</label>
                      <div className="text-[10px] text-white/30 font-medium">Conversion Rate: INR to CREDITS</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-black text-white">{creditsPerInr}x</div>
                    <div className="text-[10px] text-white/20 font-bold uppercase">Multiplier</div>
                  </div>
                </div>

                <div className="relative group">
                  <input 
                    className="ui-input text-3xl font-mono py-8 pl-10 bg-white/[0.02] border-white/5 transition-all group-hover:border-white/10 focus:border-purple-500/50 rounded-3xl" 
                    type="number" 
                    min={1} 
                    value={creditsPerInr} 
                    onChange={(e: any) => setCreditsPerInr(Number(e.target.value))} 
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Credits / ₹</div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <div className="flex gap-4">
                    <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-400/70 leading-relaxed">
                      This value defines how many credits a user receives for every <span className="text-white font-bold">₹1 INR</span> spent. 
                      Example: At <span className="text-white font-mono">{creditsPerInr}x</span>, a ₹100 payment grants <span className="text-white font-mono font-bold">{(100 * creditsPerInr).toLocaleString()}</span> credits.
                    </p>
                  </div>
                </div>
              </div>

              {msg && (
                <div className={`p-6 rounded-3xl border flex items-center gap-4 text-sm font-medium animate-in zoom-in-95 ${
                  msg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${msg.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                  {msg.text}
                </div>
              )}

              <button 
                className="ui-btn-primary w-full py-6 text-lg font-bold flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl shadow-purple-500/20 rounded-3xl hover:scale-[1.01] active:scale-100 transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-none" 
                onClick={save} 
                disabled={busy || creditsPerInr <= 0}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Synchronizing Registry...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Save System Config
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
