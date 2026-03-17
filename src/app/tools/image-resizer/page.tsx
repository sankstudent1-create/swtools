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
type FitMode = "cover" | "contain" | "stretch";

const SIZE_PRESETS = [
  { label: "Passport", width: 300, height: 400 },
  { label: "HD", width: 1280, height: 720 },
  { label: "Square", width: 1080, height: 1080 },
  { label: "Story", width: 1080, height: 1920 },
];

async function getImageSize(file: File): Promise<{ width: number; height: number }> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image dimensions."));
    };
    image.src = url;
  });
}

async function processImage(
  sourceFile: File,
  targetWidth: number,
  targetHeight: number,
  fitMode: FitMode,
  outputFormat: OutputFormat,
  quality: number,
  background: string
): Promise<Blob> {
  const bitmap = await createImageBitmap(sourceFile);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas is unavailable.");

  context.fillStyle = background;
  context.fillRect(0, 0, targetWidth, targetHeight);

  if (fitMode === "stretch") {
    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  } else {
    const sourceRatio = bitmap.width / bitmap.height;
    const targetRatio = targetWidth / targetHeight;

    if (fitMode === "cover") {
      let sx = 0;
      let sy = 0;
      let sWidth = bitmap.width;
      let sHeight = bitmap.height;

      if (sourceRatio > targetRatio) {
        sWidth = bitmap.height * targetRatio;
        sx = (bitmap.width - sWidth) / 2;
      } else {
        sHeight = bitmap.width / targetRatio;
        sy = (bitmap.height - sHeight) / 2;
      }

      context.drawImage(bitmap, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
    } else {
      const scale = Math.min(targetWidth / bitmap.width, targetHeight / bitmap.height);
      const drawWidth = bitmap.width * scale;
      const drawHeight = bitmap.height * scale;
      const dx = (targetWidth - drawWidth) / 2;
      const dy = (targetHeight - drawHeight) / 2;
      context.drawImage(bitmap, dx, dy, drawWidth, drawHeight);
    }
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to convert output."));
        else resolve(blob);
      },
      outputFormat,
      outputFormat === "image/png" ? undefined : quality / 100
    );
  });
}

export default function ImageResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [fitMode, setFitMode] = useState<FitMode>("cover");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState("#0b1018");
  const [sourceSize, setSourceSize] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [previewUrl, outputUrl]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setShowSuccess(false);
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (!selected) {
      setPreviewUrl(null);
      setSourceSize(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(selected));
    setSourceSize(await getImageSize(selected));
  }

  async function onResize() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }
    if (width < 32 || height < 32) {
      setError("Width and height must be at least 32 px.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await processImage(file, width, height, fitMode, outputFormat, quality, background);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const outputFile = new File([blob], `${file.name.split(".")[0]}-${width}x${height}.${extension}`, { type: outputFormat });
      const url = URL.createObjectURL(outputFile);
      setOutputUrl(url);
      setOutputName(outputFile.name);
      setShowSuccess(true);
    } catch (processError) {
      setError(processError instanceof Error ? processError.message : "Failed to resize image.");
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/10 via-brand-sky/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">Image Resizer</h1>
          <p className="mt-2 text-foreground/75">Resize, reframe, and export images with fit modes, quality control, and format selection.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          <div className="ui-modal-shell p-6">
            <div className="space-y-4">
              <label className="block">
                <div className="ui-upload-dropzone p-8 text-center cursor-pointer" onDragOver={(event) => event.preventDefault()}>
                  <p className="text-sm font-medium">Upload image</p>
                  <p className="text-xs text-foreground/65">JPG, PNG, WEBP</p>
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </div>
              </label>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                  {SIZE_PRESETS.map((preset) => (
                    <button key={preset.label} className="ui-btn-secondary" onClick={() => {
                      setWidth(preset.width);
                      setHeight(preset.height);
                    }}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Width (px)</span>
                  <input className="ui-input" type="number" min={32} value={width} onChange={(event) => setWidth(Number(event.target.value) || 0)} />
                </label>
                <label className="ui-field">
                  <span className="ui-label">Height (px)</span>
                  <input className="ui-input" type="number" min={32} value={height} onChange={(event) => setHeight(Number(event.target.value) || 0)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Fit Mode</span>
                  <select className="ui-input" value={fitMode} onChange={(event) => setFitMode(event.target.value as FitMode)}>
                    <option value="cover">Cover Crop</option>
                    <option value="contain">Contain with Background</option>
                    <option value="stretch">Stretch to Fit</option>
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

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Lossy Quality ({quality})</span>
                  <input type="range" min={40} max={100} value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
                </label>
                <label className="ui-field">
                  <span className="ui-label">Background</span>
                  <input className="ui-input h-[42px] p-1.5" type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
                </label>
              </div>

              {sourceSize && <p className="text-xs text-foreground/65">Source: {sourceSize.width}×{sourceSize.height} px</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onResize} disabled={!file || isProcessing}>
                {isProcessing ? "Resizing..." : "Resize Image"}
              </button>
            </div>
          </div>

          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            {!previewUrl && !outputUrl && <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">No image yet</div>}
            {previewUrl && (
              <div className="mb-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Original</p>
                <img src={previewUrl} alt="Original" className="max-h-56 w-full rounded-lg border border-white/10 object-contain" />
              </div>
            )}
            {outputUrl && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Resized Output</p>
                <img src={outputUrl} alt="Output" className="max-h-56 w-full rounded-lg border border-white/10 object-contain" />
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Resize Completed"
        message="Your image has been resized and exported with the selected advanced settings."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Image"
      />
    </main>
  );
}
