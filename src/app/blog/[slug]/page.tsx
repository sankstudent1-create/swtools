import { notFound } from "next/navigation";
import Script from "next/script";
import { getPublishedPostBySlug } from "@/lib/blog/queries";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return notFound();

  const published = post.published_at ? new Date(post.published_at) : null;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: published ? published.toISOString() : undefined,
    dateModified: new Date(post.updated_at).toISOString(),
    author: post.author?.full_name
      ? { "@type": "Person", name: post.author.full_name }
      : undefined,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 md:px-6">
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <header className="mb-8">
        <div className="text-xs text-foreground/60">
          {post.category?.name ? post.category.name : "General"}
          {published ? ` • ${published.toLocaleDateString()}` : ""}
        </div>
        <h1 className="mt-2 text-4xl font-bold">{post.title}</h1>
        {post.excerpt && (
          <p className="mt-3 text-foreground/70">{post.excerpt}</p>
        )}
      </header>

      <article className="ui-modal-shell p-6">
        <pre className="whitespace-pre-wrap text-sm text-foreground/80">
          {JSON.stringify(post.content_json, null, 2)}
        </pre>
      </article>
    </main>
  );
}
