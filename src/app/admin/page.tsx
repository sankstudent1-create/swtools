import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { Users, CreditCard, Activity, Tag, Settings, ArrowUpRight, ChevronRight, LayoutDashboard, FileCheck, MessageSquare } from 'lucide-react'

export default async function AdminPage() {
  const { isAdmin } = await requireAdmin()

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#07090f]">
        <div className="w-full max-w-md ui-modal-shell p-8 text-center border-red-500/20 bg-red-500/5">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-white/60">You do not have administrative privileges to view this area.</p>
          <div className="mt-8">
            <Link className="ui-btn-secondary w-full" href="/dashboard">Return to Dashboard</Link>
          </div>
        </div>
      </main>
    )
  }

  let stats = {
    users: 0,
    payments: 0,
    toolRuns: 0,
    totalRevenue: 0
  }
  let statsError: string | null = null

  try {
    const admin = createSupabaseAdminClient()

    const [usersRes, payRes, runsRes, revenueRes] = await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin.from('razorpay_payments').select('id', { count: 'exact', head: true }),
      admin.from('tool_runs').select('id', { count: 'exact', head: true }),
      admin.from('razorpay_payments').select('amount_paise')
    ])

    stats.users = usersRes.count ?? 0
    stats.payments = payRes.count ?? 0
    stats.toolRuns = runsRes.count ?? 0
    
    if (revenueRes.data) {
      stats.totalRevenue = revenueRes.data.reduce((acc, curr) => acc + (curr.amount_paise || 0), 0) / 100
    }
  } catch (e) {
    statsError = e instanceof Error ? e.message : 'Failed to load admin stats'
  }

  const navCards = [
    {
      title: 'User Management',
      desc: 'View users, monitor balances, and manually add credits.',
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      title: 'Payment History',
      desc: 'Track Razorpay orders, captured payments and revenue.',
      href: '/admin/payments',
      icon: CreditCard,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      title: 'Topup Verifications',
      desc: 'Review UPI topup requests, run OCR, and approve credits.',
      href: '/admin/topup-requests',
      icon: FileCheck,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20'
    },
    {
      title: 'Contact Messages',
      desc: 'View and reply to contact form submissions.',
      href: '/admin/contact-messages',
      icon: MessageSquare,
      color: 'text-fuchsia-400',
      bg: 'bg-fuchsia-500/10',
      border: 'border-fuchsia-500/20'
    },
    {
      title: 'Activity Logs',
      desc: 'Monitor tool usage, downloads and system events.',
      href: '/admin/logs',
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      title: 'Tool Pricing',
      desc: 'Configure credit costs and tool availability status.',
      href: '/admin/pricing',
      icon: Tag,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      title: 'Blog Management',
      desc: 'Create and manage blog posts, categories, and comments.',
      href: '/admin/blog3',
      icon: LayoutDashboard,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      title: 'System Settings',
      desc: 'Adjust global conversion rates and configurations.',
      href: '/admin/settings',
      icon: Settings,
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/20'
    }
  ]

  return (
    <main className="min-h-screen px-4 py-24 bg-[#07090f] selection:bg-purple-500/30">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="relative mb-12">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <LayoutDashboard className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">Management Console</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white">
                Admin <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent italic">Panel</span>
              </h1>
              <p className="text-white/40 mt-3 text-lg max-w-xl leading-relaxed">
                Complete control over users, financial transactions, and tool configurations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/tools" className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-medium transition-all hover:bg-white/10 hover:text-white">
                Visit Site
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {statsError && (
          <div className="mb-10 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {statsError}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-400' },
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: CreditCard, color: 'text-emerald-400' },
            { label: 'Active Runs', value: stats.toolRuns, icon: Activity, color: 'text-amber-400' },
            { label: 'Payments', value: stats.payments, icon: ChevronRight, color: 'text-purple-400' }
          ].map((stat, i) => (
            <div key={i} className="group relative p-8 rounded-3xl ui-modal-shell border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden transition-all hover:border-white/10 hover:shadow-2xl hover:shadow-purple-500/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <stat.icon className="w-12 h-12" />
              </div>
              <div className="text-sm font-medium text-white/40 mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navCards.map((card, i) => (
            <Link 
              key={i} 
              href={card.href} 
              className={`group relative p-8 rounded-[2.5rem] ui-modal-shell border-white/5 bg-white/[0.02] transition-all duration-500 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${card.bg}`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${card.bg} border ${card.border} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {card.title}
                  <ChevronRight className="w-4 h-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </h3>
                <p className="text-white/40 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
