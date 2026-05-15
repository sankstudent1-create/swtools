"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import { ArrowLeft, Save, Globe, Send, AlertCircle, Image as ImageIcon, Search, Layout, Settings, Sparkles, ChevronRight, Eye, Smartphone, Monitor, Plus, X } from "lucide-react";
import Link from "next/link";

interface PostEditorProps {
  initialData?: any;
  categories: any[];
  authorId: string;
}

export default function PostEditor({ initialData, categories, authorId }: PostEditorProps) {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo'>('content');

  const defaultDoc = { type: "doc", content: [{ type: "paragraph" }] };

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [contentJson, setContentJson] = useState(
    initialData?.content_json && typeof initialData.content_json === "object"
      ? initialData.content_json
      : defaultDoc
  );
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seo_keywords?.join(", ") || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || initialData?.excerpt || "");

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && title && !slug) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title, initialData]);

  const uploadCoverImage = async (file: File) => {
    setCoverUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const { uploadBlogMedia } = await import("./actions");
      const { publicUrl } = await uploadBlogMedia(formData);
      
      setCoverImageUrl(publicUrl);
    } catch (e: any) {
      setError(e?.message || "Failed to upload cover image");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSave = async (newStatus?: string) => {
    setLoading(true);
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      setLoading(false);
      return;
    }

    const postStatus = newStatus || status;
    const publishedAt = postStatus === "published" ? (initialData?.published_at || new Date().toISOString()) : null;

    const editor = editorRef.current?.getEditor();
    const finalContent = editor?.getJSON() || contentJson;

    // Deep inspection: log ALL nodes and their attributes for debugging
    const allNodes = (finalContent?.content || []);
    const mediaNodes = allNodes.filter(
      (node: any) => node.type === "youtube" || node.type === "iframeEmbed" || node.type === "image"
    );
    
    console.log("[PostEditor] Save inspection:", {
      totalNodes: allNodes.length,
      mediaNodes: mediaNodes.map((n: any) => ({
        type: n.type,
        src: n.attrs?.src,
        hasAttrs: !!n.attrs,
        attrKeys: n.attrs ? Object.keys(n.attrs) : [],
      })),
    });

    // Integrity Check: Scan for media nodes without attributes
    const missingAttrs = mediaNodes.filter(
      (node: any) => !node.attrs?.src
    );

    if (missingAttrs.length > 0) {
      console.error("[PostEditor] Media nodes found with MISSING attributes!", missingAttrs);
      if (!window.confirm(`Warning: ${missingAttrs.length} media item(s) are missing their links. Save anyway? (Broken items will be removed)`)) {
        setLoading(false);
        return;
      }
      // Auto-repair: remove broken media nodes from the content before saving
      finalContent.content = allNodes.filter(
        (node: any) => {
          if ((node.type === "youtube" || node.type === "iframeEmbed" || node.type === "image") && !node.attrs?.src) {
            return false; // Remove broken media node
          }
          return true;
        }
      );
    }

    const postData = {
      title,
      slug,
      excerpt,
      category_id: categoryId || null,
      status: postStatus,
      content_json: finalContent,
      cover_image_url: coverImageUrl || null,
      author_id: authorId,
      published_at: publishedAt,
      seo_keywords: seoKeywords.split(",").map((k: string) => k.trim()).filter((k: string) => !!k),
      seo_description: seoDescription || excerpt,
    };

    try {
      const { saveBlogPost } = await import("./actions");
      await saveBlogPost(postData, initialData?.id);
      router.push("/admin/blog");
      router.refresh();
    } catch (e: any) {
      console.error("[blog] save failed", e);
      setError(e?.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link href="/admin/blog" className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
              }`}>
                {status}
              </span>
              <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">•</span>
              <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">{initialData ? 'Refining Story' : 'Crafting New Story'}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white italic">
              {initialData ? "Edit" : "Create"} <span className="bg-gradient-to-r from-brand-orange to-indigo-400 bg-clip-text text-transparent">Story</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave()}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold flex items-center gap-2 transition-all"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Save Draft
          </button>
          <button 
            onClick={() => handleSave("published")}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black flex items-center gap-2 shadow-xl shadow-brand-orange/20 transition-all group"
          >
            <Globe size={18} className="group-hover:rotate-12 transition-transform" />
            {loading ? "Publishing..." : "Publish Story"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Navigation Tabs (Mobile) */}
        <div className="lg:col-span-12 flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 lg:hidden">
          {(['content', 'settings', 'seo'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className={`lg:col-span-8 space-y-8 ${activeTab !== 'content' ? 'hidden lg:block' : ''}`}>
          <div className="space-y-4">
            <textarea
              placeholder="Enter your compelling title..."
              className="w-full bg-transparent text-5xl md:text-6xl font-black tracking-tighter border-none focus:ring-0 placeholder-white/10 p-0 italic resize-none leading-[0.9] overflow-hidden"
              rows={2}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onFocus={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div className="flex items-center gap-4 py-2 border-y border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                <Layout size={12} />
                slug:
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-grow bg-transparent border-none p-0 text-sm font-mono text-indigo-400 focus:ring-0 placeholder-white/10"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          <div className="ui-modal-shell p-2 bg-white/[0.01] border-white/5 rounded-3xl min-h-[600px] shadow-2xl overflow-hidden group focus-within:border-brand-orange/20 transition-colors">
            <BlogEditor 
              ref={editorRef}
              content={contentJson} 
              onChange={setContentJson} 
            />
          </div>
        </div>

        {/* Sidebar Section */}
        <div className={`lg:col-span-4 space-y-8 ${activeTab === 'content' ? 'hidden lg:block' : ''}`}>
          
          {/* Cover Image Card */}
          <div className="ui-modal-shell p-8 bg-white/[0.01] border-white/5 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <ImageIcon size={14} className="text-brand-orange" />
                Cover Visual
              </h3>
            </div>
            
            <div 
              className="relative aspect-video rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden hover:border-brand-orange/30 transition-all cursor-pointer group"
              onClick={() => coverFileInputRef.current?.click()}
            >
              {coverImageUrl ? (
                <>
                  <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20">Change Artwork</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="text-xs font-bold text-white/20 group-hover:text-white/40 transition-colors">Upload 16:9 Image</span>
                </div>
              )}
              {coverUploading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadCoverImage(file);
                e.target.value = "";
              }}
            />
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Visual URL</label>
              <input 
                type="text" 
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full ui-input bg-white/5 border-white/10 text-xs py-3 rounded-xl focus:border-brand-orange/50 transition-all"
              />
            </div>
          </div>

          {/* Classification & Metadata */}
          <div className="ui-modal-shell p-8 bg-white/[0.01] border-white/5 rounded-3xl space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Settings size={14} className="text-indigo-400" />
              Settings
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Taxonomy</label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="" className="bg-[#07090f]">Unclassified</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#07090f]">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Status</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                  {['draft', 'published'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        status === s 
                          ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                          : 'text-white/20 hover:text-white/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SEO Performance Card */}
          <div className="ui-modal-shell p-8 bg-white/[0.01] border-white/5 rounded-3xl space-y-6 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Search size={80} className="text-indigo-400" />
            </div>
            
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-400" />
                Search Intelligence
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${excerpt.length > 50 ? 'bg-emerald-400' : 'bg-brand-orange'}`} />
                <span className="text-[9px]">{excerpt.length}/160</span>
              </div>
            </h3>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Abstract (Snippet)</label>
              <textarea 
                value={excerpt} 
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                className="w-full ui-input bg-white/5 border-white/10 text-xs py-3 rounded-xl focus:border-brand-orange/50 transition-all resize-none"
                placeholder="The perfect summary to hook your readers..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Keywords</label>
              <input 
                type="text" 
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="typing, ssc, india post..."
                className="w-full ui-input bg-white/5 border-white/10 text-xs py-3 rounded-xl focus:border-brand-orange/50 transition-all"
              />
            </div>

            {/* Google Preview Snippet */}
            <div className="space-y-2 mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/10">Engine Preview</span>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[10px] text-emerald-400 truncate flex items-center gap-1">
                  https://swtools.in <ChevronRight size={8} /> blog <ChevronRight size={8} /> {slug || "..."}
                </div>
                <div className="text-indigo-400 font-medium text-sm line-clamp-1">
                  {title || "Untiled Masterpiece"}
                </div>
                <div className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                  {excerpt || "Add a snippet to see how your story appears in search engine results globally."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl bg-rose-500 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-300">
          <AlertCircle size={20} />
          <span className="font-bold">{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:scale-110 transition-transform"><X size={18} /></button>
        </div>
      )}
    </div>
  );
}
