import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Watermark Stamper Tool',
  description: 'Protect your images by stamping customized text watermarks securely in your browser.',
  keywords: ["watermark tool online","add watermark to photo","text stamp image"],
  alternates: {
    canonical: '/tools/watermark-stamper'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
