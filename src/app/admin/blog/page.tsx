import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllPostsForAdmin } from "@/lib/blog/admin-queries";
import { Plus, Edit, Eye, MessageSquare, FileText, Layout, Search, Filter, MoreVertical, Trash2 } from "lucide-react";
import ConnectionDiagnostic from "./ConnectionDiagnostic";

export default async function AdminBlogPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return null;

  const posts = await listAllPostsForAdmin();

  return (
    <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-6">
      {/* Connection Diagnostic Tool */}
      <ConnectionDiagnostic />

      {/* Header with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Blog Management</h1>
          <p className="text-white/50 mt-1">Manage your stories, tech updates, and India Post news.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog/new"
            className="ui-btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-brand-orange/10"
          >
            <Plus size={20} /> 
            <span className="font-semibold">Create Post</span>
          </Link>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Search posts..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors">
            <Filter size={16} /> Filter
          </button>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <span className="text-white/40">Total: {posts?.length || 0} posts</span>
        </div>
      </div>

      {/* Posts Table/List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Post Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70">Last Updated</th>
                <th className="px-6 py-4 text-sm font-semibold text-white/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {posts?.map((post) => (
                <tr key={post.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white group-hover:text-brand-orange transition-colors">
                        {post.title}
                      </span>
                      <span className="text-[11px] text-white/30 font-mono mt-0.5">/{post.slug}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {post.category && !Array.isArray(post.category) ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {(post.category as any).name}
                      </span>
                    ) : (
                      <span className="text-white/20 text-xs">Uncategorized</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        post.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        post.status === "published" ? "bg-emerald-400" : "bg-orange-400"
                      }`} />
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40">
                    {new Date(post.updated_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="View Post"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/admin/blog/edit/${post.id}`}
                        className="p-2 rounded-lg text-white/40 hover:text-indigo-400 hover:bg-indigo-400/10 transition-all"
                        title="Edit Post"
                      >
                        <Edit size={18} />
                      </Link>
                      <button className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!posts || posts.length === 0) && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <FileText size={32} className="text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white">No posts found</h3>
            <p className="text-white/40 mt-1 max-w-xs mx-auto">Get started by creating your first blog post to share with your audience.</p>
          </div>
        )}
      </div>

      {/* Tools Cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/blog/categories" className="group block">
          <div className="ui-modal-shell p-8 h-full border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/[0.02] transition-all">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 w-fit mb-6 group-hover:scale-110 transition-transform">
              <Layout className="text-indigo-400" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">Categories</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">Organize your content into tech updates, India Post news, and more.</p>
            <span className="text-sm font-semibold text-indigo-400 inline-flex items-center group-hover:translate-x-1 transition-transform">
              Manage Categories →
            </span>
          </div>
        </Link>

        <Link href="/admin/blog/comments" className="group block">
          <div className="ui-modal-shell p-8 h-full border-white/10 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/[0.02] transition-all">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 w-fit mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="text-emerald-400" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-400 transition-colors">Comments</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">Moderate the conversation, reply to readers, and keep the community healthy.</p>
            <span className="text-sm font-semibold text-emerald-400 inline-flex items-center group-hover:translate-x-1 transition-transform">
              Review Comments →
            </span>
          </div>
        </Link>

        <Link href="/admin/blog/media" className="group block">
          <div className="ui-modal-shell p-8 h-full border-white/10 group-hover:border-rose-500/50 group-hover:bg-rose-500/[0.02] transition-all">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 w-fit mb-6 group-hover:scale-110 transition-transform">
              <FileText className="text-rose-400" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-rose-400 transition-colors">Media Library</h3>
            <p className="text-sm text-white/50 leading-relaxed mb-4">A central hub for all your blog images, PDFs, and uploaded assets.</p>
            <span className="text-sm font-semibold text-rose-400 inline-flex items-center group-hover:translate-x-1 transition-transform">
              View Library →
            </span>
          </div>
        </Link>
      </div>
    </main>
  );
}
