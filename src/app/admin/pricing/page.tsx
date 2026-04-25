'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Tag, Save, ArrowLeft, Loader2, Power, Zap, ShieldCheck } from 'lucide-react'

export default function AdminPricingPage() {
  const [credits, setCredits] = useState<number>(10)
  const [active, setActive] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/pricing/td-commission', { method: 'GET' })
        const j = await res.json().catch(() => null)

        if (res.ok) {
          const c = Number(j?.download_credits)
          if (Number.isFinite(c) && c > 0) setCredits(c)
          setActive(Boolean(j?.is_active))
        } else {
          setMsg({ text: j?.error || 'Failed to load current pricing', type: 'error' })
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
      const res = await fetch('/api/admin/pricing/td-commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ download_credits: credits, is_active: active }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) {
        setMsg({ text: j?.error || 'Failed to save', type: 'error' })
        return
      }
      setMsg({ text: 'Tool pricing updated successfully', type: 'success' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-all group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Zap className="w-3 h-3" />
              Dynamic Pricing
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Live Config
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Tool <span className="text-blue-400 italic">Pricing</span>
          </h1>
          <p className="text-white/40 mt-2 text-lg">Control usage costs and availability for every tool in the suite.</p>
        </div>

        <div className="ui-modal-shell p-10 bg-white/[0.01] backdrop-blur-xl border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center animate-pulse">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
              <div className="text-white/20 font-bold uppercase tracking-widest text-xs">Synchronizing with Registry...</div>
            </div>
          ) : (
            <div className="space-y-12 relative z-10">
              {/* Tool Card */}
              <div className="group relative p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 transition-all hover:border-white/10 hover:shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
                      <Tag className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">TD Commission Generator</h2>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${active ? 'text-emerald-400' : 'text-red-400'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          {active ? 'Operational' : 'System Offline'}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ID: td_commission</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-widest text-right">Current Rate</div>
                    <div className="text-3xl font-mono font-black text-white">{credits} <span className="text-sm font-bold text-white/20">CREDITS</span></div>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Usage Cost Configuration</label>
                    <span className="text-[10px] text-blue-400/50 font-mono italic">per successful download</span>
                  </div>
                  <div className="relative group">
                    <input 
                      className="ui-input text-2xl font-mono py-6 pl-8 bg-white/[0.02] border-white/5 transition-all group-hover:border-white/10 focus:border-blue-500/50 rounded-3xl" 
                      type="number" 
                      min={1} 
                      value={credits} 
                      onChange={(e: any) => setCredits(Number(e.target.value))} 
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <div className="w-px h-8 bg-white/5" />
                      <div className="text-xs font-black text-white/20 uppercase tracking-tighter">Credits</div>
                    </div>
                  </div>
                  <p className="text-xs text-white/30 leading-relaxed max-w-md px-2">
                    Increasing this value will charge users more for each PDF generated. The change is applied immediately to all future tool runs.
                  </p>
                </div>

                <div 
                  className="flex items-center justify-between p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all cursor-pointer"
                  onClick={() => setActive(!active)}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      <Power className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">Maintenance Mode</div>
                      <div className="text-sm text-white/40">Toggle tool visibility for end-users</div>
                    </div>
                  </div>
                  <div className={`w-14 h-7 rounded-full relative transition-all duration-500 ${active ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-500 ${active ? 'left-8' : 'left-1'}`} />
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
                className="ui-btn-primary w-full py-6 text-lg font-bold flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl shadow-blue-500/20 rounded-3xl hover:scale-[1.01] active:scale-100 transition-all" 
                onClick={save} 
                disabled={busy || credits <= 0}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Propagating Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    Commit Pricing Policy
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
