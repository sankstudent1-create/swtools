// ─── GDS Leave Application — Type Definitions ───────────────────────────────

export type LeaveType = 'Paid Leave' | 'Leave Without Allowances (LWA)';

export type LeaveGround =
  | 'Personal affairs'
  | 'Medical ground'
  | 'To officiate in a departmental post';

export type Designation =
  | 'Branch Postmaster (BPM)'
  | 'Assistant Branch Postmaster (ABPM)'
  | 'Dak Sevak';

export type OfficerType = 'SDI' | 'ASP' | 'SP' | 'SSP' | 'manual';

// ─── Form Data ───────────────────────────────────────────────────────────────

export interface ApplicantFields {
  name: string;
  desig: Designation;
  bo: string;       // Branch Office
  so: string;       // Sub Office
  div: string;      // Division
  station: string;
}

export interface LeaveFields {
  leaveType: LeaveType;
  fromDate: string;   // ISO yyyy-mm-dd
  toDate: string;     // ISO yyyy-mm-dd
  days: string;       // auto-calculated display string
  appDate: string;    // application date ISO
  ground: LeaveGround;
  address: string;    // may contain \n for line 2
}

export interface SubstituteFields {
  name: string;
  age: string;
  relation: string;
  address: string;
}

export interface SanctionFields {
  halfYear: string;
  balance: string;
  postmaster: string;
}

export interface CoverLetterFields {
  officerType: OfficerType;
  area: string;       // subdivision / area name (for SDI/ASP/SP/SSP)
  manual: string;     // full title when officerType === 'manual'
  subject: string;    // auto-generated but editable
  remarks: string;
}

export interface FormData {
  applicant: ApplicantFields;
  leave: LeaveFields;
  substitute: SubstituteFields;
  sanction: SanctionFields;
  coverLetter: CoverLetterFields;
}

// ─── Computed / Derived ───────────────────────────────────────────────────────

export interface DerivedData {
  officerLine: string;          // full addressing line for cover letter
  dateStr: string;              // "DD-MM-YYYY to DD-MM-YYYY (N days)"
  appDateFormatted: string;     // "DD-MM-YYYY"
  appDateLong: string;          // "12 April 2025"
  fromDateLong: string;
  toDateLong: string;
  subLine1: string;             // "Name, Age: X, (Relation)"
  boSoLine: string;             // "BO, SO"
  daysCount: string;            // just the number
}

// ─── Officer Map ──────────────────────────────────────────────────────────────

export interface OfficerConfig {
  label: string;
  prefix: string;
}

export const OFFICER_MAP: Record<OfficerType, OfficerConfig> = {
  SDI:    { label: 'Sub-Division / Area Name',    prefix: 'Sub Divisional Inspector of Post Offices' },
  ASP:    { label: 'Sub-Division / Area Name',    prefix: 'Assistant Superintendent of Post Offices' },
  SP:     { label: 'Division / Office Name',      prefix: 'Superintendent of Post Offices' },
  SSP:    { label: 'Division / Office Name',      prefix: 'Senior Superintendent of Post Offices' },
  manual: { label: 'Full Officer Title (manual)', prefix: '' },
};

export const DESIGNATIONS: Designation[] = [
  'Branch Postmaster (BPM)',
  'Assistant Branch Postmaster (ABPM)',
  'Dak Sevak',
];

export const LEAVE_GROUNDS: LeaveGround[] = [
  'Personal affairs',
  'Medical ground',
  'To officiate in a departmental post',
];

// ─── Default form state ───────────────────────────────────────────────────────

export function defaultFormData(): FormData {
  const today = new Date().toISOString().split('T')[0];
  return {
    applicant: { name: '', desig: 'Branch Postmaster (BPM)', bo: '', so: '', div: '', station: '' },
    leave: { leaveType: 'Paid Leave', fromDate: '', toDate: '', days: '', appDate: today, ground: 'Personal affairs', address: '' },
    substitute: { name: '', age: '', relation: '', address: '' },
    sanction: { halfYear: '', balance: '', postmaster: '' },
    coverLetter: { officerType: 'SDI', area: '', manual: '', subject: '', remarks: '' },
  };
}
