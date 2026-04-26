'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
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
  ChevronRight,
  RefreshCcw
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
  const [user, setUser] = useState<any>(undefined) // undefined = loading, null = guest
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [creditsPerInr, setCreditsPerInr] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const fetchBalance = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
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
    // Initial user fetch
    const initUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) fetchBalance(currentUser.id)
    }
    
    initUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchBalance(currentUser.id)
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
    setTimeout(() => setIsRefreshing(false), 800)
  }

  const fetchHistory = async () => {
    if (user === null) {
      setShowAuth(true)
      return
    }
    if (user === undefined) return
    
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
    if (user === null) {
      setShowAuth(true)
      return
    }
    if (user === undefined) return

    setIsRefreshing(true)
    const { data: walletData } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()
    
    const currentBalance = walletData?.balance ?? 0
    setBalance(currentBalance)
    setIsRefreshing(false)

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
    <>
      {/* Actual Tool UI */}
      <div className={`relative ${isProcessing ? 'pointer-events-none' : ''}`}>
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[3px] flex items-center justify-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-6 p-10 rounded-[3.5rem] bg-[#0c0f17]/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-16 h-16 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-base font-black text-white uppercase tracking-[0.3em] mb-2 italic">Optimizing</div>
                <div className="text-[11px] text-white/40 font-bold uppercase tracking-widest">High-Definition PDF Generation...</div>
              </div>
            </div>
          </div>
        )}
        {children}
      </div>

      {/* --- MODALS --- */}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#0c0f17] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight leading-none">Your Vault</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-black mt-2">{toolName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistory(false)} 
                className="p-3 hover:bg-white/5 rounded-2xl transition-all group active:scale-90"
              >
                <X className="w-6 h-6 text-white/20 group-hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-24 gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin relative" />
                  </div>
                  <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Deciphering History...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="group p-5 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-blue-500/10 transition-colors">
                          <FileText className="w-6 h-6 text-white/20 group-hover:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[15px] font-bold text-white group-hover:text-white truncate max-w-[200px] sm:max-w-[260px]">{item.filename}</div>
                          <div className="text-[10px] text-white/20 flex items-center gap-2 mt-1.5 uppercase tracking-widest font-black group-hover:text-blue-400/50">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => downloadFile(item.id)}
                        className="flex items-center justify-center p-3.5 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all active:scale-90 shadow-lg shadow-blue-500/0 hover:shadow-blue-500/20"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <div className="inline-flex p-8 rounded-[2.5rem] bg-white/[0.02] mb-8">
                    <History className="w-12 h-12 text-white/5" />
                  </div>
                  <p className="text-sm font-black text-white/20 uppercase tracking-[0.3em]">Vault is Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credits Upsell Modal */}
      {showUpsell && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
          <div className="relative w-full max-w-md bg-[#0c0f17] border border-red-500/20 rounded-[4rem] overflow-hidden shadow-2xl p-1">
            <div className="bg-[#0c0f17] rounded-[3.8rem] overflow-hidden">
              <div className="p-12 text-center">
                <div className="inline-flex p-8 rounded-[3rem] bg-red-500/5 border border-red-500/10 mb-8 shadow-2xl shadow-red-500/5">
                  <AlertCircle className="w-12 h-12 text-red-500/80" />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter text-white mb-4 uppercase leading-none">
                  Credit <span className="text-red-500">Deficit</span>
                </h3>
                <p className="text-white/40 text-sm mb-12 leading-relaxed font-bold tracking-tight">
                  You current balance of <span className="text-white">{balance}</span> is insufficient. 
                  This tool requires <span className="text-blue-500">{requiredCredits} credits</span> to operate.
                </p>
                
                <div className="space-y-4">
                  <Link 
                    href={`/dashboard/topup?amount=${Math.max(1, Math.ceil((requiredCredits - (balance || 0)) / creditsPerInr))}`}
                    className="flex items-center justify-center gap-4 w-full py-5 rounded-[1.5rem] bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.05] active:scale-[0.95]"
                  >
                    <Wallet className="w-4 h-4" />
                    Topup ₹{Math.max(1, Math.ceil((requiredCredits - (balance || 0)) / creditsPerInr))} Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => setShowUpsell(false)}
                    className="w-full py-4 text-white/20 font-black uppercase tracking-[0.2em] text-[9px] hover:text-white transition-all"
                  >
                    Dismiss
                  </button>
                </div>
                
                <div className="mt-10 flex items-center justify-center gap-3 text-[9px] text-white/10 font-black uppercase tracking-[0.4em]">
                  <Lock className="w-3 h-3" />
                  End-to-End Encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#0c0f17] border border-blue-500/20 rounded-[4rem] overflow-hidden shadow-2xl p-12 text-center">
            <div className="inline-flex p-8 rounded-[2.5rem] bg-blue-500/5 border border-blue-500/10 mb-10 shadow-2xl shadow-blue-500/10">
              <Lock className="w-14 h-14 text-blue-500/80" />
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter text-white mb-4 uppercase leading-none">
              Portal <span className="text-blue-500">Locked</span>
            </h3>
            <p className="text-white/ black uppercase tracking-[0.1em] text-sm mb-12 leading-relaxed">
              Authentication is required to access premium utilities.
            </p>
            
            <div className="space-y-4">
              <Link 
                href={`/auth/login?next=${encodeURIComponent(window.location.pathname)}`}
                className="flex items-center justify-center w-full py-5 rounded-[1.5rem] bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-blue-500/40 hover:bg-blue-600 hover:scale-[1.05] transition-all"
              >
                Sign In
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
              <button 
                onClick={() => setShowAuth(false)}
                className="w-full py-4 text-white/20 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
