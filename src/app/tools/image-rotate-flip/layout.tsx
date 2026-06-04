import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Rotate & Flip Tool',
  description: 'Rotate images to exact angles, flip horizontally or vertically without losing quality.',
  keywords: ["rotate image","flip photo online","mirror image tool"],
  alternates: {
    canonical: '/tools/image-rotate-flip'
  },
  openGraph: {
    title: 'Image Rotate & Flip Tool',
    description: 'Rotate images to exact angles, flip horizontally or vertically without losing quality.',
    url: '/tools/image-rotate-flip',
    images: ['/brand/hero-ai-grid.svg']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
