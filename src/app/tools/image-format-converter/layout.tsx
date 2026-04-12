import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Format Converter',
  description: 'Convert images freely between JPG, PNG, and WebP using this high-performance secure in-browser tool.',
  keywords: ["convert webp to jpg","png to webp","image format changer online"],
  alternates: {
    canonical: '/tools/image-format-converter'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
