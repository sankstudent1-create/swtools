import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GDS Leave Application Generator | SW Tools',
  description: 'Generate official GDS Leave Applications in exact quadruplicate format. Streamlines leave requests for rural post office staff securely inside the browser.',
  keywords: 'GDS leave application, India Post leave form, Gramin Dak Sevak, post office software, LWA application, paid leave form, postal forms',
}

export default function GdsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
