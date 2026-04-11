import type { MetadataRoute } from "next";

const routes = [
  "",
  "/about",
  "/tools",
  "/tools/ssc",
  "/tools/rrb",
  "/tools/india-post-photo",
  "/tools/india-post-signature",
  "/tools/bank-thumb",
  "/tools/ibps-declaration",
  "/tools/neet-signature",
  "/tools/image-resizer",
  "/tools/image-compressor",
  "/tools/aspect-ratio-changer",
  "/tools/pdf-maker",
  "/tools/image-scanner",
  "/tools/image-format-converter",
  "/tools/image-rotate-flip",
  "/tools/image-cropper",
  "/tools/watermark-stamper",
  "/tools/bulk-image-converter",
  "/tools/letterpad-generator",
  "/tools/gds-leave",
  "/tools/td-commission",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/tools" ? 0.9 : 0.8,
  }));
}
