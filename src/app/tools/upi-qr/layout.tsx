import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UPI QR Generator',
  description: 'Generate premium glassmorphic UPI QR codes for payments with custom branding. Secure browser-based payment code creator.',
  keywords: ["UPI QR Generator", "payment QR code maker", "glassmorphic QR code"],
  alternates: {
    canonical: '/tools/upi-qr'
  },
  openGraph: {
    title: 'UPI QR Generator',
    description: 'Generate premium glassmorphic UPI QR codes for payments with custom branding. Secure browser-based payment code creator.',
    url: '/tools/upi-qr'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
