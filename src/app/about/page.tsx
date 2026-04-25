"use client";

import Link from "next/link";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function LightbulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface TeamMember {
  name: string;
  role: string;
  description: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "SW InfoSystems",
    role: "Founded 2008",
    description: "Established tech company specializing in practical software products for education, operations, publishing, and enterprise workflows.",
  },
  {
    name: "SW Tools Team",
    role: "Dedicated Developers",
    description: "Engineers focused on building reliable, fast, browser-based tools for document handling, image cleanup, and export workflows.",
  },
];

const values = [
  {
    icon: LightbulbIcon,
    title: "Innovation",
    description: "Constantly improving our tools with latest technologies and best practices.",
  },
  {
    icon: HeartIcon,
    title: "Reliability",
    description: "Building tools you can trust for important uploads, exports, and document workflows.",
  },
  {
    icon: UsersIcon,
    title: "User-Centric",
    description: "Designing intuitive interfaces that work for everyone.",
  },
  {
    icon: GlobeIcon,
    title: "Accessibility",
    description: "Making document formatting simple and accessible for students, applicants, creators, and teams.",
  },
];

export default function AboutPage() {
  const websiteUrl = process.env.NEXT_PUBLIC_COMPANY_WEBSITE ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.swinfosystems.com";
  const websiteLabel = websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange/10 via-brand-pink/5 to-brand-sky/10" />
        
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="space-y-6 animate-fade-in-up">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
                About
                <span className="block bg-gradient-to-r from-brand-orange via-brand-pink to-brand-sky bg-clip-text text-transparent">
                  SW Tools Portal
                </span>
              </h1>
              <p className="max-w-2xl text-lg md:text-xl text-foreground/75 leading-relaxed">
                A product of SW InfoSystems. We build browser-based tools that simplify image prep, signature workflows, PDF generation, scan cleanup, and document-ready exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
              <p className="text-lg text-foreground/75 leading-relaxed">
                To provide fast, reliable, and accessible tools for formatting images and documents directly in the browser. We believe people should focus on their application, publishing, or submission goals, not on wrestling with file specs and export settings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, idx) => (
                <div key={idx} className="space-y-3">
                  <value.icon className="w-10 h-10 text-brand-orange" />
                  <h3 className="text-lg font-semibold">{value.title}</h3>
                  <p className="text-foreground/70">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-brand-orange/5 via-transparent to-brand-sky/5 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="space-y-12">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">About SW InfoSystems</h2>
              <p className="text-lg text-foreground/70">Building software solutions since 2008</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">🏢</span> Company Background
                </h3>
                <p className="text-foreground/75 leading-relaxed">
                    SW InfoSystems is an established technology company with over 15 years of experience. We build software for education, operations, business workflows, and digital document handling across India.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-2xl">🎯</span> SW Tools Portal
                </h3>
                <p className="text-foreground/75 leading-relaxed">
                  SW Tools Portal is our utility-focused product for image and document preparation. It combines exact-format upload tools with broader utilities like resizing, compression, conversion, scanning, rotation, and PDF creation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose SW Tools?</h2>
              <p className="text-lg text-foreground/70">What sets us apart from other formatting tools</p>
            </div>

            <div className="grid gap-6">
              {[
                {
                  title: "100% Offline Processing",
                  desc: "All image processing happens in your browser. Your documents never touch our servers, ensuring complete privacy.",
                },
                {
                  title: "Practical Specifications",
                  desc: "We build tools around real output needs like dimensions, size windows, quality targets, scan cleanup, and export flexibility.",
                },
                {
                  title: "Zero Cost",
                  desc: "Completely free to use. No registration, no hidden fees, no watermarks. Just upload and download.",
                },
                {
                  title: "Instant Validation",
                  desc: "Real-time validation feedback as you upload. Know exactly what needs to be fixed before submission.",
                },
                {
                  title: "Trusted by Thousands",
                  desc: "Built for repeat use across signatures, photos, forms, PDFs, and document preparation workflows.",
                },
                {
                  title: "Responsive Design",
                  desc: "Works perfectly on desktop, tablet, and mobile. Format your documents anytime, anywhere.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl border border-foreground/10 hover:border-brand-orange/30 hover:bg-brand-orange/5 transition-all">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-brand-orange to-brand-pink text-white font-semibold">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-foreground/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-brand-orange/10 via-brand-pink/5 to-brand-sky/10 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Get in Touch</h2>
            <p className="text-lg text-foreground/70">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="p-6 rounded-xl border border-foreground/10 bg-background/50">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="font-semibold mb-2">Website</h3>
              <p className="text-foreground/70">
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">
                  {websiteLabel}
                </a>
              </p>
            </div>

            <div className="p-6 rounded-xl border border-foreground/10 bg-background/50">
              <div className="text-3xl mb-3">📍</div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-foreground/70">India</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-foreground/10">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Format Your Documents?</h2>
            <p className="text-lg text-foreground/70">Access our tools and start preparing cleaner, smaller, and more usable files in seconds.</p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 px-10 py-5 text-lg font-semibold rounded-xl bg-gradient-to-r from-brand-orange to-brand-pink text-white hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            Go to Tools
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
          <p className="text-sm text-foreground/60">
            &copy; 2026 SW Tools. A product of SW InfoSystems. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
