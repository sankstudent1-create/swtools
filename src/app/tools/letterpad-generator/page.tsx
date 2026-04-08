"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import SuccessPopup from "@/components/SuccessPopup";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

type LetterpadConfig = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  registrationNumber: string;
  taxID: string;
  bankDetails: string;
  logoFile: File | null;
  logoUrl: string | null;
  logoScale: number;
  logoOffsetX: number;
  logoOffsetY: number;
  primaryColor: string;
  accentColor: string;
  fontFamily: "default" | "serif" | "modern";
};

const INITIAL_CONFIG: LetterpadConfig = {
  companyName: "Your Company Name",
  address: "123 Business Street, City, State 12345",
  phone: "+1 (555) 123-4567",
  email: "info@company.com",
  website: "www.company.com",
  registrationNumber: "REG: ABC123456",
  taxID: "TAX ID: 98-7654321",
  bankDetails: "Bank: XYZ Bank | Account: 123456789",
  logoFile: null,
  logoUrl: null,
  logoScale: 1,
  logoOffsetX: 0,
  logoOffsetY: 0,
  primaryColor: "#f29a4a",
  accentColor: "#f06a9b",
  fontFamily: "default",
};

const FONT_FAMILIES = {
  default: "system-ui, -apple-system, sans-serif",
  serif: "Georgia, serif",
  modern: "Courier New, monospace",
};

export default function LetterpadGeneratorPage() {
  const [config, setConfig] = useState<LetterpadConfig>(INITIAL_CONFIG);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "png">("pdf");
  const [exportName, setExportName] = useState("letterpad");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate preview on config change
  useEffect(() => {
    generatePreview();
  }, [config]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (exportUrl) URL.revokeObjectURL(exportUrl);
      if (config.logoUrl) URL.revokeObjectURL(config.logoUrl);
    };
  }, [previewUrl, exportUrl, config.logoUrl]);

  function updateConfig<K extends keyof LetterpadConfig>(key: K, value: LetterpadConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }

    const logoUrl = URL.createObjectURL(file);
    updateConfig("logoFile", file);
    updateConfig("logoUrl", logoUrl);
    setError(null);
  }

  function removeLogo() {
    if (config.logoUrl) URL.revokeObjectURL(config.logoUrl);
    updateConfig("logoFile", null);
    updateConfig("logoUrl", null);
  }

  function renderLetterpadOnCanvas(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) {
        reject(new Error("Canvas context unavailable."));
        return;
      }

      const ctx = canvasCtx;

      canvas.width = width;
      canvas.height = height;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const padding = 40;
      const contentWidth = width - padding * 2;
      let currentY = padding;

      // Logo rendering
      if (config.logoUrl) {
        const img = new Image();
        img.onload = () => {
          const logoHeight = 60;
          const logoWidth = (img.width / img.height) * logoHeight;
          const logoX = (width - logoWidth) / 2 + config.logoOffsetX;
          const logoY = currentY + config.logoOffsetY;

          ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);
          currentY += logoHeight + 20;
          renderTextContent();
        };
        img.onerror = () => {
          renderTextContent();
        };
        img.src = config.logoUrl;
      } else {
        renderTextContent();
      }

      function renderTextContent() {
        // Set font
        const fontFamily = FONT_FAMILIES[config.fontFamily];

        // Company Name
        ctx.fillStyle = config.primaryColor;
        ctx.font = `bold 28px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.fillText(config.companyName, width / 2, currentY);
        currentY += 40;

        // Divider line
        ctx.strokeStyle = config.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(width - padding, currentY);
        ctx.stroke();
        currentY += 20;

        // Contact details
        ctx.fillStyle = "#333333";
        ctx.font = `12px ${fontFamily}`;
        ctx.textAlign = "center";

        if (config.address) {
          ctx.fillText(config.address, width / 2, currentY);
          currentY += 18;
        }

        const contactLine = [config.phone, config.email].filter(Boolean).join(" | ");
        if (contactLine) {
          ctx.fillText(contactLine, width / 2, currentY);
          currentY += 18;
        }

        if (config.website) {
          ctx.fillText(config.website, width / 2, currentY);
          currentY += 18;
        }

        // Content area spacer
        currentY = height - 100;

        // Footer divider
        ctx.strokeStyle = config.primaryColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(width - padding, currentY);
        ctx.stroke();
        currentY += 15;

        // Footer text
        ctx.fillStyle = "#666666";
        ctx.font = `10px ${fontFamily}`;
        ctx.textAlign = "center";

        if (config.registrationNumber) {
          ctx.fillText(config.registrationNumber, width / 2, currentY);
          currentY += 15;
        }

        if (config.taxID) {
          ctx.fillText(config.taxID, width / 2, currentY);
          currentY += 15;
        }

        if (config.bankDetails) {
          ctx.fillText(config.bankDetails, width / 2, currentY);
        }

        resolve();
      }
    });
  }

  async function generatePreview() {
    if (!previewCanvasRef.current) return;

    try {
      // A4 size at 96 DPI: 794x1123
      await renderLetterpadOnCanvas(previewCanvasRef.current, 794, 1123);

      const blob = await new Promise<Blob>((resolve, reject) => {
        previewCanvasRef.current?.toBlob((blob) => {
          if (!blob) reject(new Error("Failed to generate preview."));
          else resolve(blob);
        }, "image/jpeg", 0.85);
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate preview.");
    }
  }

  async function onExport() {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      // A4 size at 96 DPI: 794x1123
      await renderLetterpadOnCanvas(canvasRef.current, 794, 1123);

      if (exportFormat === "pdf") {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvasRef.current?.toBlob((blob) => {
            if (!blob) reject(new Error("Failed to generate image."));
            else resolve(blob);
          }, "image/jpeg", 0.95);
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable.");

        const img = new Image();
        img.onload = async () => {
          canvas.width = 210;
          canvas.height = 297;
          ctx.drawImage(img, 0, 0, 210, 297);

          const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          const imgData = canvas.toDataURL("image/jpeg");
          doc.addImage(imgData, "JPEG", 0, 0, 210, 297);

          const pdfBlob = doc.output("blob");
          if (exportUrl) URL.revokeObjectURL(exportUrl);
          setExportUrl(URL.createObjectURL(pdfBlob));
          setShowSuccess(true);
        };
        img.onerror = () => {
          setError("Failed to process image for PDF.");
          setIsProcessing(false);
        };
        img.src = URL.createObjectURL(blob);
      } else {
        // PNG export
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvasRef.current?.toBlob((blob) => {
            if (!blob) reject(new Error("Failed to generate image."));
            else resolve(blob);
          }, "image/png");
        });

        if (exportUrl) URL.revokeObjectURL(exportUrl);
        setExportUrl(URL.createObjectURL(blob));
        setShowSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export letterpad.");
    } finally {
      setIsProcessing(false);
    }
  }

  function onDownload() {
    if (!exportUrl) return;

    const ext = exportFormat === "pdf" ? "pdf" : "png";
    const link = document.createElement("a");
    link.href = exportUrl;
    link.download = `${exportName}.${ext}`;
    link.click();
  }

  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-pink/10 via-brand-orange/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">Letterpad Generator</h1>
          <p className="mt-2 text-foreground/75">Create professionally formatted letterpads for companies, offices, and individuals with full customization.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          {/* Left Panel: Controls */}
          <div className="ui-modal-shell p-6 space-y-4">
            {/* Company Details */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Company Details</h3>
              <label className="ui-field">
                <span className="ui-label">Company/Person Name</span>
                <input
                  className="ui-input"
                  type="text"
                  value={config.companyName}
                  onChange={(e) => updateConfig("companyName", e.target.value)}
                />
              </label>

              <label className="ui-field mt-3">
                <span className="ui-label">Address</span>
                <textarea
                  className="ui-input min-h-16"
                  value={config.address}
                  onChange={(e) => updateConfig("address", e.target.value)}
                />
              </label>

              <label className="ui-field mt-3">
                <span className="ui-label">Phone</span>
                <input
                  className="ui-input"
                  type="text"
                  value={config.phone}
                  onChange={(e) => updateConfig("phone", e.target.value)}
                />
              </label>

              <label className="ui-field mt-3">
                <span className="ui-label">Email</span>
                <input
                  className="ui-input"
                  type="email"
                  value={config.email}
                  onChange={(e) => updateConfig("email", e.target.value)}
                />
              </label>

              <label className="ui-field mt-3">
                <span className="ui-label">Website</span>
                <input
                  className="ui-input"
                  type="text"
                  value={config.website}
                  onChange={(e) => updateConfig("website", e.target.value)}
                />
              </label>
            </div>

            {/* Logo Upload */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Logo</h3>
              <label className="block">
                <div className="ui-upload-dropzone p-6 text-center cursor-pointer">
                  <p className="text-sm font-medium">Upload company logo</p>
                  <p className="text-xs text-foreground/65">PNG, JPG, WEBP</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </label>
              {config.logoUrl && (
                <div className="mt-3 space-y-2">
                  <img src={config.logoUrl} alt="Logo" className="h-12 w-auto mx-auto rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    <label className="ui-field">
                      <span className="ui-label">Scale</span>
                      <input
                        className="ui-input"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={config.logoScale}
                        onChange={(e) => updateConfig("logoScale", Number(e.target.value))}
                      />
                    </label>
                    <button className="ui-btn-secondary mt-6" onClick={removeLogo}>
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Details */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Footer Details</h3>
              <label className="ui-field">
                <span className="ui-label">Registration Number</span>
                <input
                  className="ui-input"
                  type="text"
                  value={config.registrationNumber}
                  onChange={(e) => updateConfig("registrationNumber", e.target.value)}
                />
              </label>

              <label className="ui-field mt-3">
                <span className="ui-label">Tax ID</span>
                <input
                  className="ui-input"
                  type="text"
                  value={config.taxID}
                  onChange={(e) => updateConfig("taxID", e.target.value)}
                />
              </label>

              <label className="ui-field mt-3">
                <span className="ui-label">Bank Details</span>
                <input
                  className="ui-input"
                  type="text"
                  value={config.bankDetails}
                  onChange={(e) => updateConfig("bankDetails", e.target.value)}
                />
              </label>
            </div>

            {/* Styling */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Styling</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Primary Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      className="w-12 h-10 rounded border border-white/20 cursor-pointer"
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => updateConfig("primaryColor", e.target.value)}
                    />
                    <span className="text-xs text-foreground/65">{config.primaryColor}</span>
                  </div>
                </label>

                <label className="ui-field">
                  <span className="ui-label">Accent Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      className="w-12 h-10 rounded border border-white/20 cursor-pointer"
                      type="color"
                      value={config.accentColor}
                      onChange={(e) => updateConfig("accentColor", e.target.value)}
                    />
                    <span className="text-xs text-foreground/65">{config.accentColor}</span>
                  </div>
                </label>
              </div>

              <label className="ui-field mt-3">
                <span className="ui-label">Font Family</span>
                <select
                  className="ui-input"
                  value={config.fontFamily}
                  onChange={(e) => updateConfig("fontFamily", e.target.value as "default" | "serif" | "modern")}
                >
                  <option value="default">System (Default)</option>
                  <option value="serif">Serif (Georgia)</option>
                  <option value="modern">Modern (Courier)</option>
                </select>
              </label>
            </div>

            {/* Export Options */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Export</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="ui-field">
                  <span className="ui-label">Format</span>
                  <select className="ui-input" value={exportFormat} onChange={(e) => setExportFormat(e.target.value as "pdf" | "png")}>
                    <option value="pdf">PDF</option>
                    <option value="png">PNG</option>
                  </select>
                </label>

                <label className="ui-field">
                  <span className="ui-label">File Name</span>
                  <input
                    className="ui-input"
                    type="text"
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value || "letterpad")}
                  />
                </label>
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button className="ui-btn-primary w-full" onClick={onExport} disabled={isProcessing}>
              {isProcessing ? "Generating..." : `Export as ${exportFormat.toUpperCase()}`}
            </button>
          </div>

          {/* Right Panel: Preview */}
          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            {previewUrl ? (
              <div className="space-y-3">
                <img src={previewUrl} alt="Letterpad preview" className="w-full border border-white/10 rounded-lg" />
                {exportUrl && (
                  <button className="ui-btn-secondary w-full" onClick={onDownload}>
                    Download {exportName}.{exportFormat}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-lg border border-dashed border-white/20 text-foreground/60">
                Generating preview...
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvases for rendering */}
        <canvas ref={previewCanvasRef} style={{ display: "none" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(exportUrl)}
        title="Letterpad Generated"
        message="Your letterpad is ready for download."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel={`Download ${exportName}.${exportFormat}`}
      />
    </main>
  );
}
