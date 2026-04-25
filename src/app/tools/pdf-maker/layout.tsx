import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Images to PDF Maker',
  description: 'Convert your scanned documents and images into a polished PDF file effortlessly with customized page properties.',
  keywords: ["image to pdf","convert to pdf","create pdf files online tools"],
  alternates: {
    canonical: '/tools/pdf-maker'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
