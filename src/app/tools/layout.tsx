import AdSlot from "@/components/AdSlot";
import { buildToolMetadata } from "@/lib/og-metadata";
import type { Metadata } from "next";
import ToolFaq from "@/components/ToolFaq";

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdSlot slotKey="tools-top" label="Tools Top Banner" />
      {children}
      <ToolFaq />
      <AdSlot slotKey="tools-bottom" label="Tools Bottom Banner" variant="inline" />
    </>
  );
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] } | any>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return {
      title: "All Tools",
      description:
        "Explore SW Tools for signature formatting, image resizing, compression, PDF creation, scan cleanup, format conversion, and more.",
      alternates: {
        canonical: "/tools",
      },
    };
  }

  const toolSlug = slug.join("/");
  const prettyName = toTitleCase(slug[slug.length - 1] ?? "tool");
  const title = `${prettyName}`;
  const description =
    "Use this tool online in your browser. Fast, secure and optimized for document and image workflows.";

  return buildToolMetadata(title, description, `/tools/${toolSlug}`);
}
