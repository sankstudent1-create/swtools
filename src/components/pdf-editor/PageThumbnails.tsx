'use client';
// ─── Page Thumbnails Sidebar ─────────────────────────────────────────
import React from 'react';
import { Document, Page } from 'react-pdf';
import { RotateCw, Trash2, Plus } from 'lucide-react';
import type { PageTransform } from './types';

interface PageThumbnailsProps {
  file: File;
  numPages: number;
  currentPage: number;
  pageTransforms: Record<number, PageTransform>;
  onPageClick: (page: number) => void;
  onRotatePage: (page: number) => void;
  onDeletePage: (page: number) => void;
  onAddBlankPage?: (afterPage: number) => void;
}

export default function PageThumbnails({
  file, numPages, currentPage, pageTransforms,
  onPageClick, onRotatePage, onDeletePage, onAddBlankPage,
}: PageThumbnailsProps) {
  return (
    <div className="w-[140px] bg-[#0a0d14] border-r border-white/5 overflow-y-auto shrink-0 py-3 px-2 flex flex-col gap-2" style={{ scrollbarWidth: 'thin' }}>
      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1 mb-1">Pages</div>

      {Array.from({ length: numPages }, (_, i) => {
        const transform = pageTransforms[i];
        const isDeleted = transform?.deleted;
        const rotation = transform?.rotation || 0;
        const isCurrent = currentPage === i;

        if (isDeleted) {
          return (
            <div key={i} className="relative group">
              <div className="w-full aspect-[0.707] rounded-md bg-red-900/20 border border-red-500/20 flex items-center justify-center opacity-50">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <button
                onClick={() => onDeletePage(i)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-md text-[9px] text-white font-bold transition-opacity"
              >
                Restore
              </button>
              <span className="text-[9px] text-red-400/60 text-center block mt-0.5">Page {i + 1}</span>
            </div>
          );
        }

        return (
          <div key={i} className="relative group">
            <button
              onClick={() => onPageClick(i)}
              className={`w-full rounded-md overflow-hidden border-2 transition-all ${isCurrent ? 'border-[var(--brand-orange)] shadow-lg shadow-[var(--brand-orange)]/20' : 'border-transparent hover:border-white/20'}`}
            >
              <div style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }} className="transition-transform">
                <Document file={file} loading={<div className="w-full aspect-[0.707] bg-white/5 animate-pulse rounded" />}>
                  <Page
                    pageNumber={i + 1}
                    width={120}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </div>
            </button>

            {/* Hover actions */}
            <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onRotatePage(i); }}
                className="w-5 h-5 rounded bg-black/70 backdrop-blur text-white/80 hover:text-white flex items-center justify-center"
                title="Rotate 90°"
              >
                <RotateCw className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeletePage(i); }}
                className="w-5 h-5 rounded bg-black/70 backdrop-blur text-red-400 hover:text-red-300 flex items-center justify-center"
                title="Delete Page"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <span className={`text-[9px] text-center block mt-0.5 ${isCurrent ? 'text-[var(--brand-orange)] font-bold' : 'text-white/40'}`}>
              {i + 1}
            </span>
          </div>
        );
      })}

      {onAddBlankPage && (
        <button
          onClick={() => onAddBlankPage(numPages - 1)}
          className="w-full aspect-[0.707] rounded-md border-2 border-dashed border-white/15 hover:border-white/30 flex flex-col items-center justify-center gap-1 text-white/30 hover:text-white/60 transition-all group mt-1"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-bold uppercase tracking-wider">Add Page</span>
        </button>
      )}
    </div>
  );
}
