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
    <div className="flex flex-col gap-5">

      {/* Card 1 — Applicant Details */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.01]">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">1</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Applicant Details</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
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
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.01]">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">2</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Leave Details</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <FormField label="Type of Leave" required className="col-span-2 max-sm:col-span-1">
            <div className="flex gap-3 flex-wrap">
              {(['Paid Leave', 'Leave Without Allowances (LWA)'] as LeaveType[]).map(lt => (
                <label key={lt} className={`flex items-center gap-2 text-sm cursor-pointer px-4 py-2 border rounded-xl transition-all ${leave.leaveType === lt ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'border-white/10 text-white/70 hover:bg-white/[0.05]'}`}>
                  <input type="radio" name="lt" value={lt} checked={leave.leaveType === lt} onChange={() => setLeave({ leaveType: lt })} className="hidden" />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${leave.leaveType === lt ? 'border-emerald-400' : 'border-white/30'}`}>
                    {leave.leaveType === lt && <div className="w-2 h-2 bg-emerald-400 rounded-full" />}
                  </div>
                  {lt}
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="From Date" htmlFor="fromDate" required>
            <input id="fromDate" type="date" value={leave.fromDate} onChange={e => setLeave({ fromDate: e.target.value })} className={`${inputCls} [color-scheme:dark]`} />
          </FormField>

          <FormField label="To Date" htmlFor="toDate" required>
            <input id="toDate" type="date" value={leave.toDate} onChange={e => setLeave({ toDate: e.target.value })} className={`${inputCls} [color-scheme:dark]`} />
          </FormField>

          <FormField label="No. of Days" auto>
            <div className={readonlyCls}>{leave.days || '—'}</div>
          </FormField>

          <FormField label="Application Date" htmlFor="appDate">
            <input id="appDate" type="date" value={leave.appDate} onChange={e => setLeave({ appDate: e.target.value })} className={`${inputCls} [color-scheme:dark]`} />
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
              className={`${inputCls} resize-y min-h-[80px] leading-[1.6]`}
            />
          </FormField>
        </div>
      </div>

      {/* Card 3 — Substitute Details */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.01]">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">3</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Substitute Details</span>
        </div>
        <div className="p-5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300 mb-5 flex gap-3 items-start">
            <span className="text-amber-400 mt-0.5">ℹ️</span>
            The substitute works in your place during leave. Their name appears in the application and sanction order.
          </div>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
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
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-3 bg-white/[0.01]">
          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">4</span>
          <span className="text-xs font-bold uppercase tracking-wider text-white/90">Sanction Fields (For Sanctioning Authority)</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1">
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
        <div className="mx-5 mb-5 bg-white/[0.03] border border-white/5 rounded-xl p-4 text-sm text-white/50 leading-relaxed italic border-l-4 border-l-emerald-500/50">
          <strong className="tracking-wide not-italic text-white/80 block mb-1">Auto-printed certification:</strong> "I hereby propose Shri/Smt/Kum. [Substitute] whose particulars are given above to work as my substitute during my leave on my responsibility according to the terms of the security bond executed by me. I am aware of provisions of Rule 7 of the Department of Posts GDS Rules, 2001..."
        </div>
      </div>

    </div>
  );
}
