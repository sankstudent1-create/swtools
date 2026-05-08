const BRAND_KEYWORDS = [
  "tools.swinfosystems",
  "tools.swinfosystems.online",
  "swinfosystems tools",
  "sw info systems tools",
  "sw tools",
  "swtools",
];

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function buildPostKeywords(input: {
  title: string;
  category?: string | null;
  extra?: string[] | null;
}): string[] {
  const set = new Set<string>();

  for (const k of BRAND_KEYWORDS) set.add(normalize(k).toLowerCase());

  const titleBase = normalize(input.title);
  if (titleBase) {
    set.add(titleBase.toLowerCase());
    set.add(`${titleBase} SW Tools`.toLowerCase());
    set.add(`SW Tools ${titleBase}`.toLowerCase());
  }

  if (input.category) {
    const c = normalize(input.category);
    if (c) {
      set.add(c.toLowerCase());
      set.add(`${c} news`.toLowerCase());
      set.add(`SW Tools ${c}`.toLowerCase());
    }
  }

  for (const k of input.extra ?? []) {
    const v = normalize(k);
    if (v) set.add(v.toLowerCase());
  }

  return Array.from(set);
}

export function buildPostDescription(excerpt: string | null | undefined, fallback: string) {
  const base = (excerpt ?? "").trim();
  const value = base.length > 0 ? base : fallback;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 160) return trimmed;
  return trimmed.slice(0, 157).trimEnd() + "...";
}
