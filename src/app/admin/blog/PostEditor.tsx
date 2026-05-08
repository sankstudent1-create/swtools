"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import BlogEditor from "@/components/blog/BlogEditor";
import { ArrowLeft, Save, Globe, Send, AlertCircle } from "lucide-react";
import Link from "next/link";

interface PostEditorProps {
  initialData?: any;
  categories: any[];
  authorId: string;
}

export default function PostEditor({ initialData, categories, authorId }: PostEditorProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [contentJson, setContentJson] = useState(initialData?.content_json || {});
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialData) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSave = async (newStatus?: string) => {
    setLoading(true);
    setError(null);

    const postStatus = newStatus || status;
    const publishedAt = postStatus === "published" ? (initialData?.published_at || new Date().toISOString()) : null;

    const postData = {
      title,
      slug,
      excerpt,
      category_id: categoryId || null,
      status: postStatus,
      content_json: contentJson,
      cover_image_url: coverImageUrl || null,
      author_id: authorId,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    try {
      let result;
      if (initialData?.id) {
        result = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", initialData.id);
      } else {
        result = await supabase
          .from("blog_posts")
          .insert([postData]);
      }

      if (result.error) throw result.error;

      router.push("/admin/blog");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">{initialData ? "Edit Post" : "New Post"}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Post Title"
              className="w-full bg-transparent text-3xl font-bold border-none focus:ring-0 placeholder-white/20 p-0"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />
            <div className="flex items-center gap-2 text-sm text-white/40">
              <span className="font-mono">slug:</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-white/5 border border-white/10 rounded px-2 py-0.5 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <BlogEditor 
            content={contentJson} 
            onChange={setContentJson} 
          />
        </div>

        <div className="space-y-6">
          <div className="ui-modal-shell p-6 space-y-4">
            <h3 className="font-semibold mb-2">Publish Settings</h3>
            
            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase">Category</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">No Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/40 uppercase">Excerpt (SEO Description)</label>
              <textarea 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Brief summary for search results..."
              />
            </div>

            <div className="pt-4 space-y-2">
              <button 
                onClick={() => handleSave()}
                disabled={loading}
                className="w-full ui-btn-primary flex items-center justify-center gap-2"
              >
                <Save size={18} /> {loading ? "Saving..." : "Save Post"}
              </button>
              {status === "draft" && (
                <button 
                  onClick={() => handleSave("published")}
                  disabled={loading}
                  className="w-full ui-btn-secondary flex items-center justify-center gap-2 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Globe size={18} /> Publish Now
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="ui-modal-shell p-6">
            <h3 className="font-semibold mb-4 text-sm">Cover Image</h3>
            <input 
              type="text" 
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500"
            />
            {coverImageUrl && (
              <img src={coverImageUrl} alt="Preview" className="mt-4 w-full aspect-video object-cover rounded-lg border border-white/10" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
