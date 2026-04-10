// src/app/tools/gds-leave/page.tsx
// GDS Leave Application — integrated from gds-nextjs
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppTab }    from '@/components/gds/AppTab';
import { LetterTab } from '@/components/gds/LetterTab';
import type { FormData } from '@/types/gds';
import { defaultFormData } from '@/types/gds';
import { buildSubject } from '@/lib/gds/utils';
import { openPrintWindow, openPreviewWindow } from '@/lib/gds/printBuilder';
import styles from './gds-leave.module.css';

type Tab = 'app' | 'letter';

export default function GDSLeavePage() {
  const [tab, setTab]               = useState<Tab>('app');
  const [data, setData]             = useState<FormData>(defaultFormData);
  const [toast, setToast]           = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const prevUrlRef                  = useRef<string>('');

  function handleChange(updated: FormData) {
    const autoSubj       = buildSubject(updated);
    const currentAutoSubj = buildSubject(data);
    const subjectIsAuto  = updated.coverLetter.subject === currentAutoSubj
                        || updated.coverLetter.subject === '';
    setData(subjectIsAuto
      ? { ...updated, coverLetter: { ...updated.coverLetter, subject: autoSubj } }
      : updated
    );
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handlePrint() {
    openPrintWindow(data);
    showToast('✓ Print dialog opening… choose "Save as PDF" to download');
  }

  function handlePreview() {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const url = openPreviewWindow(data);
    prevUrlRef.current = url;
    setPreviewUrl(url);
  }

  function handleClear() {
    if (!confirm('Clear all fields?')) return;
    setData(defaultFormData());
  }

  function closePreview() {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = '';
    setPreviewUrl('');
  }

  useEffect(() => () => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
  }, []);

  return (
    <div className={styles.root}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerBrand}>
          <div className={styles.headerLogo}>GDS</div>
          <div>
            <div className={styles.headerTitle}>GDS Leave Application</div>
            <div className={styles.headerSub}>Department of Posts — India Post</div>
          </div>
        </div>
        <span className={styles.headerBadge}>Quadruplicate Format</span>
      </header>

      {/* ── Tabs ── */}
      <div className={styles.tabBar}>
        {(['app', 'letter'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`}
          >
            {t === 'app' ? '📄 Leave Application' : '✉ Cover Letter'}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <main className={styles.main}>

        {/* Banner */}
        <div className={`${styles.banner} ${tab === 'letter' ? styles.hidden : ''}`}>
          <h1 className={styles.bannerTitle}>GDS Leave Application</h1>
          <p className={styles.bannerSub}>Generates official 4-copy format — fill once, prints quadruplicate</p>
          <div className={styles.bannerTags}>
            {['4 Copies (Quadruplicate)', 'Paid Leave / LWA', 'Exact Government Format'].map(b => (
              <span key={b} className={styles.bannerTag}>{b}</span>
            ))}
          </div>
        </div>

        <div className={`${styles.banner} ${tab === 'app' ? styles.hidden : ''}`}>
          <h1 className={styles.bannerTitle}>Cover Letter Generator</h1>
          <p className={styles.bannerSub}>Formal covering letter — auto-filled from Application tab</p>
          <div className={styles.bannerTags}>
            {['Official Format', 'Auto-filled', 'Right-aligned Closing'].map(b => (
              <span key={b} className={styles.bannerTag}>{b}</span>
            ))}
          </div>
        </div>

        {tab === 'app'    && <AppTab    data={data} onChange={handleChange} />}
        {tab === 'letter' && <LetterTab data={data} onChange={handleChange} />}
      </main>

      {/* ── Action bar ── */}
      <div className={styles.actionBar}>
        <button onClick={handleClear}   className={styles.btnSecondary}>Clear</button>
        <button onClick={handlePreview} className={styles.btnSecondary}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
        <button onClick={handlePrint}   className={styles.btnPrimary}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Save as PDF
        </button>
      </div>

      {/* ── Preview modal ── */}
      {previewUrl && (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) closePreview(); }}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Preview — 4 leave copies + cover letter</span>
              <button onClick={closePreview} className={styles.modalClose}>✕</button>
            </div>
            <iframe src={previewUrl} className={styles.modalFrame} title="PDF Preview" />
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}
    </div>
  );
}
