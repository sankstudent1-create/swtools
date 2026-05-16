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
  Download,
  Clock,
  Activity,
  CreditCard,
  Settings
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

  return (
    <main className="min-h-screen bg-[#020203] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-20">
        {/* Top Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold tracking-[0.2em] text-[10px] uppercase">
              <div className="w-8 h-[1px] bg-blue-400" />
              User Control Center
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight flex items-center gap-3">
              Dashboard <span className="text-white/20">/</span> <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Overview</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <Link href="/dashboard/settings" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
               <Settings className="w-5 h-5 text-white/60" />
             </Link>
             <Link href="/tools" className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95">
              <Sparkles className="w-4 h-4" />
              Explore Tools
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </header>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Credits Card */}
          <div className="relative group overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-2xl shadow-blue-900/20">
            <div className="absolute top-0 right-0 p-8 opacity-20 transition-transform group-hover:scale-110 group-hover:rotate-12">
              <Zap className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <span className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-2">Available Credits</span>
              <div className="text-5xl font-black mb-6 tracking-tighter">{wallet?.balance_credits ?? 0}</div>
              <Link href="/dashboard/topup" className="mt-auto flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                Refill Balance <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Stats Item 1 */}
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 hover:bg-white/[0.07] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <FileBox className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-white/40 font-bold uppercase tracking-widest text-[10px] block mb-1">Generated Files</span>
            <div className="text-3xl font-black tracking-tight">{filesRes.count ?? files?.length ?? 0}</div>
            <div className="mt-4 flex items-center gap-2 text-emerald-400/60 text-[10px] font-bold uppercase">
              <Activity className="w-3 h-3" />
              Syncing Live
            </div>
          </div>

          {/* Stats Item 2 */}
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 hover:bg-white/[0.07] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
              <Download className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-white/40 font-bold uppercase tracking-widest text-[10px] block mb-1">Exports Used</span>
            <div className="text-3xl font-black tracking-tight">{ledger?.length ?? 0}</div>
            <div className="mt-4 flex items-center gap-2 text-purple-400/60 text-[10px] font-bold uppercase">
              <Clock className="w-3 h-3" />
              Last 30 Days
            </div>
          </div>

          {/* Stats Item 3 */}
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-8 hover:bg-white/[0.07] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
              <CreditCard className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-white/40 font-bold uppercase tracking-widest text-[10px] block mb-1">Account Tier</span>
            <div className="text-3xl font-black tracking-tight uppercase tracking-tighter italic">Professional</div>
            <div className="mt-4 flex items-center gap-2 text-amber-400/60 text-[10px] font-bold uppercase">
              <ShieldCheck className="w-3 h-3" />
              Verified Account
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Tools & Files */}
          <div className="lg:col-span-8 space-y-8">
            {/* Active Tools Section */}
            <section className="rounded-[2.5rem] bg-white/5 border border-white/10 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-xl font-black uppercase tracking-tight italic">Recommended Engines</h2>
                </div>
                <Link href="/tools" className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">View All Tools</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTools.map((tool) => (
                  <Link 
                    key={tool.tool_id} 
                    href={`/tools/${tool.tool_id.replace(/_/g, '-')}`}
                    prefetch={false}
                    className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/10 transition-all">
                      <Zap className="w-6 h-6 text-white/40 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-white/90 uppercase group-hover:text-white transition-colors">
                        {tool.tool_id.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{tool.download_credits} Credits / Use</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Files List Section */}
            <section className="rounded-[2.5rem] bg-white/5 border border-white/10 p-8 overflow-hidden">
               <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xl font-black uppercase tracking-tight italic">Recent Artifacts</h2>
              </div>
              <div className="bg-black/20 rounded-2xl border border-white/5">
                <FilesListClient files={files || []} />
              </div>
            </section>
          </div>

          {/* Sidebar: Activity & Support */}
          <div className="lg:col-span-4 space-y-8">
            {/* History Section */}
            <section className="rounded-[2.5rem] bg-white/5 border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-8">
                <History className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-black uppercase italic tracking-tight">Ledger</h2>
              </div>
              <div className="space-y-4">
                 {ledger?.map((entry: any) => (
                    <div key={entry.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-white/80 tracking-tight group-hover:text-white transition-colors">
                          {entry.reason.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={`text-sm font-black italic tabular-nums ${entry.delta_credits > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {entry.delta_credits > 0 ? '+' : ''}{entry.delta_credits}
                      </div>
                    </div>
                 ))}
                 {!ledger?.length && (
                    <div className="py-12 text-center">
                      <History className="w-10 h-10 text-white/5 mx-auto mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Empty Transaction Log</p>
                    </div>
                 )}
              </div>
            </section>

            {/* Security Terminal Card */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-blue-600 p-8 shadow-2xl shadow-blue-900/40">
              <div className="absolute -bottom-8 -right-8 opacity-20 transform rotate-12 transition-transform group-hover:scale-125">
                 <ShieldCheck className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 text-white">Secure Terminal</h3>
                <p className="text-[11px] font-bold text-white/70 leading-relaxed uppercase tracking-wide mb-8">
                  Your environment is protected with end-to-end encryption. Credits are stored in a secure ledger and never expire.
                </p>
                <Link href="/dashboard/support" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                  Open Support Ticket
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
