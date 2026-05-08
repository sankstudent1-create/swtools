import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { listAllPostsForAdmin } from "@/lib/blog/admin-queries";
import { Plus, Edit, Eye, MessageSquare, FileText, Layout } from "lucide-react";

export default async function AdminBlogPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return null;

  const posts = await listAllPostsForAdmin();

  return (
    <main className="mx-auto max-w-7xl px-4 pt-10 pb-16 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-white/60">Create and manage your tech and India Post news.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="ui-btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={18} /> New Post
        </Link>
      </div>

      <div className="grid gap-4">
        {posts?.map((post) => (
          <div
            key={post.id}
            className="ui-modal-shell p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                    post.status === "published"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  }`}
                >
                  {post.status}
                </span>
                {post.category && !Array.isArray(post.category) && (
                  <span className="text-xs text-white/40">
                    {(post.category as any).name}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <div className="text-xs text-white/40 mt-1 flex items-center gap-4">
                <span>Slug: {post.slug}</span>
                <span>Updated: {new Date(post.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="View Live"
              >
                <Eye size={18} />
              </Link>
              <Link
                href={`/admin/blog/edit/${post.id}`}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Edit Post"
              >
                <Edit size={18} />
              </Link>
            </div>
          </div>
        ))}

        {posts?.length === 0 && (
          <div className="ui-modal-shell p-10 text-center text-white/40 italic">
            No blog posts found. Create your first one above.
          </div>
        )}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="ui-modal-shell p-6">
          <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 w-fit mb-4">
            <Layout className="text-indigo-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Categories</h3>
          <p className="text-sm text-white/60 mb-4">Manage your news categories like India Post, Tech News, etc.</p>
          <Link href="/admin/blog/categories" className="text-sm text-indigo-400 hover:underline">
            Manage Categories →
          </Link>
        </div>
        <div className="ui-modal-shell p-6">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 w-fit mb-4">
            <MessageSquare className="text-emerald-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <p className="text-sm text-white/60 mb-4">Moderate conversation and respond to readers.</p>
          <Link href="/admin/blog/comments" className="text-sm text-emerald-400 hover:underline">
            View Comments →
          </Link>
        </div>
        <div className="ui-modal-shell p-6">
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 w-fit mb-4">
            <FileText className="text-rose-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Media</h3>
          <p className="text-sm text-white/60 mb-4">View and manage uploaded images and PDF assets.</p>
          <Link href="/admin/blog/media" className="text-sm text-rose-400 hover:underline">
            Library →
          </Link>
        </div>
      </div>
    </main>
  );
}
