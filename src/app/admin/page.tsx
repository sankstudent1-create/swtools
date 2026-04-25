import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'

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

  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Link className="ui-btn-secondary" href="/dashboard">Back</Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/settings" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors">
            <div className="text-sm text-white/60">Settings</div>
            <div className="mt-1 text-lg font-semibold">Credits rate</div>
          </Link>

          <Link href="/admin/pricing" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors">
            <div className="text-sm text-white/60">Tools</div>
            <div className="mt-1 text-lg font-semibold">Tool pricing</div>
          </Link>

          <Link href="/admin/users" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors">
            <div className="text-sm text-white/60">Users</div>
            <div className="mt-1 text-lg font-semibold">User management</div>
          </Link>

          <Link href="/admin/payments" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors">
            <div className="text-sm text-white/60">Payments</div>
            <div className="mt-1 text-lg font-semibold">Recent payments</div>
          </Link>

          <Link href="/admin/logs" className="ui-modal-shell p-6 block hover:bg-white/[0.05] transition-colors">
            <div className="text-sm text-white/60">Logs</div>
            <div className="mt-1 text-lg font-semibold">Tool run logs</div>
          </Link>
        </div>
      </div>
    </main>
  )
}
