import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Image Rotate & Flip Tool',
  'Rotate images to exact angles, flip horizontally or vertically without losing quality.',
  '/tools/image-rotate-flip'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
