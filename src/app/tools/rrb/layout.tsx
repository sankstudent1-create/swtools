import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'RRB Railway Signature Formatter',
  'Easily format your signature to meet official Railway RRB recruitment guidelines. Ensure exact pixel width and KB limits for railway exams.',
  '/tools/rrb'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
