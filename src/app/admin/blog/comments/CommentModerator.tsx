"use client";

import { useState } from "react";
import { Check, X, Trash2, AlertCircle, Loader2, MessageSquare, ArrowLeft, User, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCommentStatusV3, deleteCommentV3 } from "../actions";

interface CommentModeratorProps {
  initialComments: any[];
}

export default function CommentModerator({ initialComments }: CommentModeratorProps) {
  const router = useRouter();
  const [comments, setComments] = useState<any[]>(initialComments);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const refresh = () => {
    router.refresh();
  };

  async function setStatus(id: string, status: 'approved' | 'spam' | 'pending') {
    setActionLoading(id);
    try {
      await updateCommentStatusV3(id, status);
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function removeComment(id: string) {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    
    setActionLoading(id);
    try {
      await deleteCommentV3(id);
      setComments(prev => prev.filter(c => c.id !== id));
      refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-24">
      {/* Header */}
      <div className="relative mb-12">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-orange/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative space-y-4">
          <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-2 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to V3 Console
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
              <MessageSquare className="w-8 h-8 text-brand-orange" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white italic">
                Comment <span className="bg-gradient-to-r from-brand-orange to-amber-400 bg-clip-text text-transparent">Moderator V3</span>
              </h1>
              <p className="text-white/40 mt-1">Manage discussions on your V3 posts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Quick Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Pending Approval', count: comments.filter(c => c.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-400/5' },
          { label: 'Approved', count: comments.filter(c => c.status === 'approved').length, color: 'text-emerald-400', bg: 'bg-emerald-400/5' },
          { label: 'Total Comments', count: comments.length, color: 'text-white/40', bg: 'bg-white/5' }
        ].map((stat, i) => (
          <div key={i} className={`p-6 rounded-3xl border border-white/5 ${stat.bg} backdrop-blur-sm`}>
            <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">{stat.label}</div>
            <div className={`text-3xl font-black ${stat.color}`}>{stat.count}</div>
          </div>
        ))}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className={`ui-modal-shell p-8 bg-white/[0.02] border-white/5 backdrop-blur-md rounded-[2rem] transition-all hover:bg-white/[0.04] ${comment.status === 'pending' ? 'ring-1 ring-amber-500/20 shadow-xl shadow-amber-500/5' : ''}`}>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side: Author & Meta */}
              <div className="lg:w-1/4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-white/30" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white truncate max-w-[150px]">{comment.author_name}</div>
                    <div className="text-[10px] text-white/20 truncate max-w-[150px]">{comment.author_email}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                    <Clock size={12} />
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 truncate max-w-[200px]">
                    <FileText size={12} />
                    On: {comment.post?.title || 'Unknown Post'}
                  </div>
                </div>

                <div>
                  <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    comment.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    comment.status === 'spam' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                  }`}>
                    {comment.status}
                  </span>
                </div>
              </div>

              {/* Right Side: Content & Actions */}
              <div className="flex-grow flex flex-col">
                <div className="bg-white/5 rounded-2xl p-6 mb-6 flex-grow border border-white/5">
                  <p className="text-white/70 leading-relaxed italic whitespace-pre-wrap">"{comment.content}"</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {comment.status !== 'approved' && (
                    <button
                      onClick={() => setStatus(comment.id, 'approved')}
                      disabled={actionLoading === comment.id}
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      {actionLoading === comment.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Approve
                    </button>
                  )}
                  {comment.status !== 'spam' && (
                    <button
                      onClick={() => setStatus(comment.id, 'spam')}
                      disabled={actionLoading === comment.id}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      <X size={12} /> Mark Spam
                    </button>
                  )}
                  {comment.status !== 'pending' && (
                    <button
                      onClick={() => setStatus(comment.id, 'pending')}
                      disabled={actionLoading === comment.id}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                    >
                      Reset to Pending
                    </button>
                  )}
                  <button
                    onClick={() => removeComment(comment.id)}
                    disabled={actionLoading === comment.id}
                    className="ml-auto p-2 text-white/10 hover:text-rose-500 transition-colors"
                    title="Delete Permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="p-32 text-center ui-modal-shell border-white/5 bg-white/[0.02]">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={40} className="text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Silence is golden</h3>
            <p className="text-white/30">No comments found to moderate.</p>
          </div>
        )}
      </div>
    </div>
  );
}
