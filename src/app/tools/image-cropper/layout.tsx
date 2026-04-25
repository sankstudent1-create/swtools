import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Image Cropper',
  description: 'Easily crop pictures using custom bounds or popular social media aspect ratios.',
  keywords: ["crop image online","photo cropping tool","free crop pictures"],
  alternates: {
    canonical: '/tools/image-cropper'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
