import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import FilesListClient from './FilesListClient'
import { 
  Wallet, 
  History, 
  FileBox, 
  ArrowUpRight, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  LayoutDashboard, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  const userId = auth.user?.id
  if (!userId) return null

  // Fetch essential data
  const [walletRes, ledgerRes, filesRes, pricingRes] = await Promise.all([
    supabase.from('wallets').select('balance_credits').eq('user_id', userId).single(),
    supabase.from('wallet_ledger').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('files').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(6),
    supabase.from('tool_pricing').select('*').eq('is_active', true)
  ])

  const wallet = walletRes.data
  const ledger = ledgerRes.data
  const files = filesRes.data
  const activeTools = pricingRes.data || []

  const stats = [
    { label: 'Available Credits', value: wallet?.balance_credits ?? 0, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Downloads', value: filesRes.count ?? files?.length ?? 0, icon: Download, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Last Activity', value: ledger?.[0] ? new Date(ledger[0].created_at).toLocaleDateString() : 'No activity', icon: History, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ]

  return (
    <main className="min-h-screen px-4 py-24 bg-[#050505] selection:bg-blue-500/30 overflow-x-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="relative mb-16">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <LayoutDashboard className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">User Terminal</span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-white italic uppercase leading-none">
                My <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Hub</span>
              </h1>
              <p className="text-white/40 mt-4 text-lg max-w-xl font-medium leading-relaxed uppercase tracking-tight">
                Accelerate your workflow with premium professional tools.
              </p>
            </div>
            <Link href="/tools" className="group flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.05] active:scale-[0.98] shadow-2xl shadow-white/10">
              <Sparkles className="w-4 h-4" />
              Launch New Tool
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="group relative p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 ${s.bg}`} />
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${s.bg} border border-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                {s.label === 'Available Credits' && (
                  <Link href="/dashboard/topup" className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5 bg-blue-500/5 px-3 py-1.5 rounded-full border border-blue-500/10">
                    Refill <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{s.label}</div>
              <div className="text-4xl font-black text-white font-mono italic tracking-tighter">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Active Premium Tools */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Cpu className="w-6 h-6 text-purple-400" />
                Premium Engine Room
              </h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTools.map((tool) => (
                <Link 
                  key={tool.tool_id} 
                  href={`/tools/${tool.tool_id.replace(/_/g, '-')}`}
                  className="group relative p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-purple-500/30 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                        <Zap className="w-7 h-7 text-purple-400" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5">Consume</div>
                        <div className="text-xl font-black italic text-purple-400 leading-none">{tool.download_credits} <span className="text-[10px] uppercase not-italic">Cr</span></div>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase italic tracking-tight flex items-center gap-2">
                      {tool.tool_id.replace(/_/g, ' ')}
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-4 space-y-12">
             <section className="space-y-6">
               <div className="flex items-center gap-3">
                 <h2 className="text-lg font-black uppercase italic tracking-widest text-white/30">History</h2>
                 <div className="h-px flex-1 bg-white/5" />
               </div>
               <div className="space-y-4">
                 {ledger?.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <div>
                        <div className="text-xs font-black uppercase italic tracking-tight text-white/80">{entry.reason.replace(/_/g, ' ')}</div>
                        <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">{new Date(entry.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className={`font-mono font-black italic ${entry.delta_credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {entry.delta_credits > 0 ? '+' : ''}{entry.delta_credits}
                      </div>
                    </div>
                 ))}
                 {!ledger?.length && (
                    <div className="py-12 text-center rounded-3xl border border-dashed border-white/5">
                      <History className="w-8 h-8 text-white/5 mx-auto mb-3" />
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/10">Null Registry</div>
                    </div>
                 )}
               </div>
             </section>

             <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 relative overflow-hidden group">
               <div className="relative z-10">
                 <ShieldCheck className="w-8 h-8 text-blue-400 mb-4" />
                 <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">Secure Terminal</h3>
                 <p className="text-[10px] font-bold text-blue-400/60 leading-relaxed uppercase tracking-wider mb-6">
                   All tool operations are logged and encrypted. Unused credits never expire.
                 </p>
                 <Link href="/dashboard/topup" className="block w-full py-3 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] text-center shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                   System Refill
                 </Link>
               </div>
             </section>
          </div>
        </div>

        {/* Files Terminal */}
        <section className="mt-24 space-y-8">
           <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <FileBox className="w-6 h-6 text-emerald-400" />
                Files Archive
              </h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="rounded-[3rem] bg-white/[0.01] border border-white/5 overflow-hidden">
              <FilesListClient files={files || []} />
            </div>
        </section>
      </div>
    </main>
  )
}
