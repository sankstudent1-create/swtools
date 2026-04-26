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
  Scan,
  FileText,
  Upload,
  AlertTriangle,
  X,
  ScanLine,
  Maximize2,
  Edit3,
  Save
} from 'lucide-react'
import Tesseract from 'tesseract.js'

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
  const [activeTab, setActiveTab] = useState<'requests' | 'csv'>('requests')

  const [ocrBusyId, setOcrBusyId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(null)
  const [manualUtr, setManualUtr] = useState('')
  const [isOcrRunning, setIsOcrRunning] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)

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
        // Improved Amount Detection:
        // 1. Skip columns that match date patterns (e.g. 26/04/2026, 2026-04-26)
        // 2. Look for columns with decimal points (e.g. 199.00)
        // 3. Fallback to first positive number that isn't the UTR
        let amount = 0
        
        // Priority 1: Columns with decimal points that aren't dates or UTR
        for (const col of cols) {
          if (col === utr) continue
          if (col.includes('/') || col.includes('-')) continue // Likely a date
          
          const cleanCol = col.replace(/[^\d.]/g, '')
          if (cleanCol.includes('.')) {
            const val = parseFloat(cleanCol)
            if (!isNaN(val) && val > 0 && val < 1000000) { // Safety cap
              amount = val
              break
            }
          }
        }
        
        // Priority 2: Any positive number if amount still 0
        if (amount === 0) {
          for (const col of cols) {
            const cleanCol = col.replace(/[^\d.]/g, '')
            if (cleanCol === utr) continue
            if (col.includes('/') || col.includes('-')) continue
            
            const val = parseFloat(cleanCol)
            if (!isNaN(val) && val > 0 && val < 1000000) {
              amount = val
              break
            }
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

  const runClientSideOCR = async (imageUrl: string) => {
    setIsOcrRunning(true)
    setOcrProgress(0)
    try {
      const result = await Tesseract.recognize(
        imageUrl,
        'eng',
        { 
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100))
            }
          }
        }
      )
      
      const text = result.data.text
      const utrPatterns = [
        /UTR\D*(\d{12})/i,
        /Transaction\s*ID\D*(\d{12})/i,
        /Ref\D*(\d{12})/i,
        /\b\d{12}\b/
      ]

      let detected = null
      for (const pattern of utrPatterns) {
        const match = text.match(pattern)
        if (match) {
          detected = match[1] || match[0]
          break
        }
      }

      if (detected) {
        setManualUtr(detected)
      } else {
        alert('Could not find 12-digit UTR automatically. Please enter it manually.')
      }
    } catch (err: any) {
      console.error('Client OCR Error:', err)
      alert('OCR failed to start. Please enter UTR manually.')
    } finally {
      setIsOcrRunning(false)
    }
  }

  const saveManualUtr = async () => {
    if (!selectedRequest || !manualUtr.trim()) return
    setBusyId(selectedRequest.id)
    try {
      const res = await fetch('/api/admin/topup-requests/update-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: selectedRequest.id, utr: manualUtr.trim() })
      })
      if (res.ok) {
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, utr: manualUtr.trim() } : r))
        setSelectedRequest(prev => prev ? { ...prev, utr: manualUtr.trim() } : null)
        alert('UTR updated successfully')
      } else {
        const j = await res.json()
        alert(j.error || 'Failed to update UTR')
      }
    } catch (err) {
      alert('Update failed')
    } finally {
      setBusyId(null)
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

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter
    const searchLower = search.toLowerCase()
    const matchesSearch = !search || 
      request.utr?.toLowerCase().includes(searchLower) || 
      request.profiles?.email?.toLowerCase().includes(searchLower) ||
      request.profiles?.full_name?.toLowerCase().includes(searchLower)
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 mb-12 border-b border-white/5 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-white mb-2 italic uppercase leading-none">
                Manual Topup <span className="text-blue-500">Verification</span>
              </h1>
              <p className="text-white/40 text-sm font-medium tracking-tight">
                Manage and verify manual credit topup requests.
              </p>
            </div>

            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-xs font-bold text-white/30 hover:text-white transition-all uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/5"
            >
              <ArrowLeft className="w-3 h-3" />
              Admin Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-fit">
            <button 
              onClick={() => setActiveTab('requests')}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-blue-500 text-white shadow-2xl shadow-blue-500/40 scale-105' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
            >
              Requests List
            </button>
            <button 
              onClick={() => setActiveTab('csv')}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'csv' ? 'bg-blue-500 text-white shadow-2xl shadow-blue-500/40 scale-105' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
            >
              CSV Verification
            </button>
          </div>
        </div>

        {activeTab === 'csv' ? (
          <div className="mb-12 p-8 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-xl relative overflow-hidden group">
            {/* CSV Module Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">Bulk CSV Matcher</h2>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-4">
                <label className="flex-1 w-full group/label">
                  <div className="relative cursor-pointer py-4 px-6 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 group-hover/label:border-blue-500/50 group-hover/label:bg-blue-500/5 transition-all flex items-center justify-center gap-3">
                    <Upload className="w-5 h-5 text-white/30 group-hover/label:text-blue-500 transition-colors" />
                    <span className="text-sm font-bold text-white/40 group-hover/label:text-white transition-colors">
                      {csvBusy ? 'Uploading...' : 'Drop bank CSV here or click to browse'}
                    </span>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) handleCsvUpload(f)
                      }}
                      disabled={csvBusy}
                    />
                  </div>
                </label>
                <button
                  type="button"
                  className="ui-btn-primary px-8 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap h-full"
                  onClick={approveCsvMatches}
                  disabled={csvBusy || csvMatches.filter(m => m.amountMatch || m.isEditing).length === 0}
                >
                  {csvBusy ? 'Processing...' : `Approve Valid Matches (${csvMatches.filter(m => m.amountMatch || m.isEditing).length})`}
                </button>
              </div>

              {csvMsg && (
                <div className={`mt-4 p-4 rounded-xl border text-xs font-bold flex items-center gap-3 ${csvMsg.includes('WARNING') ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                  {csvMsg.includes('WARNING') ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  {csvMsg}
                </div>
              )}

              {csvMatches.length > 0 && (
                <div className="mt-8 border-t border-white/5 pt-8">
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Verification Analysis</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {csvMatches.map((m, i) => (
                      <div key={i} className={`flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border transition-all hover:bg-white/10 ${m.amountMatch ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <div className="font-mono text-xs font-bold text-white/80">{m.utr}</div>
                          {m.amountMatch ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase">Verified</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-tighter">Amount Error</span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-white/30">User Claimed</span>
                            <span className="text-white">₹{m.dbAmount}</span>
                          </div>
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-white/30">Bank Statement</span>
                            <span className={`font-black ${m.amountMatch ? 'text-emerald-400' : 'text-red-400'}`}>₹{m.csvAmount}</span>
                          </div>
                        </div>

                        {!m.amountMatch && (
                          <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-white/30 uppercase font-black">Correct To:</span>
                              <input 
                                type="number"
                                className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 w-full text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                defaultValue={m.csvAmount}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  setCsvMatches(prev => prev.map((item, idx) => 
                                    idx === i ? { ...item, newAmount: val, isEditing: true } : item
                                  ))
                                }}
                              />
                            </div>
                            <button 
                              onClick={() => {
                                setCsvMatches(prev => prev.map((item, idx) => 
                                  idx === i ? { ...item, isEditing: true, newAmount: m.csvAmount } : item
                                ))
                              }}
                              className="w-full py-2 rounded-lg bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all"
                            >
                              Apply Bank Amount
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black shadow-xl shadow-white/10' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search UTR, Email, Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all placeholder:text-white/20 font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black uppercase italic">Error Detected</div>
                  <div className="text-xs text-red-400/70 font-medium">{error}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {filteredRequests.map(request => (
                <div key={request.id} className="group p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          request.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                          request.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                          {request.status}
                        </div>
                        <span className="text-white/20 text-xs font-bold tracking-widest uppercase">
                          {new Date(request.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">User Details</div>
                          <div className="text-sm font-bold text-white truncate">{request.profiles?.email}</div>
                          <div className="text-xs font-medium text-white/40">{request.profiles?.full_name || 'Anonymous User'}</div>
                        </div>
                        
                        <div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">UTR Number</div>
                          <div className={`font-mono text-sm font-bold ${request.utr?.startsWith('pending_ocr') ? 'text-amber-500 italic' : 'text-white'}`}>
                            {request.utr}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Amount</div>
                          <div className="text-xl font-black italic tracking-tight text-white">
                            ₹{request.amount_inr}
                          </div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                            {request.credits_requested} Credits
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:min-w-[400px] justify-end">
                      {request.screenshot_path && (
                        <div className="flex gap-2">
                          <button 
                            className="ui-btn-secondary py-3 px-6 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-all border border-white/10"
                            onClick={() => {
                              setSelectedRequest(request)
                              setManualUtr(request.utr?.startsWith('pending_ocr') ? '' : request.utr)
                            }}
                          >
                            <Maximize2 className="w-4 h-4 text-blue-400" />
                            Verify Proof
                          </button>
                        </div>
                      )}
                      
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(request.id, 'reject')}
                            disabled={busyId === request.id}
                            className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 disabled:opacity-50"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'approve')}
                            disabled={busyId === request.id}
                            className="py-3 px-8 rounded-xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {busyId === request.id ? '...' : 'Approve'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredRequests.length === 0 && !loading && (
                <div className="py-20 text-center rounded-[3rem] bg-white/[0.02] border border-dashed border-white/10">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Search className="w-8 h-8 text-white/10" />
                  </div>
                  <div className="text-xl font-black text-white/40 italic uppercase italic tracking-tighter">No requests found</div>
                  <p className="text-sm text-white/20 font-medium">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* PROOF VERIFICATION MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-blue-500/10">
            {/* Left: Image Viewer */}
            <div className="flex-1 bg-black/40 relative group flex items-center justify-center p-4 overflow-auto">
              <img 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/manual-topup-proofs/${selectedRequest.screenshot_path}`}
                alt="Payment Proof"
                className="max-w-full h-auto rounded-xl shadow-2xl"
              />
              <button 
                onClick={() => setSelectedRequest(null)}
                className="absolute top-6 left-6 p-3 rounded-full bg-black/60 text-white/60 hover:text-white hover:bg-black transition-all border border-white/5"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Controls */}
            <div className="w-full md:w-[400px] border-l border-white/10 p-8 flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Edit3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tight">Verify Details</h3>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Manual Correction</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">User Email</label>
                    <div className="text-sm font-bold text-white bg-white/5 p-4 rounded-2xl border border-white/5 truncate">
                      {selectedRequest.profiles?.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">Amount & Credits</label>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black italic text-white">₹{selectedRequest.amount_inr}</span>
                      <span className="text-xs font-bold text-white/40 uppercase tracking-tighter">/ {selectedRequest.credits_requested} Credits</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3">UTR Number (Edit if needed)</label>
                    <div className="relative group">
                      <input 
                        type="text"
                        value={manualUtr}
                        onChange={(e) => setManualUtr(e.target.value)}
                        placeholder="Enter 12-digit UTR"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-sm font-mono font-bold focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
                      />
                      <button 
                        onClick={() => runClientSideOCR(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/manual-topup-proofs/${selectedRequest.screenshot_path}`)}
                        disabled={isOcrRunning}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                        title="Run Client-Side OCR"
                      >
                        {isOcrRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                      </button>
                    </div>
                    {isOcrRunning && (
                      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-8 border-t border-white/5">
                <button 
                  onClick={saveManualUtr}
                  disabled={!!busyId || !manualUtr || manualUtr === selectedRequest.utr}
                  className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {busyId === selectedRequest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save UTR Correction
                </button>

                {selectedRequest.status === 'pending' && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        handleAction(selectedRequest.id, 'reject')
                        setSelectedRequest(null)
                      }}
                      className="py-4 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-[10px] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedRequest.id, 'approve')
                        setSelectedRequest(null)
                      }}
                      className="py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Approve
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="w-full py-4 rounded-2xl bg-white/5 text-white/40 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
