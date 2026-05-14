"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Edit, Trash2, FileText, Globe, Clock, ChevronRight, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostListProps {
  initialPosts: any[];
}

export default function PostList({ initialPosts }: PostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this story? This action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      const { deleteBlogPost } = await import("./actions");
      await deleteBlogPost(id);
      setPosts(posts.filter((p: any) => p.id !== id));
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Failed to delete story");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">Story Details</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">Classification</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">Status</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5">Timeline</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/20 border-b border-white/5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {posts?.map((post) => (
              <tr key={post.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/5 transition-all">
                      <FileText className="w-5 h-5 text-white/20 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white group-hover:text-indigo-400 transition-colors truncate max-w-[300px]">
                        {post.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-white/20">/{post.slug}</span>
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-8 py-6">
                  {post.category && !Array.isArray(post.category) ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/5 text-indigo-400 border border-indigo-500/10">
                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                      {(post.category as any).name}
                    </div>
                  ) : (
                    <span className="text-white/10 text-[10px] font-black uppercase tracking-widest italic">Unclassified</span>
                  )}
                </td>
                
                <td className="px-8 py-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    post.status === "published"
                      ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                      : "bg-brand-orange/5 text-brand-orange border-brand-orange/10"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      post.status === "published" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-brand-orange shadow-[0_0_8px_rgba(255,107,0,0.5)]"
                    }`} />
                    {post.status}
                  </div>
                </td>
                
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/60 transition-colors">
                      <Clock size={12} />
                      <span className="text-xs font-medium">
                        {new Date(post.updated_at).toLocaleDateString("en-US", {
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/10 font-black uppercase tracking-widest">Last Modified</span>
                  </div>
                </td>
                
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                      title="Preview Story"
                    >
                      <Globe size={18} />
                    </Link>
                    <Link
                      href={`/admin/blog/edit/${post.id}`}
                      className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-indigo-400 hover:bg-indigo-400/10 border border-transparent hover:border-indigo-400/20 transition-all"
                      title="Refine Content"
                    >
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => deletePost(post.id)}
                      disabled={deletingId === post.id}
                      className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-rose-400 hover:bg-rose-400/10 border border-transparent hover:border-rose-400/20 transition-all disabled:opacity-30" 
                      title="Archive Story"
                    >
                      <Trash2 size={18} className={deletingId === post.id ? "animate-spin" : ""} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {(!posts || posts.length === 0) && (
        <div className="py-32 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/[0.02] border border-white/5 mb-6 group">
            <FileText size={40} className="text-white/10 group-hover:text-brand-orange transition-colors" />
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter">THE REPOSITORY IS EMPTY</h3>
          <p className="text-white/30 mt-2 max-w-sm mx-auto font-medium leading-relaxed">
            Every great journey begins with a single word. Start documenting your stories today.
          </p>
          <div className="mt-8">
            <Link href="/admin/blog/new" className="ui-btn-primary px-8 py-3 rounded-xl font-bold">Create First Post</Link>
          </div>
        </div>
      )}
    </div>
  );
}
