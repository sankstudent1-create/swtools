import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'
import type { EntryRow, OfficeDetails } from '@/types/td-commission'
import { numToWords, formatINR, TERM_LABELS } from '@/lib/td-commission/pdf'

type WatermarkMode = 'none' | 'preview'

const A4_WIDTH = 595.28
const A4_HEIGHT = 841.89

function safeUpper(v: string) {
  return (v || '').trim().toUpperCase()
}

function drawCenteredText(page: any, text: string, y: number, font: any, size: number) {
  const { width } = page.getSize()
  const textWidth = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color: rgb(0, 0, 0) })
}

export async function buildTDCommissionPdfBytes(params: {
  office: OfficeDetails
  rows: EntryRow[]
  watermark: WatermarkMode
}) {
  const { office, rows, watermark } = params

  const doc = await PDFDocument.create()
  const page = doc.addPage([A4_WIDTH, A4_HEIGHT])

  const fontReg = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const marginX = 36
  let y = A4_HEIGHT - 48

  drawCenteredText(page, 'DEPARTMENT OF POSTS, INDIA', y, fontBold, 12)
  y -= 18

  const boV = safeUpper(office.bo)
  const soV = safeUpper(office.so)
  const hoV = safeUpper(office.ho)

  const boLabel = boV ? `${boV} B.O.` : 'B.O.'
  const soLabel = soV ? `${soV} S.O.` : 'S.O.'
  const hoLabel = hoV ? `${hoV} H.O.` : 'H.O.'

  drawCenteredText(page, `${boLabel}   ${soLabel}   ${hoLabel}`, y, fontReg, 10)
  y -= 22

  drawCenteredText(page, 'TD COMMISSION BPM INCENTIVE BILL', y, fontBold, 12)
  y -= 20

  const monthDisp = office.month
    ? new Date(office.month + '-01').toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    : ''
  const datedDisp = office.dated
    ? new Date(office.dated).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''

  page.drawText('FOR THE MONTH OF', { x: marginX, y, size: 10, font: fontBold })
  page.drawText(monthDisp || '__________', { x: marginX + 110, y, size: 10, font: fontReg })

  page.drawText('DATED:', { x: A4_WIDTH - marginX - 120, y, size: 10, font: fontBold })
  page.drawText(datedDisp || '__________', { x: A4_WIDTH - marginX - 70, y, size: 10, font: fontReg })

  y -= 18

  const cols = [
    { key: 'sr', w: 28 },
    { key: 'acc', w: 78 },
    { key: 'pr', w: 48 },
    { key: 'name', w: 126 },
    { key: 'dep', w: 76 },
    { key: 'term', w: 70 },
    { key: 'rate', w: 70 },
    { key: 'inc', w: 78 },
  ]

  const tableX = marginX
  const tableW = cols.reduce((s, c) => s + c.w, 0)
  const rowH = 18

  function cellX(i: number) {
    let x = tableX
    for (let k = 0; k < i; k++) x += cols[k].w
    return x
  }

  function drawCellBorder(x: number, yTop: number, w: number, h: number) {
    page.drawRectangle({ x, y: yTop - h, width: w, height: h, borderColor: rgb(0, 0, 0), borderWidth: 1, color: rgb(1, 1, 1) })
  }

  const headers = ['SR\nNO', 'ACCOUNT NO.', 'PR\nNO.', 'NAME OF\nDEPOSITOR', 'DEPOSIT\nAMOUNT', 'TERM OF\nDEPOSIT', 'RATE OF\nINCENTIVE', 'INCENTIVE\nAMOUNT']

  for (let i = 0; i < cols.length; i++) {
    const x = cellX(i)
    drawCellBorder(x, y, cols[i].w, rowH)
    const text = headers[i]
    const lines = text.split('\n')
    lines.forEach((ln, li) => {
      const size = 8
      const tw = fontBold.widthOfTextAtSize(ln, size)
      page.drawText(ln, {
        x: x + (cols[i].w - tw) / 2,
        y: y - 6 - li * 9,
        size,
        font: fontBold,
        color: rgb(0, 0, 0),
      })
    })
  }

  y -= rowH

  let tDep = 0
  let tInc = 0
  rows.forEach(r => {
    tDep += parseFloat(r.dep) || 0
    tInc += parseFloat(r.inc) || 0
  })

  for (let rIdx = 0; rIdx < 19; rIdx++) {
    const r = rows[rIdx]
    const values = [
      String(rIdx + 1),
      r?.acc || '',
      r?.pr || '',
      r?.name || '',
      r?.dep ? formatINR(parseFloat(r.dep)) : '',
      r?.term ? (TERM_LABELS as any)[r.term] : '',
      r?.rate ? `${r.rate}%` : '',
      r?.inc ? formatINR(parseFloat(r.inc)) : '',
    ]

    for (let i = 0; i < cols.length; i++) {
      const x = cellX(i)
      drawCellBorder(x, y, cols[i].w, rowH)
      const v = values[i]
      const size = 8
      const pad = 4
      let tx = x + pad
      if ([0, 1, 2, 5].includes(i)) {
        const tw = fontReg.widthOfTextAtSize(v, size)
        tx = x + (cols[i].w - tw) / 2
      }
      if ([4].includes(i)) {
        const tw = fontReg.widthOfTextAtSize(v, size)
        tx = x + cols[i].w - tw - pad
      }
      page.drawText(v, { x: tx, y: y - 12, size, font: fontReg, color: rgb(0, 0, 0) })
    }

    y -= rowH
  }

  const totalRowH = 18
  for (let i = 0; i < cols.length; i++) {
    const x = cellX(i)
    drawCellBorder(x, y, cols[i].w, totalRowH)
  }

  page.drawText('Total', {
    x: tableX + cols[0].w + cols[1].w + cols[2].w + cols[3].w - 36,
    y: y - 12,
    size: 9,
    font: fontBold,
    color: rgb(0, 0, 0),
  })
  page.drawText(tDep > 0 ? formatINR(tDep) : '', {
    x: cellX(4) + cols[4].w - fontBold.widthOfTextAtSize(tDep > 0 ? formatINR(tDep) : '', 9) - 4,
    y: y - 12,
    size: 9,
    font: fontBold,
    color: rgb(0, 0, 0),
  })
  page.drawText(tInc > 0 ? formatINR(tInc) : '', {
    x: cellX(7) + cols[7].w - fontBold.widthOfTextAtSize(tInc > 0 ? formatINR(tInc) : '', 9) - 4,
    y: y - 12,
    size: 9,
    font: fontBold,
    color: rgb(0, 0, 0),
  })

  y -= totalRowH + 18

  const iWords = tInc > 0 ? numToWords(tInc) : ''
  const iAmt = tInc > 0 ? formatINR(tInc) : '.........'

  const bodyLines = [
    'Certified that all the above mentioned accounts are opened at Branch Office and not through any SAS agents.',
    'Certified that incentive for above mentioned accounts are not taken earlier.',
    `Please give the acceptance of incentive amount of Rs. ${iAmt} Rupees(in words)`,
    `Acceptance granted for the amount of Rs. ${iAmt} Rupees(in words)`,
    `Incentive amount of Rs. ${iAmt} Received Rupees (in words)`,
  ]

  page.drawText(bodyLines[0], { x: marginX, y, size: 9, font: fontReg, maxWidth: tableW })
  y -= 16
  page.drawText(bodyLines[1], { x: marginX, y, size: 9, font: fontReg, maxWidth: tableW })
  y -= 28

  const sigBpm = boV ? `Signature of BPM  ${boLabel}` : 'Signature of BPM ............... B.O.'
  const sigSpm = soV ? `Signature of SPM  ${soLabel}` : 'Signature of SPM ............... S.O.'

  function approvalBlock(line: string, sigLine: string) {
    page.drawText(line, { x: marginX, y, size: 9, font: fontReg, maxWidth: tableW })
    y -= 14
    if (iWords) {
      page.drawText(iWords, { x: marginX + 8, y, size: 8.5, font: fontReg, maxWidth: tableW - 8 })
      y -= 28
    } else {
      y -= 14
    }
    const tw = fontBold.widthOfTextAtSize(sigLine, 9)
    page.drawText(sigLine, { x: tableX + tableW - tw, y, size: 9, font: fontBold })
    y -= 26
  }

  approvalBlock(bodyLines[2], sigBpm)
  approvalBlock(bodyLines[3], sigSpm)
  approvalBlock(bodyLines[4], sigBpm)

  page.drawText('B.O DATE STAMP', { x: marginX, y, size: 10, font: fontBold })

  if (watermark === 'preview') {
    const wmText = 'SWTOOLS PREVIEW'
    const stepX = 220
    const stepY = 170
    for (let xx = -200; xx < A4_WIDTH + 200; xx += stepX) {
      for (let yy = -200; yy < A4_HEIGHT + 200; yy += stepY) {
        page.drawText(wmText, {
          x: xx,
          y: yy,
          size: 34,
          font: fontBold,
          color: rgb(0.7, 0.7, 0.7),
          rotate: degrees(30),
          opacity: 0.18,
        })
      }
    }
  }

  return await doc.save()
}
