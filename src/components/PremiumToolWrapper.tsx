'use client'

import React, { useEffect, useState } from 'react'
import { 
  X, 
  Wallet, 
  History, 
  Download, 
  Lock, 
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Calendar,
  FileText
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

  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        fetchBalance(user.id)
      }
    }
    checkUser()
    fetchRate()
  }, [])

  const fetchRate = async () => {
    try {
      const res = await fetch('/api/wallet/topup/rate')
      const j = await res.json()
      if (j.credits_per_inr) setCreditsPerInr(j.credits_per_inr)
    } catch {}
  }

  const fetchBalance = async (userId: string) => {
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle()
    if (data) setBalance(data.balance)
  }

  const fetchHistory = async () => {
    if (!user) return
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

    // Confirmation or direct start? Let's do direct start with loading
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
    <div className="relative">
      {/* Premium Tool Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Wallet Balance</div>
            <div className="text-sm font-bold text-white">
              {balance !== null ? `${balance} Credits` : '---'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchHistory}
            className="ui-btn-secondary py-2.5 px-4 text-xs flex items-center gap-2 rounded-2xl"
          >
            <History className="w-4 h-4" />
            History
          </button>
          
          <button 
            onClick={handleDownloadClick}
            disabled={isProcessing}
            className="ui-btn-primary py-2.5 px-6 text-xs flex items-center gap-2 rounded-2xl bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download ({requiredCredits} Credits)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Actual Tool UI */}
      <div className={isProcessing ? 'pointer-events-none opacity-50 grayscale transition-all' : ''}>
        {children}
      </div>

      {/* --- MODALS --- */}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#0c0f17] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <History className="w-5 h-5 text-blue-400" />
                {toolName} History
              </h3>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-white/40">Fetching your documents...</p>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-white/5">
                          <FileText className="w-5 h-5 text-white/40" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold truncate max-w-[200px]">{item.filename}</div>
                          <div className="text-[10px] text-white/30 flex items-center gap-1.5 mt-0.5 uppercase tracking-widest font-black">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => downloadFile(item.id)}
                        className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-2xl bg-white/5 mb-4">
                    <History className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/50">No downloads found for this tool.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Credits Upsell Modal */}
      {showUpsell && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300">
          <div className="relative w-full max-w-md bg-[#0c0f17] border border-red-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 text-center">
              <div className="inline-flex p-4 rounded-3xl bg-red-500/10 border border-red-500/20 mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Insufficient Credits</h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed">
                You have {balance} credits, but this tool requires {requiredCredits}. 
                Top up your wallet to continue.
              </p>
              
              <div className="grid grid-cols-1 gap-3 mb-8">
                <Link 
                  href={`/dashboard/topup?amount=${Math.ceil((requiredCredits - (balance || 0)) / creditsPerInr)}`}
                  className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                >
                  <Wallet className="w-4 h-4" />
                  Top Up ₹{Math.ceil((requiredCredits - (balance || 0)) / creditsPerInr)}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => setShowUpsell(false)}
                  className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
                >
                  Maybe Later
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-white/20 font-black uppercase tracking-widest">
                <Lock className="w-3 h-3" />
                Secure Payment Powered by Razorpay
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#0c0f17] border border-blue-500/20 rounded-[3rem] overflow-hidden shadow-2xl p-10 text-center">
            <div className="inline-flex p-5 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 mb-8 shadow-2xl shadow-blue-500/10">
              <Lock className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-3xl font-black italic tracking-tighter mb-4">
              LOGIN <span className="text-blue-500">REQUIRED</span>
            </h3>
            <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">
              Please sign in to your SW Tools account to access premium features and manage your documents.
            </p>
            
            <div className="space-y-3">
              <Link 
                href={`/auth/login?next=${encodeURIComponent(window.location.pathname)}`}
                className="block w-full py-4 rounded-2xl bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"
              >
                Sign In Now
              </Link>
              <button 
                onClick={() => setShowAuth(false)}
                className="block w-full py-4 text-white/30 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
