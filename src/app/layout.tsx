import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import AdSlot from "@/components/AdSlot";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
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
  description: "SW Tools is a premium suite of browser-based utilities for government employees, students, and professionals. Access the best tools for image compression, signature formatting, passport photo generation, PDF making, GDS leave forms, and official letterpads.",
  keywords: [
    "SW Tools",
    "Sanket Wanve Infosystems tools",
    "government employee tools",
    "India Post tools",
    "GDS leave application",
    "BPM incentive bill",
    "student document formatter",
    "signature formatting tool",
    "passport photo maker",
    "image resizer and compressor",
    "PDF compiler",
    "ssc rrb exam signature",
    "official letterhead generator",
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
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
        <Footer />
      </body>
    </html>
  );
}
