import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RRB Railway Signature Formatter',
  description: 'Easily format your signature to meet official Railway RRB recruitment guidelines. Ensure exact pixel width and KB limits for railway exams.',
  keywords: ["RRB signature size maker","Railway exam signature format"],
  alternates: {
    canonical: '/tools/rrb'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
