"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

async function compressImage(
  sourceFile: File,
  outputFormat: OutputFormat,
  qualityPercent: number,
  targetKb: number,
  resizePercent: number,
  maxWidth: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(sourceFile);
  const scaledWidth = Math.max(1, Math.round(bitmap.width * (resizePercent / 100)));
  const scaledHeight = Math.max(1, Math.round(bitmap.height * (resizePercent / 100)));
  const finalScale = maxWidth > 0 && scaledWidth > maxWidth ? maxWidth / scaledWidth : 1;
  const width = Math.max(1, Math.round(scaledWidth * finalScale));
  const height = Math.max(1, Math.round(scaledHeight * finalScale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas unavailable.");
  context.drawImage(bitmap, 0, 0, width, height);

  const canvasToBlob = (quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Compression failed."));
          else resolve(blob);
        },
        outputFormat,
        outputFormat === "image/png" ? undefined : quality
      );
    });

  let quality = Math.max(0.1, Math.min(0.95, qualityPercent / 100));
  let result = await canvasToBlob(quality);

  while (targetKb > 0 && result.size / 1024 > targetKb && quality > 0.2 && outputFormat !== "image/png") {
    quality -= 0.06;
    result = await canvasToBlob(quality);
  }

  return result;
}

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [quality, setQuality] = useState(72);
  const [targetKb, setTargetKb] = useState(0);
  const [resizePercent, setResizePercent] = useState(100);
  const [maxWidth, setMaxWidth] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [beforeKb, setBeforeKb] = useState(0);
  const [afterKb, setAfterKb] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [previewUrl, outputUrl]);

  const savingText = useMemo(() => {
    if (!beforeKb || !afterKb || afterKb >= beforeKb) return "No size reduction yet";
    const saved = (((beforeKb - afterKb) / beforeKb) * 100).toFixed(1);
    return `${saved}% smaller`;
  }, [beforeKb, afterKb]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setShowSuccess(false);
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    if (!selected) {
      setPreviewUrl(null);
      setBeforeKb(0);
      return;
    }
    setPreviewUrl(URL.createObjectURL(selected));
    setBeforeKb(Number((selected.size / 1024).toFixed(2)));
  }

  async function onCompress() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const blob = await compressImage(file, outputFormat, quality, targetKb, resizePercent, maxWidth);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const outputFile = new File([blob], `${file.name.split(".")[0]}-compressed.${extension}`, { type: outputFormat });
      const url = URL.createObjectURL(outputFile);
      setOutputUrl(url);
      setOutputName(outputFile.name);
      setAfterKb(Number((outputFile.size / 1024).toFixed(2)));
      setShowSuccess(true);
    } catch (compressError) {
      setError(compressError instanceof Error ? compressError.message : "Compression failed.");
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-pink/10 via-brand-sky/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">Image Compressor</h1>
          <p className="mt-2 text-foreground/75">Reduce file size with format conversion, scale controls, and optional size targeting.</p>
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

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Output Format</span>
                  <select className="ui-input" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/webp">WEBP</option>
                    <option value="image/png">PNG</option>
                  </select>
                </label>
                <label className="ui-field">
                  <span className="ui-label">Target size in KB</span>
                  <input className="ui-input" type="number" min={0} value={targetKb} onChange={(event) => setTargetKb(Number(event.target.value) || 0)} />
                </label>
              </div>

              <div className="ui-field">
                <span className="ui-label">Quality ({quality}%)</span>
                <input type="range" min={20} max={95} value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Resize Percent</span>
                  <input className="ui-input" type="number" min={10} max={100} value={resizePercent} onChange={(event) => setResizePercent(Number(event.target.value) || 0)} />
                </label>
                <label className="ui-field">
                  <span className="ui-label">Max Width</span>
                  <input className="ui-input" type="number" min={0} value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value) || 0)} />
                </label>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onCompress} disabled={!file || isProcessing}>
                {isProcessing ? "Compressing..." : "Compress Image"}
              </button>
            </div>
          </div>

          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview & Stats</h2>
            {!previewUrl && !outputUrl && <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">No image yet</div>}
            {previewUrl && (
              <div className="mb-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Original ({beforeKb} KB)</p>
                <img src={previewUrl} alt="Original" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
              </div>
            )}
            {outputUrl && (
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Compressed ({afterKb} KB)</p>
                <img src={outputUrl} alt="Compressed" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
                <p className="mt-2 text-sm text-foreground/75">{savingText}</p>
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Compression Completed"
        message="Your compressed image is ready with the selected output settings."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Compressed Image"
      />
    </main>
  );
}
