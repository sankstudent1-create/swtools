import type { Metadata } from "next";
import { getPublishedPostBySlug } from "@/lib/blog/queries";
import { buildPostDescription, buildPostKeywords } from "@/lib/blog/seo";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tools.swinfosystems.online";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog",
      alternates: { canonical: `/blog/${slug}` },
    };
  }

  const canonicalPath = post.canonical_path ?? `/blog/${post.slug}`;
  const description = buildPostDescription(
    post.seo_description ?? post.excerpt,
    "Latest news and updates from SW Tools."
  );

  const keywords =
    post.seo_keywords?.length
      ? post.seo_keywords
      : buildPostKeywords({
          title: post.seo_title ?? post.title,
          category: post.category?.name ?? null,
        });

  const title = post.seo_title ?? post.title;
  const absoluteUrl = `${SITE.replace(/\/+$/, "")}${canonicalPath}`;

  return {
    title: {
      default: title,
      template: "%s | SW Tools",
    },
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      siteName: "SW Tools",
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
      locale: "en_IN",
      type: "article",
    },
    twitter: {
      card: post.cover_image_url ? "summary_large_image" : "summary",
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return children;
}
