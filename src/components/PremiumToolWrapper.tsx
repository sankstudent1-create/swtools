'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { 
  X, 
  Wallet, 
  History, 
  Download, 
  Lock, 
  AlertCircle,
  ArrowRight,
  Loader2,
  Calendar,
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type ToolHistoryItem = {
  id: string
  filename: string
  created_at: string
  storage_path: string
}

type PremiumToolWrapperProps = {
  toolId: string
  toolName: string
  requiredCredits: number
  onConfirmDownload: () => Promise<void>
  isProcessing: boolean
  children: React.ReactNode
}

export default function PremiumToolWrapper({
  toolId,
  toolName,
  requiredCredits,
  onConfirmDownload,
  isProcessing,
  children
}: PremiumToolWrapperProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [showUpsell, setShowUpsell] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  
  const [history, setHistory] = useState<ToolHistoryItem[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [creditsPerInr, setCreditsPerInr] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const supabase = createSupabaseBrowserClient()

  const fetchBalance = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle()
      if (data) setBalance(data.balance)
    } catch (e) {
      console.error('Balance fetch error:', e)
    }
  }, [supabase])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchBalance(session.user.id)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchBalance(session.user.id)
      } else {
        setBalance(null)
      }
    })

    const fetchRate = async () => {
      try {
        const res = await fetch('/api/wallet/topup/rate')
        const j = await res.json()
        if (j.credits_per_inr) setCreditsPerInr(j.credits_per_inr)
      } catch {}
    }
    fetchRate()

    return () => subscription.unsubscribe()
  }, [supabase, fetchBalance])

  const handleRefreshBalance = async () => {
    if (!user) return
    setIsRefreshing(true)
    await fetchBalance(user.id)
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const fetchHistory = async () => {
    if (!user) {
      setShowAuth(true)
      return
    }
    setLoadingHistory(true)
    setShowHistory(true)
    try {
      const { data, error } = await supabase
        .from('files')
        .select('id, filename, created_at, storage_path')
        .eq('user_id', user.id)
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false })
      
      if (!error && data) setHistory(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDownloadClick = async () => {
    if (!user) {
      setShowAuth(true)
      return
    }

    // Refresh balance before checking
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()
    
    const currentBalance = walletData?.balance ?? 0
    setBalance(currentBalance)

    if (currentBalance < requiredCredits) {
      setShowUpsell(true)
      return
    }

    await onConfirmDownload()
  }

  const downloadFile = async (fileId: string) => {
    try {
      const res = await fetch('/api/files/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileId }),
      })
      const j = await res.json()
      if (res.ok) window.open(j.url, '_blank')
      else alert(j.error || 'Download failed')
    } catch (e) {
      alert('Error fetching file')
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* ── PREMIUM INTEGRATED BAR ── */}
      <div className="sticky top-16 z-[45] w-full border-b border-white/5 bg-[#07090f]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={handleRefreshBalance}>
              <div className={`p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all ${isRefreshing ? 'animate-pulse' : ''}`}>
                <Wallet className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Balance</span>
                <span className="text-xs font-bold text-white leading-none tracking-tight">
                  {balance !== null ? `${balance} Credits` : user ? 'Loading...' : '—'}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex h-6 w-px bg-white/5" />

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/10">
              <Sparkles className="w-3 h-3 text-amber-500/60" />
              <span className="text-[9px] font-bold text-amber-500/60 uppercase tracking-wider">Premium Tool</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchHistory}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-white/60 hover:text-white transition-all text-xs font-bold"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">History</span>
            </button>
            
            <button 
              onClick={handleDownloadClick}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden xs:inline">Processing</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Download</span>
                  <span className="xs:hidden">Get</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Actual Tool UI */}
      <div className={`relative ${isProcessing ? 'pointer-events-none' : ''}`}>
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-[#0c0f17]/80 border border-white/10 shadow-2xl">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white uppercase tracking-widest mb-1">Processing</div>
                <div className="text-[10px] text-white/40 font-medium">Generating your premium document...</div>
              </div>
            </div>
          </div>
        )}
        {children}
      </div>

      {/* --- MODALS --- */}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#0c0f17] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-7 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Download History</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mt-0.5">{toolName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)} 
                className="p-2.5 hover:bg-white/5 rounded-2xl transition-all group active:scale-90"
              >
                <X className="w-5 h-5 text-white/20 group-hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full animate-pulse" />
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin relative" />
                  </div>
                  <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.3em]">Retrieving Vault...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-2.5">
                  {history.map(item => (
                    <div key={item.id} className="group p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 hover:bg-blue-500/[0.02] transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                          <FileText className="w-5 h-5 text-white/20 group-hover:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-blue-50 group- Murphy truncate max-w-[220px]">{item.filename}</div>
                          <div className="text-[10px] text-white/20 flex items-center gap-2 mt-1 uppercase tracking-widest font-black group-hover:text-blue-400/40">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => downloadFile(item.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Get</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="inline-flex p-6 rounded-[2rem] bg-white/[0.02] mb-6">
                    <History className="w-10 h-10 text-white/5" />
                  </div>
                  <p className="text-sm font-bold text-white/20 uppercase tracking-[0.2em]">No History Found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credits Upsell Modal */}
      {showUpsell && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="relative w-full max-w-md bg-[#0c0f17] border border-red-500/10 rounded-[3rem] overflow-hidden shadow-2xl p-1">
            <div className="bg-[#0c0f17] rounded-[2.8rem] overflow-hidden">
              <div className="p-10 text-center">
                <div className="inline-flex p-6 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 mb-8">
                  <AlertCircle className="w-10 h-10 text-red-500/60" />
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter text-white mb-3 uppercase">Credits <span className="text-red-500/80">Low</span></h3>
                <p className="text-white/40 text-[13px] mb-10 leading-relaxed font-medium">
                  You have <span className="text-white font-bold">{balance} credits</span>, but this tool requires <span className="text-blue-400 font-bold">{requiredCredits}</span>. 
                  Top up to continue your premium experience.
                </p>
                
                <div className="space-y-3">
                  <Link 
                    href={`/dashboard/topup?amount=${Math.max(1, Math.ceil((requiredCredits - (balance || 0)) / creditsPerInr))}`}
                    className="flex items-center justify-center gap-3 w-full py-4.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Wallet className="w-4 h-4" />
                    Top Up ₹{Math.max(1, Math.ceil((requiredCredits - (balance || 0)) / creditsPerInr))}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => setShowUpsell(false)}
                    className="w-full py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-white/20 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
                
                <div className="mt-8 flex items-center justify-center gap-2 text-[8px] text-white/10 font-black uppercase tracking-[0.3em]">
                  <Lock className="w-2.5 h-2.5" />
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#0c0f17] border border-blue-500/10 rounded-[3.5rem] overflow-hidden shadow-2xl p-12 text-center">
            <div className="inline-flex p-7 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 mb-10 shadow-2xl shadow-blue-500/5">
              <Lock className="w-12 h-12 text-blue-500/80" />
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter text-white mb-4 uppercase">
              Access <span className="text-blue-500">Locked</span>
            </h3>
            <p className="text-white/30 text-[13px] mb-12 leading-relaxed font-semibold">
              Premium tools require an active session. Please login to manage your documents and wallet.
            </p>
            
            <div className="space-y-4">
              <Link 
                href={`/auth/login?next=${encodeURIComponent(window.location.pathname)}`}
                className="flex items-center justify-center w-full py-5 rounded-[1.5rem] bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-500/30 hover:bg-blue-600 hover:scale-[1.05] transition-all"
              >
                Enter Portal
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
              <button 
                onClick={() => setShowAuth(false)}
                className="w-full py-4 text-white/20 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
