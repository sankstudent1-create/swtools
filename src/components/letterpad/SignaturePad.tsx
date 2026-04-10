// ─────────────────────────────────────────────
//  components/letterpad/SignaturePad.tsx
// ─────────────────────────────────────────────
'use client';
import React, { useRef, useEffect, useState } from 'react';
import type { SigMode } from '@/types/letterpad';
import styles from './SignaturePad.module.css';

interface SignaturePadProps {
  onApply: (dataUrl: string) => void;
  upRef: React.RefObject<HTMLInputElement | null>;
}

export default function SignaturePad({ onApply, upRef }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode]         = useState<SigMode>('draw');
  const [typedSig, setTypedSig] = useState('');
  const [drawing, setDrawing]   = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // ── Init canvas ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#f8f8f4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onStart(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    setDrawing(true);
    const canvas = canvasRef.current!;
    const pos = getPos(e, canvas);
    lastPos.current = pos;
    e.preventDefault();
  }

  function onMove(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    e.preventDefault();
  }

  function onEnd() { setDrawing(false); }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f8f8f4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTypedSig('');
  }

  function handleApply() {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      onApply(canvas.toDataURL());
    } else if (mode === 'type') {
      // Render typed sig to off-screen canvas
      const oc = document.createElement('canvas');
      oc.width = 240; oc.height = 55;
      const cx = oc.getContext('2d')!;
      cx.fillStyle = '#f8f8f4';
      cx.fillRect(0, 0, oc.width, oc.height);
      cx.font = 'italic 26px "Libre Baskerville", serif';
      cx.fillStyle = '#0a0a0a';
      cx.fillText(typedSig, 8, 38);
      onApply(oc.toDataURL());
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      onApply(url);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.wrap}>
      {/* Mode tabs */}
      <div className={styles.tabs}>
        {(['draw','type','upload'] as SigMode[]).map(m => (
          <button key={m}
            className={`${styles.tab} ${mode === m ? styles.tabActive : ''}`}
            onClick={() => {
              setMode(m);
              if (m === 'upload') upRef.current?.click();
            }}>
            {m === 'draw' ? '✏️ Draw' : m === 'type' ? '⌨️ Type' : '📎 Upload'}
          </button>
        ))}
        <input ref={upRef} type="file" accept="image/*" hidden onChange={handleFileUpload} />
      </div>

      {/* Canvas */}
      {mode === 'draw' && (
        <div className={styles.canvasWrap}>
          <canvas
            ref={canvasRef}
            width={272}
            height={86}
            className={styles.canvas}
            onMouseDown={onStart}
            onMouseMove={onMove}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={onStart}
            onTouchMove={onMove}
            onTouchEnd={onEnd}
          />
        </div>
      )}

      {/* Typed */}
      {mode === 'type' && (
        <input
          className={styles.typedInput}
          value={typedSig}
          placeholder="Type signature…"
          onChange={e => setTypedSig(e.target.value)}
        />
      )}

      {/* Buttons */}
      <div className={styles.btns}>
        <button className={styles.btn} onClick={clearCanvas}>🗑 Clear</button>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleApply}>
          ✓ Apply to Letter
        </button>
      </div>
      <div className={styles.hint}>Appears above name in the letter</div>
    </div>
  );
}
