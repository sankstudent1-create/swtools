// ─────────────────────────────────────────────
//  types/letterpad.ts  –  All shared TypeScript types for Letterpad
// ─────────────────────────────────────────────

export type TemplateType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type OfficeType =
  | 'dop' | 'pm' | 'minister' | 'mp' | 'mla'
  | 'district' | 'rms' | 'savings' | 'custom';
export type FontClass = '' | 'fg' | 'fs' | 'fd2' | 'ft' | 'fn';
export type SigMode = 'draw' | 'type' | 'upload';
export type LogoSide = 'L' | 'R';
export type AILetterType =
  | 'office_order' | 'om' | 'do' | 'circular' | 'reminder'
  | 'forwarding' | 'scn' | 'noc' | 'appreciation' | 'tour'
  | 'pm_do' | 'mp_letter' | 'custom';
export type AILanguage = 'en' | 'hi' | 'bi';

// ── Letter form state (all sidebar fields) ──────────────
export interface LetterForm {
  // Ministry/Office
  h1: string;       // Hindi line 1
  h2: string;       // Hindi line 2
  e1: string;       // English line 1
  e2: string;       // English line 2
  dept: string;
  divn: string;
  ofc: string;
  city: string;
  pin: string;
  ph: string;
  em: string;
  wb: string;
  // Signatory
  sn: string;       // Name
  sd: string;       // Designation
  sp: string;       // Phone
  sh: string;       // Hindi name
  sc: string;       // Constituency
  // Letter meta
  fno: string;
  dt: string;
  toD: string;
  toA: string;
  sub: string;
  ref: string;
  sal: string;
  cls: string;
  // Body
  body: string;
  // Extras
  encl: string;
  copyTo: string[];
  endorsement: string;
}

// ── Logo position/size on paper ─────────────────────────
export interface LogoPos {
  x: number;
  y: number;
  w: number;
  placed: boolean;
}

// ── Full app state ──────────────────────────────────────
export interface AppState {
  tpl: TemplateType;
  font: FontClass;
  officeType: OfficeType;
  logoL: string | null;   // data URI
  logoR: string | null;
  posL: LogoPos;
  posR: LogoPos;
  sigUrl: string | null;
  sigMode: SigMode;
  showEncl: boolean;
  showCopy: boolean;
  showEndorse: boolean;
  form: LetterForm;
  aiTick?: number;
}

// ── AI response JSON shape ──────────────────────────────
export interface AILetterData {
  file_no: string;
  dept_hindi_1: string;
  dept_hindi_2: string;
  dept_english_1: string;
  dept_english_2: string;
  department: string;
  division: string;
  office: string;
  city: string;
  pin: string;
  phone: string;
  email: string;
  website: string;
  to_designation: string;
  to_address: string;
  subject: string;
  reference: string;
  salutation: string;
  body: string;
  closing: string;
  signatory_name: string;
  signatory_designation: string;
  encl: string;
  copy_to: string[];
}

// ── Office preset data ──────────────────────────────────
export interface OfficePreset {
  h1: string; h2: string;
  e1: string; e2: string;
  dept: string; divn: string;
  ofc: string; city: string; pin: string;
  ph: string; em: string; wb: string;
  ll: string | null;  // logo preset key
  lr: string | null;
  t: TemplateType;
}
