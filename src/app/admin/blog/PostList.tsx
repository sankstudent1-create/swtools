"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Eye, Edit, Trash2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostListProps {
  initialPosts: any[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setDeletingId(id);
    try {
      const { deleteBlogPost } = await import("./actions");
      await deleteBlogPost(id);
      setPosts(posts.filter(p => p.id !== id));
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  }

  return (
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
                    <button 
                      onClick={() => deletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="p-2 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-400/10 transition-all disabled:opacity-30" 
                      title="Delete"
                    >
                      <Trash2 size={18} className={deletingId === post.id ? "animate-pulse" : ""} />
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
  );
}
