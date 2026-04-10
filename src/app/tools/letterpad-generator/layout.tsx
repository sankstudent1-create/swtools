import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Letterpad Generator - Create Professional Government Letterpads",
  description: "AI-powered professional letterpad generator with 6 GoI templates, office presets, draggable logos, digital signatures, and Groq AI for intelligent letter generation.",
  keywords: "letterpad, government letter, business letter, company logo, letterhead generator, professional stationery, GoI letter, AI letter writer",
  openGraph: {
    title: "Advanced Letterpad Generator",
    description: "Create professionally formatted government & business letterpads with AI assistance, multiple templates, and full customization.",
  },
};

export default function LetterpadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
