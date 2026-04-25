import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import AddCreditsButton from './AddCreditsButton'

export default async function AdminUsersPage() {
  const { isAdmin, supabase } = await requireAdmin()
  if (!isAdmin) return null

  // Fetch users with their wallet balance
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, wallets(balance_credits)')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Link className="ui-btn-secondary" href="/admin">Back</Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.05]">
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {profiles?.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.email}</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`rounded px-2 py-0.5 text-xs ${p.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-white/10 text-white/60'}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-mono">{p.wallets?.[0]?.balance_credits ?? 0}</span>
                      <AddCreditsButton userId={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
