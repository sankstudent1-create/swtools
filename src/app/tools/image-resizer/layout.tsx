import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Free Online Image Resizer',
  'Resize images to precise dimensions with different fit modes, background fills, and quality controls. SW Tools premium utility.',
  '/tools/image-resizer'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
