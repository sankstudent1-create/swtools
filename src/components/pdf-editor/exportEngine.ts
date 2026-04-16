// ─── Export Engine — Comprehensive PDF Export with all element types ──
// Handles: text, rect, circle, line, arrow, highlight, drawing, image, signature, watermark, page transforms
import type { PDFElement, PageTransform, WatermarkConfig, PathPoint } from './types';

export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
    : { r: 0, g: 0, b: 0 };
}

export async function exportPdf(
  file: File,
  elements: PDFElement[],
  pageSizes: Record<number, { width: number; height: number }>,
  zoom: number,
  pageTransforms: Record<number, PageTransform>,
  watermark: WatermarkConfig | null,
  pageOrder: number[],
) {
  const { PDFDocument, StandardFonts, rgb, degrees, PDFPage } = await import('pdf-lib');
  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const pdfDoc = await PDFDocument.create();

  const sourcePages = sourceDoc.getPages();
  const effectivePageOrder = pageOrder.length > 0 
    ? pageOrder.filter(idx => !pageTransforms[idx]?.deleted)
    : Array.from({ length: sourcePages.length }, (_, i) => i).filter(idx => !pageTransforms[idx]?.deleted);

  // ─── Copy and transform pages in the correct order ───
  const pageMapping: Record<number, number> = {}; // original index -> new index
  for (let i = 0; i < effectivePageOrder.length; i++) {
    const originalIdx = effectivePageOrder[i];
    const [copiedPage] = await pdfDoc.copyPages(sourceDoc, [originalIdx]);
    const page = pdfDoc.addPage(copiedPage);
    pageMapping[originalIdx] = i;

    const transform = pageTransforms[originalIdx];
    if (transform?.rotation) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + transform.rotation));
    }
  }

  const activePages = pdfDoc.getPages();

  // ─── Font cache ───
  const fontCache: Record<string, Awaited<ReturnType<typeof pdfDoc.embedFont>>> = {};

  async function getFont(family: string, weight?: string, style?: string) {
    const isBold = weight === 'bold' || parseInt(weight || '400') >= 600;
    const isItalic = style === 'italic' || style === 'oblique';

    let fontRef;
    if (family?.includes('Times') || family === 'TimesRoman' || family?.includes('TimesRoman')) {
      if (isBold && isItalic) fontRef = StandardFonts.TimesRomanBoldItalic;
      else if (isBold) fontRef = StandardFonts.TimesRomanBold;
      else if (isItalic) fontRef = StandardFonts.TimesRomanItalic;
      else fontRef = StandardFonts.TimesRoman;
    } else if (family?.includes('Courier')) {
      if (isBold && isItalic) fontRef = StandardFonts.CourierBoldOblique;
      else if (isBold) fontRef = StandardFonts.CourierBold;
      else if (isItalic) fontRef = StandardFonts.CourierOblique;
      else fontRef = StandardFonts.Courier;
    } else {
      // Helvetica (default)
      if (isBold && isItalic) fontRef = StandardFonts.HelveticaBoldOblique;
      else if (isBold) fontRef = StandardFonts.HelveticaBold;
      else if (isItalic) fontRef = StandardFonts.HelveticaOblique;
      else fontRef = StandardFonts.Helvetica;
    }

    const key = String(fontRef);
    if (!fontCache[key]) {
      fontCache[key] = await pdfDoc.embedFont(fontRef);
    }
    return fontCache[key];
  }

  // ─── Draw elements ───
  for (const el of elements) {
    const mappedPageIdx = pageMapping[el.pageIndex];
    if (mappedPageIdx === undefined) continue; // page was deleted

    const page = activePages[mappedPageIdx];
    const { height: pageHeight, width: pageWidth } = page.getSize();

    // Scale from rendered coordinates to PDF coordinates
    const renderedSize = pageSizes[el.pageIndex];
    const renderedWidth = renderedSize ? renderedSize.width * zoom : pageWidth;
    const renderedHeight = renderedSize ? renderedSize.height * zoom : pageHeight;
    const scaleX = pageWidth / renderedWidth;
    const scaleY = pageHeight / renderedHeight;

    const pdfX = el.x * scaleX;
    const pdfY = pageHeight - (el.y * scaleY) - (el.height * scaleY);
    const pdfW = el.width * scaleX;
    const pdfH = el.height * scaleY;
    const opacity = el.opacity ?? 1;

    switch (el.type) {
      case 'rect': {
        const fill = el.fill && el.fill !== 'transparent' ? hexToRgb(el.fill) : null;
        const stroke = el.strokeColor && el.strokeColor !== 'transparent' ? hexToRgb(el.strokeColor) : null;
        if (fill) {
          page.drawRectangle({
            x: pdfX, y: pdfY, width: pdfW, height: pdfH,
            color: rgb(fill.r, fill.g, fill.b),
            opacity,
            borderWidth: stroke ? (el.strokeWidth || 1) * scaleX : 0,
            borderColor: stroke ? rgb(stroke.r, stroke.g, stroke.b) : undefined,
            borderOpacity: opacity,
          });
        } else if (stroke) {
          page.drawRectangle({
            x: pdfX, y: pdfY, width: pdfW, height: pdfH,
            borderWidth: (el.strokeWidth || 1) * scaleX,
            borderColor: rgb(stroke.r, stroke.g, stroke.b),
            borderOpacity: opacity,
          });
        }
        break;
      }

      case 'circle': {
        const cx = pdfX + pdfW / 2;
        const cy = pdfY + pdfH / 2;
        const rx = pdfW / 2;
        const ry = pdfH / 2;
        const fill = el.fill && el.fill !== 'transparent' ? hexToRgb(el.fill) : null;
        const stroke = el.strokeColor && el.strokeColor !== 'transparent' ? hexToRgb(el.strokeColor) : null;
        page.drawEllipse({
          x: cx, y: cy, xScale: rx, yScale: ry,
          color: fill ? rgb(fill.r, fill.g, fill.b) : undefined,
          opacity: fill ? opacity : 0,
          borderWidth: stroke ? (el.strokeWidth || 1) * scaleX : 0,
          borderColor: stroke ? rgb(stroke.r, stroke.g, stroke.b) : undefined,
          borderOpacity: opacity,
        });
        break;
      }

      case 'line':
      case 'arrow': {
        const stroke = hexToRgb(el.strokeColor || el.color || '#000000');
        const startX = pdfX;
        const startY = pdfY + pdfH;
        const endX = pdfX + pdfW;
        const endY = pdfY;

        page.drawLine({
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
          thickness: (el.strokeWidth || 2) * scaleX,
          color: rgb(stroke.r, stroke.g, stroke.b),
          opacity,
        });

        // Arrow head
        if (el.type === 'arrow') {
          const angle = Math.atan2(endY - startY, endX - startX);
          const headLen = 12 * scaleX;
          const a1x = endX - headLen * Math.cos(angle - Math.PI / 6);
          const a1y = endY - headLen * Math.sin(angle - Math.PI / 6);
          const a2x = endX - headLen * Math.cos(angle + Math.PI / 6);
          const a2y = endY - headLen * Math.sin(angle + Math.PI / 6);
          page.drawLine({ start: { x: endX, y: endY }, end: { x: a1x, y: a1y }, thickness: (el.strokeWidth || 2) * scaleX, color: rgb(stroke.r, stroke.g, stroke.b), opacity });
          page.drawLine({ start: { x: endX, y: endY }, end: { x: a2x, y: a2y }, thickness: (el.strokeWidth || 2) * scaleX, color: rgb(stroke.r, stroke.g, stroke.b), opacity });
        }
        break;
      }

      case 'highlight': {
        const fill = hexToRgb(el.fill || '#facc15');
        page.drawRectangle({
          x: pdfX, y: pdfY, width: pdfW, height: pdfH,
          color: rgb(fill.r, fill.g, fill.b),
          opacity: (el.opacity ?? 0.35),
        });
        break;
      }

      case 'text': {
        // ─── Inline text editing with font-accurate matching ───
        // First draw a white-out rectangle to cover original text if this was an inline edit
        if (el.originalSpanId || (el.fill && el.fill !== 'transparent')) {
          const fillColor = el.fill && el.fill !== 'transparent' ? hexToRgb(el.fill) : { r: 1, g: 1, b: 1 };
          page.drawRectangle({
            x: pdfX, y: pdfY, width: pdfW, height: pdfH,
            color: rgb(fillColor.r, fillColor.g, fillColor.b),
          });
        }

        if (el.text) {
          const font = await getFont(el.fontFamily || 'Helvetica', el.fontWeight, el.fontStyle);
          const rgbC = hexToRgb(el.color || '#000000');

          // Calculate font size in PDF coordinates
          const adjustedFontSize = (el.fontSize || 14) * scaleY;
          const pdfLetterSpacing = (el.letterSpacing || 0) * scaleX;

          // Position text with proper baseline
          const textY = pdfY + pdfH - adjustedFontSize * 1.1;

          // Handle multi-line text
          const lines = el.text.split('\n');
          const lineSpacing = adjustedFontSize * (el.lineHeight || 1.25);

          for (let li = 0; li < lines.length; li++) {
            const lineText = lines[li];
            if (!lineText.trim()) continue;

            let lineX = pdfX + 2 * scaleX; // small padding
            const lineY = textY - li * lineSpacing;

            // Safe text filtering
            const safeText = lineText.split('').filter(ch => {
              try { font.encodeText(ch); return true; } catch { return false; }
            }).join('');

            if (!safeText) continue;

            // Text alignment (approximate for multi-char)
            if (el.textAlign === 'center' || el.textAlign === 'right') {
              let textWidth = 0;
              if (pdfLetterSpacing === 0) {
                textWidth = font.widthOfTextAtSize(safeText, adjustedFontSize);
              } else {
                for (const char of safeText) {
                  textWidth += font.widthOfTextAtSize(char, adjustedFontSize) + pdfLetterSpacing;
                }
              }
              if (el.textAlign === 'center') {
                lineX = pdfX + (pdfW - textWidth) / 2;
              } else {
                lineX = pdfX + pdfW - textWidth - 2 * scaleX;
              }
            }

            // Drawing logic
            if (pdfLetterSpacing === 0) {
              // Standard drawing for performance
              page.drawText(safeText, {
                x: lineX, y: lineY, size: adjustedFontSize, font,
                color: rgb(rgbC.r, rgbC.g, rgbC.b), opacity,
              });
            } else {
              // High-fidelity character-by-character drawing
              let currentX = lineX;
              for (const char of safeText) {
                page.drawText(char, {
                  x: currentX, y: lineY, size: adjustedFontSize, font,
                  color: rgb(rgbC.r, rgbC.g, rgbC.b), opacity,
                });
                currentX += font.widthOfTextAtSize(char, adjustedFontSize) + pdfLetterSpacing;
              }
            }
          }
        }
        break;
      }

      case 'drawing': {
        // Freehand paths — draw as series of connected lines
        if (el.points && el.points.length > 1) {
          const stroke = hexToRgb(el.strokeColor || '#000000');
          for (let i = 1; i < el.points.length; i++) {
            const p0 = el.points[i - 1];
            const p1 = el.points[i];
            page.drawLine({
              start: { x: (el.x + p0.x) * scaleX, y: pageHeight - (el.y + p0.y) * scaleY },
              end: { x: (el.x + p1.x) * scaleX, y: pageHeight - (el.y + p1.y) * scaleY },
              thickness: (el.strokeWidth || 2) * scaleX,
              color: rgb(stroke.r, stroke.g, stroke.b),
              opacity,
            });
          }
        }
        break;
      }

      case 'image':
      case 'signature': {
        if (el.imageData) {
          try {
            let embedded;
            if (el.imageData.includes('image/png')) {
              const base64 = el.imageData.split(',')[1];
              const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
              embedded = await pdfDoc.embedPng(bytes);
            } else {
              const base64 = el.imageData.split(',')[1];
              const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
              embedded = await pdfDoc.embedJpg(bytes);
            }
            page.drawImage(embedded, {
              x: pdfX, y: pdfY, width: pdfW, height: pdfH, opacity,
            });
          } catch (err) {
            console.warn('Failed to embed image:', err);
          }
        }
        break;
      }
    }
  }

  // ─── Apply watermark ───
  if (watermark?.enabled) {
    const activePagesAfter = pdfDoc.getPages();
    for (const page of activePagesAfter) {
      const { width: pw, height: ph } = page.getSize();

      if (watermark.type === 'text' && watermark.text) {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const wColor = hexToRgb(watermark.color || '#ff0000');
        const fontSize = watermark.fontSize || 48;

        if (watermark.position === 'tile') {
          // Tile watermark
          for (let x = 0; x < pw; x += fontSize * 6) {
            for (let y = 0; y < ph; y += fontSize * 3) {
              page.drawText(watermark.text, {
                x, y, size: fontSize, font,
                color: rgb(wColor.r, wColor.g, wColor.b),
                opacity: watermark.opacity,
                rotate: degrees(watermark.rotation),
              });
            }
          }
        } else {
          const textWidth = font.widthOfTextAtSize(watermark.text, fontSize);
          let wx = (pw - textWidth) / 2;
          let wy = ph / 2;

          if (watermark.position === 'top-left') { wx = 30; wy = ph - 60; }
          else if (watermark.position === 'top-right') { wx = pw - textWidth - 30; wy = ph - 60; }
          else if (watermark.position === 'bottom-left') { wx = 30; wy = 40; }
          else if (watermark.position === 'bottom-right') { wx = pw - textWidth - 30; wy = 40; }

          page.drawText(watermark.text, {
            x: wx, y: wy, size: fontSize, font,
            color: rgb(wColor.r, wColor.g, wColor.b),
            opacity: watermark.opacity,
            rotate: degrees(watermark.rotation),
          });
        }
      } else if (watermark.type === 'image' && watermark.imageData) {
        try {
          let embedded;
          if (watermark.imageData.includes('image/png')) {
            const base64 = watermark.imageData.split(',')[1];
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            embedded = await pdfDoc.embedPng(bytes);
          } else {
            const base64 = watermark.imageData.split(',')[1];
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            embedded = await pdfDoc.embedJpg(bytes);
          }
          const imgW = Math.min(embedded.width, pw * 0.4);
          const imgH = (embedded.height / embedded.width) * imgW;
          const ix = (pw - imgW) / 2;
          const iy = (ph - imgH) / 2;
          page.drawImage(embedded, { x: ix, y: iy, width: imgW, height: imgH, opacity: watermark.opacity });
        } catch (err) {
          console.warn('Failed to embed watermark image:', err);
        }
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as any], { type: 'application/pdf' });
}
