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

type LetterTemplate = "professional" | "government" | "personal" | "formal" | "casual";
type LetterConfig = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  recipientName: string;
  recipientDesignation: string;
  recipientAddress: string;
  subject: string;
  letterBody: string;
  closing: string;
  signatoryName: string;
  signatoryDesignation: string;
  footerText: string;
  logoUrl: string | null;
  logoFile: File | null;
  templateType: LetterTemplate;
};

const TEMPLATE_OPTIONS: { value: LetterTemplate; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "government", label: "Government" },
  { value: "personal", label: "Personal" },
  { value: "formal", label: "Formal Official" },
  { value: "casual", label: "Casual" },
];

export default function LetterpadGeneratorAI() {
  const [config, setConfig] = useState<LetterConfig>({
    companyName: "Your Organization",
    address: "123 Business Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    email: "info@organization.com",
    website: "www.organization.com",
    recipientName: "",
    recipientDesignation: "",
    recipientAddress: "",
    subject: "",
    letterBody: "",
    closing: "Yours faithfully",
    signatoryName: "",
    signatoryDesignation: "",
    footerText: "Official Communication",
    logoUrl: null,
    logoFile: null,
    templateType: "professional",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"pdf" | "png">("pdf");
  const [exportName, setExportName] = useState("letter");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate preview on config change
  useEffect(() => {
    generatePreview();
  }, [config]);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (exportUrl) URL.revokeObjectURL(exportUrl);
      if (config.logoUrl) URL.revokeObjectURL(config.logoUrl);
    };
  }, [previewUrl, exportUrl, config.logoUrl]);

  function updateConfig<K extends keyof LetterConfig>(key: K, value: LetterConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) {
      setGenerateError("Please describe the letter you want to generate");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch("/api/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: aiPrompt,
          template: config.templateType,
          tone: config.templateType === "casual" ? "casual" : "formal",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate letter");
      }

      const { data } = await response.json();

      updateConfig("companyName", data.company_name);
      updateConfig("address", data.address);
      updateConfig("phone", data.phone);
      updateConfig("email", data.email);
      updateConfig("website", data.website);
      updateConfig("recipientName", data.recipient_name);
      updateConfig("recipientDesignation", data.recipient_designation);
      updateConfig("recipientAddress", data.recipient_address);
      updateConfig("subject", data.subject);
      updateConfig("letterBody", data.letter_body);
      updateConfig("closing", data.closing);
      updateConfig("signatoryName", data.signatory_name);
      updateConfig("signatoryDesignation", data.signatory_designation);
      updateConfig("footerText", data.footer_text);

      setAiPrompt("");
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate letter");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const logoUrl = URL.createObjectURL(file);
    updateConfig("logoFile", file);
    updateConfig("logoUrl", logoUrl);
  }

  function renderLetterOnCanvas(canvas: HTMLCanvasElement, width: number, height: number): Promise<void> {
    return new Promise((resolve) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve();
        return;
      }

      canvas.width = width;
      canvas.height = height;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      const padding = 40;
      let currentY = padding;

      // Logo
      if (config.logoUrl) {
        const img = new Image();
        img.onload = () => {
          const logoHeight = 50;
          const logoWidth = (img.width / img.height) * logoHeight;
          ctx.drawImage(img, (width - logoWidth) / 2, currentY, logoWidth, logoHeight);
          currentY += logoHeight + 15;
          renderTextContent();
        };
        img.onerror = () => renderTextContent();
        img.src = config.logoUrl;
      } else {
        renderTextContent();
      }

      function renderTextContent() {
        if (!ctx) return;
        // Company header
        ctx.fillStyle = "#1a1a1a";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(config.companyName, width / 2, currentY);
        currentY += 25;

        // Address block
        ctx.font = "11px Arial";
        ctx.fillStyle = "#333333";
        const addressLines = config.address.split("\n");
        addressLines.forEach((line) => {
          ctx.fillText(line, width / 2, currentY);
          currentY += 14;
        });

        // Contact info
        ctx.font = "10px Arial";
        ctx.fillText(`${config.phone} | ${config.email}`, width / 2, currentY);
        currentY += 16;

        // Divider
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(width - padding, currentY);
        ctx.stroke();
        currentY += 20;

        // Letter date
        ctx.font = "11px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, padding, currentY);
        currentY += 25;

        // Recipient address
        ctx.fillText(`${config.recipientName}`, padding, currentY);
        currentY += 14;
        ctx.fillText(`${config.recipientDesignation}`, padding, currentY);
        currentY += 14;
        const recipientLines = config.recipientAddress.split("\n");
        recipientLines.forEach((line) => {
          ctx.fillText(line, padding, currentY);
          currentY += 14;
        });
        currentY += 10;

        // Subject
        ctx.font = "bold 11px Arial";
        ctx.fillText(`Subject: ${config.subject}`, padding, currentY);
        currentY += 20;

        // Letter body
        ctx.font = "11px Arial";
        ctx.textAlign = "left";
        const bodyLines = config.letterBody.split("\n");
        const maxWidth = width - padding * 2;
        let letterStartY = currentY;

        bodyLines.forEach((line) => {
          if (line.trim()) {
            const words = line.split(" ");
            let currentLine = "";

            words.forEach((word) => {
              const testLine = currentLine + word + " ";
              const metrics = ctx.measureText(testLine);

              if (metrics.width > maxWidth) {
                if (currentLine) {
                  ctx.fillText(currentLine, padding, currentY);
                  currentY += 14;
                }
                currentLine = word + " ";
              } else {
                currentLine = testLine;
              }
            });

            if (currentLine) {
              ctx.fillText(currentLine, padding, currentY);
              currentY += 14;
            }
          } else {
            currentY += 10;
          }
        });

        // Signature space
        currentY += 30;
        ctx.fillText(`${config.closing}`, padding, currentY);
        currentY += 35;

        // Signatory
        ctx.font = "11px Arial";
        ctx.fillText(`${config.signatoryName}`, padding, currentY);
        currentY += 14;
        ctx.fillText(`${config.signatoryDesignation}`, padding, currentY);

        // Footer
        ctx.font = "9px Arial";
        ctx.fillStyle = "#666666";
        ctx.textAlign = "center";
        ctx.fillText(config.footerText, width / 2, height - 20);

        resolve();
      }
    });
  }

  async function generatePreview() {
    if (!previewCanvasRef.current) return;

    try {
      await renderLetterOnCanvas(previewCanvasRef.current, 794, 1123);

      const blob = await new Promise<Blob>((resolve, reject) => {
        previewCanvasRef.current?.toBlob((blob) => {
          if (!blob) reject(new Error("Failed to generate preview."));
          else resolve(blob);
        }, "image/jpeg", 0.85);
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Preview generation error:", err);
    }
  }

  async function onExport() {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      await renderLetterOnCanvas(canvasRef.current, 794, 1123);

      if (exportFormat === "pdf") {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvasRef.current?.toBlob((blob) => {
            if (!blob) reject(new Error("Failed to generate image."));
            else resolve(blob);
          }, "image/jpeg", 0.95);
        });

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgData = canvasRef.current.toDataURL("image/jpeg");
        doc.addImage(imgData, "JPEG", 0, 0, 210, 297);

        const pdfBlob = doc.output("blob");
        if (exportUrl) URL.revokeObjectURL(exportUrl);
        setExportUrl(URL.createObjectURL(pdfBlob));
        setShowSuccess(true);
      } else {
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
      setError(err instanceof Error ? err.message : "Failed to export letter.");
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/10 via-brand-pink/10 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">AI Letterpad Generator</h1>
          <p className="mt-2 text-foreground/75">Generate complete professional letters instantly using AI. Just describe what you need!</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 md:px-6">
          {/* Left Panel */}
          <div className="ui-modal-shell p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* AI Prompt Section */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">✨ AI Letter Generator</h3>
              <div className="space-y-3">
                <label className="ui-field">
                  <span className="ui-label">Template Type</span>
                  <select
                    className="ui-input"
                    value={config.templateType}
                    onChange={(e) => updateConfig("templateType", e.target.value as LetterTemplate)}
                  >
                    {TEMPLATE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="ui-field">
                  <span className="ui-label">Describe Your Letter</span>
                  <textarea
                    className="ui-input min-h-24"
                    placeholder="E.g., Write a letter to Sanket praising his good works at Beed for flood relief. President of India is recognizing his efforts. Should include government letterhead, formal tone, and official footer."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </label>

                {generateError && <p className="text-sm text-red-400">{generateError}</p>}

                <button
                  className="ui-btn-primary w-full"
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                >
                  {isGenerating ? "Generating..." : "Generate Letter with AI"}
                </button>
              </div>
            </div>

            {/* Manual Editing Section */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Manual Details</h3>
              <div className="space-y-3">
                <label className="ui-field">
                  <span className="ui-label">Organization Name</span>
                  <input
                    className="ui-input"
                    type="text"
                    value={config.companyName}
                    onChange={(e) => updateConfig("companyName", e.target.value)}
                  />
                </label>

                <label className="ui-field">
                  <span className="ui-label">Address</span>
                  <textarea
                    className="ui-input min-h-16"
                    value={config.address}
                    onChange={(e) => updateConfig("address", e.target.value)}
                  />
                </label>

                <label className="ui-field">
                  <span className="ui-label">Phone</span>
                  <input className="ui-input" type="text" value={config.phone} onChange={(e) => updateConfig("phone", e.target.value)} />
                </label>

                <label className="ui-field">
                  <span className="ui-label">Email</span>
                  <input className="ui-input" type="email" value={config.email} onChange={(e) => updateConfig("email", e.target.value)} />
                </label>

                <label className="ui-field">
                  <span className="ui-label">Website</span>
                  <input className="ui-input" type="text" value={config.website} onChange={(e) => updateConfig("website", e.target.value)} />
                </label>
              </div>
            </div>

            {/* Logo Section */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Logo</h3>
              <label className="block">
                <div className="ui-upload-dropzone p-6 text-center cursor-pointer">
                  <p className="text-sm font-medium">Upload Logo</p>
                  <p className="text-xs text-foreground/65">PNG, JPG, WEBP</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </label>
              {config.logoUrl && (
                <div className="mt-3">
                  <img src={config.logoUrl} alt="Logo" className="h-12 w-auto mx-auto rounded" />
                </div>
              )}
            </div>

            {/* Export */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Export</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
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
                    onChange={(e) => setExportName(e.target.value || "letter")}
                  />
                </label>
              </div>

              {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

              <button className="ui-btn-primary w-full" onClick={onExport} disabled={isProcessing}>
                {isProcessing ? "Exporting..." : `Export as ${exportFormat.toUpperCase()}`}
              </button>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            {previewUrl ? (
              <div className="space-y-3">
                <img src={previewUrl} alt="Letter preview" className="w-full border border-white/10 rounded-lg max-h-96 object-cover" />
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

        {/* Hidden canvases */}
        <canvas ref={previewCanvasRef} style={{ display: "none" }} />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </section>

      <SuccessPopup
        isOpen={showSuccess && Boolean(exportUrl)}
        title="Letter Generated"
        message="Your letter is ready for download."
        onClose={() => setShowSuccess(false)}
        onDownload={onDownload}
        downloadLabel={`Download ${exportName}.${exportFormat}`}
      />
    </main>
  );
}
