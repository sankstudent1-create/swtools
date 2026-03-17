import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Syne } from "next/font/google";
import Script from "next/script";
import AdSlot from "@/components/AdSlot";
import Navigation from "@/components/Navigation";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "SW Tools | Image, PDF, Signature and Document Utilities",
    template: "%s | SW Tools",
  },
  description: "Professional browser-based tools for image resizing, compression, PDF creation, scan cleanup, signatures, photos, and document-ready exports.",
  keywords: [
    "signature formatter",
    "image resizer",
    "image compressor",
    "PDF maker",
    "document scanner",
    "image format converter",
    "passport photo tool",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SW Tools",
  },
  openGraph: {
    title: "SW Tools",
    description: "A premium toolkit for image, PDF, signature, scan, and document formatting workflows.",
    images: ["/brand/hero-ai-grid.svg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SW Tools",
    description: "Image, PDF, signature, and document formatting utilities in one place.",
    images: ["/brand/hero-ai-grid.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en">
      <body className={`${inter.variable} ${syne.variable} ${jetbrainsMono.variable} antialiased`}>
        {adsEnabled && adClient ? (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
          />
        ) : null}
        <PwaRegister />
        <Navigation />
        {adsEnabled ? <AdSlot slotKey="global-top" label="Global Top Banner" /> : null}
        {children}
        {adsEnabled ? <AdSlot slotKey="global-bottom" label="Global Footer Banner" /> : null}
      </body>
    </html>
  );
}
