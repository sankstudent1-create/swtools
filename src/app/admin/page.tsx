import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    return (
      <main className="min-h-screen px-4 py-24">
        <div className="mx-auto max-w-xl ui-modal-shell p-6">
          <h1 className="text-xl font-bold">Admin</h1>
          <p className="mt-2 text-sm text-white/60">You don’t have access to this page.</p>
          <div className="mt-4">
            <Link className="ui-btn-secondary" href="/dashboard">Back to dashboard</Link>
          </div>
        </div>
      </main>
    )
  }

  let stats = {
    users: 0,
    payments: 0,
    toolRuns: 0,
  }
  let statsError: string | null = null

  try {
    const admin = createSupabaseAdminClient()

    const [usersRes, payRes, runsRes] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('razorpay_payments').select('id', { count: 'exact', head: true }),
      admin.from('tool_runs').select('id', { count: 'exact', head: true }),
    ])

    stats.users = usersRes.count ?? 0
    stats.payments = payRes.count ?? 0
    stats.toolRuns = runsRes.count ?? 0
  } catch (e) {
    statsError = e instanceof Error ? e.message : 'Failed to load admin stats'
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-white/40 mt-1">Manage users, credits, pricing, and payments</p>
          </div>
          <Link className="ui-btn-secondary" href="/tools">Go to site</Link>
        </div>

        {statsError ? (
          <div className="ui-modal-shell p-6 border border-red-500/20 bg-red-500/5 text-red-300 text-sm mb-8">
            {statsError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="ui-modal-shell p-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
            <div className="text-sm text-white/50">Total Users</div>
            <div className="text-3xl font-mono font-bold mt-2">{stats.users}</div>
          </div>
          <div className="ui-modal-shell p-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
            <div className="text-sm text-white/50">Payments Recorded</div>
            <div className="text-3xl font-mono font-bold mt-2">{stats.payments}</div>
          </div>
          <div className="ui-modal-shell p-6 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
            <div className="text-sm text-white/50">Tool Runs</div>
            <div className="text-3xl font-mono font-bold mt-2">{stats.toolRuns}</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/users" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors border border-white/5">
            <div className="text-sm text-white/60">Users</div>
            <div className="mt-1 text-lg font-semibold">User management</div>
            <div className="mt-2 text-xs text-white/40">View users and balances, add credits</div>
          </Link>

          <Link href="/admin/payments" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors border border-white/5">
            <div className="text-sm text-white/60">Payments</div>
            <div className="mt-1 text-lg font-semibold">Razorpay payments</div>
            <div className="mt-2 text-xs text-white/40">Track captured payments and statuses</div>
          </Link>

          <Link href="/admin/logs" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors border border-white/5">
            <div className="text-sm text-white/60">Logs</div>
            <div className="mt-1 text-lg font-semibold">Tool activity</div>
            <div className="mt-2 text-xs text-white/40">Recent previews/downloads and credit charges</div>
          </Link>

          <Link href="/admin/pricing" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors border border-white/5">
            <div className="text-sm text-white/60">Tools</div>
            <div className="mt-1 text-lg font-semibold">Tool pricing</div>
            <div className="mt-2 text-xs text-white/40">Set download credits and availability</div>
          </Link>

          <Link href="/admin/settings" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors border border-white/5">
            <div className="text-sm text-white/60">Settings</div>
            <div className="mt-1 text-lg font-semibold">Credits rate</div>
            <div className="mt-2 text-xs text-white/40">Configure credits per ₹1 conversion</div>
          </Link>
        </div>
      </div>
    </main>
  )
}
