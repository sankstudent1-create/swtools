// src/app/tools/gds-leave/page.tsx
// GDS Leave Application — integrated from gds-nextjs
'use client';

import { Calculator, Download, Eye, Printer, Plus, Save, Building2, MapPin, Building, RotateCcw, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { AppTab }    from '@/components/gds/AppTab';
import { LetterTab } from '@/components/gds/LetterTab';
import type { FormData } from '@/types/gds';
import { defaultFormData } from '@/types/gds';
import { buildSubject } from '@/lib/gds/utils';
import { openWatermarkedPreviewWindow, buildPrintHTML } from '@/lib/gds/printBuilder';
import { htmlPagesToPdfBlobA4 } from '@/lib/pdf/htmlToPdfBase64';
import HistoryModal from '@/components/common/HistoryModal';
import CreditsModal from '@/components/common/CreditsModal';
import { Clock } from 'lucide-react';
import styles from './gds-leave.module.css';

type Tab = 'app' | 'letter';

export default function GDSLeavePage() {
  const [tab, setTab]               = useState<Tab>('app');
  const [data, setData]             = useState<FormData>(defaultFormData);
  const [toast, setToast]           = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const prevUrlRef                  = useRef<string>('');

  const [isCharging, setIsCharging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(15);

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
        {/* ── HEADER ── */}
        <header className={styles.header}>
          <div className={styles.headerBrand}>
            <Link href="/tools" className="p-2 hover:bg-white/5 rounded-lg transition-colors group mr-2">
              <ArrowLeft className="w-4 h-4 text-white/40 group-hover:text-white" />
            </Link>
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
          <button onClick={() => setShowHistory(true)} className={styles.btnSecondary}>
            <Clock className="w-4 h-4 mr-1" />
            History
          </button>
          <button 
            onClick={handlePrint} 
            disabled={isCharging}
            className={styles.btnPrimary}
          >
            {isCharging ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            )}
            Download PDF
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

        <HistoryModal 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)} 
          toolId="gds_leave" 
        />

        <CreditsModal 
          isOpen={showCredits} 
          onClose={() => setShowCredits(false)} 
          requiredCredits={requiredCredits} 
        />
      </div>
  );
}
