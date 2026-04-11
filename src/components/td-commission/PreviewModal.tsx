'use client'

import { useEffect, useRef } from 'react'

interface Props {
  blobUrl: string | null
  onClose: () => void
}

export default function PreviewModal({ blobUrl, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  if (!blobUrl) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        className="flex flex-col w-[92vw] max-w-4xl h-[90vh] rounded-xl overflow-hidden shadow-2xl"
        style={{ background: '#1b2d4f' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
          <span className="font-serif text-white font-bold text-base">PDF Preview</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>
        <iframe src={blobUrl} className="flex-1 border-0 bg-white" title="PDF Preview" />
      </div>
    </div>
  )
}
