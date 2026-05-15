"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Tag, AlertCircle, Loader2, ArrowLeft, Layout } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveBlogCategoryV3, deleteBlogCategoryV3 } from "../actions";

interface CategoryManagerProps {
  initialCategories: any[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const refresh = () => {
    router.refresh();
  };

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    
    setActionLoading(true);
    setError(null);
    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    try {
      const saved = await saveBlogCategoryV3({ name: newCategoryName, slug });
      setNewCategoryName("");
      setCategories(prev => [...prev, saved].sort((a,b) => a.name.localeCompare(b.name)));
      refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function updateCategory(id: string) {
    if (!editName.trim()) return;
    
    setActionLoading(true);
    setError(null);
    const slug = editName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    try {
      await saveBlogCategoryV3({ name: editName, slug }, id);
      setEditingId(null);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName, slug } : c).sort((a,b) => a.name.localeCompare(b.name)));
      refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Are you sure? Posts in this category will become Uncategorized.")) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      await deleteBlogCategoryV3(id);
      setCategories(prev => prev.filter((c: any) => c.id !== id));
      refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-24">
      {/* Premium Header */}
      <div className="relative mb-12">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative space-y-4">
          <Link href="/admin/blog3" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-2 group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to V3 Console
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <Layout className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white italic">
                Category <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Manager V3</span>
              </h1>
              <p className="text-white/40 mt-1">Organize your V3 content into meaningful sections.</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-bold">Operation Failed</p>
            <p className="opacity-80">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400/50 hover:text-rose-400">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Add New Section */}
      <div className="ui-modal-shell p-8 mb-10 bg-white/[0.02] border-white/5 backdrop-blur-md overflow-hidden relative group rounded-3xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Plus size={80} className="text-white" />
        </div>
        
        <div className="relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-brand-orange rounded-full" />
            Create New Category
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={actionLoading}
              placeholder="e.g. India Post News"
              className="ui-input flex-grow bg-white/5 border-white/10 hover:border-brand-orange/30 focus:border-brand-orange/50 transition-all rounded-xl p-4 text-white"
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <button
              onClick={addCategory}
              disabled={actionLoading || !newCategoryName.trim()}
              className="px-8 py-4 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold whitespace-nowrap flex items-center justify-center gap-2 group transition-all"
            >
              {actionLoading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} className="group-hover:rotate-90 transition-transform" />}
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.01] backdrop-blur-sm shadow-2xl">
        <div className="bg-white/5 border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-3">
            <Tag size={20} className="text-indigo-400" />
            Existing Categories
          </h2>
          <span className="text-[10px] uppercase font-black tracking-widest text-white/20 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {categories.length} sections
          </span>
        </div>
        
        <div className="divide-y divide-white/[0.03]">
          {categories.map((cat) => (
            <div key={cat.id} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
              {editingId === cat.id ? (
                <div className="flex items-center gap-3 flex-grow mr-4 animate-in fade-in slide-in-from-left-4">
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-grow bg-indigo-500/5 border border-indigo-500/30 rounded-xl px-4 py-2 text-sm text-white focus:outline-none transition-all"
                    onKeyDown={(e) => e.key === "Enter" && updateCategory(cat.id)}
                  />
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateCategory(cat.id)} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all">
                      <Check size={20} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all">
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{cat.name}</span>
                  <span className="text-xs font-mono text-white/20">slug: /{cat.slug}</span>
                </div>
              )}

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditName(cat.name);
                  }}
                  disabled={actionLoading}
                  className="p-3 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                  title="Rename"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  disabled={actionLoading}
                  className="p-3 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="p-24 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Tag size={32} className="text-white/10" />
              </div>
              <p className="text-white/30 font-medium">No categories created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
