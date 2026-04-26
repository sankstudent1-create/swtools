import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Images to PDF Maker',
  'Convert your scanned documents and images into a polished PDF file effortlessly with customized page properties.',
  '/tools/pdf-maker'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
