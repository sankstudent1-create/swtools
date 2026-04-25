"use client";

import { ChangeEvent, useState, useEffect } from "react";
import Link from "next/link";
import SuccessPopup from "@/components/SuccessPopup";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

type Validation = {
  isDimensionValid: boolean;
  isRatioValid: boolean;
  isFileSizeValid: boolean;
  ratio: string;
  fileKb: number;
  messages: string[];
};

const TOOL_CONFIG = {
  name: "India Post GDS Signature Formatter",
  org: "India Post (Gramin Dak Sevak Online Engagement)",
  icon: "✍️",
  color: "from-brand-sky to-cyan-500",
  colorText: "text-brand-sky",
  colorBg: "bg-brand-sky/10",
  colorBorder: "border-brand-sky/30",
  width: 300,
  height: 120,
  minKb: 20,
  maxKb: 100,
  format: "image/jpeg" as const,
  conditions: [
    "Format: JPEG/JPG only",
    "File size: 20 to 100 KB",
    "Dimensions: 300 px (W) × 120 px (H)",
    "Aspect ratio: 5:2 (Landscape orientation)",
    "Resolution: 72 DPI minimum, 150 DPI recommended",
    "Background: Plain white or light neutral color",
    "Signature coverage: 70-80% of image area",
    "Scanned with minimum 100 DPI resolution",
    "Use black or blue ink pen only",
    "Signature on white paper, clear and legible",
    "No shaky strokes, pixelated appearance, or artifacts",
    "No typed, printed, or digital text - handwritten only",
  ],
};

function getImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const imageUrl = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
      URL.revokeObjectURL(imageUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Unable to read the selected image."));
    };
    image.src = imageUrl;
  });
}

function calculateValidation(
  file: File,
  imageWidth: number,
  imageHeight: number,
  targetWidth: number,
  targetHeight: number,
  minKb: number,
  maxKb: number
): Validation {
  const fileKb = Number((file.size / 1024).toFixed(2));
  const currentRatio = imageWidth / imageHeight;
  const targetRatio = targetWidth / targetHeight;
  const ratioDiff = Math.abs(currentRatio - targetRatio);

  const isDimensionValid = imageWidth === targetWidth && imageHeight === targetHeight;
  const isRatioValid = ratioDiff <= 0.02;
  const isFileSizeValid = fileKb >= minKb && fileKb <= maxKb;

  const messages: string[] = [];
  if (!isDimensionValid) messages.push(`Dimensions should be ${targetWidth} x ${targetHeight} px.`);
  if (!isRatioValid) messages.push(`Aspect ratio should be ${(targetRatio).toFixed(3)} (5:2).`);
  if (!isFileSizeValid) messages.push(`File size should be between ${minKb} KB and ${maxKb} KB.`);
  if (messages.length === 0) messages.push("Image is valid for the selected requirements.");

  return { isDimensionValid, isRatioValid, isFileSizeValid, ratio: currentRatio.toFixed(3), fileKb, messages };
}

async function processImage(
  sourceFile: File,
  targetWidth: number,
  targetHeight: number,
  maxKb: number,
  outputType: "image/jpeg"
): Promise<Blob> {
  const bitmap = await createImageBitmap(sourceFile);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Unable to process image. Canvas is unavailable.");

  const sourceRatio = bitmap.width / bitmap.height;
  const targetRatio = targetWidth / targetHeight;
  let sx = 0, sy = 0, sWidth = bitmap.width, sHeight = bitmap.height;

  if (sourceRatio > targetRatio) {
    sWidth = bitmap.height * targetRatio;
    sx = (bitmap.width - sWidth) / 2;
  } else {
    sHeight = bitmap.width / targetRatio;
    sy = (bitmap.height - sHeight) / 2;
  }

  context.drawImage(bitmap, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

  const canvasToBlob = (quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Image conversion failed."));
          else resolve(blob);
        },
        outputType,
        quality
      );
    });

  let quality = 0.92;
  let result = await canvasToBlob(quality);
  while (result.size / 1024 > maxKb && quality > 0.4) {
    quality -= 0.08;
    result = await canvasToBlob(quality);
  }

  return result;
}

export default function IndiaPostSignaturePage() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [processedFileName, setProcessedFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (processedFileUrl) URL.revokeObjectURL(processedFileUrl);
    };
  }, [imagePreviewUrl, processedFileUrl]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setValidation(null);
    setShowSuccess(false);
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);

    if (selectedFile) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(previewUrl);
      try {
        const imageSize = await getImageSize(selectedFile);
        const report = calculateValidation(
          selectedFile,
          imageSize.width,
          imageSize.height,
          TOOL_CONFIG.width,
          TOOL_CONFIG.height,
          TOOL_CONFIG.minKb,
          TOOL_CONFIG.maxKb
        );
        setValidation(report);
      } catch (readError) {
        setError(readError instanceof Error ? readError.message : "Unable to read image.");
      }
    } else {
      setImagePreviewUrl(null);
    }
  }

  async function onAutoFix() {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const blob = await processImage(file, TOOL_CONFIG.width, TOOL_CONFIG.height, TOOL_CONFIG.maxKb, TOOL_CONFIG.format);
      const outputFile = new File([blob], `${file.name.split(".")[0]}-gds-signature.jpg`, { type: TOOL_CONFIG.format });
      const outputUrl = URL.createObjectURL(outputFile);
      setProcessedFileUrl(outputUrl);
      setProcessedFileName(outputFile.name);

      const imageSize = await getImageSize(outputFile);
      const report = calculateValidation(
        outputFile,
        imageSize.width,
        imageSize.height,
        TOOL_CONFIG.width,
        TOOL_CONFIG.height,
        TOOL_CONFIG.minKb,
        TOOL_CONFIG.maxKb
      );
      setValidation(report);
      setShowSuccess(true);
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : "Unable to auto-fix the image.");
    } finally {
      setIsProcessing(false);
    }
  }

  function onDownloadProcessed() {
    if (!processedFileUrl || !processedFileName) return;
    const link = document.createElement("a");
    link.href = processedFileUrl;
    link.download = processedFileName;
    link.click();
  }

  const isValid = validation?.isDimensionValid && validation?.isRatioValid && validation?.isFileSizeValid;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-sky/15 via-brand-sky/5 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity mb-6">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Tools
          </Link>

          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="text-6xl">{TOOL_CONFIG.icon}</div>
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold">{TOOL_CONFIG.name}</h1>
                <p className="text-lg text-foreground/70">{TOOL_CONFIG.org}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className={`p-4 rounded-xl border ${TOOL_CONFIG.colorBorder} ${TOOL_CONFIG.colorBg}`}>
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">File Size</p>
                <p className={`text-xl font-bold ${TOOL_CONFIG.colorText}`}>{TOOL_CONFIG.minKb}–{TOOL_CONFIG.maxKb} KB</p>
              </div>
              <div className={`p-4 rounded-xl border ${TOOL_CONFIG.colorBorder} ${TOOL_CONFIG.colorBg}`}>
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Dimensions</p>
                <p className={`text-xl font-bold ${TOOL_CONFIG.colorText}`}>{TOOL_CONFIG.width}×{TOOL_CONFIG.height} px</p>
              </div>
              <div className={`p-4 rounded-xl border ${TOOL_CONFIG.colorBorder} ${TOOL_CONFIG.colorBg}`}>
                <p className="text-xs text-foreground/60 uppercase tracking-wider mb-1">Aspect Ratio</p>
                <p className={`text-xl font-bold ${TOOL_CONFIG.colorText}`}>5:2 Landscape</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="ui-modal-shell overflow-hidden">
            <span className="ui-ambient-orb right-5 top-5 h-20 w-20 bg-brand-sky/30" />
            <span className="ui-ambient-orb bottom-6 left-4 h-16 w-16 bg-brand-pink/20" />

            <div className="relative p-8 md:p-10">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${TOOL_CONFIG.color} opacity-10`} />
              <div className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <span className="ui-workspace-chip">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-sky" />
                    Smart Upload Workspace
                  </span>
                  <div className="flex items-center gap-4">
                    <UploadIcon className={`ui-floaty h-8 w-8 ${TOOL_CONFIG.colorText}`} />
                    <h2 className="font-heading text-2xl font-bold">Upload Your Signature</h2>
                  </div>
                </div>

                <label className="block">
                  <div
                    className={`ui-upload-dropzone ${TOOL_CONFIG.colorBorder} p-8 text-center md:p-12 cursor-pointer`}
                    onDragEnter={(event) => ((event.currentTarget as HTMLDivElement).dataset.dragging = "true")}
                    onDragOver={(event) => {
                      event.preventDefault();
                      (event.currentTarget as HTMLDivElement).dataset.dragging = "true";
                    }}
                    onDragLeave={(event) => ((event.currentTarget as HTMLDivElement).dataset.dragging = "false")}
                    onDrop={(event) => {
                      event.preventDefault();
                      (event.currentTarget as HTMLDivElement).dataset.dragging = "false";
                    }}
                  >
                    <p className="text-sm font-medium text-foreground/85 mb-2">Click to upload or drag & drop</p>
                    <p className="text-xs text-foreground/60">PNG, JPG up to 10MB • Auto resize & optimize</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />
                  </div>
                </label>

                {error && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-500">
                    {error}
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="ui-preview-card p-4">
                    <h3 className="mb-3 font-semibold">Original Image</h3>
                    {imagePreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagePreviewUrl} alt="Original" className="w-full max-h-64 object-contain rounded-lg border border-white/10 bg-black/20" />
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-foreground/55">
                        No image selected
                      </div>
                    )}
                  </div>

                  <div className="ui-preview-card p-4">
                    <h3 className="mb-3 font-semibold">Formatted Output</h3>
                    {processedFileUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={processedFileUrl} alt="Processed" className="mb-3 w-full max-h-64 rounded-lg border border-white/10 bg-black/20 object-contain" />
                        <a
                          href={processedFileUrl}
                          download={processedFileName}
                          className={`block w-full rounded-lg bg-gradient-to-r ${TOOL_CONFIG.color} px-4 py-2 text-center font-semibold text-black transition hover:shadow-lg`}
                        >
                          Download {processedFileName}
                        </a>
                      </>
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-foreground/55">
                        Process image to see output
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onAutoFix}
                    disabled={!file || isProcessing}
                    className={`flex-1 rounded-xl bg-gradient-to-r ${TOOL_CONFIG.color} px-6 py-3 font-semibold text-black transition hover:shadow-lg disabled:opacity-50`}
                  >
                    {isProcessing ? "Processing..." : "Auto Fix & Download"}
                  </button>
                </div>

                {validation && (
                  <div className={`ui-preview-card p-4 ${isValid ? "border-green-500/30 bg-green-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                    <div className="mb-3 flex items-center gap-2">
                      {isValid ? (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-amber-500">⚠</span>
                      )}
                      <span className={`font-semibold ${isValid ? "text-green-500" : "text-amber-500"}`}>
                        {isValid ? "✓ Valid" : "Needs Fix"}
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm text-foreground/90">
                      {validation.messages.map((msg) => (
                        <li key={msg} className="flex items-start gap-2">
                          <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                          <span>{msg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-12 md:py-16 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8">Official Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {TOOL_CONFIG.conditions.map((condition, idx) => (
              <div key={idx} className={`flex gap-3 p-4 rounded-xl border ${TOOL_CONFIG.colorBorder} ${TOOL_CONFIG.colorBg}`}>
                <CheckIcon className={`w-5 h-5 ${TOOL_CONFIG.colorText} flex-shrink-0 mt-0.5`} />
                <p className="text-sm">{condition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(processedFileUrl)}
        title="Signature Processed"
        message="Your India Post signature has been tuned for clarity, size, and submission compatibility."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownloadProcessed}
        downloadLabel="Download Signature"
      />
    </main>
  );
}
