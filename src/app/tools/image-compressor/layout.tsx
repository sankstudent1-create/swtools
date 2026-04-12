import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advanced Image Compressor',
  description: 'Reduce image file size intelligently. Compress JPG, PNG, WEBP files while keeping high visual quality.',
  keywords: ["image compressor online","reduce image kb","compress photo size free"],
  alternates: {
    canonical: '/tools/image-compressor'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
