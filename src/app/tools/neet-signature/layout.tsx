import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NEET Signature & Photo Formatter',
  description: 'Correctly format your online NEET application signature and photo attachments precisely to NTA guidelines.',
  keywords: ["NEET signature format","NEET photo size tool","NTA signature resize"],
  alternates: {
    canonical: '/tools/neet-signature'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
