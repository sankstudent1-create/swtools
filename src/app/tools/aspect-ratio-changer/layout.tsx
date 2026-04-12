import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aspect Ratio Changer',
  description: 'Change the aspect ratio of any image to 16:9, 4:3, 1:1 and other sizes instantly. Fill backgrounds easily.',
  keywords: ["change aspect ratio","image ratio tool","16:9 image cropper"],
  alternates: {
    canonical: '/tools/aspect-ratio-changer'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
