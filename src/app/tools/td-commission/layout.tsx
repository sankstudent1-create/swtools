import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'SW Tools - TD Commission BPM Incentive Bill Generator',
  description: 'TD Commission BPM Incentive Bill Generator for GDS/BPM Post Offices',
}

export default function TDCommissionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@300;400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  )
}
