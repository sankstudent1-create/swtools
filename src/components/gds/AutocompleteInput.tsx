'use client';

import { useAutocomplete } from '@/lib/gds/useAutocomplete';
import { inputCls } from '@/components/gds/FormField';

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
        className={`${inputCls} ${className}`}
        {...ac.inputProps}
      />
      {ac.isOpen && ac.suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#0a0a0a] border border-white/[0.12] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-[999] max-h-[220px] overflow-y-auto backdrop-blur-xl">
          {ac.suggestions.map((v, i) => (
            <div
              key={i}
              onMouseDown={(e) => { e.preventDefault(); ac.selectSuggestion(v); }}
              className="px-4 py-2.5 text-sm cursor-pointer flex items-center gap-3 text-white/80 hover:bg-white/[0.05] hover:text-white transition-colors"
            >
              <span className="opacity-70">{icon}</span>
              <span>{v}</span>
            </div>
          ))}
          <div className="px-4 py-2 text-[10px] text-white/40 border-t border-white/[0.08] italic">
            ↑ Previously entered — click to reuse
          </div>
        </div>
      )}
    </div>
  );
}
