import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'NEET Signature & Photo Formatter',
  'Correctly format your online NEET application signature and photo attachments precisely to NTA guidelines.',
  '/tools/neet-signature'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
