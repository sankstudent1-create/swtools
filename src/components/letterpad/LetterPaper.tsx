// ─────────────────────────────────────────────
//  components/letterpad/LetterPaper.tsx
//  The A4 paper preview with all 6 template layouts
// ─────────────────────────────────────────────
'use client';
import React, { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import type { AppState, LogoSide } from '@/types/letterpad';
import styles from './LetterPaper.module.css';

interface LetterPaperProps {
  state: AppState;
  onBodyChange: (val: string) => void;
  onEnclChange: (val: string) => void;
  onCopyChange: (val: string[]) => void;
  onEndorseChange: (val: string) => void;
  onLogoPos: (side: LogoSide, pos: { x?: number; y?: number; w?: number; placed?: boolean }) => void;
}

const FONT_MAP: Record<string, string> = {
  '':    "'Libre Baskerville', serif",
  fg:    "'EB Garamond', serif",
  fs:    "'Source Serif 4', serif",
  fd2:   "'Noto Serif Devanagari', serif",
  ft:    "'Tiro Devanagari Hindi', serif",
  fn:    "'DM Sans', sans-serif",
};

// ── Logo placeholder SVG ────────────────────
function LogoPlaceholder({ icon, label }: { icon: string; label: string }) {
  return (
    <div className={styles.logoPh}>
      <span>{icon}</span>
      <small>{label}</small>
    </div>
  );
}

// ── Draggable logo ───────────────────────────
interface DraggableLogoProps {
  src: string | null;
  side: LogoSide;
  pos: { x: number; y: number; w: number; placed: boolean };
  paperRef: React.RefObject<HTMLDivElement | null>;
  onPos: (side: LogoSide, pos: { x?: number; y?: number; w?: number; placed?: boolean }) => void;
  onRemove: () => void;
}

function DraggableLogo({ src, side, pos, paperRef, onPos, onRemove }: DraggableLogoProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const resizing = useRef(false);
  const offset   = useRef({ x: 0, y: 0 });
  const startW   = useRef(0);
  const startX   = useRef(0);

  // Auto-place right logo on first mount
  useEffect(() => {
    if (side === 'R' && !pos.placed && paperRef.current) {
      const pw = paperRef.current.offsetWidth;
      onPos('R', { x: pw - pos.w - 44, y: 14, placed: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains(styles.resizeHandle) || target.classList.contains(styles.delBtn)) return;
    dragging.current = true;
    const rect = divRef.current!.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    offset.current = { x: cx - rect.left, y: cy - rect.top };
    e.preventDefault();
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current || !paperRef.current || !divRef.current) return;
      const paper = paperRef.current.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const nx = Math.max(0, Math.min(paper.width - pos.w, cx - paper.left - offset.current.x));
      const ny = Math.max(0, Math.min(paper.height - pos.w, cy - paper.top - offset.current.y));
      divRef.current.style.left = nx + 'px';
      divRef.current.style.top  = ny + 'px';
      onPos(side, { x: nx, y: ny, placed: true });
      e.preventDefault();
    }
    function onResizeMove(e: MouseEvent | TouchEvent) {
      if (!resizing.current || !divRef.current) return;
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = cx - startX.current;
      const newW = Math.max(28, Math.min(160, startW.current + delta));
      divRef.current.style.width  = newW + 'px';
      divRef.current.style.height = newW + 'px';
      onPos(side, { w: newW });
      e.preventDefault();
    }
    function onUp() { dragging.current = false; resizing.current = false; }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('touchmove', onResizeMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('touchmove', onResizeMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };
  }, [pos.w, side, onPos, paperRef]);

  function startResize(e: React.MouseEvent | React.TouchEvent) {
    resizing.current = true;
    startX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startW.current = pos.w;
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div
      ref={divRef}
      className={styles.dlogo}
      style={{ left: pos.x, top: pos.y, width: pos.w, height: pos.w }}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      {src
        ? <img src={src} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} alt="logo" draggable={false} />
        : <LogoPlaceholder icon={side === 'L' ? '🏛' : '🔏'} label={side === 'L' ? 'Dept Logo' : 'Office Seal'} />
      }
      <div className={styles.resizeHandle} onMouseDown={startResize} onTouchStart={startResize} />
      <button className={styles.delBtn} onClick={onRemove} title="Remove">✕</button>
    </div>
  );
}

// ── Header sub-components ────────────────────
function Tricolor() {
  return (
    <div className={styles.tricolor}>
      <div className={styles.tc1} /><div className={styles.tc2} /><div className={styles.tc3} />
    </div>
  );
}

// ── Main Paper ───────────────────────────────
export default function LetterPaper({
  state, onBodyChange, onEnclChange, onCopyChange, onEndorseChange, onLogoPos,
}: LetterPaperProps) {
  const { form, tpl, font, logoL, logoR, posL, posR, sigUrl, showEncl, showCopy, showEndorse } = state;
  const paperRef   = useRef<HTMLDivElement>(null);
  const bodyRef    = useRef<HTMLDivElement>(null);
  const enclRef    = useRef<HTMLDivElement>(null);
  const endorseRef = useRef<HTMLDivElement>(null);

  // ── Imperatively sync contentEditable content when AI fills fields ──
  // React intentionally skips re-rendering contentEditable nodes to avoid
  // clobbering user edits. We bypass this by using useLayoutEffect + refs.
  useLayoutEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.innerHTML = form.body.replace(/\n/g, '<br/>');
    }
    if (enclRef.current) {
      enclRef.current.innerHTML = form.encl;
    }
    if (endorseRef.current) {
      endorseRef.current.innerHTML = form.endorsement.replace(/\n/g, '<br/>');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.aiTick]);


  const addr = [form.ofc, form.city, form.pin ? '– ' + form.pin : ''].filter(Boolean).join(', ');
  const fontFamily = FONT_MAP[font] || FONT_MAP[''];

  // ── Header by template ───────────────────────
  function renderHeader() {
    switch (tpl) {
      case 'A': case 'E': case 'F': return (
        <div className={styles.hA}>
          <div className={styles.hATop}>
            <div className={styles.hAFno}>{form.fno}</div>
            <div className={styles.hARslot} />  {/* right logo placeholder slot */}
          </div>
          <div className={styles.hACenter}>
            {form.h1 && <div className={styles.hAHi}>{form.h1}{form.h2 ? ' / ' + form.h2 : ''}</div>}
            {form.e1 && <div className={styles.hAEn}>{form.e1}{form.e2 ? ' / ' + form.e2 : ''}</div>}
            <div className={styles.hADept}>
              {form.dept}
              {tpl === 'F' && <span className={styles.circularBadge}>CIRCULAR</span>}
            </div>
            {form.divn && <div className={styles.hADiv}>{form.divn}</div>}
            <div className={styles.hAStars}>★&nbsp;&nbsp;★&nbsp;&nbsp;★&nbsp;&nbsp;★</div>
          </div>
          <div className={styles.hAAddr}>
            {form.ofc}{form.city ? ', ' + form.city : ''}{form.pin ? ' – ' + form.pin : ''}<br/>
            {form.ph ? <>Phone: {form.ph}&emsp;</> : null}{form.em}
          </div>
        </div>
      );
      case 'B': return (
        <div className={styles.hB}>
          <div className={styles.hBCenter}>
            <div className={styles.hBLogoSlot} />
            {form.sh && <div className={styles.hBHi}>{form.sh}</div>}
            {form.sn && <div className={styles.hBEn}>{form.sn.replace(/[()]/g,'')}</div>}
            {form.sd && <div className={styles.hBDg}>{form.sd}</div>}
          </div>
          <div className={styles.hBAddr}>
            {form.ofc}<br/>{form.city}{form.pin ? ' – ' + form.pin : ''}<br/>{form.dt}
          </div>
        </div>
      );
      case 'C': return (
        <div className={styles.hC}>
          <div className={styles.hCRow}>
            <div className={styles.hCLogo} />{/* left logo slot */}
            <div className={styles.hCMid}>
              {form.sh && <div className={styles.hCHi}>{form.sh}</div>}
              {form.sn && <div className={styles.hCEn}>{form.sn.replace(/[()]/g,'')}</div>}
              {form.sd && <div className={styles.hCDg}>{form.sd}</div>}
              {form.dept && <div className={styles.hCSub}>{form.dept}</div>}
              {form.sc && <div className={styles.hCSub}>{form.sc}</div>}
              <div className={styles.hCContact}>
                {form.ph ? <>📞 {form.ph}&emsp;</> : null}
                {form.em ? <>✉ {form.em}</> : null}
              </div>
            </div>
            <div className={styles.hCLogo} />{/* right logo slot */}
          </div>
        </div>
      );
      case 'D': return (
        <div className={styles.hD}>
          <div className={styles.hDRow}>
            <div className={styles.hDLogo} />{/* left logo slot */}
            <div className={styles.hDNames}>
              {form.sh && <div className={styles.hDHi}>{form.sh}</div>}
              {form.sn && <div className={styles.hDEn}>{form.sn.replace(/[()]/g,'')}</div>}
              {form.sd && <div className={styles.hDDg}>{form.sd}</div>}
              {form.sc && <div className={styles.hDCn}>{form.sc}</div>}
            </div>
            <div className={styles.hDAddr}>
              {form.dept && <><strong>{form.dept}</strong><br/></>}
              {form.ofc && <>{form.ofc}<br/></>}
              {form.city}{form.pin ? ' – ' + form.pin : ''}<br/>
              {form.ph ? <>📞 {form.ph}<br/></> : null}
              {form.em ? <>✉ {form.em}<br/></> : null}
              {form.wb ? <>🌐 {form.wb}</> : null}
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  }

  // ── Divider by template ──────────────────────
  function renderDivider() {
    switch (tpl) {
      case 'A': case 'E': case 'F': return <><hr className={styles.dblLine}/><hr className={styles.singleLine}/></>;
      case 'B': return <hr className={styles.solidLine}/>;
      case 'C': return (
        <>
          <div className={styles.triStrip}><div className={styles.ts1}/><div className={styles.ts2}/><div className={styles.ts3}/></div>
          <hr className={styles.thinLine}/>
        </>
      );
      case 'D': return <hr className={styles.saffronLine}/>;
      default: return null;
    }
  }

  // ── Footer style by template ─────────────────
  const footerClass = tpl === 'C'
    ? `${styles.footer} ${styles.footerC}`
    : tpl === 'D'
    ? `${styles.footer} ${styles.footerD}`
    : `${styles.footer} ${styles.footerAB}`;

  return (
    <div className={styles.paper} ref={paperRef} style={{ fontFamily }}>
      {/* Tricolor */}
      <Tricolor />

      {/* Header */}
      {renderHeader()}

      {/* Divider */}
      {renderDivider()}

      {/* Meta row */}
      {(tpl === 'A' || tpl === 'E' || tpl === 'F') && (
        <div className={styles.meta}>
          <span>{form.fno}</span>
          <span>{addr}</span>
          <span>Dated: {form.dt}</span>
        </div>
      )}

      {/* Body */}
      <div className={styles.body}>
        {/* To block */}
        {tpl !== 'E' && (
          <div className={styles.toBlock}>
            <span className={styles.toLabel}>To</span>
            <div>
              <strong>{form.toD}</strong>
              {form.toA.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        )}

        {/* Subject */}
        <div className={styles.subBlock}>
          <span className={styles.subLabel}>Sub:</span>
          <span className={styles.subText}>{form.sub || '—'}</span>
        </div>

        {/* Reference */}
        {form.ref && (
          <div className={styles.refBlock}>
            <strong>Ref:</strong> {form.ref}
          </div>
        )}

        {/* Salutation */}
        {tpl !== 'E' && <div className={styles.salBlock}>{form.sal},</div>}

        {/* Body content — contenteditable, imperatively synced via ref on AI fill */}
        <div
          ref={bodyRef}
          className={styles.bodyText}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => onBodyChange(e.currentTarget.textContent || '')}
          dangerouslySetInnerHTML={{ __html: form.body.replace(/\n/g, '<br/>') }}
        />

        {/* Signature */}
        <div className={styles.sigWrap}>
          <div className={styles.sigSpace}>
            {sigUrl && <img src={sigUrl} className={styles.sigImg} alt="signature" />}
          </div>
          <div className={styles.sigName}>{form.sn || '(Authorised Signatory)'}</div>
          {form.sd && <div className={styles.sigDesig}>{form.sd}</div>}
          {form.dept && <div className={styles.sigDept}>{form.dept}</div>}
          {(form.sp || form.em) && (
            <div className={styles.sigContact}>
              {[form.sp, form.em].filter(Boolean).join('  |  ')}
            </div>
          )}
        </div>
      </div>

      {/* Encl */}
      {showEncl && (
        <div className={styles.enclBlock}>
          <div
            ref={enclRef}
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none' }}
            onBlur={e => onEnclChange(e.currentTarget.textContent || '')}
            dangerouslySetInnerHTML={{ __html: form.encl }}
          />
        </div>
      )}

      {/* Copy To */}
      {showCopy && (
        <div className={styles.copyBlock}>
          <div className={styles.copyHead}>Copy to:</div>
          <ol className={styles.copyList}>
            {form.copyTo.map((item, i) => (
              <li key={`copy-${i}-${state.aiTick || 0}`}
                contentEditable
                suppressContentEditableWarning
                style={{ outline: 'none' }}
                onBlur={e => {
                  const updated = [...form.copyTo];
                  updated[i] = e.currentTarget.textContent || '';
                  onCopyChange(updated);
                }}
              >{item}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Endorsement */}
      {showEndorse && (
        <div className={styles.endorseBlock}>
          <div className={styles.endorseHead}>Forwarded / Endorsed to:</div>
          <div
            ref={endorseRef}
            contentEditable
            suppressContentEditableWarning
            style={{ outline: 'none', minHeight: 38 }}
            onBlur={e => onEndorseChange(e.currentTarget.textContent || '')}
            dangerouslySetInnerHTML={{ __html: form.endorsement.replace(/\n/g,'<br/>') }}
          />
        </div>
      )}

      {/* Footer — always present */}
      <div className={footerClass}>
        <span>{(form.dept || 'Government of India') + ' · Government of India'}</span>
        <span>{form.city}{form.pin ? ' – ' + form.pin : ''}</span>
        <span>{form.wb}</span>
      </div>

      {/* Draggable Logos Layer */}
      {logoL && (
        <DraggableLogo src={logoL} side="L" pos={posL} paperRef={paperRef}
          onPos={onLogoPos} onRemove={() => {}} />
      )}
      {logoR && (
        <DraggableLogo src={logoR} side="R" pos={posR} paperRef={paperRef}
          onPos={onLogoPos} onRemove={() => {}} />
      )}
    </div>
  );
}
