import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Advanced Image Compressor',
  'Reduce image file size intelligently. Compress JPG, PNG, WEBP files while keeping high visual quality.',
  '/tools/image-compressor'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
