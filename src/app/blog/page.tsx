import Link from "next/link";
import { listPublishedPosts } from "@/lib/blog/queries";
import { Calendar, Clock, ChevronRight, BookOpen, ArrowRight, Rss } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & News | SW Tools",
  description: "Tech updates, India Post news, and practical guides. Stay informed with the latest from SW Tools.",
};

function estimateReadTime(post: any): number {
  try {
    const json = post.content_json as any;
    const text = JSON.stringify(json);
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  } catch {
    return 3;
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts(30);
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen">
      {/* Hero / Page Header */}
      <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-brand-orange/5 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20">
              <Rss size={12} className="text-brand-orange" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Live Feed</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic text-white leading-none">
            Stories &<br />
            <span className="bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange bg-clip-text text-transparent">
              Dispatches
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-white/50 text-lg font-medium leading-relaxed">
            Tech updates, India Post news, and practical guides for government employees.
          </p>
          <div className="mt-8 flex items-center gap-2 text-white/20 text-sm font-medium">
            <span>{posts.length} published</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Updated regularly</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Featured Post */}
        {featured && (
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-grow bg-white/5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Latest Story</span>
              <div className="h-px flex-grow bg-white/5" />
            </div>

            <Link href={`/blog/${featured.slug}`} className="group relative block overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] hover:border-brand-orange/20 transition-all duration-500">
              <div className="grid md:grid-cols-2">
                {/* Image Side */}
                <div className="relative overflow-hidden bg-white/[0.03] aspect-[4/3] md:aspect-auto">
                  {featured.cover_image_url ? (
                    <img
                      src={featured.cover_image_url}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={80} className="text-white/5" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#07090f]/80 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/80 to-transparent md:hidden" />
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-center p-10 md:p-14">
                  <div className="flex items-center gap-3 mb-6">
                    {featured.category && (
                      <span className="px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-[10px] font-black uppercase tracking-widest text-brand-orange">
                        {featured.category.name}
                      </span>
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Featured</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white group-hover:text-brand-orange transition-colors leading-[1.1]">
                    {featured.title}
                  </h2>

                  {featured.excerpt && (
                    <p className="mt-4 text-white/50 leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-8">
                    <div className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
                      <Calendar size={12} />
                      {featured.published_at ? formatDate(featured.published_at) : ""}
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30 text-xs font-medium">
                      <Clock size={12} />
                      {estimateReadTime(featured)} min read
                    </div>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-brand-orange font-bold text-sm group-hover:gap-4 transition-all">
                    Read Story
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Rest of posts grid */}
        {rest.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-grow bg-white/5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">More Stories</span>
              <div className="h-px flex-grow bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] hover:border-brand-orange/20 hover:bg-white/[0.04] transition-all duration-300"
                >
                  {/* Card Image */}
                  {post.cover_image_url ? (
                    <div className="relative overflow-hidden aspect-video">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/60 to-transparent" />
                      {post.category && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/10">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-white/[0.02] flex items-center justify-center border-b border-white/5">
                      <BookOpen size={32} className="text-white/5" />
                      {post.category && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/30 border border-white/10">
                            {post.category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="flex flex-col flex-grow p-6">
                    <h2 className="font-black text-white group-hover:text-brand-orange transition-colors tracking-tight leading-snug line-clamp-2">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="mt-2 text-sm text-white/40 line-clamp-2 leading-relaxed flex-grow">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-white/20 text-[10px] font-medium">
                          <Calendar size={10} />
                          {post.published_at ? formatDate(post.published_at) : ""}
                        </div>
                        <div className="flex items-center gap-1 text-white/20 text-[10px] font-medium">
                          <Clock size={10} />
                          {estimateReadTime(post)}m
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
              <BookOpen size={40} className="text-white/10" />
            </div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter">NO STORIES YET</h2>
            <p className="text-white/30 mt-2 max-w-sm">The chronicles are being written. Come back soon for the latest updates.</p>
          </div>
        )}
      </div>
    </main>
  );
}
