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
    custom:       'Letter',
  };

  const langNote =
    lang === 'hi' ? 'Write EVERYTHING in Hindi (Devanagari script).' :
    lang === 'bi' ? 'Write body in bilingual format (English paragraph then Hindi equivalent).' :
    'Write in English.';

  const isOfficial = type !== 'custom' && type !== 'appreciation';
  
  const styleNote =
    (tpl === 'B' || type === 'pm_do')     ? 'Warm formal DO letter — no numbered paragraphs.' :
    (tpl === 'C' || type === 'mp_letter') ? 'MP letter — formal but personal.' :
    (tpl === 'E' || type === 'om')        ? 'Office Memorandum — body starts "The undersigned is directed to inform..."' :
    isOfficial                            ? 'Standard formal letter with numbered paragraphs for clarity.' :
                                            'Natural letter format. DO NOT use numbered paragraphs unless explicitly requested.';

  return `Generate a complete ${isOfficial ? 'Government of India ' : ''}${tMap[type] ?? 'letter'} with all fields based ONLY on this brief.

User Brief: "${brief || 'Generate a complete realistic example letter'}"

Letter Style: ${styleNote}
Language: ${langNote}

CRITICAL RULES:
1. Do NOT invent unrelated Government Ministries/Departments for personal letters or custom letters unless requested in the brief. 
2. If the user brief is personal (e.g. a love letter, letter to a friend), keep the tone and headers personal. Leave department fields empty if they do not make sense.
3. Body: Write a natural letter. Only use numbered paragraphs if it is a strict official order, OM, or circular.
${isOfficial ? '4. copy_to: 2-3 realistic recipients if applicable. encl: 1-2 realistic enclosures if applicable.' : '4. DO NOT add "copy_to" or "encl" fields unless the brief specifically asks for them.'}

RESPOND WITH ONLY THE JSON OBJECT.`;
}

// ── Result type includes which Groq model was used ──
export interface AILetterResult {
  data: AILetterData;
  model: string;    // e.g. "llama-3.3-70b-versatile" or a fallback
}

// ── Main function — calls /api/generate-letter route ─
export async function generateLetterWithAI(
  prompt: string,
  letterType: string,
  language: string,
  currentContext: { department?: string; office?: string; city?: string },
  onStatus: (msg: string) => void
): Promise<AILetterResult> {
  onStatus('⏳ Sending to Groq AI server…');

  const res = await fetch('/api/generate-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: prompt, letterType, language, currentContext }),
  });

  const json = await res.json() as {
    success?: boolean;
    data?: Record<string, unknown>;
    error?: string;
    model?: string;
  };

  if (!res.ok || json.error) {
    throw new Error(json.error ?? `Server error: HTTP ${res.status}`);
  }
  if (!json.data) {
    throw new Error('AI returned an empty response. Please try again.');
  }

  const modelUsed = json.model || 'Groq AI';

  // Map short-key Groq response → AILetterData
  const d = json.data;
  const data: AILetterData = {
    file_no:               (d.fno  || d.file_no  || '') as string,
    dept_hindi_1:          (d.h1   || d.dept_hindi_1 || '') as string,
    dept_hindi_2:          (d.h2   || d.dept_hindi_2 || '') as string,
    dept_english_1:        (d.e1   || d.dept_english_1 || '') as string,
    dept_english_2:        (d.e2   || d.dept_english_2 || '') as string,
    department:            (d.dept || d.department || '') as string,
    division:              (d.divn || d.division || '') as string,
    office:                (d.ofc  || d.office || '') as string,
    city:                  (d.city || '') as string,
    pin:                   (d.pin  || '') as string,
    phone:                 (d.ph   || d.phone || '') as string,
    email:                 (d.em   || d.email || '') as string,
    website:               (d.wb   || d.website || '') as string,
    to_designation:        (d.toD  || d.to_designation || '') as string,
    to_address:            (d.toA  || d.to_address || '') as string,
    subject:               (d.sub  || d.subject || '') as string,
    reference:             (d.ref  || d.reference || '') as string,
    salutation:            (d.sal  || d.salutation || '') as string,
    body:                  (d.body || '') as string,
    closing:               (d.cls  || d.closing || '') as string,
    signatory_name:        (d.sn   || d.signatory_name || '') as string,
    signatory_designation: (d.sd   || d.signatory_designation || '') as string,
    encl: (Array.isArray(d.enclList)
      ? (d.enclList as string[]).join('\n')
      : (d.encl || '')) as string,
    copy_to: (Array.isArray(d.copyList)
      ? d.copyList as string[]
      : Array.isArray(d.copy_to)
        ? d.copy_to as string[]
        : []) as string[],
  };

  const shortModel = modelUsed.split('/').pop() ?? modelUsed;
  onStatus(`✓ Letter generated! (via ${shortModel})`);

  return { data, model: modelUsed };
}
