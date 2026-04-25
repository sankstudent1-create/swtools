'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Search,
  Filter,
  Eye,
  Wallet,
  Calendar,
  User as UserIcon
} from 'lucide-react'

type TopupRequest = {
  id: string
  user_id: string
  amount_inr: number
  credits_requested: number
  utr: string
  screenshot_path: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles: {
    email: string
    full_name: string | null
  }
}

export default function AdminTopupRequestsPage() {
  const [requests, setRequests] = useState<TopupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [search, setSearch] = useState('')

  async function loadRequests() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/topup-requests')
      const j = await res.json()
      if (res.ok) {
        setRequests(j.requests || [])
      } else {
        setError(j.error || 'Failed to load requests')
      }
    } catch (e) {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return
    
    setBusyId(requestId)
    try {
      const res = await fetch('/api/admin/topup-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action })
      })
      const j = await res.json()
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r))
      } else {
        alert(j.error || 'Action failed')
      }
    } catch (e) {
      alert('Action failed')
    } finally {
      setBusyId(null)
    }
  }

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter
    const matchesSearch = r.utr.toLowerCase().includes(search.toLowerCase()) || 
                         r.profiles.email.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    }
  }

  return (
    <main className="min-h-screen px-6 py-24 bg-[#07090f] text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group mb-4"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Topup Requests
            </h1>
            <p className="text-white/40 mt-2 font-medium">Verify UPI payments and approve wallet credits</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64"
                placeholder="Search UTR or Email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              value={filter}
              onChange={(e: any) => setFilter(e.target.value)}
            >
              <option value="all" className="bg-[#0f1117]">All Status</option>
              <option value="pending" className="bg-[#0f1117]">Pending</option>
              <option value="approved" className="bg-[#0f1117]">Approved</option>
              <option value="rejected" className="bg-[#0f1117]">Rejected</option>
            </select>
            <button 
              onClick={loadRequests}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Clock className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {loading && requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="text-white/40 animate-pulse font-medium">Fetching requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-32 rounded-3xl border-2 border-dashed border-white/5">
            <Filter className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-medium">No requests found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <div 
                key={request.id}
                className="ui-modal-shell p-6 group transition-all duration-300 hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-blue-400 font-bold">
                      {request.profiles.full_name?.[0] || request.profiles.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {request.profiles.full_name || 'Anonymous User'}
                      </h3>
                      <p className="text-xs text-white/40 font-mono">{request.profiles.email}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="block text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Amount</span>
                    <span className="text-xl font-bold text-emerald-400">₹{request.amount_inr}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="block text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Credits</span>
                    <span className="text-xl font-bold text-blue-400">+{request.credits_requested}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 uppercase font-bold tracking-tighter">
                      <Search className="w-3.5 h-3.5" />
                      UTR
                    </div>
                    <span className="font-mono text-white/80 select-all">{request.utr}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2 text-white/40 uppercase font-bold tracking-tighter">
                      <Calendar className="w-3.5 h-3.5" />
                      Date
                    </div>
                    <span className="text-white/60">{new Date(request.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {request.screenshot_path && (
                    <button 
                      className="ui-btn-secondary py-2 px-4 text-xs flex items-center gap-2"
                      onClick={() => {
                        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/topup-screenshots/${request.screenshot_path}`
                        window.open(url, '_blank')
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      View Screenshot
                    </button>
                  )}
                  
                  {request.status === 'pending' && (
                    <>
                      <button 
                        className="ui-btn-primary bg-emerald-500 hover:bg-emerald-600 border-emerald-500/50 py-2 px-4 text-xs flex items-center gap-2 ml-auto"
                        disabled={!!busyId}
                        onClick={() => handleAction(request.id, 'approve')}
                      >
                        {busyId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Approve
                      </button>
                      <button 
                        className="ui-btn-secondary border-red-500/30 text-red-400 hover:bg-red-500/5 py-2 px-4 text-xs flex items-center gap-2"
                        disabled={!!busyId}
                        onClick={() => handleAction(request.id, 'reject')}
                      >
                        {busyId === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
