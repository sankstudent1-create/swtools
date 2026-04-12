import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'India Post GDS Signature Formatter',
  description: 'Format your signature for the India Post Gramin Dak Sevak (GDS) application. Fast, secure, and accurate 20KB limit scaling.',
  keywords: ["India Post GDS signature","GDS signature resize","GDS signature 20kb"],
  alternates: {
    canonical: '/tools/india-post-signature'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
