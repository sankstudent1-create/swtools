import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online Image Resizer',
  description: 'Resize images to precise dimensions with different fit modes, background fills, and quality controls. SW Tools premium utility.',
  keywords: ["online image resizer","scale image online","resize image pixels"],
  alternates: {
    canonical: '/tools/image-resizer'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
