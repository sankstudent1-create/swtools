// ─────────────────────────────────────────────
//  tools/letterpad-generator/page.tsx
// ─────────────────────────────────────────────
'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Appbar      from '@/components/letterpad/Appbar';
import Sidebar     from '@/components/letterpad/Sidebar';
import LetterPaper from '@/components/letterpad/LetterPaper';
import EditToolbar from '@/components/letterpad/EditToolbar';
import { useLetterState } from '@/hooks/useLetterState';
import type { LetterForm, LogoSide } from '@/types/letterpad';
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

  // ── Mobile tab: 'edit' | 'preview' ──────────
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('preview');
  const [isMobile, setIsMobile] = useState(false);

  // ── Responsive paper scale ───────────────────
  useEffect(() => {
    function updateScale() {
      const vw = window.innerWidth;
      const mobile = vw <= 900;
      setIsMobile(mobile);
      let scale = 1;
      if (vw <= 640)       scale = Math.max(0.38, (vw - 16) / 794);
      else if (vw <= 900)  scale = Math.max(0.65, (vw - 32) / 794);
      document.documentElement.style.setProperty('--paper-scale', String(scale.toFixed(3)));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // ── Print / PDF ──────────────────────────────
  function doPrint() { window.print(); }
  function doPDF()   { window.print(); }

  const handleLogoPos = useCallback((side: LogoSide, pos: object) => {
    setLogoPos(side, pos as Parameters<typeof setLogoPos>[1]);
  }, [setLogoPos]);

  const handleFormChange = useCallback((key: keyof LetterForm, value: string) => {
    updateForm(key, value);
  }, [updateForm]);

  return (
    <div className={styles.letterpadRoot}>
      {/* Google Fonts */}
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

      {/* ── Mobile tab bar ── */}
      {isMobile && (
        <div className={styles.mobileTabBar}>
          <button
            className={`${styles.mobileTab} ${mobileTab === 'edit' ? styles.mobileTabActive : ''}`}
            onClick={() => setMobileTab('edit')}
          >✏️ Edit</button>
          <button
            className={`${styles.mobileTab} ${mobileTab === 'preview' ? styles.mobileTabActive : ''}`}
            onClick={() => setMobileTab('preview')}
          >📄 Preview</button>
        </div>
      )}

      <div className={`${styles.workspace} ${isMobile ? styles.workspaceMobile : ''}`}>

        {/* ── SIDEBAR ── */}
        <div className={`${styles.sidebarCol} ${isMobile && mobileTab !== 'edit' ? styles.hidden : ''}`}>
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
        <main className={`${styles.preview} ${isMobile && mobileTab !== 'preview' ? styles.hidden : ''}`}>
          {/* Toolbar row */}
          <div className={styles.previewTop}>
            <span className={styles.previewLabel}>
              📄 A4 · Click paper to edit · AI fills all fields · Groq powered
            </span>
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
          </div>

          {/* Paper */}
          <div className={styles.paperWrap}>
            <LetterPaper
              state={state}
              onFormChange={handleFormChange}
              onCopyChange={val => updateForm('copyTo', val)}
              onLogoPos={handleLogoPos}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
