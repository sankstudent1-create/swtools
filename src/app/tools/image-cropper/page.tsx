"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SuccessPopup from "@/components/SuccessPopup";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

const RATIO_PRESETS = [
  { label: "1:1", w: 1, h: 1 },
  { label: "4:5", w: 4, h: 5 },
  { label: "16:9", w: 16, h: 9 },
  { label: "9:16", w: 9, h: 16 },
  { label: "3:2", w: 3, h: 2 },
];

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

async function cropImage(
  file: File,
  ratioW: number,
  ratioH: number,
  outputWidth: number,
  outputFormat: OutputFormat,
  quality: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const targetRatio = ratioW / ratioH;
  const sourceRatio = bitmap.width / bitmap.height;

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

  const outputHeight = Math.max(60, Math.round(outputWidth / targetRatio));
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable.");

  context.drawImage(bitmap, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to crop image."));
      else resolve(blob);
    }, outputFormat, outputFormat === "image/png" ? undefined : quality / 100);
  });
}

export default function ImageCropperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [ratioW, setRatioW] = useState(1);
  const [ratioH, setRatioH] = useState(1);
  const [outputWidth, setOutputWidth] = useState(1080);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [previewUrl, outputUrl]);

  const ratioLabel = useMemo(() => `${ratioW}:${ratioH}`, [ratioW, ratioH]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setShowSuccess(false);
    setFile(selected);
    if (!selected) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function onCrop() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await cropImage(file, ratioW, ratioH, outputWidth, outputFormat, quality);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const out = new File([blob], `${file.name.split(".")[0]}-crop-${ratioW}x${ratioH}.${extension}`, { type: outputFormat });
      const url = URL.createObjectURL(out);
      setOutputUrl(url);
      setOutputName(out.name);
      setShowSuccess(true);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Failed to crop image.");
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
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100"><ArrowLeftIcon className="h-4 w-4" /> Back to Tools</Link>
          <h1 className="text-4xl font-bold">Image Cropper</h1>
          <p className="mt-2 text-foreground/75">Center-crop images to common aspect ratios with export size and format controls.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          <div className="ui-modal-shell p-6 space-y-4">
            <label className="block">
              <div className="ui-upload-dropzone p-8 text-center cursor-pointer" onDragOver={(event) => event.preventDefault()}>
                <p className="text-sm font-medium">Upload image</p>
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </div>
            </label>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Ratio Presets</p>
              <div className="flex flex-wrap gap-2">
                {RATIO_PRESETS.map((preset) => (
                  <button key={preset.label} className="ui-btn-secondary" onClick={() => {
                    setRatioW(preset.w);
                    setRatioH(preset.h);
                  }}>{preset.label}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <input className="ui-input" type="number" min={1} value={ratioW} onChange={(event) => setRatioW(Number(event.target.value) || 1)} />
              <input className="ui-input" type="number" min={1} value={ratioH} onChange={(event) => setRatioH(Number(event.target.value) || 1)} />
              <input className="ui-input" type="number" min={120} value={outputWidth} onChange={(event) => setOutputWidth(Number(event.target.value) || 120)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select className="ui-input" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WEBP</option>
              </select>
              <div className="ui-field">
                <span className="ui-label">Quality ({quality}%)</span>
                <input type="range" min={20} max={100} value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="ui-btn-primary w-full" onClick={onCrop} disabled={!file || isProcessing}>{isProcessing ? "Cropping..." : `Crop to ${ratioLabel}`}</button>
          </div>

          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            {!previewUrl && !outputUrl && <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">No image yet</div>}
            {previewUrl && <img src={previewUrl} alt="Original" className="mb-4 max-h-52 w-full rounded-lg border border-white/10 object-contain" />}
            {outputUrl && (
              <div>
                <img src={outputUrl} alt="Cropped" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Crop Completed"
        message="Your cropped image is ready to download."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Cropped Image"
      />
    </main>
  );
}
