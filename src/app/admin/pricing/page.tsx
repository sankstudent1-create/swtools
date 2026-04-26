'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  Tag, 
  Save, 
  AlertTriangle,
  RefreshCw,
  Power
} from 'lucide-react'

type ToolPricing = {
  tool_id: string
  download_credits: number
  is_active: boolean
  updated_at: string
}

export default function AdminPricingPage() {
  const [tools, setTools] = useState<ToolPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyToolId, setBusyToolId] = useState<string | null>(null)

  useEffect(() => {
    loadPricing()
  }, [])

  const loadPricing = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/pricing')
      const data = await res.json()
      if (res.ok) setTools(data)
      else setError(data.error || 'Failed to load pricing')
    } catch (e) {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const updateTool = async (tool: ToolPricing) => {
    setBusyToolId(tool.tool_id)
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tool)
      })
      if (!res.ok) {
        const j = await res.json()
        alert(j.error || 'Update failed')
      }
    } catch (e) {
      alert('Network error')
    } finally {
      setBusyToolId(null)
    }
  }

  const toggleStatus = (id: string) => {
    const updated = tools.map(t => {
      if (t.tool_id === id) {
        const next = { ...t, is_active: !t.is_active }
        updateTool(next)
        return next
      }
      return t
    })
    setTools(updated)
  }

  const updateCredits = (id: string, val: number) => {
    setTools(prev => prev.map(t => t.tool_id === id ? { ...t, download_credits: val } : t))
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-white mb-2 italic uppercase leading-none">
              Tool <span className="text-purple-500">Pricing</span>
            </h1>
            <p className="text-white/40 text-sm font-medium tracking-tight uppercase tracking-widest">
              Manage Credit Costs & Availability
            </p>
          </div>
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-xs font-bold text-white/30 hover:text-white transition-all uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Admin
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold flex items-center gap-3 animate-in fade-in">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-white/20">
            <Loader2 className="w-10 h-10 animate-spin" />
            <div className="text-xs font-black uppercase tracking-widest">Loading Tool configurations...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tools.map((tool) => (
              <div 
                key={tool.tool_id} 
                className={`group relative p-8 rounded-[2.5rem] bg-white/[0.03] border transition-all duration-500 hover:bg-white/[0.05] ${tool.is_active ? 'border-white/10' : 'border-red-500/10 grayscale-[0.5] opacity-60'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${tool.is_active ? 'bg-purple-500/10 border-purple-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                      <Tag className={`w-7 h-7 ${tool.is_active ? 'text-purple-400' : 'text-red-400'}`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic tracking-tight uppercase text-white">{tool.tool_id.replace(/_/g, ' ')}</h3>
                      <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
                        Last Updated: {new Date(tool.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-1">Credits Cost</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number"
                          value={tool.download_credits}
                          onChange={(e) => updateCredits(tool.tool_id, parseInt(e.target.value))}
                          className="w-24 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-black italic text-purple-400 focus:outline-none focus:border-purple-500/50 transition-all"
                        />
                        <button 
                          onClick={() => updateTool(tool)}
                          disabled={busyToolId === tool.tool_id}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/40 hover:text-white"
                        >
                          {busyToolId === tool.tool_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="h-12 w-[1px] bg-white/5 hidden md:block" />

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest block ml-1">Status</label>
                      <button 
                        onClick={() => toggleStatus(tool.tool_id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border ${tool.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white'}`}
                      >
                        <Power className="w-3 h-3" />
                        {tool.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-500/80 font-medium leading-relaxed">
            <span className="font-black uppercase text-amber-500 block mb-1">Global Impact</span>
            Changes to tool pricing and availability take effect immediately for all users. Disabling a tool will hide it from the tools directory and prevent new runs.
          </div>
        </div>
      </div>
    </div>
  )
}
