import { buildToolMetadata } from '@/lib/og-metadata';

export const metadata = buildToolMetadata(
  'Online Typing Tutor',
  'Improve your typing speed and accuracy with our interactive typing tutor. Features SSC CGL prep, lessons, and real-time analysis.',
  '/tools/typing-tutor'
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
