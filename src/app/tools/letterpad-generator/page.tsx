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

type LetterTemplate = "A" | "B" | "C" | "D" | "E" | "F";
type Language = "en" | "hi" | "bilingual";
type FontType = "baskerville" | "garamond" | "serif4" | "devanagari" | "tiro" | "sans";

interface LetterConfig {
  // Header
  hindiLine1: string;
  hindiLine2: string;
  englishLine1: string;
  englishLine2: string;
  department: string;
  division: string;
  office: string;
  city: string;
  pin: string;
  phone: string;
  email: string;
  website: string;

  // Recipient
  toDesignation: string;
  toAddress: string;
  subject: string;
  reference: string;
  salutation: string;

  // Letter
  bodyText: string;
  closing: string;

  // Signatory
  signatoryName: string;
  signatoryDesignation: string;
  directionExtn: string;
  hindiName: string;
  constituency: string;

  // File number
  fileNo: string;
  date: string;

  // Settings
  template: LetterTemplate;
  language: Language;
  font: FontType;
  logoLeft: string | null;
  logoRight: string | null;
  showEnclosure: boolean;
  showCopyTo: boolean;
  showEndorsement: boolean;
}

const OFFICE_PRESETS = {
  dop: {
    hindiLine1: "भारत सरकार",
    hindiLine2: "संचार मंत्रालय",
    englishLine1: "Government of India",
    englishLine2: "Ministry of Communications",
    department: "Department of Posts",
    office: "Dak Bhavan, Sansad Marg",
    city: "New Delhi",
    pin: "110 001",
    phone: "011-23096000",
    email: "directorpost@indiapost.gov.in",
    website: "www.indiapost.gov.in",
  },
  pm: {
    hindiLine1: "",
    hindiLine2: "",
    englishLine1: "",
    englishLine2: "",
    department: "Prime Minister",
    office: "South Block",
    city: "New Delhi",
    pin: "110 001",
    phone: "011-23012312",
    email: "connect@pmindia.gov.in",
    website: "www.pmindia.gov.in",
  },
  president: {
    hindiLine1: "भारत के राष्ट्रपति",
    hindiLine2: "का कार्यालय",
    englishLine1: "Office of the President",
    englishLine2: "Government of India",
    department: "Rashtrapati Bhavan",
    office: "President's Secretariat",
    city: "New Delhi",
    pin: "110 001",
    phone: "011-30911111",
    email: "contact@rashtrapatibhavan.gov.in",
    website: "www.rashtrapatibhavan.gov.in",
  },
  custom: {},
};

export default function LetterpadGeneratorAI() {
  const [config, setConfig] = useState<LetterConfig>({
    hindiLine1: "भारत सरकार",
    hindiLine2: "संचार मंत्रालय",
    englishLine1: "Government of India",
    englishLine2: "Ministry of Communications",
    department: "Department of Posts",
    division: "(Establishment Division)",
    office: "Dak Bhavan, Sansad Marg",
    city: "New Delhi",
    pin: "110 001",
    phone: "011-23096000",
    email: "directorpost@indiapost.gov.in",
    website: "www.indiapost.gov.in",
    toDesignation: "The Chief Post Master General",
    toAddress: "Maharashtra Circle,\nMumbai-400 001.",
    subject: "Disbursement of Salary/wages/pension",
    reference: "",
    salutation: "Sir",
    bodyText: "I am directed to forward herewith a copy...",
    closing: "Yours faithfully",
    signatoryName: "(Authorized Signatory)",
    signatoryDesignation: "Designation",
    directionExtn: "",
    hindiName: "",
    constituency: "",
    fileNo: "F.No.38-0112013-PAP",
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    template: "A",
    language: "en",
    font: "baskerville",
    logoLeft: null,
    logoRight: null,
    showEnclosure: false,
    showCopyTo: false,
    showEndorsement: false,
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

  useEffect(() => {
    generatePreview();
  }, [config]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (exportUrl) URL.revokeObjectURL(exportUrl);
    };
  }, [previewUrl, exportUrl]);

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
          template: config.template,
          tone: "formal",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate letter (${response.status})`);
      }

      const { data } = await response.json();

      updateConfig("englishLine1", data.company_name);
      updateConfig("subject", data.subject);
      updateConfig("toDesignation", data.recipient_name);
      updateConfig("toAddress", data.recipient_address);
      updateConfig("bodyText", data.letter_body);
      updateConfig("closing", data.closing);
      updateConfig("signatoryName", data.signatory_name);
      updateConfig("signatoryDesignation", data.signatory_designation);

      setAiPrompt("");
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate letter");
      console.error("AI generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  }

  function applyPreset(preset: keyof typeof OFFICE_PRESETS) {
    const presetData = OFFICE_PRESETS[preset];
    Object.entries(presetData).forEach(([key, value]) => {
      if (key in config) {
        updateConfig(key as keyof LetterConfig, value);
      }
    });
  }

  function renderLetter(canvas: HTMLCanvasElement): Promise<void> {
    return new Promise((resolve) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve();
        return;
      }

      canvas.width = 794;
      canvas.height = 1123;

      // White background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 794, 1123);

      // Tricolor bar
      const triHeight = 7;
      ctx.fillStyle = "#FF9933";
      ctx.fillRect(0, 0, 794, triHeight);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, triHeight, 794, triHeight);
      ctx.strokeStyle = "#e5e5e5";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, triHeight, 794, triHeight);
      ctx.fillStyle = "#138808";
      ctx.fillRect(0, triHeight * 2, 794, triHeight);

      let y = 30;
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#000000";

      // Header
      if (config.englishLine1) {
        ctx.fillText(config.englishLine1, 397, y);
        y += 18;
      }
      if (config.englishLine2) {
        ctx.fillText(config.englishLine2, 397, y);
        y += 18;
      }
      if (config.department) {
        ctx.font = "bold 13px Arial";
        ctx.fillText(config.department, 397, y);
        y += 15;
      }

      // Divider
      ctx.strokeStyle = "#06038D";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(754, y);
      ctx.stroke();
      y += 15;

      // Meta info
      ctx.font = "11px Arial";
      ctx.textAlign = "left";
      ctx.fillText(config.fileNo, 40, y);
      ctx.textAlign = "right";
      ctx.fillText(`Dated: ${config.date}`, 754, y);
      y += 25;

      // To block
      ctx.textAlign = "left";
      ctx.font = "bold 11px Arial";
      ctx.fillText("To", 40, y);
      y += 16;
      ctx.font = "11px Arial";
      ctx.fillText(config.toDesignation, 40, y);
      y += 14;

      const toLines = config.toAddress.split("\n");
      toLines.forEach((line) => {
        ctx.fillText(line, 40, y);
        y += 14;
      });
      y += 10;

      // Subject
      ctx.font = "bold 11px Arial";
      ctx.fillText(`Sub: ${config.subject}`, 40, y);
      y += 20;

      // Salutation
      ctx.font = "11px Arial";
      ctx.fillText(`${config.salutation},`, 40, y);
      y += 20;

      // Body text
      const bodyLines = config.bodyText.split("\n");
      bodyLines.forEach((line) => {
        if (line.trim()) {
          const words = line.split(" ");
          let currentLine = "";

          words.forEach((word) => {
            const testLine = currentLine + word + " ";
            const metrics = ctx.measureText(testLine);

            if (metrics.width > 714) {
              if (currentLine) {
                ctx.fillText(currentLine, 40, y);
                y += 14;
              }
              currentLine = word + " ";
            } else {
              currentLine = testLine;
            }
          });

          if (currentLine) {
            ctx.fillText(currentLine, 40, y);
            y += 14;
          }
        } else {
          y += 10;
        }
      });

      y += 20;

      // Closing
      ctx.fillText(config.closing + ",", 40, y);
      y += 35;

      // Signatory
      ctx.font = "11px Arial";
      ctx.fillText(config.signatoryName, 40, y);
      y += 14;
      ctx.fillText(config.signatoryDesignation, 40, y);

      // Footer
      ctx.font = "9px Arial";
      ctx.fillStyle = "#666666";
      ctx.textAlign = "center";
      ctx.fillText(config.office + " | " + config.city + " - " + config.pin, 397, 1100);

      resolve();
    });
  }

  async function generatePreview() {
    if (!previewCanvasRef.current) return;

    try {
      await renderLetter(previewCanvasRef.current);

      const blob = await new Promise<Blob>((resolve, reject) => {
        previewCanvasRef.current?.toBlob((blob) => {
          if (!blob) reject(new Error("Failed to generate preview"));
          else resolve(blob);
        }, "image/jpeg", 0.85);
      });

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("Preview error:", err);
    }
  }

  async function onExport() {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      await renderLetter(canvasRef.current);

      if (exportFormat === "pdf") {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvasRef.current?.toBlob((blob) => {
            if (!blob) reject(new Error("Failed to generate image"));
            else resolve(blob);
          }, "image/jpeg", 0.95);
        });

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const imgData = canvasRef.current.toDataURL("image/jpeg");
        doc.addImage(imgData, "JPEG", 0, 0, 210, 297);

        const pdfBlob = doc.output("blob");
        if (exportUrl) URL.revokeObjectURL(exportUrl);
        setExportUrl(URL.createObjectURL(pdfBlob));
      } else {
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvasRef.current?.toBlob((blob) => {
            if (!blob) reject(new Error("Failed to generate image"));
            else resolve(blob);
          }, "image/png");
        });

        if (exportUrl) URL.revokeObjectURL(exportUrl);
        setExportUrl(URL.createObjectURL(blob));
      }

      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export");
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
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Link href="/tools" className="mb-6 inline-flex items-center gap-2 text-sm font-medium opacity-85 hover:opacity-100">
            <ArrowLeftIcon className="h-4 w-4" /> Back to Tools
          </Link>
          <h1 className="text-4xl font-bold">Advanced Letterpad Generator</h1>
          <p className="mt-2 text-foreground/75">Professional government & business letter generator with AI, multiple templates, and full customization</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3 md:px-6">
          {/* Left Panel: Controls */}
          <div className="col-span-1 ui-modal-shell p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* AI Generator */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">✨ AI Generator</h3>
              <textarea
                className="ui-input min-h-20 mb-2"
                placeholder="Describe your letter (e.g., 'Write appreciation letter from President of India to Sanket for flood relief work at Beed')"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              {generateError && <p className="text-xs text-red-400 mb-2">{generateError}</p>}
              <button className="ui-btn-primary w-full text-sm" onClick={handleAIGenerate} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            {/* Office Presets */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Office Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(OFFICE_PRESETS).map((preset) => (
                  <button
                    key={preset}
                    className="ui-btn-secondary text-xs py-1"
                    onClick={() => applyPreset(preset as keyof typeof OFFICE_PRESETS)}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Template Type</h3>
              <div className="grid grid-cols-3 gap-2">
                {(["A", "B", "C", "D", "E", "F"] as LetterTemplate[]).map((t) => (
                  <button
                    key={t}
                    className={`py-2 px-2 rounded text-sm border ${config.template === t ? "bg-brand-orange/20 border-brand-orange" : "border-white/20 hover:border-white/40"}`}
                    onClick={() => updateConfig("template", t)}
                  >
                    Type-{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Header Details</h3>
              <label className="ui-field">
                <span className="ui-label text-xs">English Line 1</span>
                <input className="ui-input text-sm" value={config.englishLine1} onChange={(e) => updateConfig("englishLine1", e.target.value)} />
              </label>
              <label className="ui-field mt-2">
                <span className="ui-label text-xs">English Line 2</span>
                <input className="ui-input text-sm" value={config.englishLine2} onChange={(e) => updateConfig("englishLine2", e.target.value)} />
              </label>
              <label className="ui-field mt-2">
                <span className="ui-label text-xs">Department</span>
                <input className="ui-input text-sm" value={config.department} onChange={(e) => updateConfig("department", e.target.value)} />
              </label>
              <label className="ui-field mt-2">
                <span className="ui-label text-xs">File No</span>
                <input className="ui-input text-sm" value={config.fileNo} onChange={(e) => updateConfig("fileNo", e.target.value)} />
              </label>
            </div>

            {/* Letter Content */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Letter Content</h3>
              <label className="ui-field">
                <span className="ui-label text-xs">To - Designation</span>
                <input className="ui-input text-sm" value={config.toDesignation} onChange={(e) => updateConfig("toDesignation", e.target.value)} />
              </label>
              <label className="ui-field mt-2">
                <span className="ui-label text-xs">To - Address</span>
                <textarea className="ui-input text-sm min-h-12" value={config.toAddress} onChange={(e) => updateConfig("toAddress", e.target.value)} />
              </label>
              <label className="ui-field mt-2">
                <span className="ui-label text-xs">Subject</span>
                <input className="ui-input text-sm" value={config.subject} onChange={(e) => updateConfig("subject", e.target.value)} />
              </label>
              <label className="ui-field mt-2">
                <span className="ui-label text-xs">Body Text</span>
                <textarea className="ui-input text-sm min-h-24" value={config.bodyText} onChange={(e) => updateConfig("bodyText", e.target.value)} />
              </label>
            </div>

            {/* Signatory */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Signatory</h3>
              <label className="ui-field">
                <span className="ui-label text-xs">Name</span>
                <input className="ui-input text-sm" value={config.signatoryName} onChange={(e) => updateConfig("signatoryName", e.target.value)} />
              </label>
              <label className="ui-field mt-2">
                <span className="ui-label text-xs">Designation</span>
                <input className="ui-input text-sm" value={config.signatoryDesignation} onChange={(e) => updateConfig("signatoryDesignation", e.target.value)} />
              </label>
            </div>

            {/* Export */}
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide opacity-75">Export</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select className="ui-input text-sm" value={exportFormat} onChange={(e) => setExportFormat(e.target.value as "pdf" | "png")}>
                  <option value="pdf">PDF</option>
                  <option value="png">PNG</option>
                </select>
                <input className="ui-input text-sm" value={exportName} onChange={(e) => setExportName(e.target.value || "letter")} />
              </div>
              {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
              <button className="ui-btn-primary w-full text-sm" onClick={onExport} disabled={isProcessing}>
                {isProcessing ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>

          {/* Right Panel: Large Preview */}
          <div className="col-span-2 ui-preview-card p-4">
            <h2 className="mb-3 text-lg font-semibold">Live Preview (A4)</h2>
            {previewUrl ? (
              <div className="space-y-3">
                <img src={previewUrl} alt="Letter preview" className="w-full border-4 border-white/10 rounded-lg shadow-lg" style={{ maxHeight: "70vh", objectFit: "cover" }} />
                {exportUrl && (
                  <button className="ui-btn-secondary w-full" onClick={onDownload}>
                    Download {exportName}.{exportFormat}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-foreground/60">
                Generating preview...
              </div>
            )}
          </div>
        </div>

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
