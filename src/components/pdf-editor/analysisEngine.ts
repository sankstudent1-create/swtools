import { PDFElement } from './types';

export interface AnalyzedTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  isSerif: boolean;
  isBold: boolean;
  isMono: boolean;
  transform: number[];
}

export interface PageAnalysis {
  items: AnalyzedTextItem[];
  viewport: { width: number; height: number };
}

/**
 * Analyzes a PDF page to extract high-precision coordinate and font metadata.
 * maps PDF.js data to our internal coordinate system.
 */
export async function analyzePage(pageProxy: any): Promise<PageAnalysis> {
  const textContent = await pageProxy.getTextContent();
  const viewport = pageProxy.getViewport({ scale: 1 });
  
  // Extract common objects to find font information
  const commonObjs = pageProxy.commonObjs;

  const items: AnalyzedTextItem[] = textContent.items.map((item: any) => {
    // PDF.js transform: [fontHeight, 0, 0, fontHeight, x, y]
    // The y-coordinate in PDF space is bottom-up, but textContent items 
    // often have transforms that need mapping to top-down.
    const t = item.transform;
    const fontSize = Math.sqrt(t[0] * t[0] + t[1] * t[1]);
    
    // Convert PDF coordinates (bottom-up) to Viewport coordinates (top-down)
    // pdf.js getViewport().transform converts [x, y] to [x', y']
    const [x, y] = viewport.convertToViewportPoint(t[4], t[5]);
    
    // Height and width usually come in textContent item
    const width = item.width;
    const height = item.height || fontSize;

    // ─── Robust Font Detection ───
    let isSerif = false;
    let isBold = false;
    let isMono = false;
    let fontName = '';

    try {
      const fontId = item.fontName;
      // commonObjs.get can throw "Requesting object that isn't resolved yet"
      const fontInfo = commonObjs.get(fontId);
      
      if (fontInfo && fontInfo.name) {
        const rawName = fontInfo.name.toLowerCase();
        // PDF fonts often include subsets (e.g., "ABCDEF+TimesNewRoman")
        fontName = rawName.includes('+') ? rawName.split('+')[1] : rawName;
        
        isSerif = fontName.includes('serif') || fontName.includes('times') || fontName.includes('minion') || fontName.includes('georgia');
        isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');
        isMono = fontName.includes('mono') || fontName.includes('courier') || fontName.includes('consolas');
      }
    } catch (err) {
      // If font resolution fails, we fall back to generic detection or defaults
      // console.warn('Font resolution delayed for:', item.fontName);
    }

    return {
      str: item.str,
      x,
      y: y - height, // Align to top-down rect rendering
      width,
      height,
      fontSize,
      fontName: item.fontName,
      isSerif,
      isBold,
      isMono,
      transform: t
    };
  });

  return {
    items,
    viewport: { width: viewport.width, height: viewport.height }
  };
}

/**
 * Finds the best text group at a given coordinate.
 * Uses a spatial buffer to catch lines even if user clicks white space between words.
 */
export function findTextAt(analysis: PageAnalysis, x: number, y: number): AnalyzedTextItem[] {
  const BUFFER = 10;
  
  // 1. Find the item directly under the cursor or very close vertically
  const lineCandidates = analysis.items.filter(item => {
    const verticalMatch = y >= item.y - 2 && y <= item.y + item.height + 2;
    const horizontalMatch = x >= item.x - BUFFER && x <= item.x + item.width + BUFFER;
    return verticalMatch && horizontalMatch;
  });

  if (lineCandidates.length === 0) return [];

  // 2. Pick the closest one
  const target = lineCandidates[0];
  
  // 3. Find all items on the same "line" (y-proximity)
  return analysis.items.filter(item => 
    Math.abs(item.y - target.y) < 2 && 
    item.fontSize === target.fontSize
  ).sort((a, b) => a.x - b.x);
}
