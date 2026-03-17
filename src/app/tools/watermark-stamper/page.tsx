"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import SuccessPopup from "@/components/SuccessPopup";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

async function stampWatermark(
  file: File,
  text: string,
  position: Position,
  opacity: number,
  fontSize: number,
  color: string,
  outputFormat: OutputFormat
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas unavailable.");

  context.drawImage(bitmap, 0, 0);
  context.globalAlpha = opacity / 100;
  context.font = `${fontSize}px Inter, Arial, sans-serif`;
  context.fillStyle = color;

  const padding = 24;
  const textWidth = context.measureText(text).width;
  let x = padding;
  let y = padding + fontSize;

  if (position === "top-right") {
    x = canvas.width - textWidth - padding;
    y = padding + fontSize;
  }
  if (position === "bottom-left") {
    x = padding;
    y = canvas.height - padding;
  }
  if (position === "bottom-right") {
    x = canvas.width - textWidth - padding;
    y = canvas.height - padding;
  }
  if (position === "center") {
    x = (canvas.width - textWidth) / 2;
    y = canvas.height / 2;
  }

  context.fillText(text, x, y);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Watermark export failed."));
      else resolve(blob);
    }, outputFormat, outputFormat === "image/png" ? undefined : 0.92);
  });
}

export default function WatermarkStamperPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [text, setText] = useState("SW Tools");
  const [position, setPosition] = useState<Position>("bottom-right");
  const [opacity, setOpacity] = useState(65);
  const [fontSize, setFontSize] = useState(42);
  const [color, setColor] = useState("#ffffff");
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

  async function onApply() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }
    if (!text.trim()) {
      setError("Enter watermark text.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await stampWatermark(file, text.trim(), position, opacity, fontSize, color, outputFormat);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const out = new File([blob], `${file.name.split(".")[0]}-watermarked.${extension}`, { type: outputFormat });
      const url = URL.createObjectURL(out);
      setOutputUrl(url);
      setOutputName(out.name);
      setShowSuccess(true);
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Failed to apply watermark.");
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
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100"><ArrowLeftIcon className="h-4 w-4" /> Back to Tools</Link>
          <h1 className="text-4xl font-bold">Watermark Stamper</h1>
          <p className="mt-2 text-foreground/75">Add a text watermark with flexible position, opacity, and style controls.</p>
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

            <input className="ui-input" type="text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Watermark text" />

            <div className="grid grid-cols-2 gap-3">
              <select className="ui-input" value={position} onChange={(event) => setPosition(event.target.value as Position)}>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="center">Center</option>
              </select>
              <select className="ui-input" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WEBP</option>
              </select>
            </div>

            <label className="ui-field">
              <span className="ui-label">Opacity ({opacity}%)</span>
              <input type="range" min={20} max={100} value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
            </label>

            <label className="ui-field">
              <span className="ui-label">Font Size ({fontSize}px)</span>
              <input type="range" min={16} max={96} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} />
            </label>

            <label className="ui-field">
              <span className="ui-label">Text Color</span>
              <input className="ui-input h-[42px] p-1.5" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}
            <button className="ui-btn-primary w-full" onClick={onApply} disabled={!file || isProcessing}>{isProcessing ? "Applying..." : "Apply Watermark"}</button>
          </div>

          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            {!previewUrl && !outputUrl && <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">No image yet</div>}
            {previewUrl && <img src={previewUrl} alt="Original" className="mb-4 max-h-52 w-full rounded-lg border border-white/10 object-contain" />}
            {outputUrl && (
              <div>
                <img src={outputUrl} alt="Watermarked" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Watermark Applied"
        message="Your watermarked image is ready to download."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Watermarked Image"
      />
    </main>
  );
}
