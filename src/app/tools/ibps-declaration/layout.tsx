import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'IBPS Handwritten Declaration Formatter',
  'Prepare handwritten declaration scans for IBPS PO, Clerk, SO exams with correct landscape size, dimension, and 50KB to 100KB limits.',
  '/tools/ibps-declaration'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
