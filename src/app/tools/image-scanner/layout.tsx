import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Document Scanner Effect Tool',
  description: 'Give photos of documents a clean, professional scanner effect. Black-and-white, grayscale, auto-cleanup tools.',
  keywords: ["online document scanner","photo to scanner effect","scan image online"],
  alternates: {
    canonical: '/tools/image-scanner'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
