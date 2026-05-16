import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Pro PDF Editor',
  'Edit, annotate, and modify PDF files directly in your browser. Add text, images, and shapes to your documents securely.',
  '/tools/pdf-editor'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
