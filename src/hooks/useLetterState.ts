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
  posL: { ...DEFAULT_LOGO_POS, x: 42, y: 24, w: 100 },
  posR: { ...DEFAULT_LOGO_POS, x: 650, y: 24, w: 100 },
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
        
        const ASHOKA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAAEcCAMAAABUNR5wAAAAilBMVEX///8AAACjo6P8/Pz5+fny8vL19fXu7u6IiIje3t729vb6+vqenp7j4+Pn5+fOzs5/f3/IyMi+vr7a2tq2trbR0dGQkJC6urqurq52dnZ8fHyampqRkZFPT09EREQfHx9tbW1bW1swMDA5OTllZWU1NTVMTExVVVUmJiYQEBAXFxciIiJAQEA4ODh7YdRUAAAgAElEQVR4nO19eX+jvM62DSFAyr4FAkmAkASS9Pt/vVeXbLJ0Oktn+rz3P8fnd+ZuUwJC1nJJlmUhvm8EYfgmss2pM4TltIUlymEXpULEjZMIkYZhGHzj0/5xJJtaiErSmPCP3F/w4ygfY9rzf67Jf02qsJKyjEULKk8zdQ1+laej7ONgLeUY0nXnO+3Df0xxLV/GNQ2l9InpUiYilZkQppQ2/XuUsi3juDz/5zRHd2Iz35FMrSMFCK3wD5Fs4x8xyM1SfWNDV8X/IcXhneKIfoslqPUlVAwkC2kIkUuLFE869KvFVOuL/6vRQa28YLFa8a8x8w+EissePxFtmaS/bUYhXBL1UJHc/XcUk5zKXlEr0paEwrjRT2ei720C9WNPH4FkEo5QOsae5UbKzX9Hsg0ZZtr9pQgOZOZuOeQ2FhbZCTA0IFtikVykpixx4fpSFf+p/rlEskuUp2nZkgzcNiTIQhzkJZkNyYl+KMnApTXxP7YKCM3tv6QZXCbliiI5vm12xNpGvHclMbgtsty1aeRlxNa62NVKWQNlM/4zfwJZXgYbmIVCyCMJwUb2dfrhqsUanmVH1jmcwF8D3P9P6MUgDjYkuWZLs9/J/U4O/ucXJuRCHFOIElp5UZPz3wwwrCUXmKUiwI+/AD0+yUOUCLNXKpD//yLx4zAnZWsFjNfZ/fXFNuxb4AZszrP/e+J+MrZSGS/y3MoLAyQtP14VZAkLjFWxf4QClv+nZC0tGp//yZdsf8Xb7bTA7+mFTVtlP18UH/FZz0ZiYvaO/7ckLzqmonc+o5oRZQI15F8Tua/KGiA5fFwDE+0lWcs+r4UP914veB0ry/xXkt/vyOdHUSUTXEcEgEKycTTWsjQDSyGPu3qRs7vRZwthHwhaWEQ4tO/y6bPy5kRxwOXY1X8fvCys9gkMf+RzAHNhk6mNyIfQCxwAk+UtEFcCS5pXOVlkfjcSDHjIcyFGqKHz48OS/ulZw98QHQ8X/fXWSBrM9s1evFxxkJI+6CqSD6LAaMlqVF5BLiWGLKhrrnhTp0+MA4nEEBMIScslbnr+8DhzYEqNOI7Xzv5xgy+Me7jRKTo99dt+uHu3tVKiIiGSG+Ek5mkPtQtIuOmRPV9T4tGZhA1xSCYqs6NvGxwFti+PC1ht7ywxfrjg94N8cRUIN1JWab6LHg7PGs0jzb41QXhdYW1m5L6RxFIpGZRWQBUM90E+EREzVoY4v3gToBXG2fNoPpmIXw+LGUFM3Bzun5F3PuVrMhLTBFGzFe5NyGDsCTm4xtt8Ycpvp99zfzfZhDG6WFyY0rV8hXMQ4+KZgFiWPbTgz8eOZrY2JkOYDzUIVdCWX6WXdrLt7sY1IfKKbVXO+MIvMcn8oy1vZpnOVEwx7mLq91fqbIZlVEGO318I8N4Jd8vtn1McqmAnGF8+veipa0laY3lX+zfJtOZneVv7flgrxdf0V7JMknRhmkGkg5EDc9dQk2hsWYahKC8xrI2gwPvA+V+OQj/yxYsRqYO9LsvEPZI+rcie7IV6uv67u+H3GJvtQw7zhwbU6pM1C3HCknGDxGar5C5I8zhl4lTCS/4x4jtI+YkPordeR9UZXOxzJoadcPsQd2Fb+eAspv7ukM2pk0Yl92U8P9znCQSVEz1mQ4LXNrFfvE7oQqwd9kl/mj8At2YB7IvV/HGp2bo0yME0nM7CXGzlw1wHJICi7S32LfwOMiXbsZOdMYOlmI1JoTiv3yw1G/HJuP4pFnnr5PYRNxBknN90LVv+JLKEfZbeQlYnTHL70P2Ezel2oED15nieVw+T9OkaTxLVgfoyu35fUazvbNEXfoB/yH6Q8Kx+/PyHEV+I3OjJpQYzhim0+sUQy0SWNBM1/Z/kZauE3paHkLS8nW5PrndD1ERyEbANcbVqqvSdjgDdnSE+YH4Wy5vEfd6rev1L750DnAWMD7d1UzAbFpoFOzm/8qFif+Uis7JkMliOMno5EoxUvowQ2QG6I6RKZT/km9dan1dJRA9a2XTV E/DsJWOFOWgXcmOvj BufhLGL EtB2wmPHh3kQtp3zXHL1/fvkMQn1uWgelBgL2CwMEhMC5A/krQ3cLI C2Lw8WEof2EpODbWV S13SfTMR3 vNeS/VdJW+2oKd l+ xmqGEf0c4hSKo+AfmzHgt13dLdFIJG5wOoRK2IJp/u6UkL JYsn d s3OlX7G4JT dcc1k7Jtszy dKb mveD9 oiyqaP2WUyVGec m2+rMH79ukDjh4Y/AFnF m/R0 hBut PsL hFvp TYJar gN w+HG1 AKtz gX9pVlFSM JjDfEG7wEYGaQhK9YW4XYFsw5Gr0 bAx9 k7H cyyZ rZLghT jNt qtrlcs9ieUrdWbxY1zQfJZgv0|";
        const SWACHH_URL = "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Swachh_Bharat_Mission_logo.png/320px-Swachh_Bharat_Mission_logo.png";
        const INDIA_POST_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgyE5GVmnBOyQiy0AveMpnPmeiJhLjLZld_-aEpgH9KpT_YSedoqnMagbtR3uP0KZvo0iiGqgESWSetBUgwwL1z-frzblwInOhqxyrcGUztjB4cB5k0dHbR_0pcj4JCX3Gzzs26LOfMFdyG1nuI7sWt4UbLCrVEhXvwX5uStq1r2PaofAqlM0a4tZ-aPhI/s2620-rw/India%20Post%20Dak%20Sewa%20Jan%20Sewa%20New%20Logo%20Final.png";
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
      posL: isHigherPost ? { ...s.posL, x: 347, y: 24, w: 100, placed: true } : (isFull ? { ...s.posL, x: 42, y: 24, w: 100, placed: true } : s.posL),
      posR: (isFull && newLogoR) ? { ...s.posR, x: 650, y: 24, w: 100, placed: true } : s.posR,
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
