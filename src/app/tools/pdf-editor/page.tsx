'use client';
import React, { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Rnd } from 'react-rnd';

// Essential CSS for react-pdf
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ElementType = 'text' | 'rect';

interface PDFElement {
  id: string;
  pageIndex: number;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fill?: string;
}

export default function PdfEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [elements, setElements] = useState<PDFElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Settings
  const [activeTool, setActiveTool] = useState<ElementType | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [color, setColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Helvetica');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addElement = (pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newEl: PDFElement = {
      id: Math.random().toString(36).substring(7),
      pageIndex,
      type: activeTool,
      x,
      y,
      width: activeTool === 'rect' ? 100 : 150,
      height: activeTool === 'rect' ? 40 : 40,
      text: activeTool === 'text' ? 'Double click to edit' : '',
      fontFamily,
      fontSize,
      color,
      fill: activeTool === 'rect' ? '#ffffff' : 'transparent',
    };
    
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
    setActiveTool(null); // reset tool after placing
  };

  const updateElement = (id: string, partial: Partial<PDFElement>) => {
    setElements(els => els.map(el => el.id === id ? { ...el, ...partial } : el));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedId) {
        // Prevent deletion if currently typing in an input
        if (document.activeElement?.tagName.toLowerCase() !== 'textarea') {
           setElements(els => els.filter(el => el.id !== selectedId));
        }
      }
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };

  const handleExport = async () => {
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      
      const pages = pdfDoc.getPages();

      for (const el of elements) {
        const page = pages[el.pageIndex];
        const { height: pageHeight } = page.getSize();
        
        // Convert screen coordinates to PDF points
        // Assuming the react-pdf renders at scale={1} which usually maps 1 CSS px = 1 PDF point for default resolution
        // The PDF coordinate system has (0,0) at the bottom left!
        const pdfX = el.x;
        const pdfY = pageHeight - el.y - (el.height); // Bottom left of bounding box
        
        if (el.type === 'rect') {
           const fillColor = el.fill === '#ffffff' ? rgb(1,1,1) : rgb(0,0,0); // simplify
           page.drawRectangle({
             x: pdfX,
             y: pdfY,
             width: el.width,
             height: el.height,
             color: fillColor,
           });
        } else if (el.type === 'text' && el.text) {
           const font = el.fontFamily === 'TimesRoman' ? timesRomanFont : helveticaFont;
           const rgbC = hexToRgb(el.color || '#000000');
           page.drawText(el.text, {
             x: pdfX,
             y: pdfY + el.height - (el.fontSize || 14), // Approx baseline offset
             size: el.fontSize,
             font: font,
             color: rgb(rgbC.r, rgbC.g, rgbC.b),
           });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `edited_${file.name}`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Error exporting PDF. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8" onKeyDown={handleKeyDown} tabIndex={0}>
      <Head>
        <title>Pro PDF Editor - SWTools</title>
      </Head>
      
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 flex flex-col" style={{ minHeight: '80vh' }}>
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-100 bg-white flex justify-between items-center z-20">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600" style={{ fontFamily: 'var(--font-outfit)' }}>
              Pro PDF Editor
            </h1>
            <p className="text-sm text-gray-500">Edit, Annotate, and Whiteout seamlessly</p>
          </div>
          <div className="flex gap-4 items-center">
            {file && <span className="text-sm text-gray-500 font-medium">{file.name}</span>}
            <button onClick={handleExport} disabled={!file} className="px-6 py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-md disabled:opacity-50">
              Export PDF
            </button>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex pb-4 bg-gray-50 h-full overflow-hidden">
          {!file ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-24 h-24 mb-6 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-4xl shadow-inner">📄</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Upload a PDF to start editing</h2>
              <p className="text-gray-500 mb-8 max-w-md text-center">Type directly over your PDF or whiteout existing text invisibly.</p>
              <label className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold cursor-pointer hover:bg-orange-600 shadow-lg transition-transform transform hover:-translate-y-1">
                Select PDF File
                <input type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
              </label>
            </div>
          ) : (
            <div className="flex-1 flex relative h-full">
              {/* Toolbar */}
              <div className="w-16 bg-white border-r border-gray-100 flex flex-col items-center py-4 gap-4 z-10 shadow-sm shrink-0">
                <button 
                  onClick={() => setActiveTool('text')}
                  className={`w-10 h-10 rounded text-xl flex items-center justify-center transition-colors ${activeTool === 'text' ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500' : 'hover:bg-gray-100 text-gray-600'}`} 
                  title="Add Text">T</button>
                <button 
                  onClick={() => setActiveTool('rect')}
                  className={`w-10 h-10 rounded text-xl flex items-center justify-center transition-colors ${activeTool === 'rect' ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-500' : 'hover:bg-gray-100 text-gray-600'}`} 
                  title="Whiteout Box">🧽</button>
              </div>
              
              {/* Canvas Area */}
              <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-8 bg-gray-200/50">
                <Document
                  file={file}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  className="flex flex-col gap-8"
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index}`} className="relative shadow-lg ring-1 ring-gray-900/5 bg-white mx-auto">
                      <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} scale={1} />
                      
                      {/* Interaction Overlay */}
                      <div 
                        className={`absolute inset-0 z-10 ${activeTool ? 'cursor-crosshair' : ''}`}
                        onClick={(e) => addElement(index, e)}
                      >
                        {elements.filter(e => e.pageIndex === index).map(el => (
                          <Rnd
                            key={el.id}
                            position={{ x: el.x, y: el.y }}
                            size={{ width: el.width, height: el.height }}
                            onDragStop={(e, d) => updateElement(el.id, { x: d.x, y: d.y })}
                            onResizeStop={(e, direction, ref, delta, position) => {
                              updateElement(el.id, {
                                width: parseInt(ref.style.width),
                                height: parseInt(ref.style.height),
                                ...position,
                              });
                            }}
                            className={`border ${selectedId === el.id ? 'border-blue-500 border-dashed bg-blue-500/10' : 'border-transparent'} group`}
                            onClick={(e: any) => { e.stopPropagation(); setSelectedId(el.id); }}
                          >
                            {el.type === 'rect' && (
                              <div className="w-full h-full" style={{ backgroundColor: el.fill }}></div>
                            )}
                            {el.type === 'text' && (
                              <textarea
                                value={el.text}
                                onChange={(e) => updateElement(el.id, { text: e.target.value })}
                                className="w-full h-full bg-transparent resize-none outline-none leading-tight"
                                style={{
                                  fontFamily: el.fontFamily,
                                  fontSize: `${el.fontSize}px`,
                                  color: el.color
                                }}
                              />
                            )}
                            
                            {/* Delete button (visible on hover) */}
                            {selectedId === el.id && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setElements(els => els.filter(x => x.id !== el.id)); }}
                                className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            )}
                          </Rnd>
                        ))}
                      </div>
                    </div>
                  ))}
                </Document>
              </div>

              {/* Properties Panel */}
              <div className="w-64 bg-white border-l border-gray-100 p-6 shadow-sm shrink-0 overflow-y-auto">
                 <h3 className="font-bold text-gray-800 mb-6 pb-2 border-b">Properties</h3>
                 
                 {selectedId ? (() => {
                   const el = elements.find(e => e.id === selectedId);
                   if (!el) return null;
                   return (
                     <div className="space-y-6">
                       {el.type === 'text' && (
                         <>
                           <div>
                             <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">FONT FAMILY</label>
                             <select 
                               className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                               value={el.fontFamily}
                               onChange={(e) => updateElement(el.id, { fontFamily: e.target.value })}
                             >
                               <option value="Helvetica">Arial / Helvetica</option>
                               <option value="TimesRoman">Times New Roman</option>
                             </select>
                           </div>
                           
                           <div>
                             <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">FONT SIZE (px)</label>
                             <input 
                               type="number" 
                               className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                               value={el.fontSize}
                               onChange={(e) => updateElement(el.id, { fontSize: parseInt(e.target.value) || 14 })}
                             />
                           </div>

                           <div>
                             <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">TEXT COLOR</label>
                             <div className="flex gap-2">
                               {['#000000', '#2563eb', '#dc2626'].map(c => (
                                 <button
                                   key={c}
                                   onClick={() => updateElement(el.id, { color: c })}
                                   className={`w-8 h-8 rounded-full shadow-sm ring-offset-2 ${el.color === c ? 'ring-2 ring-gray-400' : ''}`}
                                   style={{ backgroundColor: c }}
                                 />
                               ))}
                             </div>
                           </div>
                         </>
                       )}
                       
                       {el.type === 'rect' && (
                         <div>
                           <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wider">FILL COLOR</label>
                           <div className="flex gap-2">
                             <button
                               onClick={() => updateElement(el.id, { fill: '#ffffff' })}
                               className={`w-8 h-8 rounded-full border shadow-sm ring-offset-2 bg-white ${el.fill === '#ffffff' ? 'ring-2 ring-gray-400' : ''}`}
                               title="Whiteout"
                             />
                             <button
                               onClick={() => updateElement(el.id, { fill: '#000000' })}
                               className={`w-8 h-8 rounded-full border shadow-sm ring-offset-2 bg-black ${el.fill === '#000000' ? 'ring-2 ring-gray-400' : ''}`}
                               title="Blackout"
                             />
                           </div>
                         </div>
                       )}

                       <button 
                         onClick={() => setElements(els => els.filter(x => x.id !== selectedId))}
                         className="w-full mt-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                       >
                         Delete Selected
                       </button>
                     </div>
                   );
                 })() : (
                   <p className="text-sm text-gray-400 italic text-center mt-8">Select an element on the canvas to see its properties.</p>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
