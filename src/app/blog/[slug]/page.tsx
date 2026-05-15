import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { getPublishedPostBySlug, listPublishedPosts } from "@/lib/blog/queries";
import { renderTipTapToHtml } from "@/lib/blog/render";
import { Calendar, Clock, Tag, ChevronLeft, ArrowRight, Share2, BookOpen } from "lucide-react";

function BlockRenderer({ block }: { block: any }) {
  switch (block.type) {
    case 'heading':
      const Tag = `h${block.content.level || 2}` as keyof JSX.IntrinsicElements;
      return <Tag className="text-3xl md:text-4xl font-black tracking-tight text-white italic mt-12 mb-6">{block.content.text}</Tag>;
    case 'text':
      return <p className="text-lg text-white/70 leading-relaxed mb-6 whitespace-pre-wrap">{block.content.text}</p>;
    case 'image':
      return (
        <figure className="my-12 space-y-3">
          <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/5">
            <img src={block.content.src} alt={block.content.alt} className="w-full h-auto" />
          </div>
          {block.content.alt && (
            <figcaption className="text-center text-[10px] font-black uppercase tracking-widest text-white/20">
              {block.content.alt}
            </figcaption>
          )}
        </figure>
      );
    case 'youtube':
      let videoId = '';
      if (block.content.src.includes('v=')) {
        videoId = block.content.src.split('v=')[1].split('&')[0];
      } else if (block.content.src.includes('youtu.be/')) {
        videoId = block.content.src.split('youtu.be/')[1].split('?')[0];
      } else if (block.content.src.includes('youtube.com/live/')) {
        videoId = block.content.src.split('/live/')[1].split('?')[0];
      } else {
        videoId = block.content.src.split('/').pop()?.split('?')[0] || block.content.src;
      }
        
      return (
        <div className="my-12 aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    default:
      return null;
  }
}

function estimateReadTime(post: any): number {
  try {
    const blocks = post.content_blocks || [];
    const text = blocks.map((b: any) => b.content?.text || '').join(' ');
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  } catch {
    return 3;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return notFound();

  const published = post.published_at ? new Date(post.published_at) : null;
  const readTime = estimateReadTime(post);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: published ? published.toISOString() : undefined,
    dateModified: new Date(post.updated_at).toISOString(),
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
  };

  // Fetch related posts
  const allPosts = await listPublishedPosts(6);
  const related = allPosts.filter(p => p.slug !== slug && p.category?.id === post.category?.id).slice(0, 3);

  return (

    <>
      <Script
        id="post-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {/* No more twitter/instagram scripts needed if using standard V3 blocks for now */}


      <main className="min-h-screen">
        {/* Hero */}
        <div className="relative overflow-hidden">
          {/* Background image blur */}
          {post.cover_image_url && (
            <div className="absolute inset-0 -z-10">
              <img
                src={post.cover_image_url}
                alt=""
                className="w-full h-full object-cover scale-110 blur-2xl opacity-10"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#07090f]/50 via-[#07090f]/80 to-[#07090f]" />
            </div>
          )}

          <div className="mx-auto max-w-4xl px-6 pt-28 pb-12">
            {/* Back link */}
            <Link href="/blog" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs font-bold uppercase tracking-widest transition-colors mb-10 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              All Stories
            </Link>

            {/* Category & meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {post.category && (
                <Link href={`/blog?category=${post.category.slug}`} className="px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-black uppercase tracking-widest text-brand-orange hover:bg-brand-orange/20 transition-colors">
                  {post.category.name}
                </Link>
              )}
              <div className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
                <Clock size={12} />
                {readTime} min read
              </div>
              {published && (
                <div className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
                  <Calendar size={12} />
                  {formatDate(published.toISOString())}
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.05] text-white font-outfit">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mt-5 text-xl text-white/50 leading-relaxed max-w-2xl">
                {post.excerpt}
              </p>
            )}

            {/* Author row */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                  <span className="text-sm font-black text-white/60">
                    {post.author?.full_name?.charAt(0) || "S"}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{post.author?.full_name || "SW Tools"}</div>

                  <div className="text-[11px] text-white/30">Author</div>
                </div>
              </div>


              <button
                onClick={undefined}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white text-xs font-bold transition-all"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="mx-auto max-w-5xl px-6 mb-0">
            <div className="overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full aspect-video object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="mx-auto max-w-4xl px-6 py-16">
          <article className="prose prose-invert max-w-none">
            {post.content_blocks?.map((block: any) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </article>


          {/* SEO Tags */}
          {post.seo_keywords?.length > 0 && (
            <div className="mt-16 pt-8 border-t border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={12} className="text-white/20" />
                {post.seo_keywords.map(kw => (
                  <span key={kw} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-white/30">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="border-t border-white/5 bg-white/[0.01]">
            <div className="mx-auto max-w-7xl px-6 py-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black tracking-tighter text-white">More Stories</h2>
                <Link href="/blog" className="flex items-center gap-1 text-xs font-bold text-white/30 hover:text-brand-orange transition-colors">
                  View all
                  <ArrowRight size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(rel => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    className="group flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-orange/20 overflow-hidden transition-all duration-300"
                  >
                    {rel.cover_image_url ? (
                      <div className="relative overflow-hidden aspect-video">
                        <img src={rel.cover_image_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/60 to-transparent" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-white/[0.02] flex items-center justify-center">
                        <BookOpen size={24} className="text-white/5" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col gap-2">
                      {rel.category && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-orange">{rel.category.name}</span>
                      )}
                      <h3 className="font-black text-white group-hover:text-brand-orange transition-colors tracking-tight leading-snug line-clamp-2">
                        {rel.title}
                      </h3>
                      <div className="flex items-center gap-1 text-white/20 text-[10px] font-medium mt-1">
                        <Clock size={9} />
                        {estimateReadTime(rel)} min read
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
