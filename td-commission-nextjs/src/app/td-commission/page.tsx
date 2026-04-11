'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { EntryRow, OfficeDetails, TermKey } from '@/types'
import { numToWords, formatINR, buildPDFDoc, lsGet, RATES } from '@/utils/pdf'
import { useLS } from '@/hooks/useLS'
import AutocompleteInput from '@/components/AutocompleteInput'
import EntryRowComponent from '@/components/EntryRow'
import PreviewModal from '@/components/PreviewModal'

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

  // Restore office from localStorage on mount
  useEffect(() => {
    setOffice(prev => ({
      ...prev,
      bo: getFirst('bo') || prev.bo,
      so: getFirst('so') || prev.so,
      ho: getFirst('ho') || prev.ho,
    }))
    // Seed 5 empty rows
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
      // recompute inc if dep or rate changed
      if (field === 'dep' || field === 'rate') {
        const dep = parseFloat(field === 'dep' ? value : r.dep) || 0
        const rate = parseFloat(field === 'rate' ? value : r.rate) || 0
        updated.inc = dep > 0 && rate > 0 ? (dep * rate / 100).toFixed(2) : ''
      }
      // if term changed, rate and inc updated by EntryRowComponent already
      return updated
    }))
  }, [])

  // Totals
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
    <div className="min-h-screen bg-[#eef0f4]">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-7 shadow-lg"
        style={{ background: '#1b2d4f' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm font-serif"
            style={{ background: 'linear-gradient(135deg,#c8973a,#a97a28)' }}>SW</div>
          <div>
            <div className="text-white font-bold text-sm leading-none">SW Info Systems</div>
            <div className="text-white/35 text-[10px] uppercase tracking-widest mt-0.5">Post Office Tools</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savedFlash && (
            <span className="text-green-400 text-xs font-semibold flex items-center gap-1">✓ Saved</span>
          )}
          <span className="text-[10px] font-semibold px-3 py-1 rounded-full border uppercase tracking-wide"
            style={{ background: 'rgba(200,151,58,.16)', borderColor: 'rgba(200,151,58,.38)', color: '#c8973a' }}>
            TD Commission · BPM Incentive Bill
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-7 pb-24">

        {/* ── INTRO ── */}
        <div className="relative rounded-xl p-6 mb-5 overflow-hidden border border-white/6"
          style={{ background: 'linear-gradient(120deg,#1b2d4f,#22386a)' }}>
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-5xl opacity-[0.07]">📮</span>
          <div className="flex items-center justify-between gap-5">
            <div>
              <h1 className="font-serif text-white text-xl font-bold mb-1">BPM Incentive Bill Generator</h1>
              <p className="text-white/45 text-[13px] font-light">
                Fill office details & entries — PDF auto-generated matching the official form
              </p>
            </div>
            <div className="hidden sm:flex gap-6">
              {[
                { val: String(filledCount), lbl: 'Entries' },
                { val: totalDep > 0 ? Math.round(totalDep).toLocaleString('en-IN') : '0', lbl: 'Deposit ₹' },
                { val: totalInc > 0 ? Math.round(totalInc).toLocaleString('en-IN') : '0', lbl: 'Incentive ₹' },
              ].map(s => (
                <div key={s.lbl} className="text-center">
                  <div className="text-xl font-bold font-mono" style={{ color: '#c8973a' }}>{s.val}</div>
                  <div className="text-[10px] uppercase tracking-widest text-white/35 mt-0.5">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── OFFICE DETAILS ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-navy">Office Details</span>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3.5">
            {[
              { id: 'bo', lsKey: 'bo', label: 'Branch Office (B.O)', icon: '🏤', placeholder: 'e.g. Songaon' },
              { id: 'so', lsKey: 'so', label: 'Sub Office (S.O)', icon: '🏢', placeholder: 'e.g. Pendgaon' },
              { id: 'ho', lsKey: 'ho', label: 'Head Office (H.O)', icon: '🏛', placeholder: 'e.g. Latur' },
            ].map(f => (
              <div key={f.id} className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[.7px]">
                  {f.label} <span className="text-green-600 not-uppercase tracking-normal text-[9px] font-semibold">● saved</span>
                </label>
                <AutocompleteInput
                  id={f.id}
                  lsKey={f.lsKey}
                  value={office[f.id as keyof OfficeDetails]}
                  onChange={v => setOff(f.id as keyof OfficeDetails, v)}
                  placeholder={f.placeholder}
                  icon={f.icon}
                  className="bg-[#f8f9fb] border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13.5px] w-full focus:border-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/7 transition-all"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[.7px]">
                Month <span className="text-green-600 not-uppercase tracking-normal text-[9px] font-semibold">● auto</span>
              </label>
              <input type="month" value={office.month}
                onChange={e => setOff('month', e.target.value)}
                className="bg-[#f8f9fb] border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13.5px] w-full focus:border-navy focus:bg-white focus:outline-none transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-[.7px]">
                Date <span className="text-green-600 not-uppercase tracking-normal text-[9px] font-semibold">● auto</span>
              </label>
              <input type="date" value={office.dated}
                onChange={e => setOff('dated', e.target.value)}
                className="bg-[#f8f9fb] border-[1.5px] border-gray-200 rounded-lg px-3 py-2 text-[13.5px] w-full focus:border-navy focus:bg-white focus:outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* ── ENTRIES ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-navy">Account Entries</span>
          </div>
          <div className="p-5">
            {/* Rate reference */}
            <div className="flex gap-2 flex-wrap mb-4">
              {[['1 Yr','0.5%'],['2 Yr','1.0%'],['3 Yr','1.0%'],['5 Yr','2.0%']].map(([t,r]) => (
                <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-md font-mono"
                  style={{ background: '#f0f5ff', border: '1px solid #c5d3ef', color: '#243758' }}>
                  {t} → <span style={{ color: '#a97a28' }}>{r}</span>
                </span>
              ))}
              <span className="text-[11px] px-2.5 py-1 rounded-md"
                style={{ background: '#fffbf0', border: '1px solid #e8d09a', color: '#7a5c1a' }}>
                Rate & Incentive auto-fill on Term select
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full border-collapse text-xs min-w-[720px]">
                <thead>
                  <tr>
                    {['SR','Account No.','PR No.','Name of Depositor','Deposit Amt (₹)','Term of Deposit','Rate (%)','Incentive Amt (₹)',''].map((h, i) => (
                      <th key={i}
                        className="bg-[#f0f3f8] border border-gray-300 px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-[.4px] text-navy whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <EntryRowComponent key={row.id} row={row} index={i} onChange={changeRow} onDelete={deleteRow} />
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="border border-gray-300 bg-[#f0f3f8] px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Total
                    </td>
                    <td className="border border-gray-300 bg-[#f0f3f8] text-right px-2 py-2 font-mono text-xs font-bold text-navy">
                      {formatINR(totalDep)}
                    </td>
                    <td className="border border-gray-300 bg-[#f0f3f8]" />
                    <td className="border border-gray-300 bg-[#f0f3f8]" />
                    <td className="border border-gray-300 bg-[#f0f3f8] text-right px-2 py-2 font-mono text-xs font-bold text-green-700">
                      {formatINR(totalInc)}
                    </td>
                    <td className="border border-gray-300 bg-[#f0f3f8]" />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Add row + counter */}
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={addRow}
                disabled={rows.length >= MAX_ROWS}
                className="text-[12px] font-semibold px-3 py-2 rounded-lg border border-dashed transition-all disabled:opacity-40"
                style={{ background: '#f0f3f8', borderColor: '#b8c0cc', color: '#6b7a94' }}
              >
                + Add Row
              </button>
              <span className="text-[11.5px] text-gray-400">{rows.length} / {MAX_ROWS} rows</span>
            </div>

            {/* In words */}
            <div className="mt-3.5">
              <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-[.7px] mb-1.5">
                Total Incentive — In Words
              </div>
              <div className="rounded-lg px-3.5 py-2.5 text-[13px] italic min-h-[40px]"
                style={{ background: '#f5faf7', border: '1px solid #b8dfc8', color: '#1e7a4a' }}>
                {inWords}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── STICKY ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex gap-2.5 justify-end flex-wrap px-5 py-3.5 border-t border-gray-200 backdrop-blur-md"
        style={{ background: 'rgba(238,240,244,.95)' }}>
        <button onClick={clearAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white text-navy font-semibold text-[13px] hover:bg-gray-50 transition-all">
          Clear All
        </button>
        <button onClick={handlePreview}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white text-navy font-semibold text-[13px] hover:bg-gray-50 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 bg-white text-navy font-semibold text-[13px] hover:bg-gray-50 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print
        </button>
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-white font-bold text-[13.5px] transition-all hover:-translate-y-px shadow-lg"
          style={{ background: 'linear-gradient(135deg,#1b2d4f,#243e70)', boxShadow: '0 4px 14px rgba(27,45,79,.28)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PDF
        </button>
      </div>

      {/* Preview Modal */}
      <PreviewModal blobUrl={previewUrl} onClose={() => { setPreviewUrl(null) }} />

    </div>
  )
}
