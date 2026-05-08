"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

type FaqItem = {
  q: string;
  a: string;
};

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function faqForToolSlug(toolSlug: string): FaqItem[] {
  const toolName = toTitleCase(toolSlug.split("/").pop() ?? toolSlug);

  const map: Record<string, FaqItem[]> = {
    "image-resizer": [
      {
        q: "How do I resize an image without losing quality?",
        a: "Use a target size close to the original and export as PNG for lossless output or JPEG/WebP with a higher quality slider. Avoid extreme upscaling.",
      },
      {
        q: "Does SW Tools upload my images to a server?",
        a: "No. The resize happens in your browser so your files stay on your device.",
      },
      {
        q: "Which format should I choose (JPG/PNG/WebP)?",
        a: "JPG is best for photos, PNG for sharp text/logos, and WebP for smaller size with good quality.",
      },
    ],
    "image-compressor": [
      {
        q: "How can I reduce image size to a specific KB limit?",
        a: "Lower the quality slider and (if needed) reduce width/height. Smaller pixel dimensions reduce file size the most.",
      },
      {
        q: "Will compression affect clarity for documents?",
        a: "For scanned text, prefer PNG/WebP or keep JPEG quality higher to avoid artifacts around letters.",
      },
      {
        q: "Is compression done online or locally?",
        a: "It is processed locally in your browser for privacy.",
      },
    ],
    "pdf-maker": [
      {
        q: "How do I convert images to a single PDF?",
        a: "Upload images in order, choose page size/orientation, and generate the PDF. You can then download the final file.",
      },
      {
        q: "Can I make a PDF for printing (A4)?",
        a: "Yes. Select A4 and set margins. Use a fit mode that avoids cropping important content.",
      },
      {
        q: "Are my files uploaded?",
        a: "No. The PDF is created in your browser.",
      },
    ],
    "pdf-editor": [
      {
        q: "Can I edit a PDF without uploading it?",
        a: "Yes. The editor runs in your browser so your PDF stays on your device.",
      },
      {
        q: "Can I add text and signatures?",
        a: "You can add text elements and signatures, then export a new PDF.",
      },
      {
        q: "Why is my PDF slow to load?",
        a: "Very large PDFs take longer to render. Reduce zoom or work with fewer pages at a time.",
      },
    ],
    "ssc": [
      {
        q: "How do I create an SSC-ready signature image?",
        a: "Upload your signature, adjust to the required dimensions/size, and download the formatted output for SSC portals.",
      },
      {
        q: "Will it meet SSC upload limits?",
        a: "The tool is designed to help you match common SSC pixel and KB constraints. Always verify the latest notification requirements.",
      },
      {
        q: "Is it safe for personal documents?",
        a: "Yes—processing is done in your browser.",
      },
    ],
  };

  return (
    map[toolSlug] ?? [
      {
        q: `What is ${toolName} used for?`,
        a: `${toolName} helps you complete this task directly in the browser with SW Tools.` ,
      },
      {
        q: "Does this tool upload my files?",
        a: "No. Processing happens locally in your browser for better privacy.",
      },
      {
        q: "Why is this page useful for government/job portal uploads?",
        a: "Many portals require strict image/PDF size and formatting. This tool helps you generate compliant files quickly.",
      },
    ]
  );
}

export default function ToolFaq() {
  const pathname = usePathname();

  const items = useMemo(() => {
    const cleaned = (pathname ?? "").split("?")[0];
    const parts = cleaned.split("/").filter(Boolean);
    if (parts[0] !== "tools") return [];
    const slug = parts.slice(1).join("/");
    if (!slug) return [];
    return faqForToolSlug(slug);
  }, [pathname]);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 md:px-6">
      <div className="ui-modal-shell p-6">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={item.q} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-foreground/75">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
