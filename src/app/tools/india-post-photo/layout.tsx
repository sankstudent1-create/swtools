import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'India Post GDS Photo Formatter',
  'Free online tool to crop and resize your passport photo to exactly 4:5 ratio and 50KB limit for India Post Gramin Dak Sevak online application.',
  '/tools/india-post-photo'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
