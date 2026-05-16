import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'YouTube Video Stats Extractor',
  'Extract SEO tags, analyze video performance, and get detailed statistics for any YouTube video online.',
  '/tools/youtube-stats'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
