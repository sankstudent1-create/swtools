import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Letterpad Generator',
  description: 'Generate official government and business letterpads with our smart, customizable template output engine.',
  keywords: ["letterpad generator","office letterhead template","government formatting tool"],
  alternates: {
    canonical: '/tools/letterpad-generator'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
