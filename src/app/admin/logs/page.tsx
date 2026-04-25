import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { Activity, ArrowLeft, Search, Clock, User, Zap, Mail, ChevronRight } from 'lucide-react'

export default async function AdminLogsPage() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return null

  let toolRuns: any[] | null = null
  let loadError: string | null = null
  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from('tool_runs')
      .select('*, profiles!tool_runs_user_id_fkey(email)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      loadError = error.message
    } else {
      toolRuns = data
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Failed to load'
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f] selection:bg-amber-500/30">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
              <Activity className="w-10 h-10 text-amber-400" />
              System <span className="text-amber-400/50 italic">Activity</span>
            </h1>
            <p className="text-white/40 max-w-md">Real-time monitoring of tool usage and system events across the platform.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest animate-pulse">
              Live Feed
            </div>
          </div>
        </div>

        {loadError && (
          <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {loadError}
          </div>
        )}

        {/* Logs Feed */}
        <div className="grid gap-4">
          {toolRuns?.map((run: any) => (
            <div key={run.id} className="group relative p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm transition-all hover:bg-white/[0.03] hover:border-white/10 hover:shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-tighter">
                        {run.tool_id}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-widest ${
                        run.action === 'download' ? 'text-emerald-400' : 'text-blue-400'
                      }`}>
                        {run.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white font-medium">
                      <User className="w-3.5 h-3.5 text-white/20" />
                      {run.profiles?.email || 'Anonymous User'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:text-right">
                  <div className="hidden lg:block">
                    <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1 text-right">Credits</div>
                    <div className={`text-lg font-mono font-black ${run.credits_charged > 0 ? 'text-red-400' : 'text-white/40'}`}>
                      {run.credits_charged > 0 ? `-${run.credits_charged}` : 'FREE'}
                    </div>
                  </div>
                  
                  <div className="w-px h-10 bg-white/5 hidden md:block" />
                  
                  <div>
                    <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1 md:text-right">Timestamp</div>
                    <div className="flex items-center gap-2 text-sm text-white/60 font-medium whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(run.created_at).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!toolRuns?.length && (
            <div className="p-24 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Activity className="w-10 h-10 text-white/10" />
              </div>
              <div className="text-white/40 font-medium text-lg italic">Silence in the system... no logs found.</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
