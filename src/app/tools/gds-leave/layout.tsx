import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GDS Leave Application PDF Generator',
  description: 'Auto-generate official GDS Leave Applications in 4-copy format. Complete paid leave and LWA form generator.',
  keywords: ["GDS leave application","India Post GDS leave PDF","Gramin Dak Sevak leave form make online"],
  alternates: {
    canonical: '/tools/gds-leave'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
