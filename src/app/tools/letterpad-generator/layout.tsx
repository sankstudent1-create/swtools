import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swalekhani — Official Letterpad Generator by Sanket Wanve | Swinfosystems',
  description: 'Swalekhani by Swinfosystems — India\'s most beautiful official letterpad generator and writer tool by Sanket Wanve. Perfect for Government, Industry, Business, and Personal letters.',
  keywords: ["swalekhani", "swinfosystems letterpad generator", "swinfosystems letter generator", "sanket wanve", "letterpad generator", "official letter writer", "free letter generator", "industry letter format"],
  alternates: {
    canonical: '/tools/letterpad-generator'
  },
  openGraph: {
    title: 'Swalekhani — Official Letterpad Generator by Sanket Wanve | Swinfosystems',
    description: 'Swalekhani by Swinfosystems — India\'s most beautiful official letterpad generator and writer tool by Sanket Wanve. Perfect for Government, Industry, Business, and Personal letters.',
    url: '/tools/letterpad-generator',
    images: ['/brand/hero-ai-grid.svg']
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
