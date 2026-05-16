import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'UPI QR Generator',
  'Generate custom, branded UPI QR codes for instant payments. Supports all major UPI apps like GPay, PhonePe, and BHIM.',
  '/tools/upi-qr'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
