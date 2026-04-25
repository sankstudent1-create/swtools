import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  auto?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, htmlFor, required, auto, children, className = '' }: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 relative ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-bold text-white/50 uppercase tracking-wider pl-1"
      >
        {label}
        {required && <span className="text-emerald-400 ml-1">*</span>}
        {auto && (
          <span className="text-[9px] text-blue-400 font-semibold ml-2 normal-case tracking-normal">
            ● auto
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

// Shared input className - Glassmorphic
export const inputCls =
  'w-full bg-white/[0.03] border border-white/10 rounded-xl text-white px-4 py-2.5 text-sm font-[inherit] transition-all duration-200 outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] appearance-none placeholder-white/20';

export const selectCls = inputCls + ' cursor-pointer bg-[#0a0a0a]';

export const readonlyCls =
  'w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-semibold px-4 py-2.5 text-sm cursor-default flex items-center h-[42px]';
