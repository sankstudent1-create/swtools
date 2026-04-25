import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'India Post GDS Photo Formatter',
  description: 'Free online tool to crop and resize your passport photo to exactly 4:5 ratio and 50KB limit for India Post Gramin Dak Sevak online application.',
  keywords: ["India Post GDS photo","GDS photo resize","India post application photo 50kb"],
  alternates: {
    canonical: '/tools/india-post-photo'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
