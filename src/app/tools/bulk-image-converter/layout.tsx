import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bulk Image Converter',
  description: 'Batch convert multiple images between formats, adjust sizes, and compress simultaneously.',
  keywords: ["batch image converter","bulk convert photos","multiple image format tool"],
  alternates: {
    canonical: '/tools/bulk-image-converter'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
