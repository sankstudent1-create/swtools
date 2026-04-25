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
type FitMode = "cover" | "contain";

const PRESETS = [
  { label: "1:1", w: 1, h: 1 },
  { label: "4:5", w: 4, h: 5 },
  { label: "16:9", w: 16, h: 9 },
  { label: "3:2", w: 3, h: 2 },
  { label: "5:2", w: 5, h: 2 },
  { label: "9:16", w: 9, h: 16 },
];

async function changeAspect(
  file: File,
  ratioW: number,
  ratioH: number,
  outputWidth: number,
  outputFormat: OutputFormat,
  fitMode: FitMode,
  background: string
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const targetRatio = ratioW / ratioH;
  const outputHeight = Math.max(60, Math.round(outputWidth / targetRatio));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable.");

  context.fillStyle = background;
  context.fillRect(0, 0, outputWidth, outputHeight);

  const sourceRatio = bitmap.width / bitmap.height;

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

    context.drawImage(bitmap, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);
  } else {
    const scale = Math.min(outputWidth / bitmap.width, outputHeight / bitmap.height);
    const drawWidth = bitmap.width * scale;
    const drawHeight = bitmap.height * scale;
    const dx = (outputWidth - drawWidth) / 2;
    const dy = (outputHeight - drawHeight) / 2;
    context.drawImage(bitmap, dx, dy, drawWidth, drawHeight);
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Aspect ratio conversion failed."));
      else resolve(blob);
    }, outputFormat, outputFormat === "image/png" ? undefined : 0.92);
  });
}

export default function AspectRatioChangerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState("");
  const [ratioW, setRatioW] = useState(4);
  const [ratioH, setRatioH] = useState(5);
  const [outputWidth, setOutputWidth] = useState(1200);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/jpeg");
  const [fitMode, setFitMode] = useState<FitMode>("cover");
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

  const ratioLabel = useMemo(() => `${ratioW}:${ratioH}`, [ratioW, ratioH]);

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
    if (ratioW <= 0 || ratioH <= 0 || outputWidth < 120) {
      setError("Set valid ratio and width values.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const blob = await changeAspect(file, ratioW, ratioH, outputWidth, outputFormat, fitMode, background);
      const extension = outputFormat === "image/png" ? "png" : outputFormat === "image/webp" ? "webp" : "jpg";
      const name = `${file.name.split(".")[0]}-ratio-${ratioW}x${ratioH}.${extension}`;
      const outputFile = new File([blob], name, { type: outputFormat });
      const url = URL.createObjectURL(outputFile);
      setOutputUrl(url);
      setOutputName(name);
      setShowSuccess(true);
    } catch (convertError) {
      setError(convertError instanceof Error ? convertError.message : "Failed to change ratio.");
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
          <h1 className="text-4xl font-bold">Aspect Ratio Changer</h1>
          <p className="mt-2 text-foreground/75">Crop or letterbox images into preset and custom ratios with export controls.</p>
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
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Presets</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      className="ui-btn-secondary"
                      onClick={() => {
                        setRatioW(preset.w);
                        setRatioH(preset.h);
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Ratio W</span>
                  <input className="ui-input" type="number" min={1} value={ratioW} onChange={(event) => setRatioW(Number(event.target.value) || 0)} />
                </label>
                <label className="ui-field">
                  <span className="ui-label">Ratio H</span>
                  <input className="ui-input" type="number" min={1} value={ratioH} onChange={(event) => setRatioH(Number(event.target.value) || 0)} />
                </label>
                <label className="ui-field">
                  <span className="ui-label">Output W</span>
                  <input className="ui-input" type="number" min={120} value={outputWidth} onChange={(event) => setOutputWidth(Number(event.target.value) || 0)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Fit Mode</span>
                  <select className="ui-input" value={fitMode} onChange={(event) => setFitMode(event.target.value as FitMode)}>
                    <option value="cover">Cover Crop</option>
                    <option value="contain">Contain with Background</option>
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

              <label className="ui-field">
                <span className="ui-label">Background</span>
                <input className="ui-input h-[42px] p-1.5" type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onConvert} disabled={!file || isProcessing}>
                {isProcessing ? "Converting..." : `Convert to ${ratioLabel}`}
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
                <p className="mb-2 text-xs uppercase tracking-wider text-foreground/60">Converted ({ratioLabel})</p>
                <img src={outputUrl} alt="Converted" className="max-h-52 w-full rounded-lg border border-white/10 object-contain" />
                <button className="ui-btn-secondary mt-3 w-full" onClick={onDownload}>Download {outputName}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(outputUrl)}
        title="Aspect Ratio Updated"
        message="Your image has been exported with the selected ratio and framing mode."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel="Download Converted Image"
      />
    </main>
  );
}
