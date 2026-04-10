import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GDS Leave Application',
  description: 'Official GDS Leave Application — Department of Posts, India Post. Generates quadruplicate format with cover letter.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
