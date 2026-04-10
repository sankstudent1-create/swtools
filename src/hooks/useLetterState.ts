// ─────────────────────────────────────────────
//  hooks/useLetterState.ts  –  Central state for the letterpad
// ─────────────────────────────────────────────
'use client';
import { useState, useCallback } from 'react';
import type { AppState, LetterForm, TemplateType, FontClass, LogoSide, SigMode, AILetterData } from '@/types/letterpad';
import { DEFAULT_FORM, DEFAULT_LOGO_POS, OFFICE_PRESETS, svgToDataUri } from '@/lib/letterpad/constants';

const INITIAL_STATE: AppState = {
  tpl: 'A',
  font: '',
  officeType: 'dop',
  logoL: null,
  logoR: null,
  posL: { ...DEFAULT_LOGO_POS, x: 42, y: 14, w: 68 },
  posR: { ...DEFAULT_LOGO_POS, x: 700, y: 14, w: 68 },
  sigUrl: null,
  sigMode: 'draw',
  showEncl: false,
  showCopy: false,
  showEndorse: false,
  form: { ...DEFAULT_FORM },
};

export function useLetterState() {
  const [state, setState] = useState<AppState>(() => {
    // Pre-set logos from presets
    const logoL = svgToDataUri('ip');
    const logoR = svgToDataUri('ashoka');
    const dt = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    return {
      ...INITIAL_STATE,
      logoL,
      logoR,
      form: { ...DEFAULT_FORM, dt },
    };
  });

  // ── Form field update ────────────────────────────────
  const updateForm = useCallback(<K extends keyof LetterForm>(key: K, value: LetterForm[K]) => {
    setState(s => ({ ...s, form: { ...s.form, [key]: value } }));
  }, []);

  const setForm = useCallback((form: Partial<LetterForm>) => {
    setState(s => ({ ...s, form: { ...s.form, ...form } }));
  }, []);

  // ── Template ─────────────────────────────────────────
  const setTemplate = useCallback((tpl: TemplateType) => {
    setState(s => ({ ...s, tpl }));
  }, []);

  // ── Font ─────────────────────────────────────────────
  const setFont = useCallback((font: FontClass) => {
    setState(s => ({ ...s, font }));
  }, []);

  // ── Office preset ────────────────────────────────────
  const applyOfficePreset = useCallback((type: string) => {
    const preset = OFFICE_PRESETS[type];
    if (!preset) return;

    const logoL = preset.ll ? svgToDataUri(preset.ll) : null;
    const logoR = preset.lr ? svgToDataUri(preset.lr) : null;

    setState(s => ({
      ...s,
      officeType: type as AppState['officeType'],
      tpl: preset.t,
      logoL,
      logoR,
      posR: { ...s.posR, placed: false }, // trigger auto-placement
      form: {
        ...s.form,
        h1: preset.h1, h2: preset.h2,
        e1: preset.e1, e2: preset.e2,
        dept: preset.dept, divn: preset.divn,
        ofc: preset.ofc, city: preset.city, pin: preset.pin,
        ph: preset.ph, em: preset.em, wb: preset.wb,
      },
    }));
  }, []);

  // ── Logos ─────────────────────────────────────────────
  const setLogo = useCallback((side: LogoSide, src: string | null) => {
    if (side === 'L') setState(s => ({ ...s, logoL: src }));
    else setState(s => ({ ...s, logoR: src, posR: { ...s.posR, placed: false } }));
  }, []);

  const setLogoPos = useCallback((side: LogoSide, pos: Partial<AppState['posL']>) => {
    if (side === 'L') setState(s => ({ ...s, posL: { ...s.posL, ...pos } }));
    else setState(s => ({ ...s, posR: { ...s.posR, ...pos } }));
  }, []);

  // ── Signature ─────────────────────────────────────────
  const setSigUrl = useCallback((url: string | null) => {
    setState(s => ({ ...s, sigUrl: url }));
  }, []);

  const setSigMode = useCallback((mode: SigMode) => {
    setState(s => ({ ...s, sigMode: mode }));
  }, []);

  // ── Section toggles ───────────────────────────────────
  const toggleEncl    = useCallback(() => setState(s => ({ ...s, showEncl:    !s.showEncl })), []);
  const toggleCopy    = useCallback(() => setState(s => ({ ...s, showCopy:    !s.showCopy })), []);
  const toggleEndorse = useCallback(() => setState(s => ({ ...s, showEndorse: !s.showEndorse })), []);

  // ── AI fill — populates all fields from AI response ───
  const fillFromAI = useCallback((data: AILetterData) => {
    setState(s => ({
      ...s,
      showEncl: !!(data.encl?.trim()),
      showCopy: !!(data.copy_to?.length),
      form: {
        ...s.form,
        h1: data.dept_hindi_1   || s.form.h1,
        h2: data.dept_hindi_2   || s.form.h2,
        e1: data.dept_english_1 || s.form.e1,
        e2: data.dept_english_2 || s.form.e2,
        dept: data.department   || s.form.dept,
        divn: data.division     || s.form.divn,
        ofc:  data.office       || s.form.ofc,
        city: data.city         || s.form.city,
        pin:  data.pin          || s.form.pin,
        ph:   data.phone        || s.form.ph,
        em:   data.email        || s.form.em,
        wb:   data.website      || s.form.wb,
        fno:  data.file_no      || s.form.fno,
        toD:  data.to_designation || s.form.toD,
        toA:  data.to_address   || s.form.toA,
        sub:  data.subject      || s.form.sub,
        ref:  data.reference    || s.form.ref,
        sal:  data.salutation   || s.form.sal,
        cls:  data.closing      || s.form.cls,
        sn:   data.signatory_name        || s.form.sn,
        sd:   data.signatory_designation || s.form.sd,
        body: data.body         || s.form.body,
        encl: data.encl         || s.form.encl,
        copyTo: data.copy_to?.length ? data.copy_to : s.form.copyTo,
      },
    }));
  }, []);

  return {
    state,
    updateForm,
    setForm,
    setTemplate,
    setFont,
    applyOfficePreset,
    setLogo,
    setLogoPos,
    setSigUrl,
    setSigMode,
    toggleEncl,
    toggleCopy,
    toggleEndorse,
    fillFromAI,
  };
}
