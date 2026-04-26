import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Image Format Converter',
  'Convert images freely between JPG, PNG, and WebP using this high-performance secure in-browser tool.',
  '/tools/image-format-converter'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
