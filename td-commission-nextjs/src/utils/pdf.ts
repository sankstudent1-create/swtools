import type { EntryRow, OfficeDetails } from '@/types'

export const RATES: Record<string, number> = { '1': 0.5, '2': 1.0, '3': 1.0, '5': 2.0 }
export const TERM_LABELS: Record<string, string> = {
  '1': '1 Year', '2': '2 Years', '3': '3 Years', '5': '5 Years',
}

// ── Number to Indian words ──
const ONES = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
const TENS = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

function cvt(n: number): string {
  if (n === 0) return ''
  if (n < 20)  return ONES[n]
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + cvt(n % 100) : '')
  if (n < 100000) return cvt(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + cvt(n % 1000) : '')
  if (n < 10000000) return cvt(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + cvt(n % 100000) : '')
  return cvt(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + cvt(n % 10000000) : '')
}

export function numToWords(n: number): string {
  n = Math.round(n * 100) / 100
  if (n === 0) return 'Zero Rupees Only'
  const rs = Math.floor(n)
  const ps = Math.round((n - rs) * 100)
  return cvt(rs) + ' Rupees' + (ps ? ' and ' + cvt(ps) + ' Paise' : '') + ' Only'
}

export function formatINR(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── Local Storage ──
const LS_PREFIX = 'tdbill_'

export const lsGet = (key: string): string[] => {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_PREFIX + key) || '[]') } catch { return [] }
}

export const lsAdd = (key: string, value: string): void => {
  if (typeof window === 'undefined' || !value || value.length < 2) return
  const v = value.trim()
  const arr = lsGet(key).filter(x => x.toLowerCase() !== v.toLowerCase())
  arr.unshift(v)
  localStorage.setItem(LS_PREFIX + key, JSON.stringify(arr.slice(0, 20)))
}

// ── PDF Generation (uses jsPDF loaded via CDN in layout) ──
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jspdf: any
  }
}

export async function buildPDFDoc(
  office: OfficeDetails,
  rows: EntryRow[],
): Promise<InstanceType<typeof Object>> {
  // jsPDF loaded via <Script> in layout
  const { jsPDF } = window.jspdf
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const boV = office.bo.trim()
  const soV = office.so.trim()
  const hoV = office.ho.trim()
  const mV  = office.month
  const dV  = office.dated

  const mDisp = mV
    ? new Date(mV + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    : ''
  const dDisp = dV
    ? new Date(dV).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''

  const boLabel = boV ? boV.toUpperCase() + ' B.O.' : 'B.O.'
  const soLabel = soV ? soV.toUpperCase() + ' S.O.' : 'S.O.'
  const hoLabel = hoV ? hoV.toUpperCase() + ' H.O.' : 'H.O.'
  const bpmSig  = boV ? `Signature of BPM  ${boLabel}` : 'Signature of BPM ............... B.O.'
  const spmSig  = soV ? `Signature of SPM  ${soLabel}` : 'Signature of SPM ............... S.O.'

  let tDep = 0, tInc = 0
  rows.forEach(r => { tDep += parseFloat(r.dep) || 0; tInc += parseFloat(r.inc) || 0 })

  const iWords = tInc > 0 ? numToWords(tInc) : ''
  const iAmt   = tInc > 0 ? formatINR(tInc) : '.........'

  // Build 19 rows
  const bodyRows = []
  for (let i = 0; i < 19; i++) {
    const r = rows[i]
    bodyRows.push(r
      ? [i + 1, r.acc || '', r.pr || '', r.name || '',
          r.dep  ? formatINR(parseFloat(r.dep)) : '',
          r.term ? TERM_LABELS[r.term] : '',
          r.rate ? r.rate + '%' : '',
          r.inc  ? formatINR(parseFloat(r.inc)) : '']
      : [i + 1, '', '', '', '', '', '', ''])
  }

  const totalRow = [
    { content: 'Total', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
    { content: tDep > 0 ? formatINR(tDep) : '', styles: { halign: 'right', fontStyle: 'bold' } },
    { content: '', styles: {} },
    { content: '', styles: {} },
    { content: tInc > 0 ? formatINR(tInc) : '', styles: { halign: 'right', fontStyle: 'bold' } },
  ]

  const PW = 210, mg = 13, usableW = 184
  let y = 12

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text('DEPARTMENT OF POSTS, INDIA', PW / 2, y, { align: 'center' }); y += 5.5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const offLine = (boV || soV || hoV)
    ? `${boLabel}   ${soLabel}   ${hoLabel}`
    : '...............B.O.   ...............S.O.   ...............H.O.'
  doc.text(offLine, PW / 2, y, { align: 'center' }); y += 5.5

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TD COMMISSION BPM INCENTIVE BILL', PW / 2, y, { align: 'center' }); y += 6.5

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('FOR THE MONTH OF', mg, y)
  doc.setFont('helvetica', 'normal')
  if (mDisp) doc.text(mDisp, mg + 39, y)
  doc.setFont('helvetica', 'bold')
  doc.text('DATED:', PW - mg - 34, y)
  doc.setFont('helvetica', 'normal')
  if (dDisp) doc.text(dDisp, PW - mg - 21, y)
  y += 3

  doc.autoTable({
    startY: y,
    head: [[
      { content: 'SR\nNO', styles: { halign: 'center' } },
      { content: 'ACCOUNT NO.', styles: { halign: 'center' } },
      { content: 'PR\nNO.', styles: { halign: 'center' } },
      { content: 'NAME OF\nDEPOSITOR', styles: { halign: 'center' } },
      { content: 'DEPOSIT\nAMOUNT', styles: { halign: 'center' } },
      { content: 'TERM OF\nDEPOSIT', styles: { halign: 'center' } },
      { content: 'RATE OF\nINCENTIVE', styles: { halign: 'center' } },
      { content: 'INCENTIVE\nAMOUNT', styles: { halign: 'center' } },
    ]],
    body: [...bodyRows, totalRow],
    theme: 'grid',
    styles: {
      font: 'helvetica', fontSize: 7.5,
      cellPadding: { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 },
      lineColor: [0, 0, 0], lineWidth: 0.3,
      textColor: [0, 0, 0], valign: 'middle', halign: 'center',
      fillColor: [255, 255, 255], minCellHeight: 5.0,
    },
    headStyles: {
      fillColor: [255, 255, 255], textColor: [0, 0, 0],
      fontStyle: 'bold', fontSize: 7.5, halign: 'center',
      lineColor: [0, 0, 0], lineWidth: 0.3, minCellHeight: 10,
    },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center' },
      1: { cellWidth: 27, halign: 'center' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 43, halign: 'left', cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 1.5 } },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 24, halign: 'right' },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didParseCell(d: any) {
      if (d.row.index === bodyRows.length) d.cell.styles.fillColor = [255, 255, 255]
    },
    margin: { left: mg, right: mg },
  })

  y = doc.lastAutoTable.finalY + 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Certified that all the above mentioned accounts are opened at Branch Office and not through any SAS agents.', mg, y, { maxWidth: usableW }); y += 4.5
  doc.text('Certified that incentive for above mentioned accounts are not taken earlier.', mg, y); y += 8

  function approvalBlock(line1: string, sigLine: string) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    const split: string[] = doc.splitTextToSize(line1, usableW)
    doc.text(split, mg, y)
    const lh = split.length * 4.5
    if (iWords) {
      const wy = y + lh
      doc.setFontSize(8)
      doc.text(iWords, mg + 2, wy, { maxWidth: usableW - 2 })
      const wl: string[] = doc.splitTextToSize(iWords, usableW - 2)
      y = wy + wl.length * 4.2 + 7
    } else { y += lh + 7 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text(sigLine, PW - mg, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    y += 11
  }

  approvalBlock(`Please give the acceptance of incentive amount of Rs. ${iAmt} Rupees(in words)`, bpmSig)
  approvalBlock(`Acceptance granted for the amount of Rs. ${iAmt} Rupees(in words)`, spmSig)
  approvalBlock(`Incentive amount of Rs. ${iAmt} Received Rupees (in words)`, bpmSig)

  y += 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('B.O DATE STAMP', mg, y)

  return doc
}
