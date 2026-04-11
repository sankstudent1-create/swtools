import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'India Post TD Commission Bill Generator | SW Tools',
  description: 'Generate official India Post TD Commission BPM Incentive Bills for Branch Postmasters. Features auto-calculation for interest rates, dynamic table generation, and instant high-quality PDF exports.',
  keywords: "TD Commission, BPM Incentive Bill, India Post tools, GDS TD Commission, Branch Postmaster tools, postal forms, time deposit commission calculator, post office forms, SW Tools India Post",
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
