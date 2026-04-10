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
    <div className={`flex flex-col gap-1 relative ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[10px] font-bold text-[#607090] uppercase tracking-[0.7px]"
      >
        {label}
        {required && <span className="text-[#b42c2c] ml-[2px]">*</span>}
        {auto && (
          <span className="text-[9px] text-[#1a6a42] font-semibold ml-1 normal-case tracking-normal">
            ● auto
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

// Shared input className
export const inputCls =
  'w-full bg-[#f5f7fc] border-[1.5px] border-[#c5cede] rounded-[7px] text-[#111] px-[11px] py-[8px] text-[13px] font-[inherit] transition-all duration-150 outline-none focus:border-[#1b2d4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(27,45,79,0.07)] appearance-none';

export const selectCls = inputCls + ' cursor-pointer';

export const readonlyCls =
  'w-full bg-[#eef1ff] border-[1.5px] border-[#c5cede] rounded-[7px] text-[#1b2d4f] font-semibold px-[11px] py-[8px] text-[13px] cursor-default';
