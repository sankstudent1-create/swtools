import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllPostsForAdmin, listCategories } from "@/lib/blog/admin-queries";
import { Plus, MessageSquare, FileText, Layout, Search, Filter, ArrowUpRight, Clock, CheckCircle, Pencil } from "lucide-react";
import ConnectionDiagnostic from "./ConnectionDiagnostic";
import PostList from "./PostList";

export default async function AdminBlogPage() {
  const { isAdmin, user } = await requireAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#07090f]">
        <div className="w-full max-w-md ui-modal-shell p-10 text-center border-red-500/20 bg-red-500/5 backdrop-blur-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Layout className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2">ACCESS <span className="text-red-500">DENIED</span></h1>
          <p className="text-white/50 leading-relaxed">
            Administrative privileges required. 
            {user && <span className="block mt-1 text-white/30 text-xs font-mono">Authenticated as {user.email}</span>}
          </p>
          <div className="mt-10">
            <Link className="ui-btn-secondary w-full py-4 rounded-2xl font-bold border-white/10 hover:bg-white/5" href="/dashboard">Return to Dashboard</Link>
          </div>
        </div>
      </main>
    );
  }

  const posts = await listAllPostsForAdmin() || [];
  const categories = await listCategories() || [];
  
  const stats = {
    total: posts.length,
    published: posts.filter((p: any) => p.status === 'published').length,
    drafts: posts.filter((p: any) => p.status === 'draft').length,
    categories: categories.length
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pt-24 pb-24 md:px-8 relative">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-widest">Admin Console</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic">
            Blog <span className="bg-gradient-to-r from-brand-orange to-indigo-400 bg-clip-text text-transparent">Nexus</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl font-medium leading-relaxed">
            The central hub for SWTools storytelling, technical deep-dives, and India Post community updates.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog/new"
            className="ui-btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl shadow-brand-orange/20 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Plus size={22} className="group-hover:rotate-90 transition-transform" /> 
            <span className="font-bold text-lg">New Story</span>
          </Link>
        </div>
      </div>

      {/* Stats QuickView */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Total Stories', value: stats.total, icon: FileText, color: 'text-white' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'In Progress', value: stats.drafts, icon: Pencil, color: 'text-brand-orange' },
          { label: 'Categories', value: stats.categories, icon: Layout, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="ui-modal-shell p-6 bg-white/[0.02] border-white/5 backdrop-blur-sm group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
            </div>
            <div className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-white/30 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          {/* Post Management Container */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none" />
            
            <div className="relative ui-modal-shell bg-white/[0.01] border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
              <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-brand-orange rounded-full" />
                  <h2 className="text-2xl font-black italic tracking-tight">Post <span className="text-white/40">Repository</span></h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text" 
                      placeholder="Find a story..." 
                      className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 w-64 transition-all hover:bg-white/[0.07]"
                    />
                  </div>
                  <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                    <Filter size={20} />
                  </button>
                </div>
              </div>

              <div className="p-2">
                <PostList initialPosts={posts} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Tools Section */}
      <div className="mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          <h2 className="text-xl font-bold tracking-tight">Management <span className="text-white/20 uppercase text-xs font-black tracking-widest ml-2">Utilities</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/blog/categories" className="group block h-full">
            <div className="ui-modal-shell p-10 h-full border-white/5 bg-white/[0.01] hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all rounded-[2rem] relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layout size={160} />
              </div>
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <Layout className="text-indigo-400" size={32} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-4 group-hover:text-indigo-400 transition-colors">Categories</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-8">Architect the taxonomy of your blog. Organize content into specialized domains.</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:translate-x-2 transition-transform">
                Configure Sections <ArrowUpRight size={14} />
              </div>
            </div>
          </Link>

          <Link href="/admin/blog/comments" className="group block h-full">
            <div className="ui-modal-shell p-10 h-full border-white/5 bg-white/[0.01] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all rounded-[2rem] relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <MessageSquare size={160} />
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-fit mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <MessageSquare className="text-emerald-400" size={32} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-4 group-hover:text-emerald-400 transition-colors">Discourse</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-8">Moderate community interactions. Review, reply, and manage reader engagement.</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 group-hover:translate-x-2 transition-transform">
                Audit Comments <ArrowUpRight size={14} />
              </div>
            </div>
          </Link>

          <Link href="/admin/blog/media" className="group block h-full">
            <div className="ui-modal-shell p-10 h-full border-white/5 bg-white/[0.01] hover:border-rose-500/30 hover:bg-rose-500/[0.02] transition-all rounded-[2rem] relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileText size={160} />
              </div>
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 w-fit mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <FileText className="text-rose-400" size={32} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-4 group-hover:text-rose-400 transition-colors">Vault</h3>
              <p className="text-sm text-white/40 leading-relaxed mb-8">Centralized asset management. Organize images, PDFs, and rich media resources.</p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-400 group-hover:translate-x-2 transition-transform">
                Open Library <ArrowUpRight size={14} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Hidden Diagnostic Tool - Accessible via hotkey or scroll */}
      <div className="mt-32 opacity-10 hover:opacity-100 transition-opacity">
        <ConnectionDiagnostic />
      </div>
    </main>
  );
}
