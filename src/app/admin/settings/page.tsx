'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Settings, Save, ArrowLeft, Loader2, Cpu, Globe, Zap, ShieldCheck, CreditCard } from 'lucide-react'

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    method: 'manual',
    razorpay_enabled: false,
    manual_enabled: true,
    upi_id: '',
    credits_per_inr: 1
  })
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/payment-config', { method: 'GET' })
        const j = await res.json().catch(() => null)

        if (res.ok) {
          setConfig(j)
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
      const res = await fetch('/api/admin/payment-config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
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
      <div className="mx-auto max-w-4xl">
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
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            System <span className="text-purple-400">Settings</span>
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
              {/* Payment Method Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-3xl border transition-all ${config.manual_enabled ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.manual_enabled ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-white/20'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold uppercase tracking-widest">Manual UPI</div>
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-tighter">QR & Proof Flow</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, manual_enabled: !prev.manual_enabled }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${config.manual_enabled ? 'bg-blue-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.manual_enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border transition-all ${config.razorpay_enabled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/[0.02] border-white/5 opacity-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.razorpay_enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/20'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold uppercase tracking-widest">Razorpay</div>
                        <div className="text-[10px] text-white/30 font-black uppercase tracking-tighter">Instant Auto-Credits</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setConfig(prev => ({ ...prev, razorpay_enabled: !prev.razorpay_enabled }))}
                      className={`w-12 h-6 rounded-full transition-all relative ${config.razorpay_enabled ? 'bg-emerald-500' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.razorpay_enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* UPI Config */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-bold text-white uppercase tracking-widest">Admin UPI ID</label>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="relative group">
                  <input 
                    className="ui-input text-2xl font-mono py-6 pl-8 bg-white/[0.02] border-white/5 transition-all group-hover:border-white/10 focus:border-purple-500/50 rounded-2xl" 
                    type="text"
                    value={config.upi_id}
                    onChange={(e: any) => setConfig(prev => ({ ...prev, upi_id: e.target.value }))} 
                    placeholder="example@upi"
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-white/10 uppercase tracking-[0.2em]">UPI Endpoint</div>
                </div>
              </div>

              {/* Credit Multiplier */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-bold text-white uppercase tracking-widest">Credit Multiplier</label>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <div className="relative group">
                  <input 
                    className="ui-input text-3xl font-mono py-8 pl-10 bg-white/[0.02] border-white/5 transition-all group-hover:border-white/10 focus:border-purple-500/50 rounded-[2rem]" 
                    type="number" 
                    min={1} 
                    value={config.credits_per_inr} 
                    onChange={(e: any) => setConfig(prev => ({ ...prev, credits_per_inr: Number(e.target.value) }))} 
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                    <div className="w-px h-10 bg-white/10" />
                    <div className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">Credits / ₹1</div>
                  </div>
                </div>

                <div className="p-6 rounded-[2rem] bg-purple-500/5 border border-purple-500/10">
                  <div className="flex gap-4">
                    <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <p className="text-sm text-purple-400/70 leading-relaxed">
                      At <span className="text-white font-mono font-black italic">{config.credits_per_inr}x</span> multiplier, a ₹100 payment grants <span className="text-white font-mono font-bold">{(100 * config.credits_per_inr).toLocaleString()}</span> credits.
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
                className="ui-btn-primary w-full py-6 text-lg font-bold flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl shadow-purple-500/20 rounded-[2rem] hover:scale-[1.01] active:scale-100 transition-all bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-none uppercase tracking-widest font-black" 
                onClick={save} 
                disabled={busy || config.credits_per_inr <= 0}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Updating Core Config...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Deploy Changes
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
