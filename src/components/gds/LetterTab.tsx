'use client';

import React from 'react';
import { AutocompleteInput } from '@/components/gds/AutocompleteInput';
import { FormField, inputCls } from '@/components/gds/FormField';
import type { FormData, OfficerType } from '@/types/gds';
import { OFFICER_MAP } from '@/types/gds';
import { buildOfficerLine, fmtLong, fmtDMY } from '@/lib/gds/utils';

interface LetterTabProps {
  data: FormData;
  onChange: (data: FormData) => void;
}

const OFFICER_TYPES: OfficerType[] = ['SDI', 'ASP', 'SP', 'SSP', 'manual'];

export function LetterTab({ data, onChange }: LetterTabProps) {
  const { applicant, leave, substitute, coverLetter } = data;
  const boLine = [applicant.bo, applicant.so].filter(Boolean).join(', ');

  function setCL(patch: Partial<typeof coverLetter>) {
    const updated = { ...coverLetter, ...patch };
    onChange({ ...data, coverLetter: updated });
  }

  const officerLine = buildOfficerLine(coverLetter);

  // Live letter preview
  const fromLong = fmtLong(leave.fromDate);
  const toLong   = fmtLong(leave.toDate);
  const appLong  = fmtLong(leave.appDate);

  return (
    <div className="flex flex-col gap-5">

      {/* Card 1 — Addressee */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.01]">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">1</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Addressed To — Select Officer</span>
        </div>
        <div className="p-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300 mb-5 flex gap-3 items-start">
            <span className="text-amber-400 mt-0.5">ℹ️</span>
            Select the officer type, then enter area / division name. Previously entered values are saved and suggested automatically.
          </div>

          {/* Officer type buttons */}
          <div className="flex gap-2 flex-wrap mb-5">
            {OFFICER_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setCL({ officerType: type })}
                className={`px-4 py-2 text-sm font-semibold border rounded-xl transition-all cursor-pointer select-none ${
                  coverLetter.officerType === type
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                    : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                {type === 'manual' ? 'Manual' : type}
              </button>
            ))}
          </div>

          {/* Area / manual input */}
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 mb-5">
            {coverLetter.officerType !== 'manual' && (
              <FormField label={OFFICER_MAP[coverLetter.officerType].label} htmlFor="cl-area">
                <AutocompleteInput
                  id="cl-area"
                  value={coverLetter.area}
                  onChange={v => setCL({ area: v })}
                  lsKey="clarea"
                  icon="🏢"
                  placeholder="e.g. Latur Sub Division"
                  onSelect={v => setCL({ area: v })}
                />
              </FormField>
            )}
            {coverLetter.officerType === 'manual' && (
              <FormField label="Full Officer Title (manual)" htmlFor="cl-manual" className="col-span-2 max-sm:col-span-1">
                <input
                  id="cl-manual"
                  type="text"
                  value={coverLetter.manual}
                  onChange={e => setCL({ manual: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Director of Postal Services, Aurangabad"
                />
              </FormField>
            )}
          </div>

          {/* Resulting address line */}
          <FormField label="Addressing Line" auto>
            <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-emerald-400 font-semibold px-4 py-2.5 text-sm">
              {officerLine || '—'}
            </div>
          </FormField>

          {/* Subject + Remarks */}
          <div className="grid grid-cols-2 gap-4 mt-5 max-sm:grid-cols-1">
            <FormField label="Subject Line" auto className="col-span-2 max-sm:col-span-1">
              <input
                type="text"
                value={coverLetter.subject}
                onChange={e => setCL({ subject: e.target.value })}
                className={inputCls}
                placeholder="Auto-generated"
              />
            </FormField>
            <FormField label="Additional Remarks (optional)" className="col-span-2 max-sm:col-span-1">
              <textarea
                rows={3}
                value={coverLetter.remarks}
                onChange={e => setCL({ remarks: e.target.value })}
                className={`${inputCls} resize-y min-h-[80px] leading-[1.6]`}
                placeholder="Medical details, special circumstances, etc."
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Card 2 — Letter Preview */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.01]">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">2</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Letter Preview</span>
        </div>
        <div className="p-5">
          <div className="bg-white text-black border border-white/[0.2] rounded-xl p-8 font-[Georgia,serif] text-sm leading-[1.8] shadow-inner">

            {/* Date — right */}
            <div className="text-right mb-4 text-xs leading-[1.5]">
              <div>Date: {appLong || '[Date]'}</div>
            </div>

            {/* Addressee */}
            <div className="mb-4 leading-[1.6]">
              <div>To,</div>
              <div><strong>{officerLine || 'Sub Divisional Inspector of Post Offices'}</strong></div>
              {applicant.div && <div>{applicant.div}</div>}
            </div>

            <p className="mb-2"><strong>Sub: {coverLetter.subject || 'Request for grant of leave'}</strong></p>
            <p className="mb-2"><strong>Ref:</strong> Nil</p>
            <p className="mb-2">Respected Sir / Madam,</p>
            <p className="mb-2 text-justify">
              &emsp;I, <strong>{applicant.name || 'the undersigned'}</strong>, serving as{' '}
              <strong>{applicant.desig || 'GDS'}</strong> at{' '}
              <strong>{applicant.bo || '[Branch Office]'}</strong>
              {applicant.so && <>, <strong>{applicant.so}</strong></>},{' '}
              <strong>{applicant.div || '[Division]'}</strong>, respectfully submit this application
              for the grant of <strong>{leave.leaveType}</strong> for{' '}
              <strong>{leave.days || '___'} days</strong> with effect from{' '}
              <strong>{fromLong || '______'}</strong> to <strong>{toLong || '______'}</strong> on
              grounds of <strong>{leave.ground}</strong>.
            </p>
            <p className="mb-2 text-justify">
              {coverLetter.remarks
                ? `\u2003${coverLetter.remarks}`
                : `\u2003During the said period, I shall be available at: ${leave.address || '[address as in application]'}.`}
            </p>
            <p className="mb-2 text-justify">
              &emsp;I propose Shri/Smt/Kum. <strong>{substitute.name || '_______'}</strong>
              {substitute.age && <>, aged <strong>{substitute.age}</strong></>}
              {substitute.relation && `, ${substitute.relation}`}
              {substitute.address && `, resident of ${substitute.address}`}, to work as my substitute
              during my leave period. I take full responsibility for this arrangement as per the terms
              of the security bond executed by me.
            </p>
            <p className="mb-2 text-justify">
              &emsp;I humbly request your kind approval for the grant of leave and sanction of the
              substitute arrangement at the earliest. Leave application in prescribed format
              (quadruplicate) is attached herewith.
            </p>

            {/* Closing — right aligned */}
            <div className="text-right mt-6">Yours faithfully,</div>
            <div className="text-right mt-12"><strong>{applicant.name || '(Signature)'}</strong></div>
            <div className="text-right">{applicant.desig || 'GDS'}</div>
            {boLine && <div className="text-right">{boLine}</div>}
            {applicant.div && <div className="text-right">{applicant.div}</div>}

            <div className="mt-5"><strong>Encl:</strong></div>
            <div className="pl-4">1. Leave Application in prescribed format (4 copies)</div>
            <div className="pl-4">2. Medical Certificate (if applicable)</div>
          </div>
        </div>
      </div>

    </div>
  );
}
