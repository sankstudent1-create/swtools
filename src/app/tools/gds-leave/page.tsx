// src/app/tools/gds-leave/page.tsx
// GDS Leave Application — integrated from gds-nextjs
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppTab }    from '@/components/gds/AppTab';
import { LetterTab } from '@/components/gds/LetterTab';
import type { FormData } from '@/types/gds';
import { defaultFormData } from '@/types/gds';
import { buildSubject } from '@/lib/gds/utils';
import { openWatermarkedPreviewWindow, buildPrintHTML } from '@/lib/gds/printBuilder';
import { htmlPagesToPdfBlobA4 } from '@/lib/pdf/htmlToPdfBase64';
import styles from './gds-leave.module.css';

type Tab = 'app' | 'letter';

export default function GDSLeavePage() {
  const [tab, setTab]               = useState<Tab>('app');
  const [data, setData]             = useState<FormData>(defaultFormData);
  const [toast, setToast]           = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const prevUrlRef                  = useRef<string>('');

  const [isCharging, setIsCharging] = useState(false);

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

  async function handlePrint() {
    setIsCharging(true);
    try {
      const html = buildPrintHTML(data, false)
      const blob = await htmlPagesToPdfBlobA4(html, '.pdf-page')

      const form = new FormData()
      form.set('tab', tab)
      form.set('filename', `GDS_Leave_${new Date().toISOString().slice(0, 10)}.pdf`)
      form.set('sizeBytes', String(blob.size))
      form.set('file', new File([blob], 'gds_leave.pdf', { type: 'application/pdf' }))

      const res = await fetch('/api/tools/gds-leave/charge', { method: 'POST', body: form })

      if (res.status === 401) {
        window.location.href = `/auth/login?next=${encodeURIComponent('/tools/gds-leave')}`;
        return;
      }
      if (res.status === 402) {
        const j = await res.json();
        alert(`Insufficient credits. Required: ${j.required_credits}`);
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
      a.download = `GDS_Leave_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1500)
      showToast('✓ PDF generated and saved to your account');
    } catch (e) {
      alert('Connection error. Please check your internet.');
    } finally {
      setIsCharging(false);
    }
  }

  function handlePreview() {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    const url = openWatermarkedPreviewWindow(data);
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
