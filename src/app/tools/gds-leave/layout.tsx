import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'GDS Leave Application PDF Generator',
  'Auto-generate official GDS Leave Applications in 4-copy format. Complete paid leave and LWA form generator.',
  '/tools/gds-leave'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
