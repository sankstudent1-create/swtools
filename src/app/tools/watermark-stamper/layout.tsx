import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Watermark Stamper Tool',
  'Protect your images by stamping customized text watermarks securely in your browser.',
  '/tools/watermark-stamper'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
