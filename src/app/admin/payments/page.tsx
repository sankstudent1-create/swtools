import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { CreditCard, ArrowLeft, Search, Calendar, User, Zap, Mail, ChevronRight, IndianRupee, Clock } from 'lucide-react'

export default async function AdminPaymentsPage() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return null

  let payments: any[] | null = null
  let loadError: string | null = null
  try {
    const admin = createSupabaseAdminClient()
    const { data, error } = await admin
      .from('razorpay_payments')
      .select('*, profiles!razorpay_payments_user_id_fkey(email)')
      .order('created_at', { ascending: false })

    if (error) {
      loadError = error.message
    } else {
      payments = data
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Failed to load'
  }

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f] selection:bg-emerald-500/30">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-4 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
              <CreditCard className="w-10 h-10 text-emerald-400" />
              Payment <span className="text-emerald-400/50 italic">History</span>
            </h1>
            <p className="text-white/40 max-w-md">Comprehensive overview of all Razorpay transactions and credit top-ups.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              Secured by Razorpay
            </div>
          </div>
        </div>

        {loadError && (
          <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {loadError}
          </div>
        )}

        {/* Payments Grid/List */}
        <div className="grid gap-4">
          {payments?.map((p: any) => (
            <div key={p.id} className="group relative p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm transition-all hover:bg-white/[0.03] hover:border-white/10 hover:shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                    <IndianRupee className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-bold text-lg">
                        ₹{(p.amount_paise / 100).toLocaleString('en-IN')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                        p.status === 'captured' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                      <User className="w-3.5 h-3.5 text-white/20" />
                      {p.profiles?.email || 'Unknown User'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 lg:text-right">
                  <div className="min-w-[140px]">
                    <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1 lg:text-right">Order ID</div>
                    <div className="text-xs font-mono text-white/50 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      {p.razorpay_order_id}
                    </div>
                  </div>
                  
                  <div className="w-px h-10 bg-white/5 hidden lg:block" />
                  
                  <div>
                    <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest mb-1 lg:text-right">Transaction Time</div>
                    <div className="flex items-center gap-2 text-sm text-white/60 font-medium whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(p.created_at).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex">
                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!payments?.length && (
            <div className="p-24 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-white/10" />
              </div>
              <div className="text-white/40 font-medium text-lg italic">No financial records found in the vault.</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
