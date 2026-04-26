import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Professional Letterpad Generator',
  'Generate official government and business letterpads with our smart, customizable template output engine.',
  '/tools/letterpad-generator'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
