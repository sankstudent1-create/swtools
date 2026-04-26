import html2canvas from 'html2canvas'

export async function elementToPdfBase64A4(el: HTMLElement) {
  const { jsPDF } = await import('jspdf')

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let y = 0
  pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight)

  while (imgHeight + y > pageHeight) {
    y -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight)
  }

  const dataUri = pdf.output('datauristring')
  const base64 = dataUri.split(',')[1] || ''
  return base64
}

export async function elementToPdfBlobA4(el: HTMLElement) {
  const { jsPDF } = await import('jspdf')

  const canvas = await html2canvas(el, {
    scale: 1.35,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/jpeg', 0.92)

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let y = 0
  pdf.addImage(imgData, 'JPEG', 0, y, imgWidth, imgHeight)

  while (imgHeight + y > pageHeight) {
    y -= pageHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, y, imgWidth, imgHeight)
  }

  return pdf.output('blob') as Blob
}

export async function htmlPagesToPdfBase64A4(html: string, pageSelector: string) {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.left = '-10000px'
  iframe.style.top = '0'
  iframe.style.width = '1200px'
  iframe.style.height = '900px'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'

  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    if (!doc) throw new Error('No iframe document')

    doc.open()
    doc.write(html)
    doc.close()

    await new Promise<void>((resolve, reject) => {
      const w = iframe.contentWindow
      if (!w) return reject(new Error('No iframe window'))
      const done = () => resolve()
      if (doc.readyState === 'complete') {
        done()
        return
      }
      w.addEventListener('load', () => done(), { once: true })
      setTimeout(() => done(), 700)
    })

    const pages = Array.from(doc.querySelectorAll(pageSelector)) as HTMLElement[]
    if (pages.length === 0) throw new Error('No pages found')

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (i > 0) pdf.addPage()

      const y = Math.max(0, (pageHeight - imgHeight) / 2)
      pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight)
    }

    const dataUri = pdf.output('datauristring')
    const base64 = dataUri.split(',')[1] || ''
    return base64
  } finally {
    iframe.remove()
  }
}

export async function htmlPagesToPdfBlobA4(html: string, pageSelector: string) {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.left = '-10000px'
  iframe.style.top = '0'
  iframe.style.width = '1200px'
  iframe.style.height = '900px'
  iframe.style.opacity = '0'
  iframe.style.pointerEvents = 'none'

  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    if (!doc) throw new Error('No iframe document')

    doc.open()
    doc.write(html)
    doc.close()

    await new Promise<void>((resolve, reject) => {
      const w = iframe.contentWindow
      if (!w) return reject(new Error('No iframe window'))
      const done = () => resolve()
      if (doc.readyState === 'complete') {
        done()
        return
      }
      w.addEventListener('load', () => done(), { once: true })
      setTimeout(() => done(), 700)
    })

    const pages = Array.from(doc.querySelectorAll(pageSelector)) as HTMLElement[]
    if (pages.length === 0) throw new Error('No pages found')

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 1.35,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (i > 0) pdf.addPage()

      const y = Math.max(0, (pageHeight - imgHeight) / 2)
      pdf.addImage(imgData, 'JPEG', 0, y, imgWidth, imgHeight)
    }

    return pdf.output('blob') as Blob
  } finally {
    iframe.remove()
  }
}
