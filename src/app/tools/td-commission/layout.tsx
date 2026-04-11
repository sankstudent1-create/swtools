import type { Metadata } from 'next'
import Script from 'next/script'

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
      {/* jsPDF + autoTable loaded globally so they're available in utils/pdf.ts */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js"
        strategy="beforeInteractive"
      />
    </>
  )
}
