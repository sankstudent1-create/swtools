'use client';
// ─── Properties Panel — Context-sensitive element properties ──────────
import React from 'react';
import {
  Palette, Type as TypeIcon, PaintBucket, Minus,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Trash2, Check, Copy
} from 'lucide-react';
import type { PDFElement, TextAlign } from './types';
import { FONT_OPTIONS, PRESET_COLORS, HIGHLIGHT_COLORS } from './types';

interface PropertiesPanelProps {
  element: PDFElement | null;
  onUpdate: (id: string, partial: Partial<PDFElement>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function ColorGrid({ current, onChange, showTransparent }: { current: string; onChange: (c: string) => void; showTransparent?: boolean }) {
  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {showTransparent && (
        <button
          onClick={() => onChange('transparent')}
          className={`w-7 h-7 rounded-full border border-dashed border-white/30 flex items-center justify-center text-[10px] text-white/40 transition-transform hover:scale-110 ${current === 'transparent' ? 'ring-2 ring-brand-sky' : ''}`}
          title="Transparent"
        >∅</button>
      )}
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-7 h-7 rounded-full shadow-md transition-transform hover:scale-110 flex items-center justify-center ${c === '#ffffff' ? 'border border-gray-400' : ''}`}
          style={{ backgroundColor: c }}
        >
          {current === c && <Check className={`w-3.5 h-3.5 ${(c as string) === '#ffffff' || (c as string) === '#facc15' || (c as string) === '#84cc16' ? 'text-black' : 'text-white'}`} />}
        </button>
      ))}
      {/* Custom color input */}
      <label className="w-7 h-7 rounded-full overflow-hidden cursor-pointer border border-white/20 hover:border-white/40 transition-colors" title="Custom color">
        <input
          type="color"
          value={current === 'transparent' ? '#000000' : current}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 -ml-1.5 -mt-1.5 cursor-pointer border-none"
        />
      </label>
    </div>
  );
}

function OpacitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="ui-field">
      <label className="ui-label text-white/70 text-xs">Opacity {Math.round(value * 100)}%</label>
      <input
        type="range"
        min={0} max={1} step={0.05}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--brand-orange)]"
      />
    </div>
  );
}

export default function PropertiesPanel({ element, onUpdate, onRemove, onDuplicate }: PropertiesPanelProps) {
  if (!element) {
    return (
      <div className="w-full md:w-64 bg-[#0c1019] border-t md:border-t-0 md:border-l border-white/5 p-4 shrink-0 flex flex-col items-center justify-center text-center text-white/30 text-sm min-h-[200px]">
        <Palette className="w-8 h-8 mb-2 opacity-30" />
        <p>Select an element<br />to edit properties</p>
      </div>
    );
  }

  const el = element;
  const update = (p: Partial<PDFElement>) => onUpdate(el.id, p);

  return (
    <div className="w-full md:w-64 bg-[#0c1019] border-t md:border-t-0 md:border-l border-white/5 p-4 shrink-0 overflow-y-auto animate-fade-in-up z-20" style={{ scrollbarWidth: 'thin' }}>
      <h3 className="font-bold text-white text-sm mb-4 pb-3 border-b border-white/10 flex items-center gap-2 uppercase tracking-wider">
        <Palette className="w-4 h-4 text-[var(--brand-orange)]" />
        {el.type === 'text' ? 'Text' : el.type === 'image' || el.type === 'signature' ? 'Image' : el.type === 'drawing' ? 'Drawing' : el.type === 'highlight' ? 'Highlight' : 'Shape'} Properties
      </h3>

      <div className="space-y-4">
        {/* ─── TEXT PROPERTIES ─── */}
        {el.type === 'text' && (
          <>
            {/* Font Family */}
            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs flex items-center gap-1"><TypeIcon className="w-3 h-3" /> Font</label>
              <select
                className="ui-input text-xs bg-white/5 text-white border-white/10"
                value={el.fontFamily || 'Helvetica'}
                onChange={e => update({ fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value} className="bg-[#111]">{f.label}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs">Size (px)</label>
              <input
                type="number"
                className="ui-input text-xs bg-white/5 text-white border-white/10 w-full"
                value={el.fontSize || 14}
                min={6} max={144}
                onChange={e => update({ fontSize: parseInt(e.target.value) || 14 })}
              />
            </div>

            {/* Bold / Italic / Underline */}
            <div className="flex gap-1">
              <button
                onClick={() => update({ fontWeight: el.fontWeight === 'bold' || parseInt(el.fontWeight || '400') >= 600 ? 'normal' : 'bold' })}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all text-xs ${el.fontWeight === 'bold' || parseInt(el.fontWeight || '400') >= 600 ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/5'}`}
                title="Bold"
              ><Bold className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => update({ fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all text-xs ${el.fontStyle === 'italic' ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/5'}`}
                title="Italic"
              ><Italic className="w-3.5 h-3.5" /></button>
              <button
                onClick={() => update({ textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' })}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all text-xs ${el.textDecoration === 'underline' ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/5'}`}
                title="Underline"
              ><Underline className="w-3.5 h-3.5" /></button>

              <div className="w-px bg-white/10 mx-1" />

              {/* Alignment */}
              {(['left', 'center', 'right'] as TextAlign[]).map(a => (
                <button
                  key={a}
                  onClick={() => update({ textAlign: a })}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-all text-xs ${el.textAlign === a || (!el.textAlign && a === 'left') ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/5'}`}
                  title={`Align ${a}`}
                >
                  {a === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                  {a === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                  {a === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Text Color */}
            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs">Text Color</label>
              <ColorGrid current={el.color || '#000000'} onChange={c => update({ color: c })} />
            </div>

            {/* Letter Spacing */}
            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs">Letter Spacing</label>
              <input
                type="number"
                className="ui-input text-xs bg-white/5 text-white border-white/10 w-full"
                value={el.letterSpacing ?? 0}
                step={0.5} min={-5} max={20}
                onChange={e => update({ letterSpacing: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </>
        )}

        {/* ─── SHAPE PROPERTIES ─── */}
        {(el.type === 'rect' || el.type === 'circle' || el.type === 'line' || el.type === 'arrow') && (
          <>
            {(el.type === 'rect' || el.type === 'circle') && (
              <div className="ui-field">
                <label className="ui-label text-white/70 text-xs flex items-center gap-1"><PaintBucket className="w-3 h-3" /> Fill</label>
                <ColorGrid current={el.fill || '#ffffff'} onChange={c => update({ fill: c })} showTransparent />
              </div>
            )}

            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs">Stroke Color</label>
              <ColorGrid current={el.strokeColor || '#000000'} onChange={c => update({ strokeColor: c })} showTransparent />
            </div>

            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs flex items-center gap-1"><Minus className="w-3 h-3" /> Stroke Width</label>
              <input
                type="range"
                min={0} max={12} step={1}
                value={el.strokeWidth ?? 2}
                onChange={e => update({ strokeWidth: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--brand-sky)]"
              />
              <span className="text-[10px] text-white/40">{el.strokeWidth ?? 2}px</span>
            </div>

            {el.type === 'rect' && (
              <div className="ui-field">
                <label className="ui-label text-white/70 text-xs">Corner Radius</label>
                <input
                  type="range" min={0} max={30} step={1}
                  value={el.borderRadius ?? 0}
                  onChange={e => update({ borderRadius: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--brand-pink)]"
                />
                <span className="text-[10px] text-white/40">{el.borderRadius ?? 0}px</span>
              </div>
            )}
          </>
        )}

        {/* ─── HIGHLIGHT PROPERTIES ─── */}
        {el.type === 'highlight' && (
          <div className="ui-field">
            <label className="ui-label text-white/70 text-xs">Highlight Color</label>
            <div className="flex gap-2 mt-1">
              {HIGHLIGHT_COLORS.map(hc => (
                <button
                  key={hc.value}
                  onClick={() => update({ fill: hc.value })}
                  className={`w-9 h-9 rounded-lg transition-transform hover:scale-110 flex items-center justify-center ${el.fill === hc.value ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0c1019]' : ''}`}
                  style={{ backgroundColor: hc.value + '80' }}
                  title={hc.label}
                >
                  {el.fill === hc.value && <Check className="w-4 h-4 text-black" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── DRAWING PROPERTIES ─── */}
        {el.type === 'drawing' && (
          <>
            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs">Stroke Color</label>
              <ColorGrid current={el.strokeColor || '#000000'} onChange={c => update({ strokeColor: c })} />
            </div>
            <div className="ui-field">
              <label className="ui-label text-white/70 text-xs">Stroke Width</label>
              <input
                type="range" min={1} max={10} step={1}
                value={el.strokeWidth ?? 2}
                onChange={e => update({ strokeWidth: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--brand-orange)]"
              />
              <span className="text-[10px] text-white/40">{el.strokeWidth ?? 2}px</span>
            </div>
          </>
        )}

        {/* ─── IMAGE / SIGNATURE PROPERTIES ─── */}
        {(el.type === 'image' || el.type === 'signature') && (
          <div className="text-xs text-white/50">
            Drag handles to resize. Use opacity below to blend.
          </div>
        )}

        {/* ─── COMMON: OPACITY ─── */}
        <OpacitySlider value={el.opacity ?? 1} onChange={v => update({ opacity: v })} />

        {/* ─── ACTIONS ─── */}
        <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
          <button
            onClick={() => onDuplicate(el.id)}
            className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <button
            onClick={() => onRemove(el.id)}
            className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
