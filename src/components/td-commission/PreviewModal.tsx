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
        <div className="relative flex-1 bg-white overflow-hidden">
          <iframe src={blobUrl} className="w-full h-full border-0" title="PDF Preview" />
          
          {/* Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.07] select-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex gap-20 whitespace-nowrap -rotate-12 mb-20 translate-x-10 translate-y-10">
                {Array.from({ length: 6 }).map((_, j) => (
                  <span key={j} className="text-4xl font-black tracking-[0.2em] text-black">SWTOOLS PREVIEW</span>
                ))}
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[11px] font-bold text-white/80 uppercase tracking-widest">Watermarked Preview · Unlock for High Quality</p>
          </div>
        </div>
      </div>
    </div>
  )
}
