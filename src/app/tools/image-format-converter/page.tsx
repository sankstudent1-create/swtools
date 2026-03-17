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

async function convertImage(file: File, format: OutputFormat, quality: number, background: string): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Canvas unavailable.");

  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to convert image."));
        else resolve(blob);
      },
      format,
      format === "image/png" ? undefined : quality / 100
    );
  });
}

export default function ImageFormatConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(92);
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

  async function onConvert() {
    if (!file) {
      setError("Upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await convertImage(file, outputFormat, quality, background);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const outputFile = new File([blob], `${file.name.split(".")[0]}-converted.${extension}`, { type: outputFormat });
      const url = URL.createObjectURL(outputFile);
      setOutputUrl(url);
      setOutputName(outputFile.name);
      setShowSuccess(true);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : "Conversion failed.");
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/10 via-brand-pink/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">Image Format Converter</h1>
          <p className="mt-2 text-foreground/75">Convert images between JPG, PNG, and WEBP with export quality and background control.</p>
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
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WEBP</option>
                  </select>
                </label>
                <label className="ui-field">
                  <span className="ui-label">Background</span>
                  <input className="ui-input h-[42px] p-1.5" type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
                </label>
              </div>

              <div className="ui-field">
                <span className="ui-label">Quality ({quality}%)</span>
                <input type="range" min={20} max={100} value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onConvert} disabled={!file || isProcessing}>
                {isProcessing ? "Converting..." : "Convert Image"}
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
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Converted</p>
                <img src={outputUrl} alt="Converted" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Conversion Completed"
        message="Your image has been exported in the selected format."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Converted Image"
      />
    </main>
  );
}
