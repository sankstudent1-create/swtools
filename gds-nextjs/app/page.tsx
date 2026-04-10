'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppTab }    from '@/components/AppTab';
import { LetterTab } from '@/components/LetterTab';
import type { FormData } from '@/types/gds';
import { defaultFormData } from '@/types/gds';
import { derive, buildSubject } from '@/lib/utils';
import { openPrintWindow, openPreviewWindow } from '@/lib/printBuilder';

type Tab = 'app' | 'letter';

export default function GDSLeavePage() {
  const [tab, setTab]         = useState<Tab>('app');
  const [data, setData]       = useState<FormData>(defaultFormData);
  const [toast, setToast]     = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const prevUrlRef = useRef<string>('');

  // Keep subject auto-updated whenever form data changes
  function handleChange(updated: FormData) {
    const autoSubj = buildSubject(updated);
    // Only overwrite subject if it's still the auto-generated value (not manually edited)
    const currentAutoSubj = buildSubject(data);
    const subjectIsAuto = updated.coverLetter.subject === currentAutoSubj
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
    // Revoke old URL
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

  // Cleanup on unmount
  useEffect(() => () => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-[#e8ecf2]">

      {/* ── Header ── */}
      <header className="bg-[#1b2d4f] h-[52px] px-[22px] flex items-center justify-between sticky top-0 z-[100] shadow-[0_2px_14px_rgba(0,0,0,.25)]">
        <div className="flex items-center gap-[11px]">
          <div className="w-[30px] h-[30px] bg-gradient-to-br from-[#b8890a] to-[#7a5010] rounded-[6px] flex items-center justify-center font-extrabold text-[10px] text-white font-serif">
            GDS
          </div>
          <div>
            <div className="text-[14px] font-bold text-white">GDS Leave Application</div>
            <div className="text-[9px] text-white/35 uppercase tracking-[1px]">Department of Posts — India Post</div>
          </div>
        </div>
        <span className="bg-[rgba(184,137,10,.18)] border border-[rgba(184,137,10,.4)] text-[#d4a017] text-[10px] font-bold px-[11px] py-[3px] rounded-[20px] tracking-[.5px] uppercase hidden sm:block">
          Quadruplicate Format
        </span>
      </header>

      {/* ── Tabs ── */}
      <div className="bg-[#22386a] flex border-b border-white/[0.08]">
        {(['app', 'letter'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-[18px] py-[10px] text-[13px] font-medium border-b-2 transition-all cursor-pointer bg-transparent ${
              tab === t
                ? 'text-white border-[#b8890a]'
                : 'text-white/45 border-transparent hover:text-white/75'
            }`}
          >
            {t === 'app' ? '📄 Leave Application' : '✉ Cover Letter'}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <main className="max-w-[820px] mx-auto px-4 pt-[22px] pb-[90px]">

        {/* Banner */}
        <div className={`bg-gradient-to-r from-[#1b2d4f] to-[#253e6a] rounded-[10px] p-[18px_22px] mb-[18px] ${tab === 'letter' ? 'hidden' : ''}`}>
          <h1 className="font-serif text-[18px] font-bold text-white mb-[3px]">GDS Leave Application</h1>
          <p className="text-white/42 text-[12px]">Generates official 4-copy format — fill once, prints quadruplicate</p>
          <div className="flex gap-[6px] mt-[9px] flex-wrap">
            {['4 Copies (Quadruplicate)', 'Paid Leave / LWA', 'Exact Government Format'].map(b => (
              <span key={b} className="bg-white/[0.07] border border-white/10 text-white/52 text-[10px] font-medium px-2 py-[2px] rounded-[3px]">{b}</span>
            ))}
          </div>
        </div>

        <div className={`bg-gradient-to-r from-[#1b2d4f] to-[#253e6a] rounded-[10px] p-[18px_22px] mb-[18px] ${tab === 'app' ? 'hidden' : ''}`}>
          <h1 className="font-serif text-[18px] font-bold text-white mb-[3px]">Cover Letter Generator</h1>
          <p className="text-white/42 text-[12px]">Formal covering letter — auto-filled from Application tab</p>
          <div className="flex gap-[6px] mt-[9px] flex-wrap">
            {['Official Format', 'Auto-filled', 'Right-aligned Closing'].map(b => (
              <span key={b} className="bg-white/[0.07] border border-white/10 text-white/52 text-[10px] font-medium px-2 py-[2px] rounded-[3px]">{b}</span>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {tab === 'app'    && <AppTab    data={data} onChange={handleChange} />}
        {tab === 'letter' && <LetterTab data={data} onChange={handleChange} />}
      </main>

      {/* ── Action bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(232,236,242,.95)] backdrop-blur-[10px] border-t border-[#c5cede] px-4 py-[11px] flex gap-2 justify-end flex-wrap z-50">
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-[6px] px-4 py-2 rounded-[7px] text-[13px] font-semibold cursor-pointer bg-white text-[#1b2d4f] border-[1.5px] border-[#c5cede] hover:bg-[#eef1ff] hover:border-[#1b2d4f] transition-all"
        >
          Clear
        </button>
        <button
          onClick={handlePreview}
          className="inline-flex items-center gap-[6px] px-4 py-2 rounded-[7px] text-[13px] font-semibold cursor-pointer bg-white text-[#1b2d4f] border-[1.5px] border-[#c5cede] hover:bg-[#eef1ff] hover:border-[#1b2d4f] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Preview
        </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-[6px] px-[22px] py-[9px] rounded-[7px] text-[13px] font-semibold cursor-pointer bg-gradient-to-br from-[#1b2d4f] to-[#22386a] text-white shadow-[0_4px_14px_rgba(27,45,79,.28)] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(27,45,79,.38)] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Save as PDF
        </button>
      </div>

      {/* ── Preview modal ── */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-[rgba(5,10,26,.88)] z-[2000] flex items-center justify-center"
          onClick={e => { if (e.target === e.currentTarget) closePreview(); }}
        >
          <div className="bg-[#1b2d4f] rounded-[10px] w-[95vw] max-w-[960px] h-[94vh] flex flex-col overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="font-serif font-bold text-white text-[14px]">
                Preview — 4 leave copies + cover letter
              </span>
              <button
                onClick={closePreview}
                className="bg-white/[0.08] border-none text-white w-7 h-7 rounded-[5px] cursor-pointer text-[14px] hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <iframe src={previewUrl} className="flex-1 border-none" title="PDF Preview" />
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-[20px] right-[20px] bg-[#1a6a42] text-white font-bold text-[13px] px-4 py-[10px] rounded-[8px] shadow-[0_6px_22px_rgba(0,0,0,.2)] z-[9999] animate-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

    </div>
  );
}
