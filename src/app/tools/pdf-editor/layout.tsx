import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pro PDF Editor',
  description: 'Edit, whiteout, annotate, and bake interactive text into any PDF without server uploads. Secure browser-based PDF editor by SW Tools.',
  keywords: ["Pro PDF Editor", "edit PDF online", "free PDF editor", "client-side PDF editor"],
  alternates: {
    canonical: '/tools/pdf-editor'
  },
  openGraph: {
    title: 'Pro PDF Editor',
    description: 'Edit, whiteout, annotate, and bake interactive text into any PDF without server uploads. Secure browser-based PDF editor by SW Tools.',
    url: '/tools/pdf-editor'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
