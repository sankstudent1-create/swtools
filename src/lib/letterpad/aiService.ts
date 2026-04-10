// ─────────────────────────────────────────────
//  lib/letterpad/aiService.ts  –  AI letter generation
//  Uses Groq API via server-side /api/generate-letter route.
//  No client-side API keys needed — GROQ_API_KEY is set server-side.
// ─────────────────────────────────────────────
import type { AILetterData, LetterForm, TemplateType } from '@/types/letterpad';

// ── Build user prompt from context ──────────
export function buildPrompt(
  type: string,
  brief: string,
  lang: string,
  form: LetterForm,
  tpl: TemplateType
): string {
  const tMap: Record<string, string> = {
    office_order: 'Office Order',
    om:           'Office Memorandum (OM)',
    do:           'Demi-Official (D.O.) Letter',
    circular:     'Circular',
    reminder:     'Reminder Letter',
    forwarding:   'Forwarding / Endorsement Note',
    scn:          'Show Cause Notice',
    noc:          'No Objection Certificate',
    appreciation: 'Letter of Appreciation',
    tour:         'Tour Programme Communication',
    pm_do:        'Prime Ministerial personal DO letter',
    mp_letter:    'MP Constituency Letter',
    custom:       'Official Government Letter',
  };

  const langNote =
    lang === 'hi' ? 'Write EVERYTHING in formal Hindi (Devanagari script).' :
    lang === 'bi' ? 'Write body in bilingual format (English paragraph then Hindi equivalent).' :
    'Write in formal English.';

  const styleNote =
    (tpl === 'B' || type === 'pm_do')    ? 'PM/senior official personal DO letter — warm formal, no numbered paragraphs.' :
    (tpl === 'C' || type === 'mp_letter')? 'MP letter — formal but personal.' :
    (tpl === 'E' || type === 'om')        ? 'Office Memorandum — body starts "The undersigned is directed to inform..."' :
    'Standard GoI formal letter with numbered paragraphs.';

  return `Generate a complete Government of India ${tMap[type] ?? 'official letter'} with all fields.

User Brief: "${brief || 'Generate a complete realistic example letter of this type'}"

Letter Style: ${styleNote}
Language: ${langNote}

Generate ALL fields completely based solely on the user brief.
Body: 3-5 paragraphs with proper GoI phrasing.
copy_to: 3-4 realistic recipients. encl: 1-2 realistic enclosures if applicable.

RESPOND WITH ONLY THE JSON OBJECT.`;
}

// ── Main function — calls /api/generate-letter route ─
// The API route handles Groq auth server-side, zero CORS issues.
export async function generateLetterWithAI(
  prompt: string,
  letterType: string,
  language: string,
  currentContext: { department?: string; office?: string; city?: string },
  onStatus: (msg: string) => void
): Promise<AILetterData> {
  onStatus('⏳ Sending to Groq AI server…');

  const res = await fetch('/api/generate-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: prompt,
      letterType,
      language,
      currentContext,
    }),
  });

  const json = await res.json() as { success?: boolean; data?: Record<string, unknown>; error?: string };

  if (!res.ok || json.error) {
    throw new Error(json.error ?? `Server error: HTTP ${res.status}`);
  }

  if (!json.data) {
    throw new Error('AI returned an empty response. Please try again.');
  }

  // Map the Groq response (which uses short keys) to AILetterData format
  const d = json.data;
  const result: AILetterData = {
    file_no:               (d.fno || d.file_no || '') as string,
    dept_hindi_1:          (d.h1 || d.dept_hindi_1 || '') as string,
    dept_hindi_2:          (d.h2 || d.dept_hindi_2 || '') as string,
    dept_english_1:        (d.e1 || d.dept_english_1 || '') as string,
    dept_english_2:        (d.e2 || d.dept_english_2 || '') as string,
    department:            (d.dept || d.department || '') as string,
    division:              (d.divn || d.division || '') as string,
    office:                (d.ofc || d.office || '') as string,
    city:                  (d.city || '') as string,
    pin:                   (d.pin || '') as string,
    phone:                 (d.ph || d.phone || '') as string,
    email:                 (d.em || d.email || '') as string,
    website:               (d.wb || d.website || '') as string,
    to_designation:        (d.toD || d.to_designation || '') as string,
    to_address:            (d.toA || d.to_address || '') as string,
    subject:               (d.sub || d.subject || '') as string,
    reference:             (d.ref || d.reference || '') as string,
    salutation:            (d.sal || d.salutation || '') as string,
    body:                  (d.body || '') as string,
    closing:               (d.cls || d.closing || '') as string,
    signatory_name:        (d.sn || d.signatory_name || '') as string,
    signatory_designation: (d.sd || d.signatory_designation || '') as string,
    encl:                  (Array.isArray(d.enclList) ? (d.enclList as string[]).join('\n') : (d.encl || '')) as string,
    copy_to:               (Array.isArray(d.copyList) ? d.copyList as string[] : Array.isArray(d.copy_to) ? d.copy_to as string[] : []) as string[],
  };

  onStatus('✓ Letter generated successfully!');
  return result;
}
