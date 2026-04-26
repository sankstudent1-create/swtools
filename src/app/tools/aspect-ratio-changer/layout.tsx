import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Aspect Ratio Changer',
  'Change the aspect ratio of any image to 16:9, 4:3, 1:1 and other sizes instantly. Fill backgrounds easily.',
  '/tools/aspect-ratio-changer'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
