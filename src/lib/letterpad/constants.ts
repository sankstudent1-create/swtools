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
  if (key === 'ip') return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgyE5GVmnBOyQiy0AveMpnPmeiJhLjLZld_-aEpgH9KpT_YSedoqnMagbtR3uP0KZvo0iiGqgESWSetBUgwwL1z-frzblwInOhqxyrcGUztjB4cB5k0dHbR_0pcj4JCX3Gzzs26LOfMFdyG1nuI7sWt4UbLCrVEhXvwX5uStq1r2PaofAqlM0a4tZ-aPhI/s2620-rw/India%20Post%20Dak%20Sewa%20Jan%20Sewa%20New%20Logo%20Final.png';
  if (key === 'ashoka') return 'data:image/png;base64,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 E/DsJWOFOWgXcmOvj BufhLGL EtB2wmPHh3kQtp3zXHL1/fvkMQn1uWgelBgL2CwMEhMC5A/krQ3cLI C2Lw8WEof2EpODbWV S13SfTMR3 vNeS/VdJW+2oKd l+ xmqGEf0c4hSKo+AfmzHgt13dLdFIJG5wOoRK2IJp/u6UkL JYsn d s3OlX7G4JT dcc1k7Jtszy dKb mveD9 oiyqaP2WUyVGec m2+rMH79ukDjh4Y/AFnF m/R0 hBut PsL hFvp TYJar gN w+HG1 AKtz gX9pVlFSM JjDfEG7wEYGaQhK9YW4XYFsw5Gr0 bAx9 k7H cyyZ rZLghT jNt qtrlcs9ieUrdWbxY1zQfJZgv0nFyoA56yhZ7OC2pJu wNAQr nQB d1HTLQTpL8HjdQKB CUrdWY4oBmS8IglLhFRFwu aPrRLoP VLTPlDTvjC6 ufyC FBI C44ZPp+ibM1l4/f7a4st2/EAOIN9MoVsobk7hSsO6pzCBwwySx8mCcF2GgcTL3hjCoL+vb3LX8aTmILuYTcMonbxUc7YgjOfe6XFk7qx+cCHJkJASv1pCKEAAtXlkT5bGxKbOkS1NwtFgp1o6XXfeE/siMRtvP1By9s6aG5dluLAcwsm1QF5GLNwYtyQ+2it6T01MIwm1irQ9TlhcWSkZSdtugqfJ5AddQyATbz58mtK9znIoJiX2q7g+KUF2B/V2+V0hfDfNTjJ2ETNhnEq6F5m9ivxhl1iLtDzJYkFyYMDVtWWSu7FxlqMtzut8tvceGGBru+IL/pj1GKat/KBqGctj8oFkV4Y+OGAeaf7i3ewHYlLKTilMNH+DbXdGpks5EKfs4FR2orLylm3jFjM+KO9Wzm6l4FhLDlr98GfblIG3O0RLIvYNkFBTTCIPMTFLDcvICvXvsrc/kJzLMJdX2YZ0rzLIA8tOACL6IpuvC6WhJzVOYAUubDGWkaQ7khQ7Z/dCvsVcqqi+u/s3K8+yzDXZMq6liFu+B2GCUZaTvnkLEQOgjQL95SGDlV1rsSBtJEn7QLInc1M6FPE5j8ylK58QD+GC+KxsinvBY0nwpxNWEyjaI+op3g/lsVkn4KJ/1Lw9P7yWIa/k4BdC3bKWvfnA8Pz2a4VPQ2f/cJ2IFW02Jn4jbi95CR/2slyupxeITNhtGyWmekpKcFkW6u/7zSx5xMhAikMHN+1ZzhCVK5EzcJaV8rVO7AZ+iozMhqiip0JHyXQQ1+YViJxX2nKot80YGinHMAzjei9L6wqDaV8ciuqeIPFao6rhA9jjSF26Bd4fXCIbdyz5+gR+uE7iN4S25qZlTzSEgZ9tplmp5IeR07zRY7xWlMVZijUHW6s3YWFOnGQDFEI/7kgb77aWHDlNm1XAOiVPHtGYveEP9nCnnLElx+VIJJesk4yJAHb01QSRC7F5oa6LIV9WmPEkF6X2wDa0a0HaSsEj4g4NC7SKjjzbES57yFM7lJbQanm8Y+JyxoHmD3nfobRbmWpzRK4ghrWwSQousXX3+lIM3h2/Ia2hTBbPosymGdz50H1wsqqIZAKcpUpfEDWN+u6SnoMQLHyG9kE5EU7gFVBiW8uf+TP Fb6cflrf6WCxZkmEa+T4BcXn1LldHfw7ngk5soznDSa9BYDsILTHi9b3IBHtjjcRiTl+EEPOM7Hq4PO0N5lJ8kmcYcpqsN9jT11xRTQSWDOxa5ddP2rzX8LpKZ/Ayq/2C6Gvnr41zPHjOavwdoqqivqVJf+S/2RnbXzKY4cGeaELrjqjMdMalXBfKVps8Gwv9hvNIR36fNIbIfeCdQcKtQREADi05Ej96I0I0ReR7UMUuI8Yp66XGzYV9oZ6SshN8YFmN5l9isU6u3XF9S6q9X3GZvsQw7zhwbU6pM1C3HCknGDxGar5C5I8zhl4lTCS/4x4jtI+YkPordeR9UZXOxzJoadcPsQd2Fb+eAspv7ukM2pk0Yl92U8P9znCQSVEz1mQ4LXNrFfvE7oQqwd9kl/mj8At2YB7IvV/HGp2bo0yME0nM7CXGzlw1wHJICi7S32LfwOMiXbsZOdMYOlmI1JoTiv3yw1G/HJuP4pFnnr5PYRNxBknN90LVv+JLKEfZbeQlYnTHL70P2Ezel2oED15nieVw+T9OkaTxLVgfoyu35fUazvbNEXfoB/yH6Q8Kx+/PyHEV+I3OjJpQYzhim0+sUQy0SWNBM1/Z/kZauE3paHkLS8nW5PrndD1ERyEbANcbVqqvSdjgDdnSE+YH4Wy5vEfd6rev1L750DnAWMD7d1UzAbFpoFOzm/8qFif+Uis7JkMliOMno5EoxUvowQ2QG6I6RKZT/km9dan1dJRA9a2XTV E/DsJWOFOWgXcmOvj BufhLGL EtB2wmPHh3kQtp3zXHL1/fvkMQ|';
  if (key === 'railway') return 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEXAnK6sQOu3_YQbcYZBv4wFbXEuyGu4qkvw&s';
  if (key === 'swachh') return 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Swachh_Bharat_Mission_logo.png/320px-Swachh_Bharat_Mission_logo.png';
  const svg = SVG_LOGOS[key];
  if (!svg) return '';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ── Office Presets ────────────────────────────
export const OFFICE_PRESETS: Record<string, OfficePreset> = {
  dop:      { h1:'भारत सरकार', h2:'संचार मंत्रालय', e1:'Government of India', e2:'Ministry of Communications', dept:'Department of Posts', divn:'(Establishment Division)', ofc:'Dak Bhavan, Sansad Marg', city:'New Delhi', pin:'110 001', ph:'011-23096000', em:'directorpost@indiapost.gov.in', wb:'www.indiapost.gov.in', ll:'swachh', lr:'ip', t:'A' },
  pm:       { h1:'', h2:'', e1:'', e2:'', dept:'Prime Minister', divn:'', ofc:'South Block', city:'New Delhi', pin:'110 001', ph:'011-23012312', em:'connect@pmindia.gov.in', wb:'www.pmindia.gov.in', ll:'ashoka', lr:null, t:'B' },
  minister: { h1:'भारत सरकार', h2:'', e1:'Government of India', e2:'Ministry of ___', dept:'Cabinet Minister', divn:'', ofc:'North Block', city:'New Delhi', pin:'110 001', ph:'', em:'', wb:'india.gov.in', ll:'ashoka', lr:null, t:'B' },
  railway:  { h1:'भारत सरकार', h2:'रेल मंत्रालय', e1:'Government of India', e2:'Ministry of Railways', dept:'Railway Board', divn:'', ofc:'Rail Bhavan, Raisina Road', city:'New Delhi', pin:'110 001', ph:'', em:'', wb:'www.indianrailways.gov.in', ll:'swachh', lr:'railway', t:'A' },
  mp:       { h1:'लोक सभा', h2:'भारत', e1:'LOK SABHA', e2:'INDIA', dept:'Member of Parliament', divn:'', ofc:'Parliament House', city:'New Delhi', pin:'110 001', ph:'011-23034000', em:'', wb:'www.loksabha.nic.in', ll:'ashoka', lr:null, t:'C' },
  mla:      { h1:'विधान सभा', h2:'', e1:'VIDHAN SABHA', e2:'', dept:'Member of Legislative Assembly', divn:'', ofc:'Assembly Secretariat', city:'State Capital', pin:'', ph:'', em:'', wb:'', ll:'ashoka', lr:null, t:'D' },
  district: { h1:'भारत सरकार', h2:'संचार मंत्रालय', e1:'Government of India', e2:'Ministry of Communications', dept:'Department of Posts', divn:'', ofc:'O/o the Supdt. of Post Offices', city:'Nagpur', pin:'440 001', ph:'0712-2540001', em:'spo-ngp@indiapost.gov.in', wb:'www.indiapost.gov.in', ll:'swachh', lr:'ip', t:'A' },
  rms:      { h1:'भारत सरकार', h2:'रेल डाक सेवा', e1:'Government of India', e2:'Railway Mail Service', dept:'Dept of Posts – RMS', divn:'', ofc:'O/o the Sr. Supdt., RMS', city:'', pin:'', ph:'', em:'', wb:'www.indiapost.gov.in', ll:'swachh', lr:'ip', t:'A' },
  savings:  { h1:'भारत सरकार', h2:'डाकघर बचत बैंक', e1:'Government of India', e2:'Post Office Savings Bank', dept:'Department of Posts', divn:'', ofc:'Head Post Office', city:'', pin:'', ph:'', em:'posb@indiapost.gov.in', wb:'www.indiapost.gov.in', ll:'swachh', lr:'ip', t:'A' },
  custom:   { h1:'भारत सरकार', h2:'', e1:'Government of India', e2:'', dept:'', divn:'', ofc:'', city:'', pin:'', ph:'', em:'', wb:'', ll:'ashoka', lr:null, t:'A' },
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

export const DEFAULT_LOGO_POS: LogoPos = { x: 42, y: 24, w: 100, placed: false };

export const TEMPLATE_INFO: Record<TemplateType, { label: string; desc: string }> = {
  A: { label: 'Type-A · Classic DoP / Dak Bhavan', desc: 'FileNo left · Logo right · Stars divider' },
  B: { label: 'Type-B · PM / Senior Official',     desc: 'Emblem center · Address top-right' },
  C: { label: 'Type-C · MP / Sansad Member',       desc: 'Dual logos · Bilingual name center' },
  D: { label: 'Type-D · MLA / State Assembly',     desc: 'Emblem left · Prominent name' },
  E: { label: 'Type-E · Office Memorandum (OM)',   desc: 'No To-block · Wide distribution' },
  F: { label: 'Type-F · Circular / General Order', desc: 'CIRCULAR badge · Numbered' },
};

export const FONT_OPTIONS: Array<{ key: string; label: string; style: CSSProperties }> = [
  { key: '',    label: 'Outfit (Default)', style: { fontFamily: "var(--font-outfit), sans-serif" } },
  { key: 'fg',  label: 'EB Garamond',      style: { fontFamily: "'EB Garamond', serif" } },
  { key: 'fs',  label: 'Source Serif',     style: { fontFamily: "'Source Serif 4', serif" } },
  { key: 'fd2', label: 'पोप्पिंस (Poppins)',style: { fontFamily: "var(--font-poppins), sans-serif" } },
  { key: 'ft',  label: 'तिरो',             style: { fontFamily: "'Tiro Devanagari Hindi', serif" } },
  { key: 'fn',  label: 'DM Sans',          style: { fontFamily: "'DM Sans', sans-serif" } },
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
  { value: 'notice',        label: 'Notice Announcement' },
  { value: 'advisory',      label: 'Advisory / Guideline' },
  { value: 'notification',  label: 'Public Notification' },
  { value: 'pm_do',         label: 'PM-style Personal DO Letter' },
  { value: 'mp_letter',     label: 'MP Constituency Letter' },
  { value: 'custom',        label: 'Custom' },
];
