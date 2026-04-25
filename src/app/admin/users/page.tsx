import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import AddCreditsButton from './AddCreditsButton'
import { Users, ArrowLeft, Search, Mail, Shield, Wallet, Calendar } from 'lucide-react'

export default async function AdminUsersPage() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return null

  let profiles: any[] | null = null
  let loadError: string | null = null
  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .select('*, wallets!wallets_user_id_fkey(balance_credits)')
      .order('created_at', { ascending: false })

    if (error) {
      loadError = error.message
    } else {
      profiles = data
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Failed to load'
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
              <Users className="w-10 h-10 text-blue-400" />
              User Management
            </h1>
            <p className="text-white/40 max-w-md">Monitor user balances, roles, and manual credit adjustments.</p>
          </div>
          
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by email..." 
              className="ui-input pl-11 bg-white/[0.02] border-white/5 hover:border-white/10 focus:border-blue-500/50 transition-all rounded-2xl w-full"
            />
          </div>
        </div>

        {loadError && (
          <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {loadError}
          </div>
        )}

        {/* Users Table */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-xs font-bold text-white/30 uppercase tracking-[0.2em]">User Identity</th>
                  <th className="px-8 py-6 text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Permissions</th>
                  <th className="px-8 py-6 text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Account Status</th>
                  <th className="px-8 py-6 text-xs font-bold text-white/30 uppercase tracking-[0.2em] text-right">Credit Wallet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {profiles?.map((p: any) => (
                  <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center text-blue-400 font-bold text-lg shadow-inner">
                          {p.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-semibold flex items-center gap-2">
                            {p.email}
                            {p.role === 'admin' && <Shield className="w-3 h-3 text-purple-400" />}
                          </div>
                          <div className="text-xs text-white/30 flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3 h-3" />
                            Joined {new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        p.role === 'admin' 
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        {p.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-white/40 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-6">
                        <div className="text-right">
                          <div className="text-xl font-mono font-black text-white">{p.wallets?.[0]?.balance_credits ?? 0}</div>
                          <div className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">Available Credits</div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <AddCreditsButton userId={p.id} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {!profiles?.length && (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <Mail className="w-8 h-8 text-white/20" />
                        </div>
                        <div className="text-white/40 font-medium">No users discovered yet</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
