// ─────────────────────────────────────────────
//  tools/letterpad-generator/page.tsx
//  Full-featured letterpad page using the swinfsystems-letterhead
//  components, integrated with Groq AI (no Claude API key needed)
// ─────────────────────────────────────────────
'use client';
import React, { useCallback, useEffect } from 'react';
import Appbar      from '@/components/letterpad/Appbar';
import Sidebar     from '@/components/letterpad/Sidebar';
import LetterPaper from '@/components/letterpad/LetterPaper';
import EditToolbar from '@/components/letterpad/EditToolbar';
import { useLetterState } from '@/hooks/useLetterState';
import type { LogoSide } from '@/types/letterpad';
import styles from './letterpad-page.module.css';

export default function LetterpadGeneratorPage() {
  const {
    state,
    updateForm,
    setTemplate,
    setFont,
    applyOfficePreset,
    setLogo,
    setLogoPos,
    setSigUrl,
    toggleEncl,
    toggleCopy,
    toggleEndorse,
    fillFromAI,
  } = useLetterState();

  // ── Responsive paper scale ─────────────────────────────
  useEffect(() => {
    function updateScale() {
      const vw = window.innerWidth;
      let scale = 1;
      if (vw <= 640)  scale = Math.max(0.38, (vw - 16) / 794);
      else if (vw <= 900) scale = Math.max(0.65, (vw - 16) / 794);
      document.documentElement.style.setProperty('--paper-scale', String(scale.toFixed(3)));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // ── Print / PDF ──────────────────────────────────
  function doPrint() {
    window.print();
  }
  function doPDF() {
    window.print(); // browser shows "Save as PDF" option automatically
  }

  // ── Logo pos update ──────────────────────────
  const handleLogoPos = useCallback((side: LogoSide, pos: object) => {
    setLogoPos(side, pos as Parameters<typeof setLogoPos>[1]);
  }, [setLogoPos]);

  return (
    <div className={styles.letterpadRoot}>
      {/* Google Fonts for letterpad (serif fonts) */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Noto+Serif+Devanagari:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600&family=Tiro+Devanagari+Hindi:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
        rel="stylesheet"
      />

      <Appbar
        onPrint={doPrint}
        onPDF={doPDF}
        onToggleEndorse={toggleEndorse}
        onToggleCopy={toggleCopy}
      />

      <div className={styles.workspace}>
        {/* ── SIDEBAR (wrapped for sticky scroll) ── */}
        <div className={styles.sidebarCol}>
          <Sidebar
            state={state}
            onUpdateForm={updateForm}
            onTemplate={setTemplate}
            onFont={setFont}
            onOffice={applyOfficePreset}
            onLogo={setLogo}
            onSigApply={setSigUrl}
            onFillAI={fillFromAI}
            onToggleEncl={toggleEncl}
            onToggleCopy={toggleCopy}
            onToggleEndorse={toggleEndorse}
          />
        </div>

        {/* ── PREVIEW AREA ── */}
        <main className={styles.preview}>
          {/* Toolbar row */}
          <div className={styles.previewTop}>
            <span className={styles.previewLabel}>
              📄 A4 GoI Format · Drag logos to reposition · Live Preview · Powered by Groq AI
            </span>
            <button className={styles.clearBtn} onClick={() => updateForm('body', '')}>
              ✕ Clear Body
            </button>
          </div>

          {/* Edit bar */}
          <EditToolbar
            showEncl={state.showEncl}
            showCopy={state.showCopy}
            showEndorse={state.showEndorse}
            onToggleEncl={toggleEncl}
            onToggleCopy={toggleCopy}
            onToggleEndorse={toggleEndorse}
            onPrint={doPrint}
            onPDF={doPDF}
          />

          {/* Paper */}
          <div className={styles.paperWrap}>
            <LetterPaper
              state={state}
              onBodyChange={val => updateForm('body', val)}
              onEnclChange={val => updateForm('encl', val)}
              onCopyChange={val => updateForm('copyTo', val)}
              onEndorseChange={val => updateForm('endorsement', val)}
              onLogoPos={handleLogoPos}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
