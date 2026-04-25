// ─── GDS Leave Application — Utility Functions ──────────────────────────────

import type { FormData, DerivedData, OfficerType, CoverLetterFields } from '@/types/gds';
import { OFFICER_MAP } from '@/types/gds';

// ─── Date Formatting ─────────────────────────────────────────────────────────

/** yyyy-mm-dd → dd-mm-yyyy */
export function fmtDMY(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

/** yyyy-mm-dd → "12 April 2025" */
export function fmtLong(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Calculate number of days between two ISO date strings (inclusive) */
export function calcDays(from: string, to: string): string {
  if (!from || !to) return '';
  const n = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;
  if (n <= 0) return 'Invalid';
  return `${n} day${n > 1 ? 's' : ''}`;
}

// ─── Officer Line Builder ────────────────────────────────────────────────────

export function buildOfficerLine(cl: CoverLetterFields): string {
  if (cl.officerType === 'manual') {
    return cl.manual.trim() || 'Sub Divisional Inspector of Post Offices';
  }
  const cfg = OFFICER_MAP[cl.officerType];
  const area = cl.area.trim();
  return cfg.prefix + (area ? `, ${area}` : '');
}

// ─── Auto-generate subject line ───────────────────────────────────────────────

export function buildSubject(data: FormData): string {
  const { applicant, leave } = data;
  const name = applicant.name || '___';
  const bo   = applicant.bo   || '___';
  const days = leave.days     || '__ days';
  const range = leave.fromDate
    ? ` (${fmtDMY(leave.fromDate)} to ${fmtDMY(leave.toDate)})`
    : '';
  return `Request for grant of ${leave.leaveType} to ${name}, ${bo} — ${days}${range}`;
}

// ─── Derive all computed display values ──────────────────────────────────────

export function derive(data: FormData): DerivedData {
  const { applicant, leave, substitute, coverLetter } = data;

  const officerLine = buildOfficerLine(coverLetter);

  const dateStr = leave.fromDate && leave.toDate
    ? `${fmtDMY(leave.fromDate)} to ${fmtDMY(leave.toDate)}${leave.days ? ` (${leave.days})` : ''}`
    : '';

  const subLine1 = [
    substitute.name,
    substitute.age   ? `Age: ${substitute.age}`    : '',
    substitute.relation ? `(${substitute.relation})` : '',
  ].filter(Boolean).join(', ');

  const boSoLine = [applicant.bo, applicant.so].filter(Boolean).join(', ');

  const daysCount = leave.days.replace(' days', '').replace(' day', '');

  return {
    officerLine,
    dateStr,
    appDateFormatted: fmtDMY(leave.appDate),
    appDateLong:      fmtLong(leave.appDate),
    fromDateLong:     fmtLong(leave.fromDate),
    toDateLong:       fmtLong(leave.toDate),
    subLine1,
    boSoLine,
    daysCount,
  };
}

// ─── localStorage helpers (safe — SSR-compatible) ────────────────────────────

const LS_PREFIX = 'gds2_';

export function lsGet(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_PREFIX + key) || '[]') as string[];
  } catch {
    return [];
  }
}

export function lsSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  if (!value || value.length < 2) return;
  const v = value.trim();
  const existing = lsGet(key);
  const updated = [v, ...existing.filter(x => x.toLowerCase() !== v.toLowerCase())].slice(0, 20);
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(updated));
  } catch {
    // quota exceeded — ignore
  }
}

// ─── Print / PDF generation ──────────────────────────────────────────────────

/** CSS used inside the printed window */
export function getPrintCSS(): string {
  return `
@page { size: 215.91mm 279.42mm; margin: 0; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #fff; }
.pdf-page {
  display: block; width: 215.91mm; height: 279.42mm;
  position: relative; background: #fff;
  font-family: 'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif;
  color: #000; overflow: hidden; page-break-after: always;
}
.pdf-border {
  position: absolute; left: 8.47mm; top: 8.47mm;
  width: 199.01mm; height: 262.52mm; border: 1pt solid #000;
}
.t {
  position: absolute; white-space: nowrap; font-size: 12pt; line-height: 1; color: #000;
  font-family: 'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif;
}
.t.bold  { font-weight: bold; }
.t.sz10  { font-size: 10pt; }
.t.sz12  { font-size: 12pt; }
.ul  { position: absolute; height: 0; border-bottom: 0.8pt solid #000; }
.ulv {
  position: absolute; font-size: 11pt; line-height: 1; color: #000;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-family: 'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif;
}
#letter-content {
  position: absolute; left: 22mm; top: 18mm; right: 18mm; bottom: 15mm;
  font-family: 'Bookman Old Style','Book Antiqua',Palatino,Georgia,serif;
  font-size: 11pt; line-height: 1.75; color: #000; overflow: hidden;
}
`;
}
