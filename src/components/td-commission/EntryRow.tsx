'use client'

import { useRef } from 'react'
import { useLS } from '@/hooks/useLS'
import { RATES, TERM_LABELS } from '@/lib/td-commission/pdf'
import type { EntryRow, TermKey } from '@/types/td-commission'
import { Trash2, User } from 'lucide-react'

interface Props {
  row: EntryRow
  index: number
  onChange: (id: number, field: keyof EntryRow, value: string) => void
  onDelete: (id: number) => void
}

export default function EntryRowComponent({ row, index, onChange, onDelete }: Props) {
  const { get, add } = useLS()
  const nameDropRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const handleTerm = (term: string) => {
    onChange(row.id, 'term', term)
    const rate = term ? String(RATES[term]) : ''
    onChange(row.id, 'rate', rate)
    // recalc inc
    const dep = parseFloat(row.dep) || 0
    const r = parseFloat(rate) || 0
    onChange(row.id, 'inc', dep > 0 && r > 0 ? (dep * r / 100).toFixed(2) : '')
  }

  const handleDep = (dep: string) => {
    onChange(row.id, 'dep', dep)
    const rate = parseFloat(row.rate) || 0
    const d = parseFloat(dep) || 0
    onChange(row.id, 'inc', d > 0 && rate > 0 ? (d * rate / 100).toFixed(2) : '')
  }

  const nameMatches = (q: string) => {
    const all = get('names')
    return q ? all.filter(v => v.toLowerCase().includes(q.toLowerCase())) : all.slice(0, 10)
  }

  return (
    <tr className="group transition-colors relative border-b border-white/[0.02] hover:bg-white/[0.04]">
      {/* SR */}
      <td className="text-center text-[11px] text-white/30 font-mono py-1 rounded-l-xl w-10">
        {index + 1}
      </td>

      {/* Account No */}
      <td className="p-1">
        <input
          type="text"
          value={row.acc}
          placeholder="A/C No."
          className="w-full px-3 py-2 text-[13px] bg-transparent border border-transparent focus:border-white/10 focus:bg-white/[0.02] text-white placeholder-white/20 focus:outline-none rounded-lg transition-all"
          onChange={e => onChange(row.id, 'acc', e.target.value)}
        />
      </td>

      {/* PR No */}
      <td className="p-1">
        <input
          type="text"
          value={row.pr}
          placeholder="PR No."
          className="w-full px-3 py-2 text-[13px] bg-transparent border border-transparent focus:border-white/10 focus:bg-white/[0.02] text-white placeholder-white/20 focus:outline-none rounded-lg transition-all"
          onChange={e => onChange(row.id, 'pr', e.target.value)}
        />
      </td>

      {/* Depositor Name with autocomplete */}
      <td className="p-1 relative">
        <input
          ref={nameInputRef}
          type="text"
          value={row.name}
          placeholder="Depositor Name"
          autoComplete="off"
          className="w-full px-3 py-2 text-[13px] bg-transparent border border-transparent focus:border-white/10 focus:bg-white/[0.02] text-white placeholder-white/20 focus:outline-none rounded-lg transition-all"
          onChange={e => {
            onChange(row.id, 'name', e.target.value)
            const m = nameMatches(e.target.value)
            if (nameDropRef.current) {
              nameDropRef.current.style.display = m.length ? 'block' : 'none'
              nameDropRef.current.innerHTML = m.map(v =>
                `<div class="px-4 py-2.5 text-[13px] text-white/80 cursor-pointer hover:bg-white/10 flex gap-2 items-center transition-colors" data-val="${v.replace(/"/g, '&quot;')}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/40"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>${v}</div>`
              ).join('') + `<div class="px-4 py-2 text-[10px] text-emerald-400/60 uppercase tracking-widest font-semibold border-t border-white/10 bg-white/[0.02]">↑ Known depositors</div>`
            }
          }}
          onFocus={() => {
            const m = nameMatches(row.name)
            if (nameDropRef.current && m.length) {
              nameDropRef.current.style.display = 'block'
              nameDropRef.current.innerHTML = m.map(v =>
                `<div class="px-4 py-2.5 text-[13px] text-white/80 cursor-pointer hover:bg-white/10 flex gap-2 items-center transition-colors" data-val="${v.replace(/"/g, '&quot;')}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/40"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>${v}</div>`
              ).join('') + `<div class="px-4 py-2 text-[10px] text-emerald-400/60 uppercase tracking-widest font-semibold border-t border-white/10 bg-white/[0.02]">↑ Known depositors</div>`
            }
          }}
          onBlur={() => {
            setTimeout(() => { if (nameDropRef.current) nameDropRef.current.style.display = 'none' }, 160)
            if (row.name.trim()) add('names', row.name.trim())
          }}
        />
        <div
          ref={nameDropRef}
          className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 hidden bg-[#050505] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[240px] backdrop-blur-xl"
          onMouseDown={e => {
            const el = (e.target as HTMLElement).closest('[data-val]') as HTMLElement | null
            if (el) {
              e.preventDefault()
              const val = el.dataset.val || ''
              onChange(row.id, 'name', val)
              add('names', val)
              if (nameDropRef.current) nameDropRef.current.style.display = 'none'
            }
          }}
        />
      </td>

      {/* Deposit */}
      <td className="p-1">
        <input
          type="number"
          value={row.dep}
          placeholder="0.00"
          step="0.01"
          className="w-full px-3 py-2 text-[13px] text-right font-mono text-white bg-transparent border border-transparent focus:border-white/10 focus:bg-white/[0.02] placeholder-white/20 focus:outline-none rounded-lg transition-all"
          onChange={e => handleDep(e.target.value)}
        />
      </td>

      {/* Term */}
      <td className="p-1">
        <select
          value={row.term}
          className="w-full px-3 py-2 text-[13px] bg-transparent border border-transparent focus:border-white/10 focus:bg-white/[0.02] text-white focus:outline-none rounded-lg transition-all cursor-pointer [&>option]:bg-[#0f0f0f] [&>option]:text-white"
          onChange={e => handleTerm(e.target.value)}
        >
          <option value="">— Select —</option>
          {Object.entries(TERM_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </td>

      {/* Rate (read-only display) */}
      <td className="text-center font-mono text-[13px] font-semibold text-white/50 py-1">
        {row.rate ? <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">{row.rate}%</span> : '—'}
      </td>

      {/* Incentive (computed) */}
      <td className="p-1">
        <input
          type="number"
          value={row.inc}
          readOnly
          placeholder="0.00"
          className="w-full px-3 py-2 text-[13px] text-right font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_0_8px_rgba(16,185,129,0.05)] outline-none rounded-lg cursor-default font-semibold"
        />
      </td>

      {/* Delete */}
      <td className="text-center pr-2 rounded-r-xl">
        <button
          onClick={() => onDelete(row.id)}
          className="text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all rounded-lg p-2"
          aria-label="Delete row"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}
