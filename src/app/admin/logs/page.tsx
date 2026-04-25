import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export default async function AdminLogsPage() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return null

  let toolRuns: any[] | null = null
  let loadError: string | null = null
  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from('tool_runs')
      .select('*, profiles(email)')
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
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tool Run Logs</h1>
          <Link className="ui-btn-secondary" href="/admin">Back</Link>
        </div>

        {loadError ? (
          <div className="mt-6 ui-modal-shell p-6">
            <div className="text-sm text-red-400">{loadError}</div>
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.05]">
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Tool</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {toolRuns?.map((run: any) => (
                <tr key={run.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {new Date(run.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {run.profiles?.email || run.user_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                      {run.tool_id}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{run.action}</td>
                  <td className="px-4 py-3 text-right">
                    {run.credits_charged > 0 ? (
                      <span className="text-red-400">-{run.credits_charged}</span>
                    ) : (
                      <span className="text-white/40">0</span>
                    )}
                  </td>
                </tr>
              ))}
              {!toolRuns?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
