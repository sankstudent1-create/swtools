'use client';
import React from 'react';
import { Minus, Plus, Maximize2, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset
}) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-[#0c1019]/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl animate-fade-in-up">
      <button 
        onClick={onZoomOut}
        className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
        title="Zoom Out (Ctrl -)"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="px-3 min-w-[70px] text-center border-x border-white/10">
        <span className="text-xs font-bold text-white tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <button 
        onClick={onZoomIn}
        className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
        title="Zoom In (Ctrl +)"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-white/10 mx-1" />

      <button 
        onClick={onReset}
        className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
        title="Reset Zoom"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ZoomControls;
