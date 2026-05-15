import { getPostsV3 } from "../admin/blog3/actions";
import Link from "next/link";
import { Calendar, User, ArrowRight, Layout } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Blog3PublicPage() {
  const posts = await getPostsV3();
  const publishedPosts = posts.filter((p: any) => p.status === 'published');

  return (
    <div className="min-h-screen bg-[#07090f]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white italic leading-tight mb-6">
              THE <span className="bg-gradient-to-r from-brand-orange to-indigo-400 bg-clip-text text-transparent underline decoration-brand-orange/20">V3 STORIES</span>
            </h1>
            <p className="text-xl text-white/40 font-medium leading-relaxed max-w-2xl">
              Exploring the intersection of technology, design, and intelligence. Our latest insights, built on a robust core.
            </p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {publishedPosts.map((post: any) => (
              <Link 
                key={post.id} 
                href={`/blog3/${post.slug}`}
                className="group block space-y-6"
              >
                <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-white/5 border border-white/5 relative">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10 italic font-black uppercase text-[10px] tracking-widest">
                      No Artwork
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    <span className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-[10px]">
                      Read Story <ArrowRight size={14} />
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white/20">
                    <span className="px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase tracking-widest border border-brand-orange/20">
                      {post.blog_categories_v3?.name || 'Story'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={12} /> {new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white group-hover:text-brand-orange transition-colors italic leading-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
                    {post.excerpt || "No summary available for this story."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          
          {publishedPosts.length === 0 && (
            <div className="text-center py-40 bg-white/[0.01] border border-dashed border-white/5 rounded-3xl">
              <h3 className="text-2xl font-black text-white/20 italic uppercase tracking-tighter">No stories published yet</h3>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
