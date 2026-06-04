'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import { Plus } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import type { PDFElement, ToolType, PageTransform, WatermarkConfig, PathPoint } from '@/components/pdf-editor/types';
import { generateId } from '@/components/pdf-editor/types';
import { useHistory } from '@/components/pdf-editor/useHistory';
import { analyzePage, findTextAt, PageAnalysis } from '@/components/pdf-editor/analysisEngine';
import Toolbar from '@/components/pdf-editor/Toolbar';
import PropertiesPanel from '@/components/pdf-editor/PropertiesPanel';
import PageThumbnails from '@/components/pdf-editor/PageThumbnails';
import SignatureModal from '@/components/pdf-editor/SignatureModal';
import WatermarkModal from '@/components/pdf-editor/WatermarkModal';
import TopBar from '@/components/pdf-editor/TopBar';
import ZoomControls from '@/components/pdf-editor/ZoomControls';
import DrawingCanvas from '@/components/pdf-editor/DrawingCanvas';
import PageManager from '@/components/pdf-editor/PageManager';
import { exportPdf } from '@/components/pdf-editor/exportEngine';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Simple IntersectionObserver hook for virtualized page loading
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [options]);

  return { ref, inView };
}

// Lazy Page wrapper component
interface LazyPageProps {
  idx: number;
  zoom: number;
  transform: PageTransform;
  pageSize: { width: number; height: number } | undefined;
  elements: PDFElement[];
  selectedId: string | null;
  activeTool: ToolType;
  drawColor: string;
  drawWidth: number;
  onLoadSuccess: (pageIndex: number, page: any) => void;
  onPageInteraction: (pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => void;
  onDrawEnd: (pageIndex: number, points: PathPoint[]) => void;
  onSelectElement: (id: string) => void;
  updateElement: (id: string, partial: Partial<PDFElement>) => void;
  renderElement: (el: PDFElement) => React.ReactNode;
}

function LazyPageRenderer({
  idx,
  zoom,
  transform,
  pageSize,
  elements,
  selectedId,
  activeTool,
  drawColor,
  drawWidth,
  onLoadSuccess,
  onPageInteraction,
  onDrawEnd,
  onSelectElement,
  updateElement,
  renderElement,
}: LazyPageProps) {
  const { ref, inView } = useInView({
    rootMargin: '400px 0px 400px 0px', // Pre-render when within 400px of view
  });

  const isHorizontal = transform.rotation === 90 || transform.rotation === 270;
  const w = pageSize ? (isHorizontal ? pageSize.height : pageSize.width) * zoom : 595 * zoom;
  const h = pageSize ? (isHorizontal ? pageSize.width : pageSize.height) * zoom : 842 * zoom;

  if (!inView) {
    return (
      <div 
        ref={ref} 
        style={{ width: `${w}px`, height: `${h}px` }} 
        className="relative shadow-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center rounded-sm"
      >
        <span className="text-white/20 text-sm font-medium">Page {idx + 1}</span>
        <span className="text-white/10 text-xs mt-1">Scrolling into view...</span>
      </div>
    );
  }

  return (
    <div 
      ref={ref}
      className="relative shadow-2xl bg-white" 
      onClick={e => onPageInteraction(idx, e)}
    >
      <Page 
        pageNumber={idx + 1} 
        scale={zoom} 
        rotate={transform.rotation} 
        onLoadSuccess={p => onLoadSuccess(idx, p)}
        customTextRenderer={(textItem) => {
          // Normalize string and check if overridden
          const normalize = (s: string) => s.replace(/\s+/g, '').trim();
          const isHidden = elements.some(el => {
            if (el.pageIndex !== idx || !el.originalText) return false;
            const normOriginal = normalize(el.originalText);
            const normCurrent = normalize(textItem.str || '');
            return normOriginal.includes(normCurrent) || normCurrent.includes(normOriginal);
          });
          return isHidden ? '' : textItem.str;
        }}
      />
      
      <DrawingCanvas 
        isActive={activeTool === 'drawing'} 
        color={drawColor} 
        width={drawWidth} 
        onDrawEnd={pts => onDrawEnd(idx, pts)} 
        pageWidth={pageSize?.width || 0} 
        pageHeight={pageSize?.height || 0}
      />

      <div className="absolute inset-0 pointer-events-none z-20">
        {elements.filter(e => e.pageIndex === idx).map(el => (
          <Rnd
            key={el.id} 
            position={{ x: el.x * zoom, y: el.y * zoom }} 
            size={{ width: el.width * zoom, height: el.height * zoom }}
            scale={zoom}
            disableDragging={!!el.originalSpanId}
            enableResizing={!el.originalSpanId}
            onDragStop={(_, d) => updateElement(el.id, { x: d.x / zoom, y: d.y / zoom })}
            onResizeStop={(_, __, r, ___, pos) => updateElement(el.id, { width: parseInt(r.style.width) / zoom, height: parseInt(r.style.height) / zoom, x: pos.x / zoom, y: pos.y / zoom })}
            className={`!absolute pointer-events-auto ${selectedId === el.id ? (el.originalSpanId ? 'outline-1 outline-dashed outline-[var(--brand-sky)]/50 z-30' : 'ring-2 ring-[var(--brand-sky)] shadow-2xl z-30') : 'z-20'}`}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSelectElement(el.id); }}
          >
            {renderElement(el)}
          </Rnd>
        ))}
      </div>
    </div>
  );
}

interface InteractiveEditorProps {
  file: File;
  onClose: () => void;
}

export default function InteractiveEditor({ file, onClose }: InteractiveEditorProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageSizes, setPageSizes] = useState<Record<number, { width: number; height: number }>>({});
  const [pageAnalysis, setPageAnalysis] = useState<Record<number, PageAnalysis>>({});
  const [isExporting, setIsExporting] = useState(false);

  const history = useHistory([]);
  const elements = history.elements;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [zoom, setZoom] = useState(1.2);
  const [currentPage, setCurrentPage] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [pageTransforms, setPageTransforms] = useState<Record<number, PageTransform>>({});
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [watermark, setWatermark] = useState<WatermarkConfig | null>(null);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);

  const [drawColor, setDrawColor] = useState('#000000');
  const [drawWidth, setDrawWidth] = useState(2);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedElement = useMemo(() =>
    selectedId ? elements.find(e => e.id === selectedId) || null : null,
    [selectedId, elements]
  );

  const onPageLoadSuccess = async (pageIndex: number, page: any) => {
    setPageSizes(prev => ({
      ...prev,
      [pageIndex]: { width: page.view[2], height: page.view[3] },
    }));

    try {
      const analysis = await analyzePage(page);
      setPageAnalysis(prev => ({ ...prev, [pageIndex]: analysis }));
    } catch (err) {
      console.error('Analysis failed', err);
    }

    setPageOrder(prev => {
      if (prev.length > 0) return prev;
      return Array.from({ length: numPages }, (_, i) => i);
    });
  };

  const addElement = useCallback((el: PDFElement) => {
    history.push([...elements, el]);
    setSelectedId(el.id);
    setActiveTool('select');
  }, [elements, history]);

  const updateElement = useCallback((id: string, partial: Partial<PDFElement>) => {
    history.push(elements.map(el => el.id === id ? { ...el, ...partial } : el));
  }, [elements, history]);

  const removeElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (el?.originalSpanId) {
      const span = document.querySelector(`span[data-hidden-id="${el.originalSpanId}"]`) as HTMLElement;
      if (span) {
        span.style.color = '';
        span.removeAttribute('data-hidden-id');
      }
    }
    history.push(elements.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [elements, history, selectedId]);

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const newEl: PDFElement = { ...el, id: generateId(), x: el.x + 20, y: el.y + 20, originalSpanId: undefined };
    history.push([...elements, newEl]);
    setSelectedId(newEl.id);
  }, [elements, history]);

  const handlePageReorder = useCallback((from: number, to: number) => {
    if (to < 0 || to >= pageOrder.length) return;
    const newOrder = [...pageOrder];
    const [removed] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, removed);
    setPageOrder(newOrder);
  }, [pageOrder]);

  const handlePageRotate = useCallback((idx: number) => {
    setPageTransforms(prev => {
      const existing = prev[idx] || { rotation: 0, deleted: false, order: idx };
      return { ...prev, [idx]: { ...existing, rotation: (existing.rotation + 90) % 360 } };
    });
  }, []);

  const handlePageDelete = useCallback((idx: number) => {
    setPageTransforms(prev => {
      const existing = prev[idx] || { rotation: 0, deleted: false, order: idx };
      return { ...prev, [idx]: { ...existing, deleted: !existing.deleted } };
    });
  }, []);

  const handlePageInteraction = useCallback((pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    const analysis = pageAnalysis[pageIndex];
    
    if (activeTool === 'select' && analysis) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / zoom;
      const clickY = (e.clientY - rect.top) / zoom;
      
      const group = findTextAt(analysis, clickX, clickY);
      
      if (group.length > 0) {
        e.stopPropagation();
        
        const combinedText = group.map(item => item.str).join('');
        const target = group[0];
        const lastItem = group[group.length - 1];
        
        const minX = Math.min(...group.map(i => i.x));
        const maxX = Math.max(...group.map(i => i.x + i.width));
        const minY = Math.min(...group.map(i => i.y));
        const maxY = Math.max(...group.map(i => i.y + i.height));

        const groupSpanId = `intel-${pageIndex}-${Math.round(minX)}-${Math.round(minY)}`;

        const newEl: PDFElement = {
          id: generateId(),
          pageIndex,
          type: 'text',
          x: minX,
          y: minY - 1.5,
          width: (maxX - minX) + 4,
          height: (maxY - minY),
          text: combinedText,
          fontFamily: target.isSerif ? 'TimesRoman' : target.isMono ? 'Courier' : 'Helvetica',
          fontSize: target.fontSize,
          fontWeight: target.isBold ? 'bold' : 'normal',
          color: '#000000', 
          lineHeight: 1,
          originalSpanId: groupSpanId,
          originalText: combinedText,
          opacity: 1,
          fill: 'transparent',
          textAlign: 'left',
        };

        addElement(newEl);
        return;
      }
    }

    if (activeTool === 'select') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const common = { id: generateId(), pageIndex, x, y, opacity: 1 };

    switch (activeTool) {
      case 'text': addElement({ ...common, type: 'text', width: 200, height: 40, text: 'New Text', fontFamily: 'Helvetica', fontSize: 14, color: '#000000', textAlign: 'left' }); break;
      case 'rect': addElement({ ...common, type: 'rect', width: 140, height: 50, fill: '#ffffff', strokeColor: '#000000', strokeWidth: 1 }); break;
      case 'circle': addElement({ ...common, type: 'circle', width: 80, height: 80, fill: 'transparent', strokeColor: '#2563eb', strokeWidth: 2 }); break;
      case 'line': addElement({ ...common, type: 'line', width: 150, height: 2, strokeColor: '#000000', strokeWidth: 2 }); break;
      case 'arrow': addElement({ ...common, type: 'arrow', width: 150, height: 60, strokeColor: '#000000', strokeWidth: 2 }); break;
      case 'highlight': addElement({ ...common, type: 'highlight', width: 200, height: 22, fill: '#facc15', opacity: 0.35 }); break;
      case 'image': imageInputRef.current?.click();
        break;
    }
  }, [activeTool, addElement, pageAnalysis, zoom]);

  const handleDrawEnd = useCallback((pageIndex: number, points: PathPoint[]) => {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    addElement({
      id: generateId(), pageIndex, type: 'drawing',
      x: minX, y: minY,
      width: Math.max(maxX - minX, 10), height: Math.max(maxY - minY, 10),
      points: points.map(p => ({ x: p.x - minX, y: p.y - minY })),
      strokeColor: drawColor, strokeWidth: drawWidth, opacity: 1,
    });
  }, [addElement, drawColor, drawWidth]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await exportPdf(file, elements, pageSizes, zoom, pageTransforms, watermark, pageOrder);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Edited_${file.name}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      alert('Export failed.');
    } finally {
      setIsExporting(false);
    }
  }, [file, elements, pageSizes, zoom, pageTransforms, watermark, pageOrder]);

  const renderElement = useCallback((el: PDFElement) => {
    const isSelected = selectedId === el.id;
    const style: React.CSSProperties = { opacity: el.opacity ?? 1 };

    switch (el.type) {
      case 'text':
        const isEmpty = !el.text || el.text.trim() === '';
        return (
          <textarea
            value={el.text || ''}
            onChange={e => updateElement(el.id, { text: e.target.value })}
            placeholder={isEmpty && isSelected ? "Type to replace or leave empty..." : ""}
            className={`w-full h-full bg-transparent resize-none border-none outline-none p-0 m-0 scrollbar-hide block ${isEmpty && isSelected ? 'placeholder:text-blue-400 placeholder:text-[10px]' : ''}`}
            spellCheck={false}
            autoFocus
            style={{
              fontFamily: el.fontFamily,
              fontSize: `${el.fontSize}px`,
              fontWeight: el.fontWeight,
              color: el.color,
              textAlign: el.textAlign,
              letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : 'normal',
              lineHeight: el.lineHeight || 1.2,
              backgroundColor: 'transparent',
            }}
          />
        );
      case 'drawing':
        if (!el.points) return null;
        const d = el.points.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(' ');
        return (
          <svg className="w-full h-full">
            <path d={d} fill="none" stroke={el.strokeColor} strokeWidth={el.strokeWidth} strokeLinecap="round" />
          </svg>
        );
      case 'rect': return <div className="w-full h-full" style={{ backgroundColor: el.fill, border: `${el.strokeWidth}px solid ${el.strokeColor}` }} />;
      case 'circle': return <div className="w-full h-full rounded-full" style={{ backgroundColor: el.fill, border: `${el.strokeWidth}px solid ${el.strokeColor}` }} />;
      default: return el.imageData ? <img src={el.imageData} className="w-full h-full object-contain" /> : null;
    }
  }, [selectedId, updateElement]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar 
        fileName={file.name} numPages={numPages} currentPage={currentPage} 
        onClose={onClose} onExport={handleExport} isExporting={isExporting} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Toolbar 
          activeTool={activeTool} onToolChange={setActiveTool} 
          canUndo={history.canUndo} canRedo={history.canRedo} onUndo={history.undo} onRedo={history.redo}
          onPageManager={() => setShowPageManager(true)} onWatermark={() => setShowWatermarkModal(true)} onSignature={() => setShowSignatureModal(true)}
        />

        {showThumbnails && (
          <PageThumbnails 
            file={file} numPages={numPages} currentPage={currentPage} 
            pageTransforms={pageTransforms} onPageClick={setCurrentPage}
            onRotatePage={handlePageRotate} onDeletePage={handlePageDelete}
          />
        )}

        <div className="flex-1 overflow-auto bg-[#131722] relative p-8">
          <div className="flex flex-col items-center gap-8">
            <Document file={file} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              {(pageOrder.length > 0 ? pageOrder : Array.from({ length: numPages }, (_, i) => i)).map((idx) => {
                const transform = pageTransforms[idx] || { rotation: 0, deleted: false };
                if (transform.deleted) return null;

                return (
                  <LazyPageRenderer 
                    key={idx}
                    idx={idx}
                    zoom={zoom}
                    transform={transform}
                    pageSize={pageSizes[idx]}
                    elements={elements}
                    selectedId={selectedId}
                    activeTool={activeTool}
                    drawColor={drawColor}
                    drawWidth={drawWidth}
                    onLoadSuccess={onPageLoadSuccess}
                    onPageInteraction={handlePageInteraction}
                    onDrawEnd={handleDrawEnd}
                    onSelectElement={setSelectedId}
                    updateElement={updateElement}
                    renderElement={renderElement}
                  />
                );
              })}
            </Document>
          </div>
        </div>

        <PropertiesPanel 
          element={selectedElement} onUpdate={updateElement} 
          onRemove={removeElement} onDuplicate={duplicateElement} 
        />
      </div>

      <ZoomControls zoom={zoom} onZoomIn={() => setZoom(z => z + 0.1)} onZoomOut={() => setZoom(z => z - 0.1)} onReset={() => setZoom(1.2)} />

      <SignatureModal isOpen={showSignatureModal} onClose={() => setShowSignatureModal(false)} onInsert={url => addElement({ id: generateId(), pageIndex: currentPage, type: 'signature', x: 100, y: 100, width: 200, height: 60, imageData: url, opacity: 1 })} />
      <WatermarkModal isOpen={showWatermarkModal} current={watermark} onApply={setWatermark} onClose={() => setShowWatermarkModal(false)} />
      <PageManager 
        isOpen={showPageManager} onClose={() => setShowPageManager(false)} file={file!} numPages={numPages} 
        pageTransforms={pageTransforms} onRotate={handlePageRotate} onDelete={handlePageDelete} onReorder={handlePageReorder}
      />
    </div>
  );
}
