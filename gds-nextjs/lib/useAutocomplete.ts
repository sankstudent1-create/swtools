'use client';

import { useState, useCallback, useRef } from 'react';
import { lsGet, lsSet } from '@/lib/utils';

interface UseAutocompleteOptions {
  lsKey: string;
  onSelect?: (value: string) => void;
}

interface UseAutocompleteReturn {
  value: string;
  suggestions: string[];
  isOpen: boolean;
  inputProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  selectSuggestion: (v: string) => void;
  setValue: (v: string) => void;
}

export function useAutocomplete(
  externalValue: string,
  onChange: (v: string) => void,
  { lsKey, onSelect }: UseAutocompleteOptions
): UseAutocompleteReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeSuggestions = useCallback(
    (q: string) => {
      const saved = lsGet(lsKey);
      return saved.filter(v => !q || v.toLowerCase().includes(q.toLowerCase())).slice(0, 10);
    },
    [lsKey]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    const s = computeSuggestions(v);
    setSuggestions(s);
    setIsOpen(s.length > 0);
  };

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    const s = computeSuggestions(externalValue);
    setSuggestions(s);
    setIsOpen(s.length > 0);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => {
      setIsOpen(false);
      if (externalValue.trim()) lsSet(lsKey, externalValue.trim());
    }, 200);
  };

  const selectSuggestion = (v: string) => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    onChange(v);
    setIsOpen(false);
    lsSet(lsKey, v);
    onSelect?.(v);
  };

  return {
    value: externalValue,
    suggestions,
    isOpen,
    inputProps: {
      value: externalValue,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    selectSuggestion,
    setValue: onChange,
  };
}
