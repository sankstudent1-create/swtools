import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'India Post GDS Signature Formatter',
  'Format your signature for the India Post Gramin Dak Sevak (GDS) application. Fast, secure, and accurate 20KB limit scaling.',
  '/tools/india-post-signature'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
