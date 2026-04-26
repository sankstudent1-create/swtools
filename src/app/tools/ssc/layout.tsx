import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'SSC Exam Signature Formatter',
  'Format your signature for SSC exams (CGL, CHSL, MTS) to official dimensions and sizes perfectly. Free SSC signature template tool by SW Tools.',
  '/tools/ssc'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
