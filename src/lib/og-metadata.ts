import type { Metadata } from 'next'

const DEFAULT_SITE = 'https://tools.swinfosystems.online'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE
const BRAND = 'SW Tools'

function normalizeKeyword(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function brandKeywordVariants(): string[] {
  return [
    'tools.swinfosystems',
    'tools.swinfosystems.online',
    'swinfosystems tools',
    'sw info systems tools',
    'sw tools',
    'swtools',
  ]
}

function toPageNameVariants(title: string): string[] {
  const base = normalizeKeyword(title)
  const noBrand = base.replace(new RegExp(`\\s*\\|\\s*${BRAND}$`, 'i'), '').trim()
  if (!noBrand) return []

  return [
    noBrand,
    `${BRAND} ${noBrand}`,
    `${noBrand} ${BRAND}`,
    `${normalizeKeyword(BRAND)} ${noBrand}`,
  ]
}

export function buildToolMetadata(
  title: string,
  description: string,
  path: string,
  image = '/icon-512.png'
): Metadata {
  const url = `${SITE}${path}`
  const keywordSet = new Set<string>()
  for (const kw of brandKeywordVariants()) keywordSet.add(normalizeKeyword(kw).toLowerCase())
  for (const kw of toPageNameVariants(title)) keywordSet.add(normalizeKeyword(kw).toLowerCase())

  return {
    title: {
      default: title,
      template: `%s | ${BRAND}`,
    },
    description,
    alternates: { canonical: path },
    keywords: Array.from(keywordSet),
    openGraph: {
      title: `${title} | ${BRAND}`,
      description,
      url,
      siteName: BRAND,
      images: [{ url: image, width: 512, height: 512, alt: title }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${BRAND}`,
      description,
      images: [image],
    },
  }
}
