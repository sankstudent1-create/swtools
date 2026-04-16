'use client';
import React from 'react';
import { 
  FileText, Download, X, Printer, Share2, 
  ChevronLeft, ChevronRight, HelpCircle 
} from 'lucide-react';

interface TopBarProps {
  fileName: string;
  numPages: number;
  currentPage: number;
  onClose: () => void;
  onExport: () => void;
  isExporting: boolean;
  onPrint?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  fileName,
  numPages,
  currentPage,
  onClose,
  onExport,
  isExporting,
  onPrint
}) => {
  return (
    <div className="h-14 bg-[#0c1019] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-40 shadow-2xl">
      {/* Left section: Branding & File Info */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-all group"
          title="Back to Upload"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        
        <div className="h-6 w-px bg-white/10 mx-1 hidden md:block" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-pink)] flex items-center justify-center shadow-lg shadow-brand-orange/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white max-w-[200px] truncate leading-tight">
              {fileName}
            </span>
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase tracking-wider font-bold text-white/30">
                PRO PDF EDITOR
               </span>
               <span className="w-1 h-1 rounded-full bg-white/20" />
               <span className="text-[10px] text-white/40 tabular-nums">
                Page {currentPage + 1} of {numPages}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle section: Navigation (Desktop only) */}
      <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl">
        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-20" disabled={numPages <= 1}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-4 text-xs font-bold text-white/80 tabular-nums">
          {numPages} {numPages === 1 ? 'Page' : 'Pages'}
        </span>
        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all disabled:opacity-20" disabled={numPages <= 1}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onPrint}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
        >
          <Printer className="w-4 h-4" />
          <span>Print</span>
        </button>
        
        <button 
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block" />

        <button
          onClick={onExport}
          disabled={isExporting}
          className="relative group overflow-hidden bg-gradient-to-r from-[var(--brand-orange)] to-[var(--brand-pink)] px-5 py-2.5 rounded-xl flex items-center gap-2 text-white font-bold text-xs shadow-xl shadow-brand-orange/20 active:scale-95 transition-transform disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 translate-y-1 group-hover:translate-y-0 transition-transform" />
            </>
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all ml-1">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopBar;
