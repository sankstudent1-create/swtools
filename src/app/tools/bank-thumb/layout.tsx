import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Banking Thumb Impression Formatter',
  'Format your left-thumb impression image for IBPS, SBI, and other banking rectruitments. Ensures square resolution and high clarity.',
  '/tools/bank-thumb'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
