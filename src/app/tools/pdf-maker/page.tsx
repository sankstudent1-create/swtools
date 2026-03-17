"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import SuccessPopup from "@/components/SuccessPopup";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

type PreviewFile = { file: File; url: string };
type PageFormat = "a4" | "letter" | "legal";
type Orientation = "portrait" | "landscape";
type FitMode = "contain" | "cover";
type PdfSpeed = "FAST" | "MEDIUM" | "SLOW";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export default function PdfMakerPage() {
  const [items, setItems] = useState<PreviewFile[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("swtools-document.pdf");
  const [pageFormat, setPageFormat] = useState<PageFormat>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState(30);
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [compression, setCompression] = useState<PdfSpeed>("FAST");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      for (const item of items) {
        URL.revokeObjectURL(item.url);
      }
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [items, pdfUrl]);

  const estimatedPages = useMemo(() => items.length, [items]);

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setShowSuccess(false);

    const files = Array.from(event.target.files ?? []);
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setItems((prev) => [...prev, ...next]);
  }

  function removeImage(index: number) {
    setItems((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((_, idx) => idx !== index);
    });
  }

  async function onGeneratePdf() {
    if (!items.length) {
      setError("Upload at least one image.");
      return;
    }
    if (margin < 0 || margin > 120) {
      setError("Use a margin between 0 and 120 pt.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const doc = new jsPDF({ orientation, unit: "pt", format: pageFormat });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let index = 0; index < items.length; index++) {
        const imageDataUrl = await readAsDataUrl(items[index].file);
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const htmlImage = new Image();
          htmlImage.onload = () => resolve(htmlImage);
          htmlImage.onerror = () => reject(new Error("Failed to load image for PDF."));
          htmlImage.src = imageDataUrl;
        });

        if (index > 0) doc.addPage();

        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;
        const ratio = fitMode === "cover"
          ? Math.max(availableWidth / image.width, availableHeight / image.height)
          : Math.min(availableWidth / image.width, availableHeight / image.height);
        const drawWidth = Math.max(1, image.width * ratio);
        const drawHeight = Math.max(1, image.height * ratio);
        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        doc.addImage(imageDataUrl, "JPEG", x, y, drawWidth, drawHeight, undefined, compression);
      }

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfName(pdfName.endsWith(".pdf") ? pdfName : `${pdfName}.pdf`);
      setShowSuccess(true);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Failed to create PDF.");
    } finally {
      setIsProcessing(false);
    }
  }

  function onDownload() {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfName;
    link.click();
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/10 via-brand-pink/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">PDF Maker</h1>
          <p className="mt-2 text-foreground/75">Merge one or more images into a clean downloadable PDF.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          <div className="ui-modal-shell p-6">
            <div className="space-y-4">
              <label className="block">
                <div className="ui-upload-dropzone p-8 text-center cursor-pointer" onDragOver={(event) => event.preventDefault()}>
                  <p className="text-sm font-medium">Upload images for PDF</p>
                  <p className="text-xs text-foreground/65">JPG, PNG, WEBP • Multiple files supported</p>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Page Size</span>
                  <select className="ui-input" value={pageFormat} onChange={(event) => setPageFormat(event.target.value as PageFormat)}>
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                  </select>
                </label>
                <label className="ui-field">
                  <span className="ui-label">Orientation</span>
                  <select className="ui-input" value={orientation} onChange={(event) => setOrientation(event.target.value as Orientation)}>
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Fit Mode</span>
                  <select className="ui-input" value={fitMode} onChange={(event) => setFitMode(event.target.value as FitMode)}>
                    <option value="contain">Contain</option>
                    <option value="cover">Cover</option>
                  </select>
                </label>
                <label className="ui-field">
                  <span className="ui-label">Image Compression</span>
                  <select className="ui-input" value={compression} onChange={(event) => setCompression(event.target.value as PdfSpeed)}>
                    <option value="FAST">Fast</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="SLOW">High Quality</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-[140px_1fr] gap-3">
                <label className="ui-field">
                  <span className="ui-label">Margin</span>
                  <input className="ui-input" type="number" min={0} max={120} value={margin} onChange={(event) => setMargin(Number(event.target.value) || 0)} />
                </label>
                <label className="ui-field">
                  <span className="ui-label">PDF Name</span>
                  <input className="ui-input" type="text" value={pdfName} onChange={(event) => setPdfName(event.target.value || "swtools-document.pdf")} />
                </label>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onGeneratePdf} disabled={!items.length || isProcessing}>
                {isProcessing ? "Generating PDF..." : "Generate PDF"}
              </button>
            </div>
          </div>

          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Image Order ({items.length})</h2>
            <p className="mb-3 text-sm text-foreground/65">Estimated pages: {estimatedPages} • {pageFormat.toUpperCase()} • {orientation}</p>
            {!items.length && <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">No images uploaded yet</div>}
            {items.length > 0 && (
              <div className="grid max-h-72 grid-cols-2 gap-3 overflow-auto pr-1">
                {items.map((item, index) => (
                  <div key={`${item.file.name}-${index}`} className="relative">
                    <img src={item.url} alt={item.file.name} className="h-28 w-full rounded-lg border border-white/10 object-cover" />
                    <button className="absolute right-1 top-1 rounded bg-black/70 px-2 py-0.5 text-xs" onClick={() => removeImage(index)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {pdfUrl && <button className="ui-btn-secondary mt-4 w-full" onClick={onDownload}>Download {pdfName}</button>}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(pdfUrl)}
        title="PDF Generated"
        message="Your PDF is ready with the selected page layout and image placement settings."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download PDF"
      />
    </main>
  );
}
