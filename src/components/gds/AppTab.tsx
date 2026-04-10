'use client';

import React from 'react';
import { AutocompleteInput } from '@/components/gds/AutocompleteInput';
import { FormField, inputCls, selectCls, readonlyCls } from '@/components/gds/FormField';
import type { FormData, Designation, LeaveType, LeaveGround } from '@/types/gds';
import { DESIGNATIONS, LEAVE_GROUNDS } from '@/types/gds';
import { calcDays } from '@/lib/gds/utils';

interface AppTabProps {
  data: FormData;
  onChange: (data: FormData) => void;
}

export function AppTab({ data, onChange }: AppTabProps) {
  const { applicant, leave, substitute, sanction } = data;

  function setApp(patch: Partial<typeof applicant>) {
    onChange({ ...data, applicant: { ...applicant, ...patch } });
  }
  function setLeave(patch: Partial<typeof leave>) {
    const updated = { ...leave, ...patch };
    // Recalculate days when dates change
    if (patch.fromDate !== undefined || patch.toDate !== undefined) {
      updated.days = calcDays(updated.fromDate, updated.toDate);
    }
    onChange({ ...data, leave: updated });
  }
  function setSub(patch: Partial<typeof substitute>) {
    onChange({ ...data, substitute: { ...substitute, ...patch } });
  }
  function setSanction(patch: Partial<typeof sanction>) {
    onChange({ ...data, sanction: { ...sanction, ...patch } });
  }

  return (
    <div className="flex flex-col gap-[14px]">

      {/* Card 1 — Applicant Details */}
      <div className="bg-white border border-[#c5cede] rounded-[10px] shadow-[0_3px_18px_rgba(27,45,79,.12)]">
        <div className="px-4 py-[11px] border-b border-[#c5cede] flex items-center gap-2 bg-gradient-to-r from-[#f5f7fc] to-[#f9fafd] rounded-t-[10px]">
          <span className="w-5 h-5 bg-[#1b2d4f] text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.9px] text-[#1b2d4f]">Applicant Details</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <FormField label="Full Name" htmlFor="name" required>
            <AutocompleteInput id="name" value={applicant.name} onChange={v => setApp({ name: v })} lsKey="names" icon="👤" placeholder="e.g. Ramesh Kumar Patil" />
          </FormField>

          <FormField label="Designation" htmlFor="desig" required>
            <select id="desig" value={applicant.desig} onChange={e => setApp({ desig: e.target.value as Designation })} className={selectCls}>
              {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>

          <FormField label="Branch Office (B.O)" htmlFor="bo">
            <AutocompleteInput id="bo" value={applicant.bo} onChange={v => setApp({ bo: v })} lsKey="bo" icon="🏤" placeholder="e.g. Songaon B.O." />
          </FormField>

          <FormField label="Sub Office (S.O)" htmlFor="so">
            <AutocompleteInput id="so" value={applicant.so} onChange={v => setApp({ so: v })} lsKey="so" icon="🏢" placeholder="e.g. Pendgaon S.O." />
          </FormField>

          <FormField label="Division / Head Office" htmlFor="div">
            <AutocompleteInput id="div" value={applicant.div} onChange={v => setApp({ div: v })} lsKey="div" icon="🏛" placeholder="e.g. Latur Division" />
          </FormField>

          <FormField label="Station" htmlFor="station">
            <input id="station" type="text" value={applicant.station} onChange={e => setApp({ station: e.target.value })} className={inputCls} placeholder="Village / Town name" />
          </FormField>
        </div>
      </div>

      {/* Card 2 — Leave Details */}
      <div className="bg-white border border-[#c5cede] rounded-[10px] shadow-[0_3px_18px_rgba(27,45,79,.12)]">
        <div className="px-4 py-[11px] border-b border-[#c5cede] flex items-center gap-2 bg-gradient-to-r from-[#f5f7fc] to-[#f9fafd] rounded-t-[10px]">
          <span className="w-5 h-5 bg-[#1b2d4f] text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.9px] text-[#1b2d4f]">Leave Details</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <FormField label="Type of Leave" required className="col-span-2 max-sm:col-span-1">
            <div className="flex gap-2 flex-wrap">
              {(['Paid Leave', 'Leave Without Allowances (LWA)'] as LeaveType[]).map(lt => (
                <label key={lt} className={`flex items-center gap-[5px] text-[13px] cursor-pointer px-3 py-[7px] border-[1.5px] rounded-[7px] transition-all ${leave.leaveType === lt ? 'border-[#1b2d4f] bg-[#eef1ff] text-[#1b2d4f] font-semibold' : 'border-[#c5cede] text-[#111]'}`}>
                  <input type="radio" name="lt" value={lt} checked={leave.leaveType === lt} onChange={() => setLeave({ leaveType: lt })} className="accent-[#1b2d4f]" />
                  {lt}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="From Date" htmlFor="fromDate" required>
            <input id="fromDate" type="date" value={leave.fromDate} onChange={e => setLeave({ fromDate: e.target.value })} className={inputCls} />
          </FormField>

          <FormField label="To Date" htmlFor="toDate" required>
            <input id="toDate" type="date" value={leave.toDate} onChange={e => setLeave({ toDate: e.target.value })} className={inputCls} />
          </FormField>

          <FormField label="No. of Days" auto>
            <div className={readonlyCls}>{leave.days || '—'}</div>
          </FormField>

          <FormField label="Application Date" htmlFor="appDate">
            <input id="appDate" type="date" value={leave.appDate} onChange={e => setLeave({ appDate: e.target.value })} className={inputCls} />
          </FormField>

          <FormField label="Ground for Leave" htmlFor="ground" required className="col-span-2 max-sm:col-span-1">
            <select id="ground" value={leave.ground} onChange={e => setLeave({ ground: e.target.value as LeaveGround })} className={selectCls}>
              {LEAVE_GROUNDS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </FormField>

          <FormField label="Full Address While on Leave" htmlFor="address" className="col-span-2 max-sm:col-span-1">
            <textarea
              id="address"
              rows={2}
              value={leave.address}
              onChange={e => setLeave({ address: e.target.value })}
              placeholder="House No., Street, Village/Town, Taluka, District – PIN (Enter for 2nd line)"
              className={`${inputCls} resize-y min-h-[60px] leading-[1.5]`}
            />
          </FormField>
        </div>
      </div>

      {/* Card 3 — Substitute Details */}
      <div className="bg-white border border-[#c5cede] rounded-[10px] shadow-[0_3px_18px_rgba(27,45,79,.12)]">
        <div className="px-4 py-[11px] border-b border-[#c5cede] flex items-center gap-2 bg-gradient-to-r from-[#f5f7fc] to-[#f9fafd] rounded-t-[10px]">
          <span className="w-5 h-5 bg-[#1b2d4f] text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.9px] text-[#1b2d4f]">Substitute Details</span>
        </div>
        <div className="p-4">
          <div className="bg-[#fffaed] border border-[#e0c870] rounded-[7px] px-3 py-2 text-[12px] text-[#7a5800] mb-3">
            The substitute works in your place during leave. Their name appears in the application and sanction order.
          </div>
          <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
            <FormField label="Substitute Full Name" htmlFor="sname">
              <AutocompleteInput id="sname" value={substitute.name} onChange={v => setSub({ name: v })} lsKey="snames" icon="👥" placeholder="Full name" />
            </FormField>
            <FormField label="Age" htmlFor="sage">
              <input id="sage" type="number" min={18} max={65} value={substitute.age} onChange={e => setSub({ age: e.target.value })} className={inputCls} placeholder="e.g. 28" />
            </FormField>
            <FormField label="Relationship" htmlFor="srel">
              <input id="srel" type="text" value={substitute.relation} onChange={e => setSub({ relation: e.target.value })} className={inputCls} placeholder="e.g. Brother, Son" />
            </FormField>
            <FormField label="Substitute Address" htmlFor="saddr" className="col-span-3 max-sm:col-span-1">
              <input id="saddr" type="text" value={substitute.address} onChange={e => setSub({ address: e.target.value })} className={inputCls} placeholder="Village / Town, District" />
            </FormField>
          </div>
        </div>
      </div>

      {/* Card 4 — Sanction Fields */}
      <div className="bg-white border border-[#c5cede] rounded-[10px] shadow-[0_3px_18px_rgba(27,45,79,.12)]">
        <div className="px-4 py-[11px] border-b border-[#c5cede] flex items-center gap-2 bg-gradient-to-r from-[#f5f7fc] to-[#f9fafd] rounded-t-[10px]">
          <span className="w-5 h-5 bg-[#1b2d4f] text-white rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.9px] text-[#1b2d4f]">Sanction Fields (For Sanctioning Authority)</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <FormField label="Half Year Ending Date" htmlFor="halfyr">
            <input id="halfyr" type="text" value={sanction.halfYear} onChange={e => setSanction({ halfYear: e.target.value })} className={inputCls} placeholder="e.g. 31.12.2025" />
          </FormField>
          <FormField label="Leave Balance After Deduction (days)" htmlFor="bal">
            <input id="bal" type="number" value={sanction.balance} onChange={e => setSanction({ balance: e.target.value })} className={inputCls} placeholder="e.g. 14" />
          </FormField>
          <FormField label="Postmaster Name (Copy To)" htmlFor="pm" className="col-span-2 max-sm:col-span-1">
            <AutocompleteInput id="pm" value={sanction.postmaster} onChange={v => setSanction({ postmaster: v })} lsKey="pm" icon="📮" placeholder="Name of Postmaster" />
          </FormField>
        </div>
        <div className="mx-4 mb-4 bg-[#f5f7fc] border border-[#c5cede] rounded-[7px] p-3 text-[12px] text-[#607090] leading-[1.65]">
          <strong>Auto-printed certification:</strong> "I hereby propose Shri/Smt/Kum. [Substitute] whose particulars are given above to work as my substitute during my leave on my responsibility according to the terms of the security bond executed by me. I am aware of provisions of Rule 7 of the Department of Posts GDS Rules, 2001..."
        </div>
      </div>

    </div>
  );
}
