'use client';

import { useAutocomplete } from '@/lib/gds/useAutocomplete';

interface AutocompleteInputProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  lsKey: string;
  placeholder?: string;
  icon?: string;
  className?: string;
  onSelect?: (v: string) => void;
}

export function AutocompleteInput({
  id, value, onChange, lsKey, placeholder, icon = '📌', className = '', onSelect,
}: AutocompleteInputProps) {
  const ac = useAutocomplete(value, onChange, { lsKey, onSelect });

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        className={`w-full bg-[#f5f7fc] border-[1.5px] border-[#c5cede] rounded-[7px] text-[#111] px-[11px] py-[8px] text-[13px] font-[inherit] transition-all duration-150 focus:outline-none focus:border-[#1b2d4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(27,45,79,0.07)] ${className}`}
        {...ac.inputProps}
      />
      {ac.isOpen && ac.suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+2px)] left-0 right-0 bg-white border-[1.5px] border-[#1b2d4f] rounded-[8px] shadow-[0_8px_24px_rgba(27,45,79,0.14)] z-[999] max-h-[220px] overflow-y-auto">
          {ac.suggestions.map((v, i) => (
            <div
              key={i}
              onMouseDown={(e) => { e.preventDefault(); ac.selectSuggestion(v); }}
              className="px-3 py-2 text-[13px] cursor-pointer flex items-center gap-[6px] hover:bg-[#eef1ff]"
            >
              <span>{icon}</span>
              <span>{v}</span>
            </div>
          ))}
          <div className="px-3 py-1 text-[9.5px] text-[#b0bcc8] border-t border-[#c5cede] italic">
            ↑ Previously entered — click to reuse
          </div>
        </div>
      )}
    </div>
  );
}
