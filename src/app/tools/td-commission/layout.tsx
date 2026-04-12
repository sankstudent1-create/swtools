import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TD Commission / BPM Bill Generator',
  description: 'Create official BPM Incentive Bills for Time Deposit (TD) commissions automatically. Calculations made easy with SW Tools.',
  keywords: ["TD commission bill","BPM incentive bill generator","time deposit commission calculate"],
  alternates: {
    canonical: '/tools/td-commission'
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
