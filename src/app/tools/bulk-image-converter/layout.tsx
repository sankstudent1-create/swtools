import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Bulk Image Converter',
  'Batch convert multiple images between formats, adjust sizes, and compress simultaneously.',
  '/tools/bulk-image-converter'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
