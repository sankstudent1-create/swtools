// ─────────────────────────────────────────────
//  components/letterpad/Sidebar.tsx
//  Converted from Claude API key to Groq (server-side, no client key needed)
// ─────────────────────────────────────────────
'use client';
import React, { useRef, useState } from 'react';
import type { AppState, LetterForm, TemplateType, FontClass, LogoSide, AILetterData } from '@/types/letterpad';
import {
  OFFICE_PRESETS, TEMPLATE_INFO, FONT_OPTIONS,
  SALUTATION_OPTIONS, CLOSING_OPTIONS, AI_LETTER_TYPES, svgToDataUri
} from '@/lib/letterpad/constants';
import { buildPrompt, generateLetterWithAI } from '@/lib/letterpad/aiService';
import SignaturePad from './SignaturePad';
import styles from './Sidebar.module.css';

interface SidebarProps {
  state: AppState;
  onUpdateForm: <K extends keyof LetterForm>(key: K, val: LetterForm[K]) => void;
  onTemplate: (t: TemplateType) => void;
  onFont: (f: FontClass) => void;
  onOffice: (type: string) => void;
  onLogo: (side: LogoSide, src: string | null) => void;
  onSigApply: (url: string) => void;
  onFillAI: (data: AILetterData) => void;
  onToggleEncl: () => void;
  onToggleCopy: () => void;
  onToggleEndorse: () => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className={styles.sectionTitle}>{children}</div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; half?: boolean }> = ({ label, children, half }) => (
  <div className={`${styles.field} ${half ? styles.fieldHalf : ''}`}>
    <label className={styles.label}>{label}</label>
    {children}
  </div>
);

export default function Sidebar({
  state, onUpdateForm, onTemplate, onFont, onOffice, onLogo, onSigApply,
  onFillAI, onToggleEncl, onToggleCopy, onToggleEndorse,
}: SidebarProps) {
  const { form, tpl, font, officeType, logoL, logoR } = state;

  // AI state
  const [aiType, setAiType]     = useState('office_order');
  const [aiLang, setAiLang]     = useState('en');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  const upLRef = useRef<HTMLInputElement>(null);
  const upRRef = useRef<HTMLInputElement>(null);
  const upSigRef = useRef<HTMLInputElement>(null);

  // ── Logo upload ──────────────────────────────
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, side: LogoSide) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onLogo(side, ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // ── AI generate (uses Groq server-side) ──────
  async function handleGenerate() {
    setAiLoading(true);
    setAiStatus('');
    try {
      const prompt = buildPrompt(aiType, aiPrompt, aiLang, form, tpl);
      const data = await generateLetterWithAI(
        prompt,
        aiType,
        aiLang,
        { department: form.dept, office: form.ofc, city: form.city },
        setAiStatus
      );
      onFillAI(data);
      setAiStatus('✓ Complete letter generated — all fields filled!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAiStatus('✗ ' + msg.slice(0, 100));
    } finally {
      setAiLoading(false);
    }
  }

  const inp = (val: string, key: keyof LetterForm, ph?: string) => (
    <input
      className={styles.input}
      value={val}
      placeholder={ph}
      onChange={e => onUpdateForm(key, e.target.value)}
    />
  );
  const ta = (val: string, key: keyof LetterForm, rows = 2) => (
    <textarea
      className={styles.textarea}
      rows={rows}
      value={val}
      onChange={e => onUpdateForm(key, e.target.value)}
    />
  );

  return (
    <aside className={styles.sidebar}>

      {/* ── OFFICE TYPE ── */}
      <div className={styles.section}>
        <SectionTitle>Office / Authority</SectionTitle>
        <div className={styles.officeGrid}>
          {([
            ['dop','📮','Dept of Posts'], ['pm','🇮🇳','Prime Minister'],
            ['minister','🏛️','Cabinet Minister'], ['mp','🗳️','MP / Lok Sabha'],
            ['mla','📜','MLA / Assembly'], ['district','🏢','District Office'],
            ['rms','🚂','RMS / Circle'], ['savings','🏦','POSB / Savings'],
            ['custom','✏️','Custom'],
          ] as [string, string, string][]).map(([key, icon, label]) => (
            <button
              key={key}
              className={`${styles.officeBtn} ${officeType === key ? styles.officeBtnActive : ''}`}
              onClick={() => onOffice(key)}
            >
              <span className={styles.officeIcon}>{icon}</span>
              <span className={styles.officeLabel}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TEMPLATE ── */}
      <div className={styles.section}>
        <SectionTitle>Letter Layout</SectionTitle>
        <div className={styles.tplList}>
          {(Object.keys(TEMPLATE_INFO) as TemplateType[]).map(t => (
            <button
              key={t}
              className={`${styles.tplItem} ${tpl === t ? styles.tplItemActive : ''}`}
              onClick={() => onTemplate(t)}
            >
              <div className={`${styles.tplDot} ${tpl === t ? styles.tplDotActive : ''}`} />
              <div>
                <div className={styles.tplName}>{TEMPLATE_INFO[t].label}</div>
                <div className={styles.tplDesc}>{TEMPLATE_INFO[t].desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── LOGOS ── */}
      <div className={styles.section}>
        <SectionTitle>Logos &amp; Emblems <small className={styles.dragHint}>(drag on paper)</small></SectionTitle>
        <div className={styles.logoRow}>
          {(['L','R'] as LogoSide[]).map(side => {
            const src = side === 'L' ? logoL : logoR;
            const ref = side === 'L' ? upLRef : upRRef;
            return (
              <div key={side} className={styles.logoSlot} onClick={() => ref.current?.click()}>
                <div className={styles.logoSlotLabel}>{side === 'L' ? 'Left Logo' : 'Right Logo'}</div>
                {src
                  ? <img src={src} className={styles.logoPrev} alt="logo" />
                  : <div className={styles.logoPh}>{side === 'L' ? '🏛' : '🔏'}<small>No {side === 'L' ? 'logo' : 'seal'}</small></div>
                }
                <div className={styles.logoHint}>📎 Upload</div>
                <input ref={ref} type="file" accept="image/*" hidden onChange={e => handleLogoUpload(e, side)} />
              </div>
            );
          })}
        </div>
        <label className={styles.label}>Quick Presets</label>
        <div className={styles.presets}>
          {[
            ['ashoka','L','🏛 Ashoka→L'], ['ashoka','R','🏛 Ashoka→R'],
            ['ip','L','📮 India Post→L'], ['ip','R','📮 IP→R'],
            ['sansad','L','🗳 Sansad→L'], ['sansad','R','🗳 Sansad→R'],
            ['mh','L','🌀 MH→L'],
          ].map(([key, side, lbl]) => (
            <button key={`${key}-${side}`} className={styles.presetBtn}
              onClick={() => onLogo(side as LogoSide, svgToDataUri(key))}>
              {lbl}
            </button>
          ))}
          <button className={styles.presetBtn} onClick={() => onLogo('L', null)}>✕ Clear L</button>
          <button className={styles.presetBtn} onClick={() => onLogo('R', null)}>✕ Clear R</button>
        </div>
      </div>

      {/* ── MINISTRY/OFFICE ── */}
      <div className={styles.section}>
        <SectionTitle>Ministry / Office Details</SectionTitle>
        <Field label="Hindi Line 1">{inp(form.h1,'h1')}</Field>
        <Field label="Hindi Line 2">{inp(form.h2,'h2')}</Field>
        <Field label="English Line 1">{inp(form.e1,'e1')}</Field>
        <Field label="English Line 2">{inp(form.e2,'e2')}</Field>
        <Field label="Department">{inp(form.dept,'dept')}</Field>
        <Field label="Division / Section">{inp(form.divn,'divn')}</Field>
        <Field label="Office / Building">{inp(form.ofc,'ofc')}</Field>
        <div className={styles.fieldRow}>
          <Field label="City" half>{inp(form.city,'city')}</Field>
          <Field label="PIN" half>{inp(form.pin,'pin')}</Field>
        </div>
        <Field label="Phone">{inp(form.ph,'ph')}</Field>
        <Field label="Email">{inp(form.em,'em')}</Field>
        <Field label="Website">{inp(form.wb,'wb')}</Field>
      </div>

      {/* ── SIGNATORY ── */}
      <div className={styles.section}>
        <SectionTitle>Signatory Officer</SectionTitle>
        <Field label="Name (with title)">{inp(form.sn,'sn','(Dr. Vincent Barla)')}</Field>
        <Field label="Designation">{inp(form.sd,'sd','Director (Estt.)')}</Field>
        <Field label="Direct Phone / Extn.">{inp(form.sp,'sp','Extn. 2345')}</Field>
        <Field label="Hindi / Regional Name">{inp(form.sh,'sh','हिन्दी नाम')}</Field>
        <Field label="Constituency / Circle">{inp(form.sc,'sc','e.g. Amritsar, Punjab')}</Field>
      </div>

      {/* ── LETTER REFERENCE ── */}
      <div className={styles.section}>
        <SectionTitle>Letter Reference</SectionTitle>
        <Field label="File / Letter No.">{inp(form.fno,'fno')}</Field>
        <Field label="Date">{inp(form.dt,'dt')}</Field>
        <Field label="To — Designation">{inp(form.toD,'toD')}</Field>
        <Field label="To — Office / Address">{ta(form.toA,'toA')}</Field>
        <Field label="Subject">{ta(form.sub,'sub')}</Field>
        <Field label="Reference">{inp(form.ref,'ref','OM No. … dated …')}</Field>
        <div className={styles.fieldRow}>
          <Field label="Salutation" half>
            <select className={styles.select} value={form.sal} onChange={e => onUpdateForm('sal', e.target.value)}>
              {SALUTATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Closing" half>
            <select className={styles.select} value={form.cls} onChange={e => onUpdateForm('cls', e.target.value)}>
              {CLOSING_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* ── FONT ── */}
      <div className={styles.section}>
        <SectionTitle>Body Font</SectionTitle>
        <div className={styles.fontGrid}>
          {FONT_OPTIONS.map(f => (
            <button key={f.key}
              className={`${styles.fontChip} ${font === f.key ? styles.fontChipActive : ''}`}
              style={f.style}
              onClick={() => onFont(f.key as FontClass)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── DIGITAL SIGNATURE ── */}
      <div className={styles.section}>
        <SectionTitle>Digital Signature</SectionTitle>
        <SignaturePad
          onApply={onSigApply}
          upRef={upSigRef}
        />
      </div>

      {/* ── EXTRAS ── */}
      <div className={styles.section}>
        <SectionTitle>Letter Sections</SectionTitle>
        <div className={styles.sectionToggles}>
          <button className={`${styles.toggleBtn} ${state.showEncl ? styles.toggleBtnOn : ''}`} onClick={onToggleEncl}>📎 Enclosure</button>
          <button className={`${styles.toggleBtn} ${state.showCopy ? styles.toggleBtnOn : ''}`} onClick={onToggleCopy}>📋 Copy To</button>
          <button className={`${styles.toggleBtn} ${state.showEndorse ? styles.toggleBtnOn : ''}`} onClick={onToggleEndorse}>📝 Endorsement</button>
        </div>
      </div>

      {/* ── AI GENERATOR (Groq-powered, no client key needed) ── */}
      <div className={styles.aiSection}>
        <div className={styles.aiHeader}>✨ AI — Complete Letter Generator</div>
        <div className={styles.aiInfo}>
          Powered by <strong>Groq AI (Llama 3.3)</strong> — fills <strong>every field automatically</strong>: ministry, dept, To, Subject, Ref, body paragraphs, Encl., Copy To, File No., and signatory.
        </div>

        <Field label="Letter Type">
          <select className={styles.select} value={aiType} onChange={e => setAiType(e.target.value)}>
            {AI_LETTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Field label="Describe what you need">
          <textarea
            className={styles.textarea}
            rows={4}
            value={aiPrompt}
            placeholder="e.g. Reminder to all postmasters in Nagpur region to submit monthly cash accounts by 5th. Mention penalty for delay. From PMG Nagpur."
            onChange={e => setAiPrompt(e.target.value)}
          />
        </Field>

        <Field label="Language">
          <select className={styles.select} value={aiLang} onChange={e => setAiLang(e.target.value)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="bi">Bilingual (EN + HI)</option>
          </select>
        </Field>

        <button
          className={styles.aiBtn}
          disabled={aiLoading}
          onClick={handleGenerate}
        >
          {aiLoading ? <span className={styles.spinner} /> : '✦'}
          {aiLoading ? 'Generating complete letter…' : 'Generate Complete Letter'}
        </button>

        {aiStatus && (
          <div className={`${styles.aiStatus} ${aiStatus.startsWith('✓') ? styles.aiStatusOk : aiStatus.startsWith('✗') ? styles.aiStatusErr : ''}`}>
            {aiStatus}
          </div>
        )}

        {/* Groq-powered badge — no API key input needed */}
        <div className={styles.groqBadge}>
          <strong>⚡ Groq AI</strong> — Server-side integration. No API key needed from the user. Powered by <strong>Llama 3.3 70B</strong>.
        </div>
      </div>

    </aside>
  );
}
