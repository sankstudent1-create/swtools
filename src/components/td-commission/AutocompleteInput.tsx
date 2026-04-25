'use client'

import { useState, useRef, useEffect } from 'react'
import { useLS } from '@/hooks/useLS'

interface Props {
  id: string
  lsKey: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  icon?: string
}

export default function AutocompleteInput({
  id, lsKey, value, onChange, onBlur, placeholder, className, icon = '🏛',
}: Props) {
  const { get, add } = useLS()
  const [open, setOpen] = useState(false)
  const [matches, setMatches] = useState<string[]>([])
  const [selIdx, setSelIdx] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  const renderMatches = (q: string) => {
    const all = get(lsKey)
    const m = q ? all.filter(v => v.toLowerCase().includes(q.toLowerCase())) : all
    setMatches(m.slice(0, 12))
    setOpen(m.length > 0)
    setSelIdx(-1)
  }

  const pick = (v: string) => {
    onChange(v)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelIdx(i => Math.min(i + 1, matches.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && selIdx >= 0) { e.preventDefault(); pick(matches[selIdx]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        onChange={e => { onChange(e.target.value); renderMatches(e.target.value) }}
        onFocus={() => renderMatches(value)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150)
          if (value.trim()) add(lsKey, value.trim())
          onBlur?.()
        }}
        onKeyDown={handleKeyDown}
      />
      {open && matches.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border-2 border-navy rounded-lg shadow-xl overflow-hidden">
          {matches.map((m, i) => (
            <div
              key={m}
              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${i === selIdx ? 'bg-blue-50' : 'hover:bg-blue-50'}`}
              onMouseDown={e => { e.preventDefault(); pick(m) }}
            >
              <span className="text-xs text-gray-400">{icon}</span>
              <span>{m}</span>
            </div>
          ))}
          <div className="px-3 py-1.5 text-xs text-gray-400 italic border-t border-gray-100">
            ↑ Previously used
          </div>
        </div>
      )}
    </div>
  )
}
