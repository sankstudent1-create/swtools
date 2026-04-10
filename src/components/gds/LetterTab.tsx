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
    <div className="flex flex-col gap-[14px]">

      {/* Card 1 — Addressee */}
      <div className="bg-white border border-[#c5cede] rounded-[10px] shadow-[0_3px_18px_rgba(27,45,79,.12)]">
        <div className="px-4 py-[11px] border-b border-[#c5cede] flex items-center gap-2 bg-gradient-to-r from-[#f5f7fc] to-[#f9fafd] rounded-t-[10px]">
          <span className="w-5 h-5 bg-[#1b2d4f] text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.9px] text-[#1b2d4f]">Addressed To — Select Officer</span>
        </div>
        <div className="p-4">
          <div className="bg-[#fffaed] border border-[#e0c870] rounded-[7px] px-3 py-2 text-[12px] text-[#7a5800] mb-3">
            Select the officer type, then enter area / division name. Previously entered values are saved and suggested automatically.
          </div>

          {/* Officer type buttons */}
          <div className="flex gap-[6px] flex-wrap mb-3">
            {OFFICER_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setCL({ officerType: type })}
                className={`px-[13px] py-[6px] text-[12px] font-bold border-[1.5px] rounded-[6px] transition-all cursor-pointer select-none ${
                  coverLetter.officerType === type
                    ? 'border-[#1b2d4f] bg-[#eef1ff] text-[#1b2d4f]'
                    : 'border-[#c5cede] bg-[#f5f7fc] text-[#607090]'
                }`}
              >
                {type === 'manual' ? 'Manual' : type}
              </button>
            ))}
          </div>

          {/* Area / manual input */}
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1 mb-3">
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
            <div className="w-full bg-[#eef1ff] border-[1.5px] border-[#c5cede] rounded-[7px] text-[#1b2d4f] font-semibold px-[11px] py-[8px] text-[13px]">
              {officerLine || '—'}
            </div>
          </FormField>

          {/* Subject + Remarks */}
          <div className="grid grid-cols-2 gap-3 mt-3 max-sm:grid-cols-1">
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
                className={`${inputCls} resize-y min-h-[60px] leading-[1.5]`}
                placeholder="Medical details, special circumstances, etc."
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Card 2 — Letter Preview */}
      <div className="bg-white border border-[#c5cede] rounded-[10px] shadow-[0_3px_18px_rgba(27,45,79,.12)]">
        <div className="px-4 py-[11px] border-b border-[#c5cede] flex items-center gap-2 bg-gradient-to-r from-[#f5f7fc] to-[#f9fafd] rounded-t-[10px]">
          <span className="w-5 h-5 bg-[#1b2d4f] text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.9px] text-[#1b2d4f]">Letter Preview</span>
        </div>
        <div className="p-4">
          <div className="bg-[#fafbfe] border border-[#c5cede] rounded-[7px] p-[22px_28px] font-[Georgia,serif] text-[12.5px] leading-[1.9] text-[#111]">

            {/* Date — right */}
            <div className="text-right mb-[14px] text-[12px] leading-[1.5]">
              <div>Date: {appLong || '[Date]'}</div>
            </div>

            {/* Addressee */}
            <div className="mb-[12px] leading-[1.6]">
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
            <div className="text-right mt-5">Yours faithfully,</div>
            <div className="text-right mt-9"><strong>{applicant.name || '(Signature)'}</strong></div>
            <div className="text-right">{applicant.desig || 'GDS'}</div>
            {boLine && <div className="text-right">{boLine}</div>}
            {applicant.div && <div className="text-right">{applicant.div}</div>}

            <div className="mt-[14px]"><strong>Encl:</strong></div>
            <div className="pl-4">1. Leave Application in prescribed format (4 copies)</div>
            <div className="pl-4">2. Medical Certificate (if applicable)</div>
          </div>
        </div>
      </div>

    </div>
  );
}
