import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Online Image Cropper',
  'Easily crop pictures using custom bounds or popular social media aspect ratios.',
  '/tools/image-cropper'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
