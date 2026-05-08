"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MessageSquare, Trash2, Check, X, User, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CommentModerator() {
  const supabase = createSupabaseBrowserClient();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    setLoading(true);
    // Join with blog_posts to get post title and profiles to get user name
    const { data, error } = await supabase
      .from("blog_comments")
      .select(`
        *,
        blog_posts (title, slug),
        profiles (full_name, email)
      `)
      .order("created_at", { ascending: false });
    
    if (data) setComments(data);
    setLoading(false);
  }

  async function deleteComment(id: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    
    const { error } = await supabase
      .from("blog_comments")
      .delete()
      .eq("id", id);
    
    if (error) {
      alert(error.message);
    } else {
      fetchComments();
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Comment Moderation</h1>
      </div>

      <div className="ui-modal-shell overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare size={20} className="text-emerald-400" />
            Recent Comments
          </h2>
          <span className="text-xs text-white/40">{comments.length} total</span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-white/40">Loading comments...</div>
        ) : (
          <div className="divide-y divide-white/10">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                        <User size={14} className="text-white/40" />
                        {comment.profiles?.full_name || "Guest"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/30">
                        <Clock size={12} />
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm leading-relaxed mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
                      {comment.body}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-[11px] text-white/40">
                        On post: <Link href={`/blog/${comment.blog_posts?.slug}`} target="_blank" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                          {comment.blog_posts?.title} <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                      title="Delete Comment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="p-16 text-center text-white/40 italic">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
                  <MessageSquare size={24} className="text-white/20" />
                </div>
                <p>No comments found yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
