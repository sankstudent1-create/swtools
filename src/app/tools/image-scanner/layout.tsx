import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Document Scanner Effect Tool',
  'Give photos of documents a clean, professional scanner effect. Black-and-white, grayscale, auto-cleanup tools.',
  '/tools/image-scanner'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
