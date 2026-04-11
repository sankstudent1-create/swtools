'use client'

import { useRef } from 'react'
import { useLS } from '@/hooks/useLS'
import { RATES, TERM_LABELS } from '@/utils/pdf'
import type { EntryRow, TermKey } from '@/types'

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
    <tr className="group transition-colors hover:bg-blue-50/40">
      {/* SR */}
      <td className="text-center text-xs text-gray-400 font-mono bg-gray-50 group-hover:bg-blue-50/60 border border-gray-200 px-2 py-1 w-9">
        {index + 1}
      </td>

      {/* Account No */}
      <td className="border border-gray-200 p-0">
        <input
          type="text"
          value={row.acc}
          placeholder="Account No."
          className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:bg-blue-50 focus:outline-none rounded-sm"
          onChange={e => onChange(row.id, 'acc', e.target.value)}
        />
      </td>

      {/* PR No */}
      <td className="border border-gray-200 p-0">
        <input
          type="text"
          value={row.pr}
          placeholder="PR No."
          className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:bg-blue-50 focus:outline-none rounded-sm"
          onChange={e => onChange(row.id, 'pr', e.target.value)}
        />
      </td>

      {/* Depositor Name with autocomplete */}
      <td className="border border-gray-200 p-0 relative">
        <input
          ref={nameInputRef}
          type="text"
          value={row.name}
          placeholder="Depositor Name"
          autoComplete="off"
          className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:bg-blue-50 focus:outline-none rounded-sm"
          onChange={e => {
            onChange(row.id, 'name', e.target.value)
            const m = nameMatches(e.target.value)
            if (nameDropRef.current) {
              nameDropRef.current.style.display = m.length ? 'block' : 'none'
              nameDropRef.current.innerHTML = m.map(v =>
                `<div class="px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 flex gap-2 items-center" data-val="${v.replace(/"/g, '&quot;')}"><span class="text-gray-400">👤</span>${v}</div>`
              ).join('') + `<div class="px-3 py-1 text-[10px] text-gray-400 italic border-t">↑ Known depositors</div>`
            }
          }}
          onFocus={() => {
            const m = nameMatches(row.name)
            if (nameDropRef.current && m.length) {
              nameDropRef.current.style.display = 'block'
              nameDropRef.current.innerHTML = m.map(v =>
                `<div class="px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 flex gap-2 items-center" data-val="${v.replace(/"/g, '&quot;')}"><span class="text-gray-400">👤</span>${v}</div>`
              ).join('') + `<div class="px-3 py-1 text-[10px] text-gray-400 italic border-t">↑ Known depositors</div>`
            }
          }}
          onBlur={() => {
            setTimeout(() => { if (nameDropRef.current) nameDropRef.current.style.display = 'none' }, 160)
            if (row.name.trim()) add('names', row.name.trim())
          }}
        />
        <div
          ref={nameDropRef}
          className="absolute top-full left-0 right-0 z-50 hidden bg-white border-2 border-navy rounded-lg shadow-xl overflow-hidden min-w-[200px]"
          style={{ minWidth: '220px' }}
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
      <td className="border border-gray-200 p-0">
        <input
          type="number"
          value={row.dep}
          placeholder="0.00"
          step="0.01"
          className="w-full px-2 py-1.5 text-xs text-right font-mono bg-transparent border-0 focus:bg-blue-50 focus:outline-none rounded-sm"
          onChange={e => handleDep(e.target.value)}
        />
      </td>

      {/* Term */}
      <td className="border border-gray-200 p-0">
        <select
          value={row.term}
          className="w-full px-2 py-1.5 text-xs bg-transparent border-0 focus:bg-blue-50 focus:outline-none rounded-sm cursor-pointer"
          onChange={e => handleTerm(e.target.value)}
        >
          <option value="">— Select —</option>
          {Object.entries(TERM_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </td>

      {/* Rate (read-only display) */}
      <td className="border border-gray-200 text-center font-mono text-xs font-semibold text-navy py-1.5 px-2">
        {row.rate ? `${row.rate}%` : '—'}
      </td>

      {/* Incentive (computed) */}
      <td className="border border-gray-200 p-0">
        <input
          type="number"
          value={row.inc}
          readOnly
          placeholder="Auto"
          className="w-full px-2 py-1.5 text-xs text-right font-mono bg-green-50 text-green-700 border-0 outline-none rounded-sm cursor-default"
        />
      </td>

      {/* Delete */}
      <td className="border border-gray-200 text-center">
        <button
          onClick={() => onDelete(row.id)}
          className="text-gray-300 hover:text-red-500 transition-colors text-xs px-1.5 py-1"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}
