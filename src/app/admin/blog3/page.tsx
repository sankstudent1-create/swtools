import { getPostsV3, getCategoriesV3 } from "./actions";
import Link from "next/link";
import { Plus, Layout, Eye, Edit, Trash2, Calendar, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Blog3AdminPage() {
  const posts = await getPostsV3();
  const categories = await getCategoriesV3();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white italic">
            Blog <span className="bg-gradient-to-r from-brand-orange to-indigo-400 bg-clip-text text-transparent">V3 Console</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-2">Next-Gen Media Integrity System</p>
        </div>
        <Link 
          href="/admin/blog3/new"
          className="px-8 py-4 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black flex items-center gap-3 shadow-2xl shadow-brand-orange/20 transition-all group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
          Create V3 Story
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: any) => (
          <div key={post.id} className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden group hover:border-brand-orange/20 transition-all">
            <div className="aspect-video bg-white/5 relative">
              {post.cover_image_url ? (
                <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10 italic font-black uppercase text-[10px] tracking-widest">
                  No Cover Artwork
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                  post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                }`}>
                  {post.status}
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-black tracking-tight text-white leading-tight line-clamp-2 italic">{post.title}</h3>
              
              <div className="flex items-center gap-4 text-white/20">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                  <Layout size={12} className="text-brand-orange" />
                  {post.blog_categories_v3?.name || 'Unclassified'}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                  <Calendar size={12} />
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Pending'}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <Link 
                  href={`/admin/blog3/edit/${post.id}`}
                  className="flex-grow py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Edit size={14} /> Edit
                </Link>
                <Link 
                  href={`/blog3/${post.slug}`}
                  target="_blank"
                  className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white flex items-center justify-center transition-all"
                >
                  <Eye size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
