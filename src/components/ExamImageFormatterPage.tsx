"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
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

type SourceSize = {
  width: number;
  height: number;
};

export type FormatterConfig = {
  name: string;
  org: string;
  icon: string;
  color: string;
  colorText: string;
  colorBg: string;
  colorBorder: string;
  width: number;
  height: number;
  ratioLabel: string;
  minKb: number;
  maxKb: number;
  format: "image/jpeg";
  conditions: string[];
  assetLabel: string;
  outputSuffix: string;
  successTitle: string;
  successMessage: string;
  downloadLabel: string;
};

function getImageSize(file: File): Promise<SourceSize> {
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
  if (!isRatioValid) messages.push(`Aspect ratio should be ${targetRatio.toFixed(3)}.`);
  if (!isFileSizeValid) messages.push(`File size should be between ${minKb} KB and ${maxKb} KB.`);
  if (messages.length === 0) messages.push("Image is valid for the selected requirements.");

  return { isDimensionValid, isRatioValid, isFileSizeValid, ratio: currentRatio.toFixed(3), fileKb, messages };
}

function getDrawFrame(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number
) {
  const baseScale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const finalScale = baseScale * scale;
  const drawWidth = sourceWidth * finalScale;
  const drawHeight = sourceHeight * finalScale;
  const dx = (targetWidth - drawWidth) / 2 + offsetX;
  const dy = (targetHeight - drawHeight) / 2 + offsetY;

  return { drawWidth, drawHeight, dx, dy };
}

async function processImage(
  sourceFile: File,
  sourceSize: SourceSize,
  targetWidth: number,
  targetHeight: number,
  maxKb: number,
  outputType: "image/jpeg",
  scale: number,
  offsetX: number,
  offsetY: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(sourceFile);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Unable to process image. Canvas is unavailable.");

  const { drawWidth, drawHeight, dx, dy } = getDrawFrame(
    sourceSize.width,
    sourceSize.height,
    targetWidth,
    targetHeight,
    scale,
    offsetX,
    offsetY
  );

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, dx, dy, drawWidth, drawHeight);
  bitmap.close?.();

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

export default function ExamImageFormatterPage({ config }: { config: FormatterConfig }) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [sourceSize, setSourceSize] = useState<SourceSize | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [processedFileUrl, setProcessedFileUrl] = useState<string | null>(null);
  const [processedFileName, setProcessedFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (processedFileUrl) URL.revokeObjectURL(processedFileUrl);
    };
  }, [imagePreviewUrl, processedFileUrl]);

  useEffect(() => {
    if (!processedFileUrl) return;
    URL.revokeObjectURL(processedFileUrl);
    setProcessedFileUrl(null);
    setProcessedFileName("");
    setShowSuccess(false);
  }, [scale, offsetX, offsetY]);

  async function loadSelectedFile(selectedFile: File | null) {
    setError(null);
    setValidation(null);
    setShowSuccess(false);
    setFile(selectedFile);
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);

    if (processedFileUrl) {
      URL.revokeObjectURL(processedFileUrl);
      setProcessedFileUrl(null);
      setProcessedFileName("");
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    if (!selectedFile) {
      setSourceSize(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setImagePreviewUrl(previewUrl);

    try {
      const nextSourceSize = await getImageSize(selectedFile);
      setSourceSize(nextSourceSize);
      setValidation(
        calculateValidation(
          selectedFile,
          nextSourceSize.width,
          nextSourceSize.height,
          config.width,
          config.height,
          config.minKb,
          config.maxKb
        )
      );
    } catch (readError) {
      setSourceSize(null);
      setError(readError instanceof Error ? readError.message : "Unable to read image.");
    }
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    await loadSelectedFile(event.target.files?.[0] ?? null);
  }

  async function onFileDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files?.[0] ?? null;
    await loadSelectedFile(selectedFile);
  }

  async function onGenerateOutput() {
    if (!file || !sourceSize) {
      setError("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const blob = await processImage(
        file,
        sourceSize,
        config.width,
        config.height,
        config.maxKb,
        config.format,
        scale,
        offsetX,
        offsetY
      );
      const outputFile = new File([blob], `${file.name.split(".")[0]}-${config.outputSuffix}.jpg`, { type: config.format });
      const outputUrl = URL.createObjectURL(outputFile);
      setProcessedFileUrl(outputUrl);
      setProcessedFileName(outputFile.name);

      const imageSize = await getImageSize(outputFile);
      setValidation(
        calculateValidation(
          outputFile,
          imageSize.width,
          imageSize.height,
          config.width,
          config.height,
          config.minKb,
          config.maxKb
        )
      );
      setShowSuccess(true);
    } catch (processingError) {
      setError(processingError instanceof Error ? processingError.message : `Unable to prepare the ${config.assetLabel}.`);
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

  function onResetAdjustments() {
    setScale(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  const isValid = validation?.isDimensionValid && validation?.isRatioValid && validation?.isFileSizeValid;
  const outputFrame = useMemo(() => {
    if (!sourceSize) return null;
    return getDrawFrame(sourceSize.width, sourceSize.height, config.width, config.height, scale, offsetX, offsetY);
  }, [config.height, config.width, offsetX, offsetY, scale, sourceSize]);

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${config.color} opacity-10`} />

        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Tools
          </Link>

          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="text-6xl">{config.icon}</div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold md:text-5xl">{config.name}</h1>
                <p className="text-lg text-foreground/70">{config.org}</p>
              </div>
            </div>

            <div className="grid gap-4 pt-4 md:grid-cols-3">
              <div className={`rounded-xl border p-4 ${config.colorBorder} ${config.colorBg}`}>
                <p className="mb-1 text-xs uppercase tracking-wider text-foreground/60">File Size</p>
                <p className={`text-xl font-bold ${config.colorText}`}>{config.minKb}-{config.maxKb} KB</p>
              </div>
              <div className={`rounded-xl border p-4 ${config.colorBorder} ${config.colorBg}`}>
                <p className="mb-1 text-xs uppercase tracking-wider text-foreground/60">Dimensions</p>
                <p className={`text-xl font-bold ${config.colorText}`}>{config.width}x{config.height} px</p>
              </div>
              <div className={`rounded-xl border p-4 ${config.colorBorder} ${config.colorBg}`}>
                <p className="mb-1 text-xs uppercase tracking-wider text-foreground/60">Aspect Ratio</p>
                <p className={`text-xl font-bold ${config.colorText}`}>{config.ratioLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="ui-modal-shell overflow-hidden">
            <span className={`ui-ambient-orb right-5 top-5 h-20 w-20 ${config.colorBg}`} />
            <span className="ui-ambient-orb bottom-6 left-4 h-16 w-16 bg-brand-pink/20" />

            <div className="relative p-8 md:p-10">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />
              <div className="relative z-10 space-y-6">
                <div className="space-y-3">
                  <span className="ui-workspace-chip">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                    Adjustable Upload Workspace
                  </span>
                  <div className="flex items-center gap-4">
                    <UploadIcon className={`ui-floaty h-8 w-8 ${config.colorText}`} />
                    <h2 className="font-heading text-2xl font-bold">Upload Your {config.assetLabel}</h2>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Use zoom and move controls first, then generate the final output. If you adjust again after generating, the old export is cleared so the preview stays truthful.
                  </p>
                </div>

                <label className="block">
                  <div
                    className={`ui-upload-dropzone cursor-pointer p-8 text-center md:p-12 ${config.colorBorder}`}
                    onDragEnter={(event) => ((event.currentTarget as HTMLDivElement).dataset.dragging = "true")}
                    onDragOver={(event) => {
                      event.preventDefault();
                      (event.currentTarget as HTMLDivElement).dataset.dragging = "true";
                    }}
                    onDragLeave={(event) => ((event.currentTarget as HTMLDivElement).dataset.dragging = "false")}
                    onDrop={onFileDrop}
                  >
                    <p className="mb-2 text-sm font-medium text-foreground/85">Click to upload or drag and drop</p>
                    <p className="text-xs text-foreground/60">PNG, JPG up to 10MB</p>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </div>
                </label>

                {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>}

                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="ui-preview-card p-4">
                        <h3 className="mb-3 font-semibold">Original Image</h3>
                        {imagePreviewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imagePreviewUrl} alt="Original" className="w-full max-h-64 rounded-lg border border-white/10 bg-black/20 object-contain" />
                        ) : (
                          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-foreground/55">
                            No image selected
                          </div>
                        )}
                      </div>

                      <div className="ui-preview-card p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="font-semibold">Live Frame Preview</h3>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-foreground/65">
                            {config.width}x{config.height}
                          </span>
                        </div>
                        {imagePreviewUrl && outputFrame ? (
                          <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
                            <div className="relative w-full bg-white" style={{ aspectRatio: `${config.width} / ${config.height}` }}>
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:18px_18px]" />
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imagePreviewUrl}
                                alt="Live adjustment preview"
                                className="pointer-events-none absolute max-w-none select-none"
                                style={{
                                  width: `${(outputFrame.drawWidth / config.width) * 100}%`,
                                  height: `${(outputFrame.drawHeight / config.height) * 100}%`,
                                  left: `${(outputFrame.dx / config.width) * 100}%`,
                                  top: `${(outputFrame.dy / config.height) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-foreground/55">
                            Upload an image to adjust framing
                          </div>
                        )}
                        <p className="mt-3 text-xs text-foreground/60">
                          Keep the full {config.assetLabel.toLowerCase()} inside the frame. Zoom out if edges touch the crop and move horizontally or vertically to center the subject.
                        </p>
                      </div>
                    </div>

                    <div className="ui-preview-card p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="font-semibold">Generated Output</h3>
                        {processedFileName ? <span className="text-xs text-foreground/55">{processedFileName}</span> : null}
                      </div>
                      {processedFileUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={processedFileUrl} alt="Processed" className="mb-3 w-full max-h-72 rounded-lg border border-white/10 bg-black/20 object-contain" />
                          <a href={processedFileUrl} download={processedFileName} className={`block w-full rounded-lg bg-gradient-to-r px-4 py-2 text-center font-semibold text-black transition hover:shadow-lg ${config.color}`}>
                            Download {processedFileName}
                          </a>
                        </>
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/15 bg-black/20 text-foreground/55">
                          Generate output to review before download
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="ui-preview-card p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="font-semibold">Adjustment Controls</h3>
                        <button type="button" onClick={onResetAdjustments} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-foreground/75 transition hover:border-white/25 hover:text-white">
                          Reset
                        </button>
                      </div>

                      <div className="space-y-4">
                        <label className="ui-field">
                          <span className="ui-label">Zoom ({scale.toFixed(2)}x)</span>
                          <input type="range" min={0.6} max={2.4} step={0.01} value={scale} onChange={(event) => setScale(Number(event.target.value))} />
                        </label>
                        <label className="ui-field">
                          <span className="ui-label">Move Left / Right ({Math.round(offsetX)} px)</span>
                          <input type="range" min={-config.width * 0.45} max={config.width * 0.45} step={1} value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} />
                        </label>
                        <label className="ui-field">
                          <span className="ui-label">Move Up / Down ({Math.round(offsetY)} px)</span>
                          <input type="range" min={-config.height * 0.45} max={config.height * 0.45} step={1} value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} />
                        </label>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <button onClick={onGenerateOutput} disabled={!file || isProcessing} className={`rounded-xl bg-gradient-to-r px-6 py-3 font-semibold text-black transition hover:shadow-lg disabled:opacity-50 ${config.color}`}>
                          {isProcessing ? "Generating..." : "Generate Preview"}
                        </button>
                        <button onClick={onDownloadProcessed} disabled={!processedFileUrl} className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:border-white/25 hover:bg-white/10 disabled:opacity-50">
                          Download Ready File
                        </button>
                      </div>
                    </div>

                    {validation && (
                      <div className={`ui-preview-card p-4 ${isValid ? "border-green-500/30 bg-green-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
                        <div className="mb-3 flex items-center gap-2">
                          {isValid ? <CheckIcon className="h-5 w-5 text-green-500" /> : <span className="text-amber-500">⚠</span>}
                          <span className={`font-semibold ${isValid ? "text-green-400" : "text-amber-400"}`}>{isValid ? "Valid Output" : "Needs Attention"}</span>
                        </div>
                        <ul className="space-y-1 text-sm text-foreground/90">
                          {validation.messages.map((message) => (
                            <li key={message} className="flex items-start gap-2">
                              <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                              <span>{message}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/15 p-3 text-xs text-foreground/75">
                          <div>
                            <p className="uppercase tracking-[0.14em] text-foreground/50">Current Ratio</p>
                            <p className="mt-1 text-sm font-semibold text-white">{validation.ratio}</p>
                          </div>
                          <div>
                            <p className="uppercase tracking-[0.14em] text-foreground/50">Current Size</p>
                            <p className="mt-1 text-sm font-semibold text-white">{validation.fileKb} KB</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-foreground/10 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <h2 className="mb-8 text-2xl font-bold">Official Requirements</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {config.conditions.map((condition) => (
              <div key={condition} className={`flex gap-3 rounded-xl border p-4 ${config.colorBorder} ${config.colorBg}`}>
                <CheckIcon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.colorText}`} />
                <p className="text-sm">{condition}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(processedFileUrl)}
        title={config.successTitle}
        message={config.successMessage}
        onClose={() => setShowSuccess(false)}
        onDownload={onDownloadProcessed}
        downloadLabel={config.downloadLabel}
      />
    </main>
  );
}