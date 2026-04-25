'use client';
// ─── Watermark Modal ─────────────────────────────────────────────────
import React, { useState } from 'react';
import { X, Type, Image, Check } from 'lucide-react';
import type { WatermarkConfig } from './types';

interface WatermarkModalProps {
  isOpen: boolean;
  current: WatermarkConfig | null;
  onApply: (config: WatermarkConfig | null) => void;
  onClose: () => void;
}

const POSITIONS = [
  { label: 'Center', value: 'center' as const },
  { label: 'Tile', value: 'tile' as const },
  { label: 'Top Left', value: 'top-left' as const },
  { label: 'Top Right', value: 'top-right' as const },
  { label: 'Bottom Left', value: 'bottom-left' as const },
  { label: 'Bottom Right', value: 'bottom-right' as const },
];

export default function WatermarkModal({ isOpen, current, onApply, onClose }: WatermarkModalProps) {
  const [config, setConfig] = useState<WatermarkConfig>(current || {
    enabled: true,
    type: 'text',
    text: 'CONFIDENTIAL',
    fontSize: 48,
    color: '#ff0000',
    opacity: 0.15,
    rotation: -30,
    position: 'center',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setConfig(c => ({ ...c, imageData: reader.result as string }));
    reader.readAsDataURL(f);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="ui-modal-shell w-full max-w-md p-0 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-lg">Watermark</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setConfig(c => ({ ...c, type: 'text' }))}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold border transition-all ${config.type === 'text' ? 'border-[var(--brand-orange)] bg-white/10 text-white' : 'border-white/10 text-white/50'}`}
            ><Type className="w-4 h-4" /> Text</button>
            <button
              onClick={() => setConfig(c => ({ ...c, type: 'image' }))}
              className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold border transition-all ${config.type === 'image' ? 'border-[var(--brand-orange)] bg-white/10 text-white' : 'border-white/10 text-white/50'}`}
            ><Image className="w-4 h-4" /> Image</button>
          </div>

          {config.type === 'text' && (
            <>
              <div className="ui-field">
                <label className="ui-label text-white/70 text-xs">Watermark Text</label>
                <input
                  type="text"
                  className="ui-input bg-white/5 text-white border-white/10"
                  value={config.text || ''}
                  onChange={e => setConfig(c => ({ ...c, text: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="ui-field">
                  <label className="ui-label text-white/70 text-xs">Font Size</label>
                  <input type="number" className="ui-input bg-white/5 text-white border-white/10" value={config.fontSize || 48} min={12} max={200}
                    onChange={e => setConfig(c => ({ ...c, fontSize: parseInt(e.target.value) || 48 }))} />
                </div>
                <div className="ui-field">
                  <label className="ui-label text-white/70 text-xs">Color</label>
                  <input type="color" className="w-full h-9 rounded-lg cursor-pointer border border-white/10" value={config.color || '#ff0000'}
                    onChange={e => setConfig(c => ({ ...c, color: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {config.type === 'image' && (
            <label className="ui-upload-dropzone p-6 flex flex-col items-center cursor-pointer">
              {config.imageData ? (
                <img src={config.imageData} alt="Watermark" className="max-h-20 mb-2 opacity-50" />
              ) : (
                <Image className="w-8 h-8 text-white/40 mb-2" />
              )}
              <span className="text-xs text-white/50">Upload logo / image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}

          {/* Common controls */}
          <div className="ui-field">
            <label className="ui-label text-white/70 text-xs">Opacity {Math.round(config.opacity * 100)}%</label>
            <input type="range" min={0.02} max={0.8} step={0.02} value={config.opacity}
              onChange={e => setConfig(c => ({ ...c, opacity: parseFloat(e.target.value) }))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--brand-orange)]" />
          </div>

          <div className="ui-field">
            <label className="ui-label text-white/70 text-xs">Rotation {config.rotation}°</label>
            <input type="range" min={-90} max={90} step={5} value={config.rotation}
              onChange={e => setConfig(c => ({ ...c, rotation: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--brand-pink)]" />
          </div>

          <div className="ui-field">
            <label className="ui-label text-white/70 text-xs">Position</label>
            <div className="grid grid-cols-3 gap-1.5">
              {POSITIONS.map(p => (
                <button key={p.value} onClick={() => setConfig(c => ({ ...c, position: p.value }))}
                  className={`py-1.5 rounded-md text-[10px] font-semibold border transition-all ${config.position === p.value ? 'border-[var(--brand-sky)] bg-white/10 text-white' : 'border-white/8 text-white/40 hover:text-white/60'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="w-full aspect-[1.414] bg-white rounded-lg relative overflow-hidden flex items-center justify-center">
            <div
              className="text-center select-none pointer-events-none"
              style={{
                transform: `rotate(${config.rotation}deg)`,
                opacity: config.opacity,
                color: config.color || '#ff0000',
                fontSize: `${Math.min(config.fontSize || 48, 32)}px`,
                fontWeight: 'bold',
              }}
            >
              {config.type === 'text' && (config.text || 'WATERMARK')}
              {config.type === 'image' && config.imageData && (
                <img src={config.imageData} alt="" className="max-w-[60%] mx-auto" />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between px-5 py-4 border-t border-white/10">
          <button onClick={() => { onApply(null); onClose(); }} className="text-sm text-red-400 hover:text-red-300">Remove Watermark</button>
          <div className="flex gap-3">
            <button onClick={onClose} className="ui-btn-secondary text-sm">Cancel</button>
            <button onClick={() => { onApply(config); onClose(); }} className="ui-btn-primary text-sm">
              <Check className="w-4 h-4" /> Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
