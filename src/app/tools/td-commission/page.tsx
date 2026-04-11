'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import type { EntryRow, OfficeDetails, TermKey } from '@/types/td-commission'
import { numToWords, formatINR, buildPDFDoc, lsGet, RATES } from '@/lib/td-commission/pdf'
import { useLS } from '@/hooks/useLS'
import AutocompleteInput from '@/components/td-commission/AutocompleteInput'
import EntryRowComponent from '@/components/td-commission/EntryRow'
import PreviewModal from '@/components/td-commission/PreviewModal'
import { Calculator, Download, Eye, Printer, Plus, Save, Building2, MapPin, Building, RotateCcw } from 'lucide-react'

const MAX_ROWS = 19

function nowYM() {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`
}
function nowDate() { return new Date().toISOString().split('T')[0] }

let idSeq = 0

export default function TDCommissionPage() {
  const { add, getFirst } = useLS()

  const [office, setOffice] = useState<OfficeDetails>({
    bo: '', so: '', ho: '',
    month: nowYM(),
    dated: nowDate(),
  })

  const [rows, setRows] = useState<EntryRow[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setOffice(prev => ({
      ...prev,
      bo: getFirst('bo') || prev.bo,
      so: getFirst('so') || prev.so,
      ho: getFirst('ho') || prev.ho,
    }))
    setRows(Array.from({ length: 5 }, () => ({
      id: ++idSeq, acc: '', pr: '', name: '', dep: '', term: '', rate: '', inc: '',
    })))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flash = () => {
    setSavedFlash(true)
    if (savedTimer.current) clearTimeout(savedTimer.current)
    savedTimer.current = setTimeout(() => setSavedFlash(false), 2000)
  }

  const setOff = (key: keyof OfficeDetails, val: string) => {
    setOffice(prev => ({ ...prev, [key]: val }))
    if (['bo', 'so', 'ho'].includes(key) && val.trim()) { add(key, val.trim()); flash() }
  }

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return
    setRows(prev => [...prev, { id: ++idSeq, acc: '', pr: '', name: '', dep: '', term: '', rate: '', inc: '' }])
  }

  const deleteRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id))

  const changeRow = useCallback((id: number, field: keyof EntryRow, value: string) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r
      const updated = { ...r, [field]: value }
      if (field === 'dep' || field === 'rate') {
        const dep = parseFloat(field === 'dep' ? value : r.dep) || 0
        const rate = parseFloat(field === 'rate' ? value : r.rate) || 0
        updated.inc = dep > 0 && rate > 0 ? (dep * rate / 100).toFixed(2) : ''
      }
      return updated
    }))
  }, [])

  const totalDep = rows.reduce((s, r) => s + (parseFloat(r.dep) || 0), 0)
  const totalInc = rows.reduce((s, r) => s + (parseFloat(r.inc) || 0), 0)
  const filledCount = rows.filter(r => r.name || r.acc).length
  const inWords = totalInc > 0 ? numToWords(totalInc) : '—'

  const saveOffice = () => {
    (['bo', 'so', 'ho'] as const).forEach(k => {
      if (office[k]) { add(k, office[k]); flash() }
    })
  }

  const getPDF = async () => { saveOffice(); return buildPDFDoc(office, rows) }

  const handlePreview = async () => {
    const doc = await getPDF()
    const blob = doc.output('blob')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(blob))
  }

  const handleDownload = async () => {
    const doc = await getPDF()
    const mDisp = office.month
      ? new Date(office.month + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })
      : ''
    doc.save(`TD_Commission_${(office.bo || 'BO').replace(/\s+/g, '_')}_${mDisp.replace(/\s+/g, '_')}.pdf`)
  }

  const handlePrint = async () => {
    const doc = await getPDF()
    const url = URL.createObjectURL(doc.output('blob'))
    const w = window.open(url, '_blank')
    if (w) w.onload = () => { w.focus(); w.print() }
    else alert('Allow popups to use Print.')
  }

  const clearAll = () => {
    if (!confirm('Clear all entries?')) return
    setRows(Array.from({ length: 5 }, () => ({
      id: ++idSeq, acc: '', pr: '', name: '', dep: '', term: '', rate: '', inc: '',
    })))
    setOffice(prev => ({ ...prev, bo: '', so: '', ho: '' }))
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 relative overflow-x-hidden font-outfit">

      {/* GLASSMORPHISM BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/10 blur-[130px] mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-cyan-600/10 blur-[140px] mix-blend-screen"></div>
      </div>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3">
          <Link href="/tools" className="text-white/40 hover:text-white transition-colors mr-2 hidden sm:block">
             ← <span className="text-xs">Tools</span>
          </Link>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-semibold text-[13px] leading-tight">TD Commission</div>
            <div className="text-white/40 text-[9px] uppercase tracking-[0.15em] mt-0.5">BPM Incentive Bill</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {savedFlash && (
            <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wider animate-in fade-in zoom-in duration-300">
              <Save className="w-3 h-3" /> Saved
            </span>
          )}
          <span className="text-[9px] font-semibold px-3 py-1.5 rounded-lg border uppercase tracking-[0.1em] bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hidden sm:block">
            India Post Utility
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32 relative z-10">
        
        {/* ── INTRO ── */}
        <div className="relative rounded-2xl p-6 mb-6 overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-md">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight mb-1.5 flex items-center gap-2">
                Time Deposit Commission
              </h1>
              <p className="text-white/50 text-[13px] font-light max-w-lg">
                Generate official BPM Incentive Bills with automated interest calculations, precise tabular formatting, and instant PDF exports.
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6 w-full md:w-auto">
              {[
                { val: String(filledCount), lbl: 'Active Entries' },
                { val: totalDep > 0 ? Math.round(totalDep).toLocaleString('en-IN') : '0', lbl: 'Total Deposit (₹)' },
                { val: totalInc > 0 ? Math.round(totalInc).toLocaleString('en-IN') : '0', lbl: 'Net Incentive (₹)' },
              ].map(s => (
                <div key={s.lbl} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1 md:min-w-[120px] text-center">
                  <div className="text-[17px] font-bold font-mono text-emerald-400">{s.val}</div>
                  <div className="text-[9px] uppercase tracking-[0.15em] text-white/40 mt-1">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── OFFICE DETAILS ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md mb-6 overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/5 bg-white/[0.01]">
            <Building className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/80">Office Designation</span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { id: 'bo', lsKey: 'bo', label: 'Branch Office', icon: '🏤', placeholder: 'e.g. Songaon' },
              { id: 'so', lsKey: 'so', label: 'Sub Office', icon: '🏢', placeholder: 'e.g. Pendgaon' },
              { id: 'ho', lsKey: 'ho', label: 'Head Office', icon: '🏛', placeholder: 'e.g. Latur' },
            ].map(f => (
              <div key={f.id} className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.1em] flex justify-between items-center">
                  {f.label} 
                  {office[f.id as keyof OfficeDetails] && <span className="text-emerald-500/70 not-uppercase tracking-normal text-[8.5px] font-medium flex items-center gap-1"><Save className="w-2.5 h-2.5"/> auto-saved</span>}
                </label>
                <AutocompleteInput
                  id={f.id}
                  lsKey={f.lsKey}
                  value={office[f.id as keyof OfficeDetails]}
                  onChange={v => setOff(f.id as keyof OfficeDetails, v)}
                  placeholder={f.placeholder}
                  icon={f.icon}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] w-full text-white placeholder-white/20 focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                />
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.1em]">
                Billing Month
              </label>
              <input type="month" value={office.month}
                onChange={e => setOff('month', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] w-full text-white [color-scheme:dark] focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.1em]">
                Submission Date
              </label>
              <input type="date" value={office.dated}
                onChange={e => setOff('dated', e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] w-full text-white [color-scheme:dark] focus:border-emerald-500/50 focus:bg-white/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" />
            </div>
          </div>
        </div>

        {/* ── ENTRIES ── */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/5 bg-white/[0.01]">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/80">Account Ledger</span>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {[['1 Yr','0.5%'],['2 Yr','1.0%'],['3 Yr','1.0%'],['5 Yr','2.0%']].map(([t,r]) => (
                <span key={t} className="text-[10px] font-semibold px-3 py-1.5 rounded-lg border font-mono bg-white/5 border-white/10 text-white/70">
                  {t} <span className="text-white/30 mx-1">→</span> <span className="text-emerald-400">{r}</span>
                </span>
              ))}
              <span className="text-[10px] px-3 py-1.5 rounded-lg border bg-emerald-500/5 flex items-center gap-1.5 border-emerald-500/20 text-emerald-400/80">
                <Calculator className="w-3 h-3" /> Auto-calculated on Term selection
              </span>
            </div>

            <div className="overflow-x-auto -mx-6 px-6 pb-2">
              <table className="w-full text-left border-separate border-spacing-y-2 min-w-[850px]">
                <thead>
                  <tr>
                    {['SR','Account No.','PR No.','Depositor Name','Deposit (₹)','Term','Rate','Incentive (₹)',''].map((h, i) => (
                      <th key={i}
                        className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/40 whitespace-nowrap bg-transparent first:rounded-l-xl last:rounded-r-xl">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {rows.map((row, i) => (
                    <EntryRowComponent key={row.id} row={row} index={i} onChange={changeRow} onDelete={deleteRow} />
                  ))}
                  {/* Totals Row */}
                  <tr className="group">
                    <td colSpan={4} className="bg-white/5 border border-white/5 px-4 py-3 rounded-l-xl text-right text-[11px] font-bold uppercase tracking-[0.15em] text-white/60">
                      Grand Total
                    </td>
                    <td className="bg-white/5 border-y border-white/5 px-3 py-3 text-right font-mono text-[14px] font-bold text-white">
                      {formatINR(totalDep)}
                    </td>
                    <td colSpan={2} className="bg-white/5 border-y border-white/5 px-3 py-3 text-right">
                       <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-400/60">Total Incentive →</span>
                    </td>
                    <td className="bg-emerald-500/10 border-y border-emerald-500/20 text-emerald-400 px-3 py-3 text-right font-mono text-[14px] font-bold shadow-[inset_0_0_12px_rgba(16,185,129,0.1)]">
                      {formatINR(totalInc)}
                    </td>
                    <td className="bg-white/5 border border-white/5 rounded-r-xl"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <button
                onClick={addRow}
                disabled={rows.length >= MAX_ROWS}
                className="flex items-center gap-2 text-[12px] font-medium px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all disabled:opacity-30 disabled:hover:bg-transparent text-white"
              >
                <Plus className="w-4 h-4" /> Add Row
              </button>
              <span className="text-[11px] text-white/40">{rows.length} / {MAX_ROWS} rows used</span>
            </div>

            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.15em] mb-2">
                Total Incentive Amount (In Words)
              </div>
              <div className="text-[14px] italic text-emerald-300/90 font-serif leading-relaxed">
                {inWords}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── STICKY ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-3 justify-end flex-wrap px-6 py-4 border-t border-white/10 bg-[#050505]/80 backdrop-blur-xl">
        <button onClick={clearAll}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 font-medium text-[13px] hover:bg-white/10 hover:text-white transition-all mr-auto sm:mr-0">
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
        <button onClick={handlePreview}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 font-medium text-[13px] hover:bg-white/10 hover:text-white transition-all">
          <Eye className="w-4 h-4" />
          Preview Document
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/80 font-medium text-[13px] hover:bg-white/10 hover:text-white transition-all">
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-[13.5px] transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <PreviewModal blobUrl={previewUrl} onClose={() => { setPreviewUrl(null) }} />

    </div>
  )
}

