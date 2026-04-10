"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ToolCard = {
  id: string;
  name: string;
  org: string;
  description: string;
  icon: string;
  color: string;
  colorText: string;
  href: string;
  width: number;
  height: number;
  minKb: number;
  maxKb: number;
  ratio: string;
};

const TOOLS: ToolCard[] = [
  {
    id: "ssc",
    name: "SSC Exam Signature",
    org: "Staff Selection Commission",
    description: "Format signature for all SSC examination platforms with official compliance",
    icon: "📋",
    color: "from-brand-orange to-orange-500",
    colorText: "text-brand-orange",
    href: "/tools/ssc",
    width: 472,
    height: 236,
    minKb: 10,
    maxKb: 20,
    ratio: "4.0:2.0",
  },
  {
    id: "rrb",
    name: "RRB Railway Signature",
    org: "Railway Recruitment Board",
    description: "Format signature for RRB Railway recruitment examinations with handwriting emphasis",
    icon: "🚂",
    color: "from-brand-pink to-pink-500",
    colorText: "text-brand-pink",
    href: "/tools/rrb",
    width: 140,
    height: 60,
    minKb: 30,
    maxKb: 49,
    ratio: "~7:3",
  },
  {
    id: "india-post-photo",
    name: "India Post GDS Photo",
    org: "India Post (Gramin Dak Sevak)",
    description: "Format photo for India Post GDS Online Engagement with portrait orientation",
    icon: "📮",
    color: "from-brand-sky to-sky-500",
    colorText: "text-brand-sky",
    href: "/tools/india-post-photo",
    width: 320,
    height: 400,
    minKb: 30,
    maxKb: 100,
    ratio: "4:5",
  },
  {
    id: "india-post-signature",
    name: "India Post GDS Signature",
    org: "India Post (Gramin Dak Sevak)",
    description: "Format signature for India Post GDS Online Engagement with landscape orientation",
    icon: "✍️",
    color: "from-brand-sky to-cyan-500",
    colorText: "text-brand-sky",
    href: "/tools/india-post-signature",
    width: 300,
    height: 120,
    minKb: 20,
    maxKb: 100,
    ratio: "5:2",
  },
  {
    id: "bank-thumb",
    name: "Banking Thumb Impression",
    org: "SBI / IBPS",
    description: "Format left-thumb impression for banking recruitments with square ratio and clarity optimization",
    icon: "👆",
    color: "from-violet-500 to-brand-pink",
    colorText: "text-violet-300",
    href: "/tools/bank-thumb",
    width: 240,
    height: 240,
    minKb: 20,
    maxKb: 50,
    ratio: "1:1",
  },
  {
    id: "ibps-declaration",
    name: "IBPS Declaration",
    org: "IBPS",
    description: "Prepare handwritten declaration image for IBPS portals with exact landscape output profile",
    icon: "📝",
    color: "from-emerald-400 to-brand-sky",
    colorText: "text-emerald-300",
    href: "/tools/ibps-declaration",
    width: 800,
    height: 400,
    minKb: 50,
    maxKb: 100,
    ratio: "2:1",
  },
  {
    id: "neet-signature",
    name: "NEET Signature",
    org: "NTA NEET",
    description: "Format NEET signature image with balanced compression and official upload-friendly dimensions",
    icon: "🧪",
    color: "from-emerald-400 to-brand-orange",
    colorText: "text-emerald-300",
    href: "/tools/neet-signature",
    width: 420,
    height: 140,
    minKb: 10,
    maxKb: 50,
    ratio: "3:1",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    org: "Utility Tool",
    description: "Resize with presets, fit modes, background fill, quality control, and export format switching",
    icon: "🖼️",
    color: "from-brand-orange to-brand-sky",
    colorText: "text-brand-orange",
    href: "/tools/image-resizer",
    width: 800,
    height: 600,
    minKb: 0,
    maxKb: 0,
    ratio: "Custom",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    org: "Utility Tool",
    description: "Reduce file size with output format conversion, size targeting, scaling, and width constraints",
    icon: "🗜️",
    color: "from-brand-pink to-brand-sky",
    colorText: "text-brand-pink",
    href: "/tools/image-compressor",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Original",
  },
  {
    id: "aspect-ratio-changer",
    name: "Aspect Ratio Changer",
    org: "Utility Tool",
    description: "Convert ratios with cover or contain framing, custom backgrounds, presets, and export format control",
    icon: "📐",
    color: "from-brand-sky to-cyan-500",
    colorText: "text-brand-sky",
    href: "/tools/aspect-ratio-changer",
    width: 1200,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Preset/Custom",
  },
  {
    id: "pdf-maker",
    name: "PDF Maker",
    org: "Utility Tool",
    description: "Build PDFs with page size, orientation, margins, fit mode, compression level, and file naming controls",
    icon: "📄",
    color: "from-brand-orange to-brand-pink",
    colorText: "text-brand-orange",
    href: "/tools/pdf-maker",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Multi-page",
  },
  {
    id: "image-scanner",
    name: "Image Scanner",
    org: "Utility Tool",
    description: "Create scan outputs with black-and-white, grayscale, cleanup, invert, and export format modes",
    icon: "🧾",
    color: "from-brand-sky to-brand-pink",
    colorText: "text-brand-sky",
    href: "/tools/image-scanner",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Document",
  },
  {
    id: "image-format-converter",
    name: "Image Format Converter",
    org: "Utility Tool",
    description: "Convert JPG, PNG, and WEBP files with quality control, background fill, and export sizing",
    icon: "🔄",
    color: "from-brand-orange to-brand-pink",
    colorText: "text-brand-orange",
    href: "/tools/image-format-converter",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Original",
  },
  {
    id: "image-rotate-flip",
    name: "Image Rotate & Flip",
    org: "Utility Tool",
    description: "Rotate, mirror, and export images with background control and angle presets",
    icon: "🧭",
    color: "from-brand-sky to-brand-orange",
    colorText: "text-brand-sky",
    href: "/tools/image-rotate-flip",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Original",
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    org: "Utility Tool",
    description: "Center-crop images to common or custom aspect ratios with export size and format controls",
    icon: "✂️",
    color: "from-brand-pink to-brand-orange",
    colorText: "text-brand-pink",
    href: "/tools/image-cropper",
    width: 1080,
    height: 1080,
    minKb: 0,
    maxKb: 0,
    ratio: "Preset/Custom",
  },
  {
    id: "watermark-stamper",
    name: "Watermark Stamper",
    org: "Utility Tool",
    description: "Apply text watermarks with position, opacity, color, and output format settings",
    icon: "🪧",
    color: "from-brand-sky to-brand-pink",
    colorText: "text-brand-sky",
    href: "/tools/watermark-stamper",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Original",
  },
  {
    id: "bulk-image-converter",
    name: "Bulk Image Converter",
    org: "Utility Tool",
    description: "Convert multiple images in one run with target format and quality controls",
    icon: "🗂️",
    color: "from-brand-orange to-brand-sky",
    colorText: "text-brand-orange",
    href: "/tools/bulk-image-converter",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "Original",
  },
  {
    id: "letterpad-generator",
    name: "Letterpad Generator",
    org: "Utility Tool",
    description: "Create professionally formatted government & office letterpads with AI assistance, customizable templates, inline editing, and A4-ready PDF output",
    icon: "📝",
    color: "from-brand-pink to-brand-orange",
    colorText: "text-brand-pink",
    href: "/tools/letterpad-generator",
    width: 794,
    height: 1123,
    minKb: 0,
    maxKb: 0,
    ratio: "A4",
  },
  {
    id: "gds-leave",
    name: "GDS Leave Application",
    org: "India Post (Gramin Dak Sevak)",
    description: "Generate official GDS Leave Applications in quadruplicate format — Paid Leave or LWA — with cover letter, auto-filled fields, and print-ready PDF output",
    icon: "🏤",
    color: "from-yellow-600 to-amber-500",
    colorText: "text-yellow-400",
    href: "/tools/gds-leave",
    width: 0,
    height: 0,
    minKb: 0,
    maxKb: 0,
    ratio: "A4 Quad",
  },
];

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "exam" | "utility">("all");

  const filteredTools = useMemo(() => {
    if (activeTab === "all") return TOOLS;
    if (activeTab === "exam") return TOOLS.filter((tool) => tool.org !== "Utility Tool");
    return TOOLS.filter((tool) => tool.org === "Utility Tool");
  }, [activeTab]);

  const examCount = TOOLS.filter((tool) => tool.org !== "Utility Tool").length;
  const utilityCount = TOOLS.filter((tool) => tool.org === "Utility Tool").length;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/18 via-brand-pink/10 to-brand-sky/15" />
        <div className="absolute -top-20 right-0 -z-10 h-72 w-72 rounded-full bg-brand-pink/25 blur-3xl" />
        <div className="absolute bottom-0 left-10 -z-10 h-64 w-64 rounded-full bg-brand-sky/20 blur-3xl" />
        
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                SW InfoSystems • Utility Tool Hub
              </div>
              <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight">
                Signatures, Photos <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-brand-orange via-brand-pink to-brand-sky bg-clip-text text-transparent">
                  plus Advanced Image
                </span>{" "}
                <br />
                and PDF Controls
              </h1>
              <p className="max-w-3xl text-lg text-foreground/80">
                Specialized upload formatters alongside utility tools with deeper output control for resizing, compression, format conversion, aspect ratios, scans, PDF generation, and rotation.
              </p>
            </div>

            <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
                <p className="text-2xl font-bold">{TOOLS.length}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Total Workflows</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
                <p className="text-2xl font-bold">{examCount}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Format Tools</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur">
                <p className="text-2xl font-bold">{utilityCount}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Utility Tools</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 max-w-xl">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/20 px-6 py-3 text-center transition-colors hover:border-white/40"
              >
                ← Back Home
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-center transition-colors hover:bg-white/15"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="border-t border-white/10 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12">
            <h2 className="font-heading mb-3 text-2xl md:text-3xl font-bold">Select Your Tool</h2>
            <p className="text-foreground/75">Choose a formatting workflow or utility tool based on the output control you need.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className={`ui-btn-secondary ${activeTab === "all" ? "border-white/35 bg-white/10" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All ({TOOLS.length})
              </button>
              <button
                className={`ui-btn-secondary ${activeTab === "exam" ? "border-white/35 bg-white/10" : ""}`}
                onClick={() => setActiveTab("exam")}
              >
                Format Tools ({examCount})
              </button>
              <button
                className={`ui-btn-secondary ${activeTab === "utility" ? "border-white/35 bg-white/10" : ""}`}
                onClick={() => setActiveTab("utility")}
              >
                Utility Tools ({utilityCount})
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(21,26,38,0.95),rgba(12,17,27,0.95))] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${tool.color} opacity-10 transition-opacity duration-300 group-hover:opacity-20`} />

                <div className="p-6 md:p-8 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <p className={`text-sm font-semibold uppercase tracking-wider ${tool.colorText}`}>
                        {tool.org.split("(")[0].trim()}
                      </p>
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-white">{tool.name}</h3>
                    </div>
                    <span className="text-4xl flex-shrink-0">{tool.icon}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm leading-relaxed text-foreground/80">{tool.description}</p>

                  {/* Specs Grid */}
                  <div className={`grid grid-cols-3 gap-3 rounded-xl border border-white/10 bg-gradient-to-br ${tool.color} p-4 opacity-20`}>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/65">Size</p>
                      <p className={`font-mono text-sm font-bold ${tool.colorText}`}>
                        {tool.minKb === 0 && tool.maxKb === 0 ? "Dynamic" : `${tool.minKb}–${tool.maxKb} KB`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/65">Dimensions</p>
                      <p className={`font-mono text-sm font-bold ${tool.colorText}`}>
                        {tool.width === 0 || tool.height === 0 ? "Flexible" : `${tool.width}×${tool.height}`}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/65">Ratio</p>
                      <p className={`font-mono text-sm font-bold ${tool.colorText}`}>{tool.ratio}</p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className={`w-full translate-y-0.5 rounded-xl bg-gradient-to-r ${tool.color} px-4 py-3 font-semibold text-black shadow-[0_12px_24px_rgba(0,0,0,0.22)] transition-shadow group-hover:translate-y-0 group-hover:shadow-[0_16px_30px_rgba(0,0,0,0.3)]`}>
                    <span className="flex items-center justify-center gap-2">
                    Access Tool
                    <ArrowRightIcon className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-white/10 bg-white/[0.02] py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <h2 className="font-heading mb-12 text-2xl md:text-3xl font-bold">Why Use Our Tools?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-3xl mb-2">✓</div>
              <h3 className="font-bold text-lg">Precision Presets</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Size windows, ratios, and export settings are tuned for practical upload and publishing workflows
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-lg">Advanced Output Control</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Adjust fit mode, quality, export format, page layout, thresholds, backgrounds, and more
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-3xl mb-2">📥</div>
              <h3 className="font-bold text-lg">Auto-Fix & Download</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Automatically resize, crop, compress, scan, or package files into ready-to-use downloads
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/10 py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center space-y-6">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Ready to Format Your Documents?</h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground/75">
            Select one of our specialized tools above to prepare images, signatures, PDFs, and other upload-ready assets in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/tools/ssc"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-orange to-orange-500 text-white font-semibold hover:shadow-lg transition-shadow"
            >
              Get Started <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-foreground/20 hover:border-foreground/40 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
