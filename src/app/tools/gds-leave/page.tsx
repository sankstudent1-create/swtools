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
import { supabase } from '@/lib/supabase';
import styles from './gds-leave.module.css';

type Tab = 'app' | 'letter';

export default function GDSLeavePage() {
  const [tab, setTab]               = useState<Tab>('app');
  const [data, setData]             = useState<FormData>(defaultFormData);
  const [toast, setToast]           = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const prevUrlRef                  = useRef<string>('');

  const [costs, setCosts] = useState<Record<string, number>>({ gds_leave_download: 10 });

  useEffect(() => {
    async function fetchCosts() {
      const { data } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'tool_costs')
        .single();
      if (data?.value) setCosts(data.value);
    }
    fetchCosts();
  }, []);

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login to print.");
      window.location.href = '/auth';
      return;
    }

    const cost = costs.gds_leave_download || 10;
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (!profile || profile.wallet_balance < cost) {
      alert(`Insufficient credits. ${cost} CR required to print/download.`);
      window.location.href = '/dashboard/wallet';
      return;
    }

    // Deduct Credits
    await supabase.from('profiles').update({ wallet_balance: profile.wallet_balance - cost }).eq('id', user.id);
    
    // Log Usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      tool_id: 'gds-leave',
      credits_spent: cost,
      metadata: { action: 'print' }
    });

    // Save Record
    await supabase.from('user_files').insert({
      user_id: user.id,
      tool_id: 'gds-leave',
      file_name: `GDS_Leave_${data.applicant.name}.pdf`,
      storage_path: 'inline_metadata',
      metadata: { data }
    });

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
            <div className="relative flex-1 bg-white overflow-hidden min-h-[500px]">
              <iframe src={previewUrl} className="w-full h-full border-0 absolute inset-0" title="PDF Preview" />
              
              {/* Watermark Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-[0.06] select-none overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="flex gap-20 whitespace-nowrap -rotate-12 mb-24 translate-x-10 translate-y-10">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <span key={j} className="text-5xl font-black tracking-[0.2em] text-black">SWTOOLS PREVIEW</span>
                    ))}
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 z-10">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em]">Watermarked Preview · Unlock to Download</p>
              </div>
            </div>
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
