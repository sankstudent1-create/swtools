"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import SuccessPopup from "@/components/SuccessPopup";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
type ConvertedItem = { name: string; url: string };

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

async function convertSingle(file: File, format: OutputFormat, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable.");
  context.drawImage(bitmap, 0, 0);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Conversion failed."));
      else resolve(blob);
    }, format, format === "image/png" ? undefined : quality / 100);
  });
}

export default function BulkImageConverterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(88);
  const [outputs, setOutputs] = useState<ConvertedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      outputs.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [outputs]);

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setError(null);
    setShowSuccess(false);
    setFiles(selected);
  }

  async function onConvertAll() {
    if (!files.length) {
      setError("Upload one or more images first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      outputs.forEach((item) => URL.revokeObjectURL(item.url));
      const converted: ConvertedItem[] = [];
      for (const file of files) {
        const blob = await convertSingle(file, outputFormat, quality);
        const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
        const name = `${file.name.split(".")[0]}-converted.${extension}`;
        const url = URL.createObjectURL(blob);
        converted.push({ name, url });
      }
      setOutputs(converted);
      setShowSuccess(true);
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "Bulk conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadAll() {
    outputs.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = item.url;
        link.download = item.name;
        link.click();
      }, index * 150);
    });
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-sky/10 via-brand-pink/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100"><ArrowLeftIcon className="h-4 w-4" /> Back to Tools</Link>
          <h1 className="text-4xl font-bold">Bulk Image Converter</h1>
          <p className="mt-2 text-foreground/75">Convert multiple images in one run to JPG, PNG, or WEBP.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          <div className="ui-modal-shell p-6 space-y-4">
            <label className="block">
              <div className="ui-upload-dropzone p-8 text-center cursor-pointer" onDragOver={(event) => event.preventDefault()}>
                <p className="text-sm font-medium">Upload multiple images</p>
                <p className="text-xs text-foreground/65">{files.length} selected</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
              </div>
            </label>

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
            <button className="ui-btn-primary w-full" onClick={onConvertAll} disabled={!files.length || isProcessing}>{isProcessing ? "Converting..." : "Convert All"}</button>
          </div>

          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Converted Files ({outputs.length})</h2>
            {!outputs.length && <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">No converted files yet</div>}
            {outputs.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {outputs.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
                    <span className="truncate text-sm text-foreground/80">{item.name}</span>
                    <button className="ui-btn-secondary" onClick={() => {
                      const link = document.createElement("a");
                      link.href = item.url;
                      link.download = item.name;
                      link.click();
                    }}>Download</button>
                  </div>
                ))}
                <button className="ui-btn-secondary w-full" onClick={downloadAll}>Download All</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && outputs.length > 0}
        title="Bulk Conversion Completed"
        message="All selected images have been converted."
        onClose={() => setShowSuccess(false)}
        onDownload={downloadAll}
        downloadLabel="Download All Files"
      />
    </main>
  );
}
