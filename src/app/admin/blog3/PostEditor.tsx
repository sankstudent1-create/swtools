"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Trash2, Type, Image as ImageIcon, 
  Play, Heading1, MoveUp, MoveDown,
  Save, Globe, ArrowLeft, Settings, Sparkles, X, Layout, 
  ChevronRight, MoreVertical, Layers, Search, Eye, Share2
} from "lucide-react";
import { BlogBlock, BlockType, PostV3, savePostV3 } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PostEditorProps {
  initialData?: PostV3;
  categories: any[];
  authorId: string;
}

export default function PostEditor({ initialData, categories, authorId }: PostEditorProps) {
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
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || "");
  const [seoKeywords, setSeoKeywords] = useState<string>(initialData?.seo_keywords?.join(", ") || "");
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData?.id && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
    }
  }, [title, initialData?.id]);

  const addBlock = (type: BlockType, content: any = {}) => {
    const newBlock: BlogBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'text' ? { text: '', ...content } : 
               type === 'image' ? { src: '', alt: '', ...content } :
               type === 'youtube' ? { src: '', ...content } :
               type === 'heading' ? { text: '', level: 2, ...content } :
               { text: '', url: '', ...content }
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
    if (!title) {
      setError("Please enter a story title.");
      return;
    }
    
    setLoading(true);
    setError(null);

    const postData: PostV3 = {
      id: initialData?.id,
      title,
      slug,
      excerpt: excerpt || null,
      content_blocks: blocks,
      cover_image_url: coverImageUrl || null,
      category_id: categoryId || null,
      status: newStatus || status,
      author_id: authorId,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      seo_keywords: seoKeywords ? seoKeywords.split(",").map(s => s.trim()) : [],
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
    <div className="min-h-screen bg-[#07090f] text-white">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#07090f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link href="/admin/blog3" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white border border-white/5 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-white/10 hidden md:block" />
            <div className="hidden md:block">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Editor Engine V3</span>
                {status === 'published' ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/20">Live</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/40 text-[8px] font-black uppercase border border-white/10">Draft</span>
                )}
              </div>
              <h2 className="text-sm font-bold text-white line-clamp-1 italic">{title || "Untitled Dispatch"}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-white/5 rounded-xl p-1 border border-white/5 mr-4">
              <button 
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'text-white/40 hover:text-white'}`}
              >
                Content
              </button>
              <button 
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'seo' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white'}`}
              >
                SEO & Meta
              </button>
            </div>

            <button 
              onClick={() => handleSave('draft')} 
              disabled={loading} 
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Save size={16} /> Save
            </button>
            <button 
              onClick={() => handleSave('published')} 
              disabled={loading} 
              className="px-6 py-2.5 rounded-xl bg-brand-orange text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-orange/20 transition-all active:scale-95"
            >
              <Globe size={16} /> {loading ? "..." : (initialData?.status === 'published' ? "Update" : "Publish")}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <X size={16} /> {error}
            </div>
            <button onClick={() => setError(null)} className="hover:text-rose-300 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Editing Area */}
          <div className="lg:col-span-8 space-y-12">
            {activeTab === 'content' ? (
              <div className="space-y-12">
                {/* Title & Slug Section */}
                <div className="space-y-6">
                  <textarea
                    placeholder="Story Title..."
                    rows={2}
                    className="w-full bg-transparent text-6xl font-black tracking-tighter border-none focus:ring-0 placeholder-white/10 p-0 italic resize-none leading-[0.9]"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                  <div className="flex items-center gap-3 py-4 border-y border-white/5 px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Canonical Path:</span>
                    <div className="flex items-center text-sm font-mono text-indigo-400/60 flex-grow">
                      <span>/blog/</span>
                      <input 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)} 
                        className="bg-transparent border-none p-0 text-sm font-mono text-indigo-400 focus:ring-0 flex-grow focus:text-indigo-300 transition-colors" 
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Image Preview */}
                {coverImageUrl && (
                  <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5">
                    <img src={coverImageUrl} alt="Cover Preview" className="w-full aspect-[21/9] object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest">Cover Artwork Active</div>
                    </div>
                    <button 
                      onClick={() => setCoverImageUrl("")}
                      className="absolute top-6 right-6 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/40 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Content Blocks */}
                <div className="space-y-8 min-h-[400px]">
                  {blocks.map((block, index) => (
                    <div key={block.id} className="group relative">
                      {/* Block Controls - Left Side */}
                      <div className="absolute -left-14 top-2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button onClick={() => moveBlock(index, 'up')} className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-brand-orange transition-colors" title="Move Up">
                          <MoveUp size={14}/>
                        </button>
                        <div className="h-4 w-px bg-white/10" />
                        <button onClick={() => moveBlock(index, 'down')} className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-brand-orange transition-colors" title="Move Down">
                          <MoveDown size={14}/>
                        </button>
                      </div>

                      <div className="relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:border-white/10 transition-all duration-500 hover:bg-white/[0.03]">
                        {/* Block Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40">
                              {block.type === 'heading' && <Heading1 size={14} />}
                              {block.type === 'text' && <Type size={14} />}
                              {block.type === 'image' && <ImageIcon size={14} />}
                              {block.type === 'youtube' && <Play size={14} />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">
                              {block.type} component
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-white/10 hover:text-white transition-colors"><Share2 size={14} /></button>
                            <button onClick={() => removeBlock(block.id)} className="p-2 text-white/10 hover:text-rose-500 transition-colors" title="Delete Block">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Block Content Renderers */}
                        <div className="relative">
                          {block.type === 'heading' && (
                            <input 
                              className="w-full bg-transparent text-3xl font-black tracking-tight border-none focus:ring-0 p-0 italic text-white placeholder-white/5"
                              value={block.content.text}
                              onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                              placeholder="Enter section heading..."
                            />
                          )}

                          {block.type === 'text' && (
                            <textarea 
                              className="w-full bg-transparent border-none focus:ring-0 p-0 min-h-[100px] resize-none text-white/70 leading-relaxed text-lg"
                              value={block.content.text}
                              onChange={(e) => {
                                updateBlock(block.id, { ...block.content, text: e.target.value });
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                              }}
                              placeholder="Describe the moment..."
                            />
                          )}

                          {block.type === 'image' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block px-1">Source URL</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs focus:border-brand-orange/50 outline-none transition-all"
                                    placeholder="https://..."
                                    value={block.content.src}
                                    onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block px-1">Alt Text (Accessibility)</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs focus:border-brand-orange/50 outline-none transition-all"
                                    placeholder="Describe image for SEO..."
                                    value={block.content.alt}
                                    onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black/40 group/img flex items-center justify-center">
                                {block.content.src ? (
                                  <img src={block.content.src} alt={block.content.alt} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex flex-col items-center gap-3 text-white/10">
                                    <ImageIcon size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Image Preview Pending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {block.type === 'youtube' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 block px-1">YouTube Link</label>
                                  <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs focus:border-brand-orange/50 outline-none transition-all"
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={block.content.src}
                                    onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
                                  />
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-indigo-300 leading-relaxed italic">
                                  The V3 engine automatically processes live streams and standard uploads into a responsive wrapper.
                                </div>
                              </div>
                              <div className="aspect-video rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                                {block.content.src ? (
                                   <div className="flex flex-col items-center gap-3 text-brand-orange/40">
                                    <Play size={32} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">YouTube Hook Active</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-3 text-white/10">
                                    <Play size={32} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Stream Preview Pending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Add Block Action */}
                <div className="flex justify-center pt-8">
                  <div className="p-2 rounded-full bg-[#0d1117] border border-white/5 shadow-2xl flex items-center gap-1 group/bar">
                    <button onClick={() => addBlock('heading')} className="p-4 rounded-full hover:bg-white/5 text-white/40 hover:text-indigo-400 transition-all flex items-center gap-2 group/btn">
                      <Heading1 size={20} className="transition-transform group-hover/btn:scale-110" />
                    </button>
                    <button onClick={() => addBlock('text')} className="p-4 rounded-full hover:bg-white/5 text-white/40 hover:text-emerald-400 transition-all flex items-center gap-2 group/btn">
                      <Type size={20} className="transition-transform group-hover/btn:scale-110" />
                    </button>
                    <button onClick={() => addBlock('image')} className="p-4 rounded-full hover:bg-white/5 text-white/40 hover:text-brand-orange transition-all flex items-center gap-2 group/btn">
                      <ImageIcon size={20} className="transition-transform group-hover/btn:scale-110" />
                    </button>
                    <button onClick={() => addBlock('youtube')} className="p-4 rounded-full hover:bg-white/5 text-white/40 hover:text-rose-500 transition-all flex items-center gap-2 group/btn">
                      <Play size={20} className="transition-transform group-hover/btn:scale-110" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Search size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tight text-white italic">Search Optimization</h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-white/20">Ensure your story reaches the right audience</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20">SEO Dispatch Title</label>
                        <span className="text-[9px] text-white/10 font-mono">{seoTitle.length} / 60</span>
                      </div>
                      <input 
                        value={seoTitle} 
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold text-white focus:border-indigo-500/50 outline-none transition-all placeholder-white/5"
                        placeholder="Optimized title for search..."
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/20">Meta Description</label>
                        <span className="text-[9px] text-white/10 font-mono">{seoDescription.length} / 160</span>
                      </div>
                      <textarea 
                        value={seoDescription} 
                        onChange={(e) => setSeoDescription(e.target.value)}
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white/70 leading-relaxed focus:border-indigo-500/50 outline-none transition-all resize-none placeholder-white/5"
                        placeholder="The short hook for Google results..."
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-2">Keywords (Semantic Tags)</label>
                      <input 
                        value={seoKeywords} 
                        onChange={(e) => setSeoKeywords(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-indigo-400 font-mono focus:border-indigo-500/50 outline-none transition-all placeholder-white/5"
                        placeholder="post office, india, sw tools..."
                      />
                      <p className="text-[9px] text-white/20 italic px-2">Separate with commas for the V3 indexer.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Publishing Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-28 space-y-8">
              {/* Category & Status */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange border border-brand-orange/20">
                    <Layers size={14} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">Classification</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Content Category</label>
                    <div className="relative group">
                      <select 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white focus:border-brand-orange/50 outline-none appearance-none transition-all cursor-pointer"
                      >
                        <option value="" className="bg-[#07090f]">Unclassified</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-[#07090f] text-white">{c.name}</option>)}
                      </select>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 rotate-90 pointer-events-none group-hover:text-brand-orange transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Cover Image Source</label>
                    <div className="relative">
                      <input 
                        value={coverImageUrl} 
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder-white/10 focus:border-brand-orange/50 outline-none transition-all"
                        placeholder="https://..."
                      />
                      <ImageIcon size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/20 block px-1">Short Excerpt</label>
                    <textarea 
                      value={excerpt} 
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 text-xs py-4 px-4 rounded-2xl focus:border-brand-orange/50 outline-none resize-none text-white/60 leading-relaxed italic placeholder-white/5"
                      placeholder="The preview text that appears on your cards..."
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Sparkles size={14} />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">V3 Quick Links</h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link 
                    href={initialData?.slug ? `/blog/${initialData.slug}` : "#"} 
                    target="_blank"
                    className={`flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all group ${!initialData?.slug ? 'opacity-20 pointer-events-none' : ''}`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Live Preview</span>
                    <Eye size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button 
                    disabled 
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 text-white/10 cursor-not-allowed"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Post Metrics</span>
                    <BarChart3 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple Icon Fallback for TS
const BarChart3 = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);

