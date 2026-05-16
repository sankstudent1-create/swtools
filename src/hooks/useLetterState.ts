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
  posL: { ...DEFAULT_LOGO_POS, x: 42, y: 55, w: 100 },
  posR: { ...DEFAULT_LOGO_POS, x: 650, y: 55, w: 100 },
  sigUrl: null,
  sigMode: 'draw',
  showEncl: false,
  showCopy: false,
  showEndorse: false,
  form: { ...DEFAULT_FORM },
};

export function useLetterState() {
  const [state, setState] = useState<AppState>(() => {
    const dt = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    return { ...INITIAL_STATE, form: { ...DEFAULT_FORM, dt } };
  });
  const [lastModel, setLastModel] = useState<string | undefined>(undefined);

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

  // ── AI fill — populates fields from AI response ───
  const fillFromAI = useCallback((data: AILetterData, isFull: boolean = false, model?: string) => {
    if (model) setLastModel(model);

    setState(s => {
      let newLogoL = isFull ? null : s.logoL;
      let newLogoR = isFull ? null : s.logoR;
      let isHigherPost = false;
      
      if (isFull) {
        const fullDeptStr = [data.department, data.dept_english_1, data.dept_english_2, data.signatory_designation].join(' ').toLowerCase();
        
        const ASHOKA_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHAZ8fV85dhWQVY6Ol8Nu_FnNEx9Wjs5NFgQ&s";
        const SWACHH_URL = "https://upload.wikimedia.org/wikipedia/commons/3/32/Swachh_Bharat_Mission_Logo.svg";
        const INDIA_POST_URL = "https://www.presentations.gov.in/wp-content/uploads/2020/06/India-Post_Preview.png";
        const RAILWAY_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEXAnK6sQOu3_YQbcYZBv4wFbXEuyGu4qkvw&s";

        isHigherPost = isFull && (
          data.letter_type === 'pm_do' ||
          fullDeptStr.includes('secretary') ||
          fullDeptStr.includes('minister') ||
          fullDeptStr.includes('director general') ||
          fullDeptStr.includes('commissioner') ||
          fullDeptStr.includes('prime minister') ||
          fullDeptStr.includes('chief minister') ||
          fullDeptStr.includes('pm') ||
          fullDeptStr.includes('cm') ||
          fullDeptStr.includes('cabinet')
        );

        if (fullDeptStr.includes('post') || fullDeptStr.includes('dak') || fullDeptStr.includes('mail')) {
          newLogoL = SWACHH_URL;
          newLogoR = INDIA_POST_URL;
        } else if (fullDeptStr.includes('railway') || fullDeptStr.includes('rail')) {
          newLogoL = SWACHH_URL;
          newLogoR = RAILWAY_URL;
        } else if (isHigherPost) {
          newLogoL = ASHOKA_URL;
          newLogoR = null;
        } else {
          // Default Gov - use Swachh for normal departments as requested
          newLogoL = SWACHH_URL;
          newLogoR = null;
        }
      }

      return {
      ...s,
      officeType: isFull ? 'custom' : s.officeType,
      tpl: isHigherPost ? 'B' : (isFull ? 'A' : s.tpl),
      logoL: newLogoL,
      logoR: newLogoR,
      posL: isHigherPost ? { ...s.posL, x: 347, y: 55, w: 100, placed: true } : (isFull ? { ...s.posL, x: 42, y: 55, w: 100, placed: true } : s.posL),
      posR: (isFull && newLogoR) ? { ...s.posR, x: 650, y: 55, w: 100, placed: true } : s.posR,
      showEncl: !!(data.encl?.trim()),
      showCopy: !!(data.copy_to?.length),
      form: {
        ...s.form,
        h1: isFull ? data.dept_hindi_1 : s.form.h1,
        h2: isFull ? data.dept_hindi_2 : s.form.h2,
        e1: isFull ? data.dept_english_1 : s.form.e1,
        e2: isFull ? data.dept_english_2 : s.form.e2,
        dept: isFull ? data.department : s.form.dept,
        divn: isFull ? data.division : s.form.divn,
        ofc:  isFull ? data.office : s.form.ofc,
        city: isFull ? data.city : s.form.city,
        pin:  isFull ? data.pin : s.form.pin,
        ph:   isFull ? data.phone : s.form.ph,
        em:   isFull ? data.email : s.form.em,
        wb:   isFull ? data.website : s.form.wb,
        fno:  data.file_no      || (isFull ? '' : s.form.fno),
        toD:  data.to_designation || (isFull ? '' : s.form.toD),
        toA:  data.to_address   || (isFull ? '' : s.form.toA),
        sub:  data.subject      || (isFull ? '' : s.form.sub),
        ref:  data.reference    || (isFull ? '' : s.form.ref),
        sal:  data.salutation   || (isFull ? '' : s.form.sal),
        cls:  data.closing      || (isFull ? '' : s.form.cls),
        sn:   data.signatory_name || (isFull ? '' : s.form.sn),
        sd:   data.signatory_designation || (isFull ? '' : s.form.sd),
        body: data.body         || (isFull ? '' : s.form.body),
        encl: data.encl         || (isFull ? '' : s.form.encl),
        copyTo: data.copy_to?.length ? data.copy_to : (isFull ? [] : s.form.copyTo),
      },
      aiTick: (s.aiTick || 0) + 1,
    };
  });
  }, []);

  return {
    state,
    lastModel,
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
