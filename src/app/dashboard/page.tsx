import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import FilesListClient from './FilesListClient'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()

  const userId = auth.user?.id
  if (!userId) {
    return null
  }

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance_credits')
    .eq('user_id', userId)
    .maybeSingle()

  const { data: ledger } = await supabase
    .from('wallet_ledger')
    .select('id,delta_credits,reason,ref_type,ref_id,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(25)

  const { data: files } = await supabase
    .from('files')
    .select('id,tool_id,filename,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(25)

  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Link className="ui-btn-secondary" href="/dashboard/topup">Top up</Link>
            <Link className="ui-btn-secondary" href="/tools/td-commission">TD Commission</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="ui-modal-shell p-5">
            <div className="text-sm text-white/60">Credits</div>
            <div className="mt-2 text-3xl font-bold">{wallet?.balance_credits ?? 0}</div>
          </div>
          <div className="ui-modal-shell p-5 md:col-span-2">
            <div className="text-sm text-white/60">Downloads</div>
            <div className="mt-2 text-sm text-white/70">Your paid files show here for re-download (coming next: direct download links).</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="ui-modal-shell p-5">
            <h2 className="font-semibold">Recent transactions</h2>
            <div className="mt-3 space-y-2">
              {(ledger ?? []).map(l => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{l.reason}</div>
                    <div className="text-xs text-white/50">{new Date(l.created_at).toLocaleString()}</div>
                  </div>
                  <div className={`font-mono text-sm ${l.delta_credits >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{l.delta_credits}</div>
                </div>
              ))}
              {(!ledger || ledger.length === 0) ? <div className="text-sm text-white/50">No transactions yet.</div> : null}
            </div>
          </section>

          <section className="ui-modal-shell p-5">
            <h2 className="font-semibold">Recent files</h2>
            <FilesListClient files={(files ?? []) as any} />
          </section>
        </div>
      </div>
    </main>
  )
}
