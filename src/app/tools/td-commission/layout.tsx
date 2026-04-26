import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'TD Commission / BPM Bill Generator',
  'Create official BPM Incentive Bills for Time Deposit (TD) commissions automatically. Calculations made easy with SW Tools.',
  '/tools/td-commission'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
