'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Settings, Save, ArrowLeft, Loader2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const supabase = createSupabaseBrowserClient()
  const [creditsPerInr, setCreditsPerInr] = useState<number>(1)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('key', 'credits_per_inr')
          .maybeSingle()
        
        if (data?.value?.credits_per_inr) {
          setCreditsPerInr(data.value.credits_per_inr)
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
      setMsg({ text: 'Settings updated successfully', type: 'success' })
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
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-400/10 px-3 py-1 rounded-full border border-purple-400/20">
            <Settings className="w-3.5 h-3.5" />
            System Config
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Admin Settings
          </h1>
          <p className="text-white/40 mt-1">Configure global application parameters</p>
        </div>

        <div className="ui-modal-shell p-8 space-y-8">
          {loading ? (
            <div className="py-10 text-center text-white/40 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading current settings...
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-white/70">Credits per ₹1 INR</label>
                  <span className="text-[10px] text-white/30 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded">Conversion Rate</span>
                </div>
                <div className="relative group">
                  <input 
                    className="ui-input text-lg font-mono transition-all group-hover:border-white/20 focus:border-purple-500/50" 
                    type="number" 
                    min={1} 
                    value={creditsPerInr} 
                    onChange={(e: any) => setCreditsPerInr(Number(e.target.value))} 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">credits/₹</div>
                </div>
                <p className="text-xs text-white/30 italic">Example: If set to 10, a user paying ₹100 will receive 1,000 credits.</p>
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
                className="ui-btn-primary w-full py-4 text-base flex items-center justify-center gap-2 relative overflow-hidden group shadow-xl shadow-purple-500/10" 
                onClick={save} 
                disabled={busy || creditsPerInr <= 0}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Save Configuration
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
