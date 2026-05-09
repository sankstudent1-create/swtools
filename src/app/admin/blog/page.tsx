import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllPostsForAdmin } from "@/lib/blog/admin-queries";
import { Plus, MessageSquare, FileText, Layout, Search, Filter } from "lucide-react";
import ConnectionDiagnostic from "./ConnectionDiagnostic";
import PostList from "./PostList";

export default async function AdminBlogPage() {
  const { isAdmin, user } = await requireAdmin();

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-[#07090f]">
        <div className="w-full max-w-md ui-modal-shell p-8 text-center border-red-500/20 bg-red-500/5">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layout className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <p className="mt-2 text-white/60">
            You do not have administrative privileges to view the blog console.
            {user && ` (Logged in as ${user.email})`}
          </p>
          <div className="mt-8">
            <Link className="ui-btn-secondary w-full" href="/dashboard">Return to Dashboard</Link>
          </div>
          {/* Keep diagnostic tool even for non-admins to help troubleshoot role issues */}
          <div className="mt-8 text-left">
            <ConnectionDiagnostic />
          </div>
        </div>
      </main>
    );
  }

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
      <PostList initialPosts={posts || []} />

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
