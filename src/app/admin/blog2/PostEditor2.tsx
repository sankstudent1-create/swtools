"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBlogPost } from "../blog/actions"; // Reuse existing actions
import BlogEditor2 from "@/components/blog/BlogEditor2";
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Settings, 
  Image as ImageIcon, 
  X,
  Type,
  Layout,
  Globe,
  Lock
} from "lucide-react";
import Link from "next/link";

interface PostEditor2Props {
  initialData?: any;
  categories: any[];
}

export default function PostEditor2({ initialData, categories }: PostEditor2Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    category_id: initialData?.category_id || "",
    status: initialData?.status || "draft",
    cover_image_url: initialData?.cover_image_url || "",
    seo_keywords: initialData?.seo_keywords || [],
  });

  const [contentJson, setContentJson] = useState(
    initialData?.content_json || { type: "doc", content: [] }
  );

  const handleSave = async () => {
    if (!formData.title) {
      alert("Please enter a title");
      return;
    }
    
    setIsSaving(true);
    try {
      const cleanedData = {
        ...formData,
        slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        category_id: formData.category_id || null,
        cover_image_url: formData.cover_image_url || null,
        excerpt: formData.excerpt || null,
        published_at: formData.status === 'published' ? (initialData?.published_at || new Date().toISOString()) : null,
        seo_description: formData.excerpt || formData.title,
        content_json: contentJson,
      };

      await saveBlogPost(cleanedData, initialData?.id);

      router.push("/admin/blog2");
      router.refresh();
    } catch (err: any) {
      alert("Failed to save: " + (err.message || "An error occurred"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#0c0f17]/80 backdrop-blur-xl border-b border-white/5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/blog2" 
            className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Post Title..."
              className="bg-transparent border-none text-xl font-black italic tracking-tight placeholder:text-white/10 focus:outline-none w-[300px] md:w-[500px]"
            />
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${formData.status === 'published' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-brand-orange'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{formData.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
          >
            <Settings size={20} />
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ui-btn-primary flex items-center gap-3 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {isSaving ? "Saving..." : <><Save size={18} /> Save Story</>}
          </button>
        </div>
      </div>

      <div className="pt-32 pb-20 px-6 mx-auto max-w-5xl">
        <BlogEditor2 
          initialContent={contentJson} 
          onChange={setContentJson} 
        />
      </div>

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="fixed inset-y-0 right-0 z-[100] w-96 bg-[#0c0f17] border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-500">
          <div className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-white/[0.01]">
            <h3 className="text-lg font-black uppercase tracking-widest italic">Configurations</h3>
            <button onClick={() => setShowSettings(false)} className="p-2 text-white/20 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <div className="p-8 space-y-10 overflow-y-auto max-h-[calc(100vh-80px)] custom-scrollbar">
            {/* Status Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/30">
                <Globe size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Publication Status</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['draft', 'published'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.status === s ? 'bg-brand-orange/10 border-brand-orange/40 text-brand-orange' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/30">
                <Layout size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Categorization</span>
              </div>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 appearance-none text-white/70"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* SEO Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/30">
                <Globe size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Permallink (Slug)</span>
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 text-white/70 font-mono"
                placeholder="url-friendly-slug"
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/30">
                <ImageIcon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cover Narrative</span>
              </div>
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 aspect-video flex items-center justify-center">
                {formData.cover_image_url ? (
                  <>
                    <img src={formData.cover_image_url} className="w-full h-full object-cover" alt="Cover" />
                    <button 
                      onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/10">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Empty Canvas</span>
                  </div>
                )}
              </div>
              <input
                type="text"
                value={formData.cover_image_url}
                onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 text-white/70"
                placeholder="Image URL..."
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/30">
                <Type size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Quick Teaser</span>
              </div>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 text-white/70 resize-none leading-relaxed"
                placeholder="A brief summary of the story..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
