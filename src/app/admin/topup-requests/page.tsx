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
  User as UserIcon,
  Scan
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

  const [ocrBusyId, setOcrBusyId] = useState<string | null>(null)

  const [csvBusy, setCsvBusy] = useState(false)
  const [csvMsg, setCsvMsg] = useState<string | null>(null)
  const [csvMatches, setCsvMatches] = useState<{ 
    requestId: string; 
    utr: string; 
    csvAmount: number; 
    dbAmount: number; 
    amountMatch: boolean;
    isEditing?: boolean;
    newAmount?: number;
  }[]>([])

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

  const parseUtrFromText = (s: string) => {
    const m = s.match(/\b\d{12}\b/)
    return m ? m[0] : null
  }

  const handleCsvUpload = async (file: File) => {
    setCsvBusy(true)
    setCsvMsg(null)
    setCsvMatches([])
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

      // naive CSV parse: split by comma, search for first 12-digit number in row
      const utrRows: { utr: string; amount: number }[] = []
      for (const line of lines.slice(0, 5000)) {
        const utr = parseUtrFromText(line)
        if (!utr) continue
        
        const cols = line.split(',').map(c => c.trim())
        // Find something that looks like an amount (number with decimal or just digits)
        // Usually in banking CSVs, the amount is in a specific column.
        // We'll look for any column that parses to a positive number and isn't the UTR.
        let amount = 0
        for (const col of cols) {
          const cleanCol = col.replace(/[^\d.]/g, '')
          const val = parseFloat(cleanCol)
          if (!isNaN(val) && val > 0 && cleanCol !== utr) {
            amount = val
            break
          }
        }
        
        utrRows.push({ utr, amount })
      }

      if (utrRows.length === 0) {
        setCsvMsg('No UTRs found in CSV')
        return
      }

      const pendingByUtr = new Map(
        requests
          .filter(r => r.status === 'pending')
          .map(r => [String(r.utr || '').trim(), r])
      )

      const matches: { 
        requestId: string; 
        utr: string; 
        csvAmount: number; 
        dbAmount: number; 
        amountMatch: boolean 
      }[] = []

      for (const row of utrRows) {
        const req = pendingByUtr.get(row.utr)
        if (req) {
          const dbAmount = Number(req.amount_inr)
          const amountMatch = Math.abs(dbAmount - row.amount) < 0.01 // Handle float precision
          
          matches.push({ 
            requestId: req.id, 
            utr: row.utr, 
            csvAmount: row.amount, 
            dbAmount: dbAmount,
            amountMatch
          })
        }
      }

      setCsvMatches(matches)
      
      const exactMatches = matches.filter(m => m.amountMatch).length
      const mismatches = matches.length - exactMatches
      
      let msg = `Found ${matches.length} matching UTRs.`
      if (mismatches > 0) {
        msg += ` WARNING: ${mismatches} requests have AMOUNT MISMATCH (DB vs CSV).`
      } else {
        msg += ` All amounts match exactly.`
      }
      setCsvMsg(msg) 
    } catch (e: any) {
      setCsvMsg(`CSV read failed: ${e.message}`)
    } finally {
      setCsvBusy(false)
    }
  }

  const approveCsvMatches = async () => {
    // Filter for requests that either match exactly OR have been manually reviewed/edited
    const toProcess = csvMatches.filter(m => m.amountMatch || m.isEditing)
    if (toProcess.length === 0) {
      alert('No valid matches to approve.')
      return
    }
    
    if (!confirm(`Approve ${toProcess.length} requests? This will update the database with the CSV Amount (or edited amount) and Credits.`)) return

    setCsvBusy(true)
    setCsvMsg(null)
    try {
      for (const m of toProcess) {
        const finalAmount = m.newAmount !== undefined ? m.newAmount : m.csvAmount
        // 1. First update the request with the actual CSV amount and credits
        const updateRes = await fetch('/api/admin/topup-requests/update-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            request_id: m.requestId, 
            amount_inr: finalAmount,
            credits_requested: Math.floor(finalAmount * 1.0) 
          }),
        })

        if (!updateRes.ok) {
          console.error('[admin] Failed to update request details before approval', m.requestId)
        }

        // 2. Then approve
        const res = await fetch('/api/admin/topup-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: m.requestId, action: 'approve' }),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.error || 'Bulk approve failed')
        }
      }
      setCsvMsg('Approved matched requests')
      await loadRequests()
    } catch (e: any) {
      setCsvMsg(e?.message || 'Bulk approve failed')
    } finally {
      setCsvBusy(false)
    }
  }

  const runOCR = async (requestId: string, screenshotPath: string) => {
    setOcrBusyId(requestId)
    try {
      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/manual-topup-proofs/${screenshotPath}`
      const res = await fetch('/api/admin/topup-requests/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      })
      const j = await res.json()
      if (res.ok) {
        if (j.utr) {
          setRequests(prev => prev.map(r => r.id === requestId ? { ...r, utr: j.utr } : r))
          // Optionally update the DB with the detected UTR
          await fetch('/api/admin/topup-requests/update-utr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ request_id: requestId, utr: j.utr })
          })
          alert(`Success! Extracted UTR: ${j.utr}`)
        } else {
          alert('OCR completed but no 12-digit UTR was found in the text. You may need to manually enter the UTR.')
          console.warn('[admin] OCR found no UTR. Full text:', j.text)
        }
      } else {
        const errMsg = j.details || j.error || 'OCR service failed'
        alert(`OCR Failed: ${errMsg}`)
        console.error('[admin] OCR Error:', j)
      }
    } catch (e: any) {
      alert(`OCR request failed: ${e.message || 'Connection error'}`)
      console.error('[admin] OCR Fetch Exception:', e)
    } finally {
      setOcrBusyId(null)
    }
  }

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

        <div className="mb-8 ui-modal-shell p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-bold text-white">CSV Verification</div>
              <div className="text-xs text-white/40 mt-1">
                Upload a CSV that contains UTR numbers. We will match against pending requests and you can bulk approve.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="ui-btn-secondary px-4 py-2 text-xs inline-flex items-center gap-2 cursor-pointer">
                Upload CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleCsvUpload(f)
                  }}
                  disabled={csvBusy}
                />
              </label>
              <button
                type="button"
                className="ui-btn-primary px-4 py-2 text-xs"
                onClick={approveCsvMatches}
                disabled={csvBusy || csvMatches.filter(m => m.amountMatch).length === 0}
              >
                {csvBusy ? 'Working…' : `Approve Valid Matches (${csvMatches.filter(m => m.amountMatch).length})`}
              </button>
            </div>
          </div>

          {csvMsg ? (
            <div className={`mt-3 text-xs font-medium ${csvMsg.includes('WARNING') ? 'text-amber-400' : 'text-emerald-400'}`}>
              {csvMsg}
            </div>
          ) : null}

          {csvMatches.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Match Details</div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {csvMatches.map((m, i) => (
                  <div key={i} className={`flex flex-col gap-2 p-3 rounded bg-white/5 border ${m.amountMatch ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-[11px] text-white/70">{m.utr}</div>
                      <div className="flex items-center gap-2">
                        {m.amountMatch ? (
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Exact Match</span>
                        ) : (
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-tighter">Amount Mismatch</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                      <div className="text-white/40">User Claim: <span className="text-white font-bold ml-1">₹{m.dbAmount}</span></div>
                      <div className="text-white/40">Bank CSV: <span className={`font-bold ml-1 ${m.amountMatch ? 'text-emerald-400' : 'text-red-400'}`}>₹{m.csvAmount}</span></div>
                    </div>

                    {!m.amountMatch && (
                      <div className="flex items-center gap-2 mt-1 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-white/40">Update to:</span>
                        <input 
                          type="number"
                          className="bg-black/40 border border-white/10 rounded px-2 py-0.5 w-20 text-[11px] focus:outline-none focus:border-blue-500"
                          defaultValue={m.csvAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            setCsvMatches(prev => prev.map((item, idx) => 
                              idx === i ? { ...item, newAmount: val, isEditing: true } : item
                            ))
                          }}
                        />
                        <button 
                          onClick={() => {
                            setCsvMatches(prev => prev.map((item, idx) => 
                              idx === i ? { ...item, isEditing: true, newAmount: m.csvAmount } : item
                            ))
                          }}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Use CSV Amount
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                    <div className="flex items-center gap-2">
                        <span className={`font-mono select-all ${request.utr.startsWith('pending_ocr') ? 'text-amber-500 italic' : 'text-white/80'}`}>
                            {request.utr}
                        </span>
                        {request.screenshot_path && request.utr.startsWith('pending_ocr') && (
                            <button 
                                onClick={() => runOCR(request.id, request.screenshot_path!)}
                                disabled={!!ocrBusyId}
                                className="p-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 transition-colors"
                                title="Run OCR to find UTR"
                            >
                                {ocrBusyId === request.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scan className="w-3 h-3" />}
                            </button>
                        )}
                    </div>
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
                        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/manual-topup-proofs/${request.screenshot_path}`
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
