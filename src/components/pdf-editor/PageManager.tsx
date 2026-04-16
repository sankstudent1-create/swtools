'use client';
import React, { useState } from 'react';
import { 
  X, RotateCw, Trash2, Plus, ArrowLeft, ArrowRight, 
  Maximize2, LayoutGrid, Check, Move
} from 'lucide-react';
import { Document, Page } from 'react-pdf';

interface PageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  file: File;
  numPages: number;
  pageTransforms: Record<number, any>;
  onRotate: (idx: number) => void;
  onDelete: (idx: number) => void;
  onReorder: (from: number, to: number) => void;
}

const PageManager: React.FC<PageManagerProps> = ({
  isOpen,
  onClose,
  file,
  numPages,
  pageTransforms,
  onRotate,
  onDelete,
  onReorder
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#07090f] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-[#0c1019]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-orange)]/10 flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-[var(--brand-orange)]" />
          </div>
          <div>
            <h2 className="text-white font-bold">Organize Pages</h2>
            <p className="text-white/40 text-xs">Reorder, rotate, or delete pages</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-2.5 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: numPages }, (_, index) => {
            const transform = pageTransforms[index] || { rotation: 0, deleted: false };
            const isDeleted = transform.deleted;

            return (
              <div 
                key={index} 
                className={`relative flex flex-col group ${isDeleted ? 'opacity-50' : ''}`}
              >
                <div 
                  className={`relative aspect-[1/1.4] bg-white rounded-xl overflow-hidden shadow-xl border-2 transition-all ${
                    isDeleted ? 'border-red-500/50 grayscale' : 'border-white/5 group-hover:border-[var(--brand-sky)]/50'
                  }`}
                >
                  <Document file={file} className="w-full h-full pointer-events-none">
                    <Page 
                      pageNumber={index + 1} 
                      width={200} 
                      renderTextLayer={false} 
                      renderAnnotationLayer={false}
                      rotate={transform.rotation}
                    />
                  </Document>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onRotate(index)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                        title="Rotate"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(index)}
                        className={`p-2 rounded-lg text-white transition-all ${isDeleted ? 'bg-green-500/40 hover:bg-green-500' : 'bg-red-500/40 hover:bg-red-500'}`}
                        title={isDeleted ? "Restore" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {!isDeleted && (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => onReorder(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold disabled:opacity-20"
                        >
                          MOVE LEFT
                        </button>
                        <button 
                          onClick={() => onReorder(index, index + 1)}
                          disabled={index === numPages - 1}
                          className="p-1 px-2 rounded bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold disabled:opacity-20"
                        >
                          MOVE RIGHT
                        </button>
                      </div>
                    )}
                  </div>

                  {isDeleted && (
                    <div className="absolute inset-x-0 bottom-4 text-center">
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg uppercase">Deleted</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-white/40 text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full">
                    PAGE {index + 1}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add Blank Page Placeholder */}
          <button className="aspect-[1/1.4] rounded-xl border-2 border-dashed border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 text-white/20 hover:text-white/40">
            <Plus className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Add Blank Page</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="h-20 border-t border-white/5 px-8 flex items-center justify-center bg-[#0c1019]">
        <button 
          onClick={onClose}
          className="bg-white/5 hover:bg-white/10 text-white px-10 py-3 rounded-2xl font-bold text-sm transition-all"
        >
          Apply Changes & Return
        </button>
      </div>
    </div>
  );
};

export default PageManager;
