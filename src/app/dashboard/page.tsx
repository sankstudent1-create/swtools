import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import FilesListClient from './FilesListClient'
import { Wallet, History, FileBox, ArrowUpRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  const userId = auth.user?.id
  if (!userId) {
    return null
  }

  // Parallel fetching for better performance
  const [walletRes, ledgerRes, filesRes] = await Promise.all([
    supabase.from('wallets').select('balance_credits').eq('user_id', userId).single(),
    supabase.from('wallet_ledger').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('files').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
  ])

  const wallet = walletRes.data
  const ledger = ledgerRes.data
  const files = filesRes.data

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <p className="text-white/40 mt-1">Manage your credits, downloads, and account activity</p>
          </div>
          <Link href="/tools" className="ui-btn-primary flex items-center gap-2 self-start">
            <FileBox className="w-4 h-4" />
            Explore Tools
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="ui-modal-shell p-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10 group transition-all duration-300 hover:border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Wallet className="w-5 h-5" />
              </div>
              <Link href="/dashboard/topup" className="text-[10px] uppercase tracking-wider font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                Add Credits <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="text-sm text-white/50 mb-1">Available Balance</div>
            <div className="text-3xl font-mono font-bold">{wallet?.balance_credits ?? 0} <span className="text-xs font-sans text-white/30 font-normal">Credits</span></div>
          </div>

          <div className="ui-modal-shell p-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <FileBox className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-white/50 mb-1">Total Downloads</div>
            <div className="text-3xl font-mono font-bold">{files?.length ?? 0} <span className="text-xs font-sans text-white/30 font-normal">Files</span></div>
          </div>

          <div className="ui-modal-shell p-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <History className="w-5 h-5" />
              </div>
            </div>
            <div className="text-sm text-white/50 mb-1">Last Activity</div>
            <div className="text-sm font-medium mt-3 text-white/80">
              {ledger?.[0] ? new Date(ledger[0].created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'No activity yet'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Files */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileBox className="w-5 h-5 text-white/60" />
                Recent Downloads
              </h2>
            </div>
            <div className="ui-modal-shell overflow-hidden border-white/5">
              <FilesListClient initialFiles={files || []} />
            </div>
          </div>

          {/* Sidebar: Ledger */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-white/60" />
              Credit History
            </h2>
            <div className="ui-modal-shell p-4 space-y-4 border-white/5">
              {ledger?.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-white/80 line-clamp-1">{entry.reason.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-white/30">{new Date(entry.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`font-mono font-bold ${entry.delta_credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {entry.delta_credits > 0 ? '+' : ''}{entry.delta_credits}
                  </span>
                </div>
              ))}
              {!ledger?.length && (
                <div className="py-10 text-center text-white/20 text-sm italic">
                  No transactions yet.
                </div>
              )}
              {ledger?.length === 5 && (
                <button className="w-full py-2 text-xs text-white/40 hover:text-white transition-colors border-t border-white/5 mt-2">
                  View Full History
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
