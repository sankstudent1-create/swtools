"use client";

import { useState } from "react";
import { submitComment } from "./actions";
import { MessageSquare, Send, User, CheckCircle2, Clock, Lock } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  initialComments: any[];
  isLoggedIn: boolean;
  user: any;
}

export default function CommentSection({ postId, initialComments, isLoggedIn, user }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await submitComment(postId, content);
      setContent("");
      setMessage({ type: 'success', text: 'Thank you! Your comment is awaiting moderation.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to post comment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-32 pt-20 border-t border-white/5">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <MessageSquare size={18} className="text-indigo-400" />
        </div>
        <h3 className="text-2xl font-black text-white italic tracking-tight">Conversations</h3>
        <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/5">
          {initialComments.length}
        </span>
      </div>

      {/* Comment Form */}
      {isLoggedIn ? (
        <div className="mb-16">
          <form onSubmit={handleSubmit} className="relative">
            <div className="ui-modal-shell p-6 bg-white/[0.02] border-white/5 rounded-[2rem] focus-within:border-brand-orange/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center">
                  <User size={14} className="text-brand-orange" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Posting as {user.email?.split('@')[0]}
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on this dispatch..."
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/10 resize-none min-h-[120px] text-lg"
                required
              />
              <div className="flex items-center justify-between mt-4">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  Respectful dialogue only
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? "Dispatching..." : "Post Comment"}
                  <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </form>
          {message && (
            <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
              <span className="text-xs font-bold uppercase tracking-widest">{message.text}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center ui-modal-shell bg-white/[0.02] border-white/5 rounded-[2rem] mb-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-white/10">
            <Lock size={32} />
          </div>
          <h4 className="text-xl font-black text-white mb-2 italic">Secured Conversation</h4>
          <p className="text-white/30 text-sm mb-8">Sign in to join the discussion and share your thoughts.</p>
          <a href="/login" className="inline-flex px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest transition-all">
            Authenticate to Comment
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-8">
        {initialComments.length > 0 ? (
          initialComments.map((comment) => (
            <div key={comment.id} className="relative group">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black italic">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="w-px h-full bg-gradient-to-b from-white/10 to-transparent mx-auto mt-4" />
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-black text-white italic">{comment.author_name}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white/60 leading-relaxed text-base">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-white/10 text-sm font-black uppercase tracking-[0.2em]">Silence is golden. Be the first to speak.</p>
          </div>
        )}
      </div>
    </section>
  );
}


