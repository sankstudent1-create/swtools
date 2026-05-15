import { getPostsV3, getCategoriesV3, getCommentsV3 } from "./actions";
import Link from "next/link";
import { Plus, Layout, Eye, Edit, Trash2, Calendar, User, MessageSquare, Tag, ChevronRight, BarChart3, Activity, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const posts = await getPostsV3(false);
  const categories = await getCategoriesV3();
  const comments = await getCommentsV3();

  const stats = [
    { label: 'Total Stories', value: posts.length, icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-400/5' },
    { label: 'Categories', value: categories.length, icon: Tag, color: 'text-brand-orange', bg: 'bg-brand-orange/5' },
    { label: 'Comments', value: comments.length, icon: MessageSquare, color: 'text-sky-400', bg: 'bg-sky-400/5' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      {/* Premium Header */}
      <div className="relative mb-16">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">V3 Content Engine</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white leading-none">
              Blog <span className="bg-gradient-to-r from-brand-orange via-amber-400 to-indigo-400 bg-clip-text text-transparent italic">Console</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl leading-relaxed">
              Managing the next generation of resilient, media-rich content for SW Tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <Link 
              href="/admin/blog/categories"
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Tag size={16} /> Categories
            </Link>
            <Link 
              href="/admin/blog/comments"
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <MessageSquare size={16} /> Comments
            </Link>
            <Link 
              href="/admin/blog/new"
              className="px-8 py-3 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-brand-orange/20 transition-all group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              New V3 Story
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {stats.map((stat, i) => (
          <div key={i} className={`p-8 rounded-[2rem] border border-white/5 ${stat.bg} backdrop-blur-sm group hover:border-white/10 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <Activity size={16} className="text-white/5 group-hover:text-white/20 transition-colors" />
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-1">{stat.label}</div>
            <div className="text-4xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Posts Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-grow bg-white/5" />
        <span className="text-[10px] font-black uppercase tracking-widest text-white/20">All V3 Dispatches</span>
        <div className="h-px flex-grow bg-white/5" />
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <div key={post.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-brand-orange/20 transition-all duration-500 hover:-translate-y-1 shadow-2xl hover:shadow-brand-orange/5">
            <div className="aspect-video bg-white/5 relative overflow-hidden">
              {post.cover_image_url ? (
                <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10 italic font-black uppercase text-[10px] tracking-widest">
                  No Cover Artwork
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090f]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-6 right-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${
                  post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-brand-orange/20 text-brand-orange border-brand-orange/30'
                }`}>
                  {post.status}
                </span>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-orange">
                  <Layout size={12} />
                  {post.blog_categories_v3?.name || 'Unclassified'}
                </div>
                <h3 className="text-xl font-black tracking-tight text-white leading-[1.2] line-clamp-2 italic group-hover:text-brand-orange transition-colors">
                  {post.title}
                </h3>
              </div>
              
              <div className="flex items-center gap-4 text-white/20 pb-6 border-b border-white/5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                  <Calendar size={12} />
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Pending'}
                </div>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                  <Edit size={12} />
                  V3 System
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  href={`/admin/blog/edit/${post.id}`}
                  className="flex-grow py-4 rounded-2xl bg-white/5 hover:bg-brand-orange hover:text-white border border-white/5 text-white/60 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-brand-orange/20"
                >
                  <Edit size={16} /> Edit Dispatch
                </Link>
                <Link 
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white flex items-center justify-center transition-all group/btn"
                  title="View Live"
                >
                  <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full p-32 text-center ui-modal-shell border-white/5 bg-white/[0.02] rounded-[3rem]">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <FileText size={48} className="text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">The desk is clear</h3>
            <p className="text-white/30 text-lg">No V3 dispatches have been drafted yet.</p>
            <Link href="/admin/blog/new" className="mt-8 inline-flex items-center gap-2 text-brand-orange font-bold hover:gap-4 transition-all uppercase tracking-widest text-[10px]">
              Create First Post <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


