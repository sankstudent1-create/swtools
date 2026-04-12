import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IBPS Handwritten Declaration Formatter',
  description: 'Prepare handwritten declaration scans for IBPS PO, Clerk, SO exams with correct landscape size, dimension, and 50KB to 100KB limits.',
  keywords: ["IBPS handwritten declaration","IBPS declaration size","IBPS text formatting"],
  alternates: {
    canonical: '/tools/ibps-declaration'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
