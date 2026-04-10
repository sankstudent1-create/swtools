// ─────────────────────────────────────────────
//  lib/letterpad/constants.ts  –  All static data & SVGs
// ─────────────────────────────────────────────
import type { OfficePreset, LetterForm, TemplateType, LogoPos } from '@/types/letterpad';
import type { CSSProperties } from 'react';

// ── SVG Logos ────────────────────────────────
const SPOKES_24 = Array.from({ length: 24 }, (_, i) => {
  const a = (i * Math.PI * 2) / 24;
  const x1 = (60 + 8 * Math.sin(a)).toFixed(1);
  const y1 = (50 - 8 * Math.cos(a)).toFixed(1);
  const x2 = (60 + 33 * Math.sin(a)).toFixed(1);
  const y2 = (50 - 33 * Math.cos(a)).toFixed(1);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#06038D" stroke-width="1.8"/>`;
}).join('');

export const SVG_LOGOS: Record<string, string> = {
  ashoka: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 135">
<circle cx="60" cy="50" r="43" fill="none" stroke="#06038D" stroke-width="3"/>
<circle cx="60" cy="50" r="35" fill="none" stroke="#06038D" stroke-width="1.5"/>
<circle cx="60" cy="50" r="6" fill="#06038D"/>
${SPOKES_24}
<g fill="#06038D">
  <ellipse cx="43" cy="92" rx="7" ry="9"/><circle cx="42" cy="83" r="6"/>
  <ellipse cx="77" cy="92" rx="7" ry="9"/><circle cx="78" cy="83" r="6"/>
  <ellipse cx="60" cy="91" rx="6" ry="8"/><circle cx="60" cy="82" r="6"/>
</g>
<rect x="29" y="100" width="62" height="7" rx="1" fill="#06038D"/>
<text x="60" y="116" text-anchor="middle" font-size="7.5" fill="#06038D" font-family="'Noto Serif Devanagari',serif" font-weight="600">सत्यमेव जयते</text>
<text x="60" y="128" text-anchor="middle" font-size="5.8" fill="#06038D" font-family="serif" letter-spacing="1">SATYAMEVA JAYATE</text>
</svg>`,

  ip: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="6" fill="#CC1111"/>
<rect x="4" y="4" width="92" height="92" rx="4" fill="none" stroke="#fff" stroke-width="1.5"/>
<text x="50" y="28" text-anchor="middle" font-size="9.5" fill="#fff" font-family="'Libre Baskerville',serif" font-weight="700" letter-spacing=".5">INDIA POST</text>
<text x="50" y="40" text-anchor="middle" font-size="8.5" fill="#ffdd99" font-family="'Noto Serif Devanagari',serif">भारतीय डाक</text>
<text x="50" y="64" text-anchor="middle" font-size="26" fill="#fff">✉</text>
<text x="50" y="80" text-anchor="middle" font-size="7" fill="rgba(255,255,255,.8)" font-family="sans-serif">Department of Posts</text>
<text x="50" y="92" text-anchor="middle" font-size="6" fill="rgba(255,255,255,.6)" font-family="sans-serif">Government of India</text>
</svg>`,

  sansad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 120">
<circle cx="55" cy="50" r="47" fill="none" stroke="#8B0000" stroke-width="3"/>
<circle cx="55" cy="50" r="39" fill="none" stroke="#8B0000" stroke-width="1"/>
<text x="55" y="38" text-anchor="middle" font-size="10.5" fill="#8B0000" font-family="'Noto Serif Devanagari',serif" font-weight="700">संसद</text>
<text x="55" y="52" text-anchor="middle" font-size="9" fill="#8B0000" font-family="'Libre Baskerville',serif" font-weight="700">SANSAD</text>
<text x="55" y="63" text-anchor="middle" font-size="7.5" fill="#8B0000" font-family="serif">BHARAT · INDIA</text>
<path d="M22 78 Q55 65 88 78" fill="none" stroke="#8B0000" stroke-width="1.5"/>
<text x="55" y="93" text-anchor="middle" font-size="7" fill="#8B0000" font-family="serif">Parliament of India</text>
<text x="55" y="108" text-anchor="middle" font-size="7" fill="#8B0000" font-family="'Noto Serif Devanagari',serif">भारत की संसद</text>
</svg>`,

  mh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110">
<circle cx="50" cy="47" r="44" fill="none" stroke="#FF6600" stroke-width="2.5"/>
<circle cx="50" cy="47" r="36" fill="none" stroke="#FF6600" stroke-width="1"/>
<text x="50" y="33" text-anchor="middle" font-size="8.5" fill="#FF6600" font-family="'Noto Serif Devanagari',serif" font-weight="700">महाराष्ट्र सरकार</text>
<text x="50" y="46" text-anchor="middle" font-size="7.5" fill="#FF6600" font-family="serif">GOVT. OF MAHARASHTRA</text>
<text x="50" y="62" text-anchor="middle" font-size="22" fill="#FF6600">🌀</text>
<text x="50" y="83" text-anchor="middle" font-size="7" fill="#FF6600" font-family="sans-serif">State Seal</text>
<text x="50" y="100" text-anchor="middle" font-size="7" fill="#FF6600" font-family="'Noto Serif Devanagari',serif">महाराष्ट्र</text>
</svg>`,
};

export function svgToDataUri(key: string): string {
  const svg = SVG_LOGOS[key];
  if (!svg) return '';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ── Office Presets ────────────────────────────
export const OFFICE_PRESETS: Record<string, OfficePreset> = {
  dop:      { h1:'भारत सरकार', h2:'संचार मंत्रालय', e1:'Government of India', e2:'Ministry of Communications', dept:'Department of Posts', divn:'(Establishment Division)', ofc:'Dak Bhavan, Sansad Marg', city:'New Delhi', pin:'110 001', ph:'011-23096000', em:'directorpost@indiapost.gov.in', wb:'www.indiapost.gov.in', ll:'ip', lr:'ashoka', t:'A' },
  pm:       { h1:'', h2:'', e1:'', e2:'', dept:'Prime Minister', divn:'', ofc:'South Block', city:'New Delhi', pin:'110 001', ph:'011-23012312', em:'connect@pmindia.gov.in', wb:'www.pmindia.gov.in', ll:'ashoka', lr:null, t:'B' },
  minister: { h1:'भारत सरकार', h2:'', e1:'Government of India', e2:'Ministry of ___', dept:'Cabinet Minister', divn:'', ofc:'North Block', city:'New Delhi', pin:'110 001', ph:'', em:'', wb:'india.gov.in', ll:'ashoka', lr:null, t:'B' },
  mp:       { h1:'लोक सभा', h2:'भारत', e1:'LOK SABHA', e2:'INDIA', dept:'Member of Parliament', divn:'', ofc:'Parliament House', city:'New Delhi', pin:'110 001', ph:'011-23034000', em:'', wb:'www.loksabha.nic.in', ll:'sansad', lr:'ashoka', t:'C' },
  mla:      { h1:'विधान सभा', h2:'', e1:'VIDHAN SABHA', e2:'', dept:'Member of Legislative Assembly', divn:'', ofc:'Assembly Secretariat', city:'State Capital', pin:'', ph:'', em:'', wb:'', ll:'ashoka', lr:null, t:'D' },
  district: { h1:'भारत सरकार', h2:'संचार मंत्रालय', e1:'Government of India', e2:'Ministry of Communications', dept:'Department of Posts', divn:'', ofc:'O/o the Supdt. of Post Offices', city:'Nagpur', pin:'440 001', ph:'0712-2540001', em:'spo-ngp@indiapost.gov.in', wb:'www.indiapost.gov.in', ll:'ip', lr:'ashoka', t:'A' },
  rms:      { h1:'भारत सरकार', h2:'रेल डाक सेवा', e1:'Government of India', e2:'Railway Mail Service', dept:'Dept of Posts – RMS', divn:'', ofc:'O/o the Sr. Supdt., RMS', city:'', pin:'', ph:'', em:'', wb:'www.indiapost.gov.in', ll:'ip', lr:'ashoka', t:'A' },
  savings:  { h1:'भारत सरकार', h2:'डाकघर बचत बैंक', e1:'Government of India', e2:'Post Office Savings Bank', dept:'Department of Posts', divn:'', ofc:'Head Post Office', city:'', pin:'', ph:'', em:'posb@indiapost.gov.in', wb:'www.indiapost.gov.in', ll:'ip', lr:'ashoka', t:'A' },
  custom:   { h1:'भारत सरकार', h2:'', e1:'Government of India', e2:'', dept:'', divn:'', ofc:'', city:'', pin:'', ph:'', em:'', wb:'', ll:null, lr:'ashoka', t:'A' },
};

// ── Default form values ───────────────────────
export const DEFAULT_FORM: LetterForm = {
  h1: '',
  h2: '',
  e1: '',
  e2: '',
  dept: '',
  divn: '',
  ofc: '',
  city: '',
  pin: '',
  ph: '',
  em: '',
  wb: '',
  sn: '',
  sd: '',
  sp: '',
  sh: '',
  sc: '',
  fno: '',
  dt: '',
  toD: '',
  toA: '',
  sub: '',
  ref: '',
  sal: 'Sir',
  cls: 'Yours faithfully',
  body: '',
  encl: '',
  copyTo: [],
  endorsement: '',
};

export const DEFAULT_LOGO_POS: LogoPos = { x: 42, y: 14, w: 68, placed: false };

export const TEMPLATE_INFO: Record<TemplateType, { label: string; desc: string }> = {
  A: { label: 'Type-A · Classic DoP / Dak Bhavan', desc: 'FileNo left · Logo right · Stars divider' },
  B: { label: 'Type-B · PM / Senior Official',     desc: 'Emblem center · Address top-right' },
  C: { label: 'Type-C · MP / Sansad Member',       desc: 'Dual logos · Bilingual name center' },
  D: { label: 'Type-D · MLA / State Assembly',     desc: 'Emblem left · Prominent name' },
  E: { label: 'Type-E · Office Memorandum (OM)',   desc: 'No To-block · Wide distribution' },
  F: { label: 'Type-F · Circular / General Order', desc: 'CIRCULAR badge · Numbered' },
};

export const FONT_OPTIONS: Array<{ key: string; label: string; style: CSSProperties }> = [
  { key: '',    label: 'Baskerville', style: { fontFamily: "'Libre Baskerville', serif" } },
  { key: 'fg',  label: 'EB Garamond', style: { fontFamily: "'EB Garamond', serif" } },
  { key: 'fs',  label: 'Source Serif', style: { fontFamily: "'Source Serif 4', serif" } },
  { key: 'fd2', label: 'देवनागरी',    style: { fontFamily: "'Noto Serif Devanagari', serif" } },
  { key: 'ft',  label: 'तिरो',        style: { fontFamily: "'Tiro Devanagari Hindi', serif" } },
  { key: 'fn',  label: 'DM Sans',     style: { fontFamily: "'DM Sans', sans-serif" } },
];

export const SALUTATION_OPTIONS = ['Sir', 'Madam', 'Sir/Madam', 'Dear Sir', 'Dear Madam', 'Dear Shri'];
export const CLOSING_OPTIONS = ['Yours faithfully', 'Yours sincerely', 'Yours obediently', 'With warm regards'];

export const AI_LETTER_TYPES: Array<{ value: string; label: string }> = [
  { value: 'office_order',  label: 'Office Order' },
  { value: 'om',            label: 'Office Memorandum (OM)' },
  { value: 'do',            label: 'Demi-Official (D.O.) Letter' },
  { value: 'circular',      label: 'Circular' },
  { value: 'reminder',      label: 'Reminder Letter' },
  { value: 'forwarding',    label: 'Forwarding / Endorsement' },
  { value: 'scn',           label: 'Show Cause Notice' },
  { value: 'noc',           label: 'No Objection Certificate' },
  { value: 'appreciation',  label: 'Letter of Appreciation' },
  { value: 'tour',          label: 'Tour Programme' },
  { value: 'pm_do',         label: 'PM-style Personal DO Letter' },
  { value: 'mp_letter',     label: 'MP Constituency Letter' },
  { value: 'custom',        label: 'Custom' },
];
