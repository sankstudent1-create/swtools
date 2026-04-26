import type { Metadata } from 'next'

const SITE = 'https://tools.swinfosystems.online'
const BRAND = 'SW Tools'

export function buildToolMetadata(
  title: string,
  description: string,
  path: string,
  image = '/icon-512.png'
): Metadata {
  const url = `${SITE}${path}`
  return {
    title,
    description,
    alternates: { canonical: path },
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
