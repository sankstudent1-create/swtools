"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, GripVertical, Type, Image as ImageIcon, 
  Play, Heading1, Link as LinkIcon, MoveUp, MoveDown,
  Save, Globe, ArrowLeft, Settings, Sparkles, X, Layout
} from "lucide-react";
import { BlogBlock, BlockType, PostV3, savePostV3 } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PostEditor3Props {
  initialData?: PostV3;
  categories: any[];
  authorId: string;
}

export default function PostEditor3({ initialData, categories, authorId }: PostEditor3Props) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<BlogBlock[]>(initialData?.content_blocks || [
    { id: '1', type: 'heading', content: { text: '', level: 1 } },
    { id: '2', type: 'text', content: { text: '' } }
  ]);
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug
  useEffect(() => {
    if (!initialData && title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  }, [title, initialData]);

  const addBlock = (type: BlockType) => {
    const newBlock: BlogBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'text' ? { text: '' } : 
               type === 'image' ? { src: '', alt: '' } :
               type === 'youtube' ? { src: '' } :
               type === 'heading' ? { text: '', level: 2 } :
               { text: '', url: '' }
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleSave = async (newStatus?: 'draft' | 'published') => {
    setLoading(true);
    setError(null);

    const postData: PostV3 = {
      id: initialData?.id,
      title,
      slug,
      excerpt,
      content_blocks: blocks,
      cover_image_url: coverImageUrl || null,
      category_id: categoryId || null,
      status: newStatus || status,
      author_id: authorId,
      published_at: (newStatus || status) === 'published' ? (initialData?.published_at || new Date().toISOString()) : null
    };

    try {
      await savePostV3(postData);
      router.push("/admin/blog3");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {error && (
        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-sm font-bold flex items-center gap-3">
          <X size={16} /> {error}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <Link href="/admin/blog3" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white border border-white/5">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white italic">
              Blog <span className="bg-gradient-to-r from-brand-orange to-indigo-400 bg-clip-text text-transparent">V3 Editor</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => handleSave('draft')} disabled={loading} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold flex items-center gap-2 transition-all">
            <Save size={18} /> Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={loading} className="px-8 py-3 rounded-xl bg-brand-orange text-white font-black flex items-center gap-2 shadow-xl shadow-brand-orange/20 transition-all">
            <Globe size={18} /> {loading ? "Publishing..." : "Publish Story"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {/* Metadata */}
          <div className="space-y-4">
            <input
              placeholder="Post Title..."
              className="w-full bg-transparent text-5xl font-black tracking-tighter border-none focus:ring-0 placeholder-white/10 p-0 italic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex items-center gap-4 py-2 border-y border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">slug:</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="bg-transparent border-none p-0 text-sm font-mono text-indigo-400 focus:ring-0 w-full" />
            </div>
          </div>

          {/* Blocks List */}
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div key={block.id} className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveBlock(index, 'up')} className="p-1 hover:text-brand-orange"><MoveUp size={16}/></button>
                  <button onClick={() => moveBlock(index, 'down')} className="p-1 hover:text-brand-orange"><MoveDown size={16}/></button>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                    {block.type}
                  </span>
                  <button onClick={() => removeBlock(block.id)} className="text-white/20 hover:text-rose-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Block Content Renderers */}
                {block.type === 'heading' && (
                  <input 
                    className="w-full bg-transparent text-2xl font-bold border-none focus:ring-0 p-0"
                    value={block.content.text}
                    onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                    placeholder="Enter heading..."
                  />
                )}

                {block.type === 'text' && (
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 p-0 min-h-[100px] resize-none text-white/80 leading-relaxed"
                    value={block.content.text}
                    onChange={(e) => {
                      updateBlock(block.id, { ...block.content, text: e.target.value });
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="Start writing..."
                  />
                )}

                {block.type === 'image' && (
                  <div className="space-y-3">
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                      placeholder="Image Source URL"
                      value={block.content.src}
                      onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
                    />
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                      placeholder="Alt Description (SEO)"
                      value={block.content.alt}
                      onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                    />
                    {block.content.src && (
                      <div className="relative aspect-video rounded-xl overflow-hidden mt-4 border border-white/5">
                        <img src={block.content.src} alt={block.content.alt} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'youtube' && (
                  <div className="space-y-3">
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                      placeholder="YouTube URL or Embed Code"
                      value={block.content.src}
                      onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
                    />
                    {block.content.src && (
                      <div className="aspect-video rounded-xl bg-black flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-white/20">
                        Video Preview (Active after save)
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Block Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white/5 border border-dashed border-white/10 rounded-3xl justify-center">
            <button onClick={() => addBlock('heading')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-xs font-bold">
              <Heading1 size={14} className="text-indigo-400" /> Heading
            </button>
            <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-xs font-bold">
              <Type size={14} className="text-emerald-400" /> Text
            </button>
            <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-xs font-bold">
              <ImageIcon size={14} className="text-brand-orange" /> Image
            </button>
            <button onClick={() => addBlock('youtube')} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-all text-xs font-bold">
              <Play size={14} className="text-rose-500" /> YouTube
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="ui-modal-shell p-8 bg-white/[0.01] border-white/5 rounded-3xl space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Settings size={14} className="text-brand-orange" /> Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Category</label>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
                >
                  <option value="" className="bg-[#07090f]">Unclassified</option>
                  {categories.map(c => <option key={c.id} value={c.id} className="bg-[#07090f]">{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Excerpt</label>
                <textarea 
                  value={excerpt} 
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 text-xs py-3 rounded-xl focus:ring-0 resize-none"
                  placeholder="Summary..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
