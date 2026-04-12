import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Banking Thumb Impression Formatter',
  description: 'Format your left-thumb impression image for IBPS, SBI, and other banking rectruitments. Ensures square resolution and high clarity.',
  keywords: ["Bank thumb impression size","IBPS left thumb impression","SBI thumb format"],
  alternates: {
    canonical: '/tools/bank-thumb'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
