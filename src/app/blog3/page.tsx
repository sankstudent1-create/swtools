import { getPostsV3 } from "../admin/blog3/actions";
import Link from "next/link";
import { Calendar, User, ArrowRight, Layout, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

function estimateReadTime(blocks: any[]): number {
  try {
    const text = blocks.map(b => b.content.text || '').join(' ');
    const words = text.split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  } catch {
    return 3;
  }
}

export default async function Blog3PublicPage() {
  const posts = await getPostsV3();
  const publishedPosts = posts.filter((p: any) => p.status === 'published');
  const [featured, ...rest] = publishedPosts;

  return (
    <div className="min-h-screen bg-[#07090f]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                <Layout size={12} className="text-brand-orange" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">V3 Chronicle</span>
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white italic leading-tight mb-6">
              THE <span className="bg-gradient-to-r from-brand-orange to-indigo-400 bg-clip-text text-transparent underline decoration-brand-orange/20">V3 STORIES</span>
            </h1>
            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl italic">
              Stories built to last. Our new resilient media architecture ensures every artwork, video, and insight stays perfect forever.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Featured Post */}
          {featured && (
            <div className="mb-24">
              <div className="flex items-center gap-3 mb-10">
                <div className="h-px flex-grow bg-white/5" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Featured Insight</span>
                <div className="h-px flex-grow bg-white/5" />
              </div>

              <Link href={`/blog3/${featured.slug}`} className="group block relative rounded-[40px] overflow-hidden border border-white/5 bg-white/[0.02] hover:border-brand-orange/20 transition-all duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-[16/10] lg:aspect-auto relative overflow-hidden bg-white/5">
                    {featured.cover_image_url ? (
                      <img src={featured.cover_image_url} alt={featured.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-white/10 italic">Artwork Pending</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#07090f]/80 hidden lg:block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/80 to-transparent lg:hidden" />
                  </div>
                  
                  <div className="p-10 md:p-20 flex flex-col justify-center space-y-8">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase tracking-widest border border-brand-orange/20">
                        {featured.blog_categories_v3?.name || 'Story'}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">
                        <Calendar size={12} /> {new Date(featured.published_at || featured.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white group-hover:text-brand-orange transition-colors italic leading-[0.95]">
                      {featured.title}
                    </h2>

                    <p className="text-lg text-white/40 font-medium leading-relaxed italic line-clamp-3">
                      {featured.excerpt}
                    </p>

                    <div className="pt-4 flex items-center gap-3 text-brand-orange font-black uppercase tracking-widest text-[11px] group-hover:gap-6 transition-all">
                      Read Story <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Grid Section */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-px flex-grow bg-white/5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Archive & Updates</span>
            <div className="h-px flex-grow bg-white/5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post: any) => (
              <Link 
                key={post.id} 
                href={`/blog3/${post.slug}`}
                className="group block bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden hover:border-brand-orange/20 hover:bg-white/[0.03] transition-all"
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-white/5 border-b border-white/5">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 italic font-black uppercase text-[10px] tracking-widest">
                      V3 ARTWORK
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/60 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[8px] font-black uppercase tracking-widest text-white/70 border border-white/10">
                      {post.blog_categories_v3?.name || 'STORY'}
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <h3 className="text-xl font-black tracking-tight text-white group-hover:text-brand-orange transition-colors italic leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/30 text-xs font-medium leading-relaxed line-clamp-2">
                    {post.excerpt || "No summary available for this story."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4 text-white/20">
                      <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={12} /> {new Date(post.published_at || post.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} className="text-brand-orange" /> {estimateReadTime(post.content_blocks)}m
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-white/10 group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {publishedPosts.length === 0 && (
            <div className="text-center py-40 bg-white/[0.01] border border-dashed border-white/5 rounded-[40px]">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Layout size={32} className="text-white/10" />
              </div>
              <h3 className="text-2xl font-black text-white/20 italic uppercase tracking-tighter">The chronicles are empty</h3>
              <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest mt-2">Publish your first V3 story to begin</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
