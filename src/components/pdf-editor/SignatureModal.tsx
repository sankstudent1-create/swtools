'use client';
// ─── Signature Modal — Draw / Type / Upload ──────────────────────────
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Pencil, Type, Upload, Trash2 } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
}

const SIGNATURE_FONTS = [
  { name: 'Brush Script', css: "'Brush Script MT', 'Segoe Script', cursive" },
  { name: 'Lucida', css: "'Lucida Handwriting', 'Lucida Calligraphy', cursive" },
  { name: 'Dancing', css: "'Dancing Script', 'Comic Sans MS', cursive" },
  { name: 'Monotype', css: "'Monotype Corsiva', 'Apple Chancery', cursive" },
];

type Tab = 'draw' | 'type' | 'upload';

export default function SignatureModal({ isOpen, onClose, onInsert }: SignatureModalProps) {
  const [tab, setTab] = useState<Tab>('draw');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(0);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Saved signature from localStorage
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('swtools_signature');
      if (saved) setSavedSignature(saved);
    }
  }, [isOpen]);

  // ─── Draw tab ───
  const startDraw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    ctx.beginPath();
    ctx.moveTo(x * scaleX, y * scaleY);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x * scaleX, y * scaleY);
    ctx.stroke();
  }, [isDrawing]);

  const stopDraw = useCallback(() => { setIsDrawing(false); }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }, []);

  useEffect(() => {
    if (isOpen && tab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setHasDrawn(false);
        }
      }
    }
  }, [isOpen, tab]);

  // ─── Type tab: render typed name to canvas and return dataUrl ───
  const renderTypedSignature = (): string => {
    const c = document.createElement('canvas');
    c.width = 500;
    c.height = 120;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, 500, 120);
    ctx.font = `42px ${SIGNATURE_FONTS[selectedFont].css}`;
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Signature', 20, 60);
    return c.toDataURL('image/png');
  };

  // ─── Upload tab ───
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  // ─── Insert handler ───
  const handleInsert = () => {
    let dataUrl: string = '';
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL('image/png');
    } else if (tab === 'type') {
      dataUrl = renderTypedSignature();
    } else if (tab === 'upload' && uploadPreview) {
      dataUrl = uploadPreview;
    }
    if (dataUrl) {
      localStorage.setItem('swtools_signature', dataUrl);
      onInsert(dataUrl);
      onClose();
    }
  };

  const useSaved = () => {
    if (savedSignature) {
      onInsert(savedSignature);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="ui-modal-shell w-full max-w-lg p-0 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-white text-lg">Add Signature</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {([['draw', Pencil, 'Draw'], ['type', Type, 'Type'], ['upload', Upload, 'Upload']] as const).map(([t, Icon, label]) => (
            <button
              key={t}
              onClick={() => setTab(t as Tab)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all ${tab === t ? 'text-[var(--brand-orange)] border-b-2 border-[var(--brand-orange)] bg-white/5' : 'text-white/50 hover:text-white/70'}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 min-h-[200px]">
          {tab === 'draw' && (
            <div>
              <canvas
                ref={canvasRef}
                width={460}
                height={140}
                className="w-full h-[140px] bg-white rounded-lg border border-white/20 cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <div className="flex justify-between mt-3">
                <button onClick={clearCanvas} className="text-xs text-white/50 hover:text-white flex items-center gap-1"><Trash2 className="w-3 h-3" /> Clear</button>
                <span className="text-[10px] text-white/30">Draw your signature above</span>
              </div>
            </div>
          )}

          {tab === 'type' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Type your name..."
                value={typedName}
                onChange={e => setTypedName(e.target.value)}
                className="ui-input w-full bg-white/5 text-white border-white/10"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-2">
                {SIGNATURE_FONTS.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFont(i)}
                    className={`p-3 rounded-lg border text-left transition-all ${selectedFont === i ? 'border-[var(--brand-orange)] bg-white/10' : 'border-white/10 hover:border-white/20'}`}
                  >
                    <span style={{ fontFamily: f.css, fontSize: '24px' }} className="text-white block truncate">
                      {typedName || 'Signature'}
                    </span>
                    <span className="text-[9px] text-white/30 mt-1 block">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              <label className="ui-upload-dropzone p-8 flex flex-col items-center cursor-pointer">
                <Upload className="w-8 h-8 text-white/40 mb-2" />
                <span className="text-sm text-white/70">Upload signature image</span>
                <span className="text-[10px] text-white/40">PNG, JPG</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
              {uploadPreview && (
                <div className="bg-white rounded-lg p-3">
                  <img src={uploadPreview} alt="Signature preview" className="max-h-24 mx-auto" />
                </div>
              )}
            </div>
          )}

          {/* Saved signature */}
          {savedSignature && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button onClick={useSaved} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                <img src={savedSignature} alt="Saved" className="h-8 bg-white rounded px-2" />
                <span className="text-xs text-white/60">Use saved signature</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/10">
          <button onClick={onClose} className="ui-btn-secondary text-sm">Cancel</button>
          <button
            onClick={handleInsert}
            disabled={tab === 'draw' && !hasDrawn || tab === 'type' && !typedName || tab === 'upload' && !uploadPreview}
            className="ui-btn-primary text-sm"
          >
            Insert Signature
          </button>
        </div>
      </div>
    </div>
  );
}
