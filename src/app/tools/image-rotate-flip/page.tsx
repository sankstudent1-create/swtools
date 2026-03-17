"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import SuccessPopup from "@/components/SuccessPopup";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

async function transformImage(file: File, rotation: number, flipX: boolean, flipY: boolean, format: OutputFormat, background: string): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const radians = (rotation * Math.PI) / 180;
  const swapSides = Math.abs(rotation) % 180 === 90;
  const width = swapSides ? bitmap.height : bitmap.width;
  const height = swapSides ? bitmap.width : bitmap.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas unavailable.");

  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.translate(width / 2, height / 2);
  context.rotate(radians);
  context.scale(flipX ? -1 : 1, flipY ? -1 : 1);
  context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to export transformed image."));
        else resolve(blob);
      },
      format,
      format === "image/png" ? undefined : 0.92
    );
  });
}

export default function ImageRotateFlipPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [rotation, setRotation] = useState(90);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [background, setBackground] = useState("#0b1018");
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

  async function onTransform() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await transformImage(file, rotation, flipX, flipY, outputFormat, background);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const outputFile = new File([blob], `${file.name.split(".")[0]}-rotated.${extension}`, { type: outputFormat });
      const url = URL.createObjectURL(outputFile);
      setOutputUrl(url);
      setOutputName(outputFile.name);
      setShowSuccess(true);
    } catch (transformError) {
      setError(transformError instanceof Error ? transformError.message : "Transformation failed.");
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-sky/10 via-brand-orange/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">Image Rotate & Flip</h1>
          <p className="mt-2 text-foreground/75">Rotate or mirror images with quick presets and export-ready output control.</p>
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
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Rotation Presets</p>
                <div className="flex flex-wrap gap-2">
                  {[0, 90, 180, 270].map((value) => (
                    <button key={value} className="ui-btn-secondary" onClick={() => setRotation(value)}>
                      {value}°
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Output Format</span>
                  <select className="ui-input" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WEBP</option>
                  </select>
                </label>
                <label className="ui-field">
                  <span className="ui-label">Background</span>
                  <input className="ui-input h-[42px] p-1.5" type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm text-foreground/80">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <input type="checkbox" checked={flipX} onChange={(event) => setFlipX(event.target.checked)} />
                  Flip Horizontally
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <input type="checkbox" checked={flipY} onChange={(event) => setFlipY(event.target.checked)} />
                  Flip Vertically
                </label>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onTransform} disabled={!file || isProcessing}>
                {isProcessing ? "Transforming..." : "Rotate and Export"}
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
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Transformed</p>
                <img src={outputUrl} alt="Transformed" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Transformation Completed"
        message="Your image has been rotated or flipped and is ready to download."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Transformed Image"
      />
    </main>
  );
}
