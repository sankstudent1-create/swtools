import type { MetadataRoute } from "next";

import { readdir } from "node:fs/promises";
import path from "node:path";
import { getPostsV3 } from "@/lib/blog-v3/queries";

const EXCLUDED_APP_ROUTES = new Set([
  "api",
  "admin",
  "auth",
  "dashboard",
]);

async function collectAppRoutes(): Promise<string[]> {
  const appDir = path.join(process.cwd(), "src", "app");
  const routes = new Set<string>();

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (dir === appDir && EXCLUDED_APP_ROUTES.has(entry.name)) continue;
        if (entry.name.startsWith("_")) continue;
        await walk(absolute);
        continue;
      }

      if (!entry.isFile()) continue;
      if (entry.name !== "page.tsx" && entry.name !== "page.jsx") continue;

      const relativeDir = path.relative(appDir, dir);
      if (!relativeDir) {
        routes.add("");
        continue;
      }

      const segments = relativeDir
        .split(path.sep)
        .filter(Boolean)
        .filter((segment) => !segment.startsWith("("))
        .filter((segment) => !segment.startsWith("@"))
        .filter((segment) => !segment.startsWith("["));

      if (segments.length === 0) {
        routes.add("");
      } else {
        routes.add(`/${segments.join("/")}`);
      }
    }
  }

  await walk(appDir);

  return Array.from(routes).sort((a, b) => a.localeCompare(b));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tools.swinfosystems.online";
  const siteUrl = rawSiteUrl.replace(/\/+$/, "");
  const now = new Date();
  
  // Collect static routes
  const routes = await collectAppRoutes();
  const baseRoutes = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly" as any,
    priority: route === "" ? 1 : route === "/tools" ? 0.9 : 0.8,
  }));

  // Collect blog posts
  let blogRoutes: any[] = [];
  try {
    const posts = await getPostsV3(true);
    blogRoutes = posts.map((post: any) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || post.created_at),
      changeFrequency: "weekly" as any,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error);
  }

  return [...baseRoutes, ...blogRoutes];
}
