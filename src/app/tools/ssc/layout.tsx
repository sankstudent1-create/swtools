import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SSC Exam Signature Formatter',
  description: 'Format your signature for SSC exams (CGL, CHSL, MTS) to official dimensions and sizes perfectly. Free SSC signature template tool by SW Tools.',
  keywords: ["SSC signature formatting","SSC photo tool","SSC examination format"],
  alternates: {
    canonical: '/tools/ssc'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
