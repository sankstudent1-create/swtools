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
import { elementToPdfBlobA4 } from '@/lib/pdf/htmlToPdfBase64';
import HistoryModal from '@/components/common/HistoryModal';
import CreditsModal from '@/components/common/CreditsModal';

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
    lastModel,
  } = useLetterState();

  const [isCharging, setIsCharging] = useState(false);

  // ── Mobile tab: 'edit' | 'preview' ──────────
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('preview');
  const [isMobile, setIsMobile] = useState(false);

  // ── Modals ──
  const [showHistory, setShowHistory] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(15);

  // ── Responsive paper scale ───────────────────
  useEffect(() => {
    function updateScale() {
      const vw = window.innerWidth;
      const mobile = vw <= 900;
      setIsMobile(mobile);
      // Desktop: scale = 1, tablet: fit to available width, mobile: tighter
      let scale = 1;
      if (vw <= 480)       scale = Math.max(0.35, (vw - 12) / 794);
      else if (vw <= 640)  scale = Math.max(0.42, (vw - 16) / 794);
      else if (vw <= 900)  scale = Math.max(0.65, (vw - 32) / 794);
      else if (vw <= 1200) scale = Math.max(0.8, (vw - 64) / 794);
      else if (vw <= 1600) scale = Math.max(0.9, (vw - 96) / 794);
      else                scale = 1;
      document.documentElement.style.setProperty('--paper-scale', String(scale.toFixed(3)));
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // ── Print / PDF — reset scale to 1 then print then restore ──
  async function doPrint() {
    setIsCharging(true);
    try {
      const paper = document.getElementById('print-area') as HTMLElement | null
      if (!paper) {
        alert('Preview not ready')
        return
      }

      const blob = await elementToPdfBlobA4(paper)

      const form = new FormData()
      form.set('action', 'download')
      form.set('filename', `Letterpad_${new Date().toISOString().slice(0, 10)}.pdf`)
      form.set('sizeBytes', String(blob.size))
      form.set('file', new File([blob], 'letterpad.pdf', { type: 'application/pdf' }))

      const res = await fetch('/api/tools/letterpad-generator/charge', { method: 'POST', body: form })

      if (res.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/tools/letterpad-generator')}`;
        return;
      }
      if (res.status === 402) {
        const j = await res.json();
        setRequiredCredits(j.required_credits || 15);
        setShowCredits(true);
        return;
      }
      if (!res.ok) {
        const j = await res.json();
        alert(j.error || 'Failed to process request');
        return;
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Letterpad_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1500)
    } catch (e) {
      alert('Connection error');
    } finally {
      setIsCharging(false);
    }
  }

  function doWatermarkedPreview() {
    const paper = document.getElementById('print-area') as HTMLElement | null
    if (!paper) {
      alert('Preview not ready')
      return
    }

    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <style>
        body{margin:0;background:#111;color:#000;display:flex;justify-content:center;align-items:flex-start;padding:24px;}
        .wrap{position:relative;}
        .wrap::before{content:'PREVIEW';position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-24deg);font-size:96px;font-weight:800;letter-spacing:0.25em;color:rgba(255,255,255,0.08);z-index:9999;pointer-events:none;}
        .wrap::after{content:'WATERMARKED PREVIEW';position:fixed;left:50%;top:calc(50% + 86px);transform:translateX(-50%);font-size:14px;font-weight:700;letter-spacing:0.35em;color:rgba(255,255,255,0.10);z-index:9999;pointer-events:none;}
      </style></head><body><div class="wrap">${paper.outerHTML}</div></body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const w = window.open(url, '_blank')
    if (!w) alert('Please allow popups to preview')
    setTimeout(() => URL.revokeObjectURL(url), 15000)
  }

  const handleLogoPos = useCallback((side: LogoSide, pos: object) => {
    setLogoPos(side, pos as Parameters<typeof setLogoPos>[1]);
  }, [setLogoPos]);

  const handleFormChange = useCallback((key: keyof LetterForm, value: string) => {
    updateForm(key, value);
  }, [updateForm]);

  return (
    <div className={styles.letterpadRoot}>
        {isCharging && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07090f]/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#1c2332] border border-white/10 rounded-3xl p-8 flex flex-col items-center max-w-sm w-full mx-4 shadow-2xl">
              <div className="w-16 h-16 relative mb-6">
                <div className="absolute inset-0 border-4 border-brand-orange/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-brand-orange rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Generating PDF...</h3>
              <p className="text-white/60 text-center text-sm mb-6">
                We are processing your document and increasing the output quality for a premium look.
              </p>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-orange to-brand-pink w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        {/* Google Fonts */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Noto+Serif+Devanagari:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600&family=Tiro+Devanagari+Hindi:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />

        <Appbar
          onPrint={doPrint}
          onPDF={doPrint}
          onToggleEndorse={toggleEndorse}
          onToggleCopy={toggleCopy}
          onHistory={() => setShowHistory(true)}
          lastModel={lastModel}
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

        {/* ── Mobile action bar (keeps actions out of horizontal appbar) ── */}
        {isMobile && mobileTab === 'preview' && (
          <div className={styles.mobileTabBar}>
            <button className={styles.mobileTabPrint} onClick={doWatermarkedPreview}>
              👁 Preview*
            </button>
            <button className={`${styles.mobileTabPrint} ${styles.mobileTabPDF}`} onClick={doPrint}>
              ⬇ PDF
            </button>
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
            {/* Toolbar row — hidden on mobile (actions are in tab bar) */}
            {!isMobile && (
              <div className={styles.previewTop}>
                <span className={styles.previewLabel}>
                  📄 A4 · Click paper to edit · AI fills all fields · Groq powered
                  {lastModel && <> · <span style={{color:'#4ade80'}}>⚡ {lastModel}</span></>}
                </span>
                <EditToolbar
                  showEncl={state.showEncl}
                  showCopy={state.showCopy}
                  showEndorse={state.showEndorse}
                  onToggleEncl={toggleEncl}
                  onToggleCopy={toggleCopy}
                  onToggleEndorse={toggleEndorse}
                  onPrint={doWatermarkedPreview}
                  onPDF={doPrint}
                />
              </div>
            )}

            {/* Paper */}
            <div className={styles.paperWrap} id="print-area">
              <LetterPaper
                state={state}
                onFormChange={handleFormChange}
                onCopyChange={val => updateForm('copyTo', val)}
                onLogoPos={handleLogoPos}
                onLogoRemove={side => setLogo(side, null)}
              />
            </div>
          </main>
        </div>

        <HistoryModal 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)} 
          toolId="letterpad_generator" 
        />

        <CreditsModal 
          isOpen={showCredits} 
          onClose={() => setShowCredits(false)} 
          requiredCredits={requiredCredits} 
        />
    </div>
  );
}
