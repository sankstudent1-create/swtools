"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import SuccessPopup from "@/components/SuccessPopup";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
type ScanMode = "bw" | "grayscale" | "clean";

async function scanImage(
  file: File,
  contrast: number,
  brightness: number,
  threshold: number,
  scanMode: ScanMode,
  invert: boolean,
  cleanup: number,
  outputFormat: OutputFormat
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) throw new Error("Canvas unavailable.");

  context.drawImage(bitmap, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let index = 0; index < data.length; index += 4) {
    let gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
    gray = contrastFactor * (gray - 128) + 128 + brightness;
    if (scanMode === "bw") {
      gray = gray > threshold ? 255 : 0;
    } else if (scanMode === "clean") {
      gray = gray > threshold ? 245 : Math.max(0, gray - cleanup);
    }

    if (invert) {
      gray = 255 - gray;
    }

    data[index] = gray;
    data[index + 1] = gray;
    data[index + 2] = gray;
  }

  context.putImageData(imageData, 0, 0);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to export scanned image."));
      else resolve(blob);
    }, outputFormat, outputFormat === "image/png" ? undefined : 0.92);
  });
}

export default function ImageScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [contrast, setContrast] = useState(40);
  const [brightness, setBrightness] = useState(12);
  const [threshold, setThreshold] = useState(145);
  const [scanMode, setScanMode] = useState<ScanMode>("bw");
  const [invert, setInvert] = useState(false);
  const [cleanup, setCleanup] = useState(18);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [previewUrl, outputUrl]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setShowSuccess(false);
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (!selected) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function onScan() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const blob = await scanImage(file, contrast, brightness, threshold, scanMode, invert, cleanup, outputFormat);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const outputFile = new File([blob], `${file.name.split(".")[0]}-scanned.${extension}`, { type: outputFormat });
      const url = URL.createObjectURL(outputFile);
      setOutputUrl(url);
      setOutputName(outputFile.name);
      setShowSuccess(true);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Failed to scan image.");
    } finally {
      setIsProcessing(false);
    }
  }

  function onDownload() {
    if (!outputUrl) return;
    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = outputName;
    link.click();
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-sky/10 via-brand-pink/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">Image Scanner</h1>
          <p className="mt-2 text-foreground/75">Turn photos into high-contrast black-and-white scan-style documents.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          <div className="ui-modal-shell p-6">
            <div className="space-y-4">
              <label className="block">
                <div className="ui-upload-dropzone p-8 text-center cursor-pointer" onDragOver={(event) => event.preventDefault()}>
                  <p className="text-sm font-medium">Upload document image</p>
                  <p className="text-xs text-foreground/65">JPG, PNG, WEBP</p>
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </div>
              </label>

              <div className="ui-field">
                <span className="ui-label">Contrast ({contrast})</span>
                <input type="range" min={-80} max={120} value={contrast} onChange={(event) => setContrast(Number(event.target.value))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Scan Mode</span>
                  <select className="ui-input" value={scanMode} onChange={(event) => setScanMode(event.target.value as ScanMode)}>
                    <option value="bw">Pure B/W</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="clean">Clean Document</option>
                  </select>
                </label>
                <label className="ui-field">
                  <span className="ui-label">Output Format</span>
                  <select className="ui-input" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WEBP</option>
                  </select>
                </label>
              </div>
              <div className="ui-field">
                <span className="ui-label">Brightness ({brightness})</span>
                <input type="range" min={-60} max={80} value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} />
              </div>
              <div className="ui-field">
                <span className="ui-label">Threshold ({threshold})</span>
                <input type="range" min={60} max={220} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
              </div>
              <div className="ui-field">
                <span className="ui-label">Cleanup ({cleanup})</span>
                <input type="range" min={0} max={80} value={cleanup} onChange={(event) => setCleanup(Number(event.target.value))} />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground/80">
                <input type="checkbox" checked={invert} onChange={(event) => setInvert(event.target.checked)} />
                Invert output colors
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onScan} disabled={!file || isProcessing}>
                {isProcessing ? "Scanning..." : "Create Scanned Output"}
              </button>
            </div>
          </div>

          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            {!previewUrl && !outputUrl && <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">No image yet</div>}
            {previewUrl && (
              <div className="mb-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Original</p>
                <img src={previewUrl} alt="Original" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
              </div>
            )}
            {outputUrl && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Scanned</p>
                <img src={outputUrl} alt="Scanned" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Scan Completed"
        message="Your document scan is ready with the selected cleanup and export settings."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Scanned Image"
      />
    </main>
  );
}
