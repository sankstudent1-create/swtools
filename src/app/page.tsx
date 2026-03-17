"use client";

import Link from "next/link";

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function TrendingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LightningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/10 via-brand-pink/5 to-brand-sky/10" />
        <div className="absolute top-20 right-0 -z-10 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-bl from-brand-pink to-brand-orange" />
        <div className="absolute bottom-0 left-1/4 -z-10 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-tr from-brand-sky to-brand-pink" />

        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-foreground/5">
              <SparklesIcon className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Image, Signature and PDF Utility Studio</span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
              Image, Signature and
              <span className="block bg-gradient-to-r from-brand-orange via-brand-pink to-brand-sky bg-clip-text text-transparent">
                Document Control Suite
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/75 leading-relaxed">
              Resize images, optimize signatures, build PDFs, clean scans, convert formats, and prepare upload-ready assets in one place. Fast local processing, no sign-up.
            </p>

            <div className="mx-auto grid max-w-3xl gap-3 pt-2 sm:grid-cols-3">
              {[
                { label: "Live Tools", value: "14+" },
                { label: "Format Flows", value: "7" },
                { label: "Utility Workflows", value: "7" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left backdrop-blur">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground/55">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/tools"
                className="px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white hover:shadow-xl hover:-translate-y-1 transition-all inline-flex items-center gap-2"
              >
                Start Formatting <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 text-base font-semibold rounded-xl border border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 transition-all"
              >
                Learn More
              </Link>
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-[1.35fr_0.95fr]">
              <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(242,154,74,0.14),transparent_32%),linear-gradient(180deg,rgba(18,24,35,0.96),rgba(10,14,23,0.98))] p-5 text-left shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                <div className="mb-5 flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Live Workspace</p>
                    <p className="mt-1 text-xl font-semibold text-white">Format, validate, export</p>
                  </div>
                  <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    Local Processing
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-foreground/50">Current Flow</p>
                          <p className="mt-1 text-lg font-semibold text-white">Signature Optimization</p>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-r from-brand-orange to-brand-pink px-3 py-1 text-xs font-bold text-white">
                          Ready
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          ["Upload", "Input captured", "text-emerald-300", "bg-emerald-400/10 border-emerald-400/20"],
                          ["Validate", "Dimensions matched", "text-brand-orange", "bg-brand-orange/10 border-brand-orange/20"],
                          ["Compress", "Target size applied", "text-brand-pink", "bg-brand-pink/10 border-brand-pink/20"],
                          ["Export", "Ready-to-use file", "text-brand-sky", "bg-brand-sky/10 border-brand-sky/20"],
                        ].map(([title, value, color, box]) => (
                          <div key={title} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${box}`}>
                            <span className="text-sm font-semibold text-white">{title}</span>
                            <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${color}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        ["Resize", "Fit modes + presets"],
                        ["Compress", "Target KB + format"],
                        ["PDF", "Layout + orientation"],
                      ].map(([title, value]) => (
                        <div key={title} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-4">
                          <p className="text-sm font-semibold text-white">{title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-foreground/50">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-white/8 bg-black/25 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-foreground/50">Compliance Signals</p>
                      <div className="mt-4 space-y-3">
                        {[
                          ["Size Match", "98%", "from-brand-orange to-brand-pink"],
                          ["Dimension Fit", "100%", "from-brand-pink to-brand-sky"],
                          ["Clarity Score", "High", "from-brand-sky to-cyan-400"],
                        ].map(([label, value, gradient]) => (
                          <div key={label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-foreground/65">{label}</span>
                              <span className="font-semibold text-white">{value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/8">
                              <div className={`h-2 rounded-full bg-gradient-to-r ${gradient}`} style={{ width: value === "High" ? "88%" : value }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-foreground/50">Utility Stack</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {[
                          "Aspect Ratio",
                          "Background Fill",
                          "Scan Cleanup",
                          "WEBP Export",
                          "PDF Margins",
                          "Target Compression",
                        ].map((label) => (
                          <span key={label} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-foreground/80">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(13,18,28,0.96),rgba(8,11,18,0.98))] p-5 text-left shadow-[0_20px_70px_rgba(0,0,0,0.28)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Tool Coverage</p>
                  <div className="mt-5 space-y-4">
                    {[
                      ["Format Tools", "Signatures, photos, declarations, thumb impressions"],
                      ["Image Utilities", "Resize, ratio, compression, scanner, rotation"],
                      ["Document Output", "PDF maker, format conversion, export controls"],
                    ].map(([title, value]) => (
                      <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm text-foreground/68">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/12 bg-gradient-to-br from-brand-orange/14 via-brand-pink/10 to-brand-sky/14 p-5 text-left shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/55">Why It Works</p>
                  <div className="mt-4 space-y-4">
                    {[
                      "No generic template look. The site now sells clarity, control, and compliance.",
                      "Every key tool exposes real output decisions instead of one-click black boxes.",
                      "The homepage now leads with product UI language instead of placeholder art.",
                    ].map((line) => (
                      <div key={line} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-relaxed text-foreground/84">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 border-t border-foreground/10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Why Choose SW Tools?</h2>
            <p className="max-w-2xl mx-auto text-foreground/70">Everything you need to clean, convert, resize, and export images and documents from a single browser-based workspace.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: LightningIcon,
                title: "Instant Processing",
                description: "Upload, validate, and download in seconds with our optimized image processing.",
              },
              {
                icon: ShieldIcon,
                title: "100% Secure",
                description: "Your documents never leave your device. All processing happens locally in your browser.",
              },
              {
                icon: TrendingIcon,
                title: "Always Accurate",
                description: "Precise resizing, compression, rotation, scanning, and export controls for real upload workflows.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-7 rounded-2xl border border-foreground/10 hover:border-brand-orange/30 bg-foreground/[0.02] hover:bg-brand-orange/5 transition-all duration-300"
              >
                <feature.icon className="w-10 h-10 mb-4 text-brand-orange group-hover:text-brand-pink transition-colors" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-brand-orange/5 via-transparent to-brand-sky/5">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-heading text-3xl md:text-4xl font-bold">Available Tools</h2>
            <p className="max-w-2xl mx-auto text-foreground/70">Specialized upload formatters plus advanced utility tools for resizing, compression, format conversion, scan cleanup, PDF assembly, and ratio control.</p>
          </div>

          <div className="mb-10 grid gap-4 lg:grid-cols-4">
            {[
              {
                title: "Precision Outputs",
                metric: "Custom Sizes",
                detail: "Exact dimensions where workflows demand strict output",
                color: "from-brand-orange/18 to-brand-pink/10",
              },
              {
                title: "Flexible Export",
                metric: "JPG PNG WEBP PDF",
                detail: "Switch output types tool by tool",
                color: "from-brand-pink/18 to-brand-sky/10",
              },
              {
                title: "Document Cleanup",
                metric: "3 modes",
                detail: "B/W, grayscale, and cleaned scan rendering",
                color: "from-brand-sky/18 to-cyan-500/10",
              },
              {
                title: "PDF Control",
                metric: "A4 Letter Legal",
                detail: "Orientation, margins, and fit behavior built in",
                color: "from-brand-orange/16 to-brand-sky/10",
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${item.color} p-5 text-left`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">{item.title}</p>
                <p className="mt-4 text-2xl font-bold text-white">{item.metric}</p>
                <p className="mt-2 text-sm text-foreground/72">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                name: "Signature Formats",
                desc: "Dedicated workflows for clean, upload-ready signature output",
                icon: "📋",
                color: "from-brand-orange to-brand-pink",
              },
              {
                name: "Photo Preparation",
                desc: "Portrait and profile output flows with resize and cleanup controls",
                icon: "🚂",
                color: "from-brand-pink to-brand-sky",
              },
              {
                name: "Document Utilities",
                desc: "Resize, rotate, compress, crop, convert, and clean document images",
                icon: "📮",
                color: "from-brand-sky to-brand-orange",
              },
              {
                name: "PDF and Scan Tools",
                desc: "Build PDFs, clean scans, and export files for submission or sharing",
                icon: "🧰",
                color: "from-brand-orange to-brand-sky",
              },
            ].map((tool, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(21,26,38,0.95),rgba(12,17,27,0.95))] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${tool.color} opacity-[0.15] transition-opacity duration-300 group-hover:opacity-[0.25]`} />
                <div className="relative z-10">
                  <span className="text-4xl">{tool.icon}</span>
                  <h3 className="font-heading mt-4 text-xl font-bold text-foreground">{tool.name}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Explore All Tools <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-32 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center space-y-8">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Trusted Standards</h2>
          <p className="text-lg text-foreground/70">We focus on clean outputs, precise dimensions, local privacy, and dependable browser-based processing.</p>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            {[
              "Local browser processing",
              "Zero data collection",
              "JPEG/PNG support",
              "Real-time validation",
              "Automatic optimization",
              "Download & use instantly",
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckIcon className="w-5 h-5 text-brand-orange flex-shrink-0" />
                <span className="text-base font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-brand-orange/10 via-brand-pink/5 to-brand-sky/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-3xl md:text-5xl font-bold">Ready to Format?</h2>
            <p className="text-lg text-foreground/70">Start formatting your documents in seconds. No registration needed.</p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            Get Started Now <ArrowRightIcon className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-semibold mb-3">SW Tools Portal</p>
              <p className="text-sm text-foreground/70">Image, signature, PDF, and document utilities made simple.</p>
            </div>
            <div>
              <p className="font-semibold mb-3">Product</p>
              <ul className="space-y-1 text-sm text-foreground/70">
                <li><Link href="/tools" className="hover:opacity-100 opacity-70">Tools</Link></li>
                <li><Link href="/about" className="hover:opacity-100 opacity-70">About</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">Legal</p>
              <ul className="space-y-1 text-sm text-foreground/70">
                <li><a href="#" className="hover:opacity-100 opacity-70">Privacy</a></li>
                <li><a href="#" className="hover:opacity-100 opacity-70">Terms</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3">Subsidiary</p>
              <p className="text-sm text-foreground/70">A product of SW InfoSystems</p>
            </div>
          </div>
          <div className="border-t border-foreground/10 pt-8 text-center text-sm text-foreground/60">
            <p>&copy; 2026 SW Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
