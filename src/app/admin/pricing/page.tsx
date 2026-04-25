'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Tag, Save, ArrowLeft, Loader2, Power } from 'lucide-react'

export default function AdminPricingPage() {
  const supabase = createSupabaseBrowserClient()
  const [credits, setCredits] = useState<number>(10)
  const [active, setActive] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('tool_pricing')
          .select('*')
          .eq('tool_id', 'td_commission')
          .maybeSingle()
        
        if (data) {
          setCredits(data.download_credits)
          setActive(data.is_active)
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
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
            <Tag className="w-3.5 h-3.5" />
            Pricing & Availability
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Tool Pricing
          </h1>
          <p className="text-white/40 mt-1">Configure credit costs and tool status</p>
        </div>

        <div className="ui-modal-shell p-8 space-y-8">
          {loading ? (
            <div className="py-10 text-center text-white/40 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading tool data...
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div>
                  <div className="text-sm font-semibold text-white">TD Commission Generator</div>
                  <div className="text-xs text-white/40 mt-0.5">Primary PDF generation tool</div>
                </div>
                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {active ? 'Online' : 'Offline'}
                </div>
              </div>

              <div className="grid gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/70">Download Credits</label>
                  <div className="relative group">
                    <input 
                      className="ui-input text-lg font-mono transition-all group-hover:border-white/20 focus:border-blue-500/50" 
                      type="number" 
                      min={1} 
                      value={credits} 
                      onChange={(e: any) => setCredits(Number(e.target.value))} 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs uppercase tracking-tighter">credits / download</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors cursor-pointer" onClick={() => setActive(!active)}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                      <Power className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Tool Status</div>
                      <div className="text-xs text-white/40">{active ? 'Users can access and download' : 'Tool is hidden/disabled for all users'}</div>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>

              {msg && (
                <div className={`p-4 rounded-lg border flex items-center gap-3 text-sm ${
                  msg.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${msg.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {msg.text}
                </div>
              )}

              <button 
                className="ui-btn-primary w-full py-4 text-base flex items-center justify-center gap-2 relative overflow-hidden group shadow-xl shadow-blue-500/10" 
                onClick={save} 
                disabled={busy || credits <= 0}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Save Pricing Policy
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
