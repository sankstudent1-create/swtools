import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'

export default async function AdminPaymentsPage() {
  const { isAdmin, supabase } = await requireAdmin()
  if (!isAdmin) return null

  // Fetch payments
  const { data: payments } = await supabase
    .from('razorpay_payments')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Payments</h1>
          <Link className="ui-btn-secondary" href="/admin">Back</Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.05]">
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments?.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/60 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {p.profiles?.email || p.user_id}
                  </td>
                  <td className="px-4 py-3 text-white/60 font-mono text-xs">
                    {p.razorpay_order_id}
                  </td>
                  <td className="px-4 py-3">
                    ₹{p.amount_paise / 100}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400 capitalize">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!payments?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                    No payments found.
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
