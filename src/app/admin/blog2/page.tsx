import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllPostsForAdmin, listCategories } from "@/lib/blog/admin-queries";
import { Plus, MessageSquare, FileText, Layout, Search, Filter, ArrowUpRight, CheckCircle, Pencil } from "lucide-react";
import PostList from "../blog/PostList"; // Reuse PostList for now but update links below if needed

export default async function AdminBlog2Page() {
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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-black uppercase tracking-widest">Experimental Console</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic font-outfit">
            Blog <span className="bg-gradient-to-r from-brand-orange to-indigo-400 bg-clip-text text-transparent">V2</span>
          </h1>
          <p className="text-white/40 text-lg max-w-xl font-medium leading-relaxed">
            Enhanced editor prototype with improved media rendering and social embed stability.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog2/new"
            className="ui-btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl shadow-brand-orange/20 group overflow-hidden relative"
          >
            <Plus size={22} className="group-hover:rotate-90 transition-transform" /> 
            <span className="font-bold text-lg">New Story (V2)</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Total Stories', value: stats.total, icon: FileText, color: 'text-white' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'In Progress', value: stats.drafts, icon: Pencil, color: 'text-brand-orange' },
          { label: 'Categories', value: stats.categories, icon: Layout, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="ui-modal-shell p-6 bg-white/[0.02] border-white/5 backdrop-blur-sm group transition-all">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-50`} />
              <ArrowUpRight className="w-4 h-4 text-white/10" />
            </div>
            <div className="text-3xl font-black text-white italic tracking-tighter">{stat.value}</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-white/30 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="ui-modal-shell bg-white/[0.01] border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-brand-orange rounded-full" />
            <h2 className="text-2xl font-black italic tracking-tight">Post <span className="text-white/40">Repository</span></h2>
          </div>
        </div>

        <div className="p-2">
          {/* Note: In a real app, we'd pass a custom link component to PostList to use /admin/blog2 */}
          <p className="p-8 text-white/30 text-sm">Use the "New Story" button above to test the V2 editor. Existing posts will still open in the V1 editor unless manually redirected.</p>
        </div>
      </div>
    </main>
  );
}
