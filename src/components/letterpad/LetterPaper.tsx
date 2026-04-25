// ─────────────────────────────────────────────
//  components/letterpad/LetterPaper.tsx
//  Full inline editing on ALL fields + AI sync via refs
// ─────────────────────────────────────────────
'use client';
import React, { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import type { AppState, LetterForm, LogoSide } from '@/types/letterpad';
import styles from './LetterPaper.module.css';

interface LetterPaperProps {
  state: AppState;
  onFormChange: (key: keyof LetterForm, value: string) => void;
  onCopyChange: (val: string[]) => void;
  onLogoPos: (side: LogoSide, pos: { x?: number; y?: number; w?: number; placed?: boolean }) => void;
  onLogoRemove?: (side: LogoSide) => void;
}

const FONT_MAP: Record<string, string> = {
  '':    "var(--font-outfit), sans-serif",
  fg:    "'EB Garamond', serif",
  fs:    "'Source Serif 4', serif",
  fd2:   "var(--font-poppins), 'Noto Serif Devanagari', serif",
  ft:    "'Tiro Devanagari Hindi', serif",
  fn:    "'DM Sans', sans-serif",
};

// ── Inline Editable field ────────────────────
// Syncs content from props only when aiTick changes (not on every keystroke)
interface EditableProps {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  tag?: keyof React.JSX.IntrinsicElements;
  placeholder?: string;
  aiTick?: number;
  multiline?: boolean;
}
function Editable({ value, onChange, className, tag: Tag = 'span', placeholder, aiTick, multiline }: EditableProps) {
  const ref = useRef<HTMLElement>(null);
  const lastTick = useRef<number | undefined>(undefined);

  // On mount: set initial content
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = multiline
        ? value.replace(/\n/g, '<br/>')
        : value;
      lastTick.current = aiTick;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On AI update (aiTick change): force-sync content
  useLayoutEffect(() => {
    if (aiTick !== undefined && aiTick !== lastTick.current && ref.current) {
      ref.current.innerHTML = multiline
        ? value.replace(/\n/g, '<br/>')
        : value;
      lastTick.current = aiTick;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTick]);

  return React.createElement(Tag as string, {
    ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    className: `${styles.editable} ${className || ''}`.trim(),
    'data-placeholder': placeholder,
    onBlur: (e: React.FocusEvent<HTMLElement>) =>
      onChange(e.currentTarget.textContent?.replace(/<br\s*\/?>/gi, '\n') || ''),
  });
}

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
  const divRef   = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const resizing = useRef(false);
  const offset   = useRef({ x: 0, y: 0 });
  const startW   = useRef(0);
  const startX   = useRef(0);

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

function Tricolor() {
  return (
    <div className={styles.tricolor}>
      <div className={styles.tc1} /><div className={styles.tc2} /><div className={styles.tc3} />
    </div>
  );
}

// ── Main Paper ───────────────────────────────
export default function LetterPaper({ state, onFormChange, onCopyChange, onLogoPos, onLogoRemove }: LetterPaperProps) {
  const { form, tpl, font, logoL, logoR, posL, posR, sigUrl, showEncl, showCopy, showEndorse } = state;
  const paperRef = useRef<HTMLDivElement>(null);
  const tick     = state.aiTick;

  const addr = [form.ofc, form.city, form.pin ? '– ' + form.pin : ''].filter(Boolean).join(', ');
  const fontFamily = FONT_MAP[font] || FONT_MAP[''];

  // Helper: Editable with correct aiTick wired in
  const E = useCallback(
    (key: keyof LetterForm, className?: string, tag?: keyof React.JSX.IntrinsicElements, placeholder?: string, multiline?: boolean) => (
      <Editable
        key={key}
        value={String(form[key] ?? '')}
        onChange={v => onFormChange(key, v)}
        className={className}
        tag={tag}
        placeholder={placeholder || `[${key}]`}
        aiTick={tick}
        multiline={multiline}
      />
    ),
  [form, onFormChange, tick]);

  // ── Header by template ───────────────────────
  function renderHeader() {
    switch (tpl) {
      case 'A': case 'E': case 'F': return (
        <div className={styles.hA}>
          <div className={styles.hATop}>
            {E('fno', styles.hAFno, 'div', 'F.No.')}
            <div className={styles.hARslot} />
          </div>
          <div className={styles.hACenter}>
            {(form.h1 || form.h2) && (
              <div className={styles.hAHi}>
                {E('h1', '', 'span', state.officeType === 'custom' ? 'Hindi Heading 1' : 'भारत सरकार')}
                {form.h2 && <> / {E('h2', '', 'span', state.officeType === 'custom' ? 'Hindi Heading 2' : 'विभाग')}</>}
              </div>
            )}
            {(form.e1 || form.e2) && (
              <div className={styles.hAEn}>
                {E('e1', '', 'span', state.officeType === 'custom' ? 'Heading 1' : 'Government of India')}
                {form.e2 && <> / {E('e2', '', 'span', state.officeType === 'custom' ? 'Heading 2' : 'Ministry')}</>}
              </div>
            )}
            <div className={styles.hADept}>
              {E('dept', '', 'span', state.officeType === 'custom' ? 'Title / Company Name' : 'Department')}
              {tpl === 'F' && <span className={styles.circularBadge}>CIRCULAR</span>}
            </div>
            {E('divn', styles.hADiv, 'div', state.officeType === 'custom' ? 'Subtitle / Branch' : 'Division / Section')}
            <div className={styles.hAStars}>★&nbsp;&nbsp;★&nbsp;&nbsp;★&nbsp;&nbsp;★</div>
          </div>
          <div className={styles.hAAddr}>
            {E('ofc', '', 'span', 'Office')}{', '}
            {E('city', '', 'span', 'City')}{' – '}
            {E('pin', '', 'span', 'PIN')}<br/>
            <span className={styles.hideIfEmptyPrint}>{'Phone: '}{E('ph', '', 'span', 'Phone')}&emsp;</span>
            <span className={styles.hideIfEmptyPrint}>{E('em', '', 'span', 'email')}</span>
          </div>
        </div>
      );
      case 'B': return (
        <div className={styles.hB}>
          <div className={styles.hBCenter}>
            <div className={styles.hBLogoSlot} />
            {E('sh', styles.hBHi, 'div', 'हिन्दी नाम')}
            {E('sn', styles.hBEn, 'div', 'Name')}
            {E('sd', styles.hBDg, 'div', 'Designation')}
          </div>
          <div className={styles.hBAddr}>
            {E('ofc', '', 'div', 'Office')}<br/>
            {E('city', '', 'span', 'City')}{' – '}{E('pin', '', 'span', 'PIN')}<br/>
            {E('dt', '', 'span', 'Date')}
          </div>
        </div>
      );
      case 'C': return (
        <div className={styles.hC}>
          <div className={styles.hCRow}>
            <div className={styles.hCLogo} />
            <div className={styles.hCMid}>
              {E('sh', styles.hCHi, 'div', 'हिन्दी नाम')}
              {E('sn', styles.hCEn, 'div', 'Name')}
              {E('sd', styles.hCDg, 'div', 'Designation')}
              {E('dept', styles.hCSub, 'div', 'Department')}
              {E('sc', styles.hCSub, 'div', 'Constituency')}
            </div>
            <div className={styles.hCLogo} />
          </div>
        </div>
      );
      case 'D': return (
        <div className={styles.hD}>
          <div className={styles.hDRow}>
            <div className={styles.hDLogo} />
            <div className={styles.hDNames}>
              {E('sh', styles.hDHi, 'div', 'हिन्दी नाम')}
              {E('sn', styles.hDEn, 'div', 'Name')}
              {E('sd', styles.hDDg, 'div', 'Designation')}
              {E('sc', styles.hDCn, 'div', 'Constituency')}
            </div>
            <div className={styles.hDAddr}>
              {E('dept', styles.hDEn, 'div', 'Department')}<br/>
              {E('ofc', '', 'div', 'Office')}<br/>
              {E('city', '', 'span', 'City')}{' – '}{E('pin', '', 'span', 'PIN')}<br/>
              <div className={styles.hideIfEmptyPrint}>{E('ph', '', 'div', 'Phone')}</div>
              <div className={styles.hideIfEmptyPrint}>{E('em', '', 'div', 'email')}</div>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  }

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

  const footerClass = tpl === 'C' ? `${styles.footer} ${styles.footerC}` :
                      tpl === 'D' ? `${styles.footer} ${styles.footerD}` :
                                    `${styles.footer} ${styles.footerAB}`;

  return (
    <div className={styles.paper} ref={paperRef} style={{ fontFamily }}>
      <Tricolor />

      {/* Edit hint */}
      <div className={styles.editHint}>✏ Click any text to edit inline</div>

      {renderHeader()}
      {renderDivider()}

      {/* Meta row */}
      {(tpl === 'A' || tpl === 'E' || tpl === 'F') && (
        <div className={styles.meta}>
          {E('fno', '', 'span', 'F.No.')}
          <span>{addr}</span>
          <span>Dated: {E('dt', '', 'span', 'Date')}</span>
        </div>
      )}

      {/* Body */}
      <div className={styles.body}>
        {/* To block — each field is block-level inside a clear container */}
        {tpl !== 'E' && (
          <div className={styles.toBlock}>
            <span className={styles.toLabel}>To</span>
            <div className={styles.toInner}>
              <div className={styles.toName}>
                <Editable
                  value={form.toD}
                  onChange={v => onFormChange('toD', v)}
                  tag="span"
                  placeholder="Recipient Designation"
                  aiTick={tick}
                />
              </div>
              <div className={styles.toAddr}>
                <Editable
                  value={form.toA}
                  onChange={v => onFormChange('toA', v)}
                  tag="span"
                  placeholder="Recipient Address"
                  aiTick={tick}
                  multiline
                />
              </div>
            </div>
          </div>
        )}

        {/* Subject */}
        <div className={styles.subBlock}>
          <span className={styles.subLabel}>Sub:</span>
          {E('sub', styles.subText, 'span', 'Subject')}
        </div>

        {/* Reference — only show if there IS a ref value */}
        {form.ref && (
          <div className={styles.refBlock}>
            <strong>Ref:</strong>{' '}
            <Editable
              value={form.ref}
              onChange={v => onFormChange('ref', v)}
              tag="span"
              placeholder="Reference"
              aiTick={tick}
            />
          </div>
        )}

        {/* Salutation */}
        {tpl !== 'E' && (
          <div className={styles.salBlock}>
            {E('sal', '', 'span', 'Sir/Madam')},
          </div>
        )}

        {/* Body text */}
        <Editable
          value={form.body}
          onChange={v => onFormChange('body', v)}
          className={styles.bodyText}
          tag="div"
          placeholder="Click to type letter body, or use AI to generate…"
          aiTick={tick}
          multiline
        />

        {/* Closing + Signature — right-aligned per GoI format */}
        <div className={styles.closingAndSig}>
          <div className={styles.closingBlock}>
            <Editable
              value={form.cls}
              onChange={v => onFormChange('cls', v)}
              tag="span"
              placeholder="Yours faithfully"
              aiTick={tick}
            />
            ,
          </div>
          <div className={styles.sigWrap}>
            <div className={styles.sigSpace}>
              {sigUrl && <img src={sigUrl} className={styles.sigImg} alt="signature" />}
            </div>
            <Editable value={form.sn}   onChange={v => onFormChange('sn', v)}   tag="div" className={styles.sigName}   placeholder="(Signatory Name)" aiTick={tick} />
            <Editable value={form.sd}   onChange={v => onFormChange('sd', v)}   tag="div" className={styles.sigDesig} placeholder="Designation" aiTick={tick} />
            <Editable value={form.dept} onChange={v => onFormChange('dept', v)} tag="div" className={styles.sigDept}  placeholder="Department" aiTick={tick} />
            {(form.sp?.trim() || form.em?.trim()) && (
              <div className={styles.sigContact}>
                {form.sp?.trim() && <Editable value={form.sp} onChange={v => onFormChange('sp', v)} tag="span" placeholder="Phone/Extn" aiTick={tick} />}
                {form.sp?.trim() && form.em?.trim() ? '  |  ' : ''}
                {form.em?.trim() && <Editable value={form.em} onChange={v => onFormChange('em', v)} tag="span" placeholder="email" aiTick={tick} />}
              </div>
            )}
          </div>
        </div>
      </div>{/* end .body */}

      {/* Encl */}
      {showEncl && (
        <div className={styles.enclBlock}>
          <Editable
            value={form.encl}
            onChange={v => onFormChange('encl', v)}
            tag="div"
            placeholder="Enclosures…"
            aiTick={tick}
            multiline
          />
        </div>
      )}

      {/* Copy To */}
      {showCopy && (
        <div className={styles.copyBlock}>
          <div className={styles.copyHead}>Copy to:</div>
          <ol className={styles.copyList}>
            {(form.copyTo.length ? form.copyTo : ['']).map((item, i) => (
              <li
                key={`copy-${i}-${tick || 0}`}
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
          <Editable
            value={form.endorsement}
            onChange={v => onFormChange('endorsement', v)}
            tag="div"
            placeholder="Endorsement details…"
            aiTick={tick}
            multiline
          />
        </div>
      )}

      {/* Footer */}
      <div className={footerClass}>
        {state.officeType === 'custom' ? (
          <span>{form.dept || ''}</span>
        ) : (
          <span>{(form.dept || 'Government of India') + ' · Government of India'}</span>
        )}
        <span>{form.city}{form.pin ? ' – ' + form.pin : ''}</span>
        <span>{form.wb}</span>
      </div>

      {/* Draggable Logos */}
      {logoL && (
        <DraggableLogo src={logoL} side="L" pos={posL} paperRef={paperRef}
          onPos={onLogoPos} onRemove={() => onLogoRemove?.('L')} />
      )}
      {logoR && (
        <DraggableLogo src={logoR} side="R" pos={posR} paperRef={paperRef}
          onPos={onLogoPos} onRemove={() => onLogoRemove?.('R')} />
      )}
    </div>
  );
}
