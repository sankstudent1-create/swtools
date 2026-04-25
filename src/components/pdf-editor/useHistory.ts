// ─── Undo / Redo History Hook ─────────────────────────────────────────
import { useState, useCallback, useRef } from 'react';
import type { PDFElement } from './types';

const MAX_HISTORY = 50;

export function useHistory(initial: PDFElement[]) {
  const [past, setPast] = useState<PDFElement[][]>([]);
  const [present, setPresent] = useState<PDFElement[]>(initial);
  const [future, setFuture] = useState<PDFElement[][]>([]);
  const skipRef = useRef(false);

  const push = useCallback((next: PDFElement[]) => {
    if (skipRef.current) {
      skipRef.current = false;
      setPresent(next);
      return;
    }
    setPast(p => {
      const updated = [...p, present];
      return updated.length > MAX_HISTORY ? updated.slice(-MAX_HISTORY) : updated;
    });
    setPresent(next);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (past.length === 0) return present;
    const prev = past[past.length - 1];
    setPast(p => p.slice(0, -1));
    setFuture(f => [present, ...f]);
    setPresent(prev);
    skipRef.current = true;
    return prev;
  }, [past, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return present;
    const next = future[0];
    setFuture(f => f.slice(1));
    setPast(p => [...p, present]);
    setPresent(next);
    skipRef.current = true;
    return next;
  }, [future, present]);

  const reset = useCallback((elements: PDFElement[]) => {
    setPast([]);
    setPresent(elements);
    setFuture([]);
  }, []);

  return {
    elements: present,
    push,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
