"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit2, Check, X, Tag, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CategoryManager() {
  const supabase = createSupabaseBrowserClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("name");
    
    if (error) {
      setError(error.message);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }

  async function addCategory() {
    if (!newCategoryName.trim()) return;
    
    setActionLoading(true);
    setError(null);
    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    try {
      const { saveBlogCategory } = await import("../actions");
      await saveBlogCategory({ name: newCategoryName, slug });
      setNewCategoryName("");
      fetchCategories();
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
      const { saveBlogCategory } = await import("../actions");
      await saveBlogCategory({ name: editName, slug }, id);
      setEditingId(null);
      fetchCategories();
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
      const { deleteBlogCategory } = await import("../actions");
      await deleteBlogCategory(id);
      fetchCategories();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Manage Categories</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div className="text-sm">
            <p className="font-bold">Error Actioning Category</p>
            <p className="opacity-80">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400/50 hover:text-rose-400">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="ui-modal-shell p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} className="text-brand-orange" />
          Add New Category
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={actionLoading}
            placeholder="Category name (e.g. India Post)"
            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <button
            onClick={addCategory}
            disabled={actionLoading || !newCategoryName.trim()}
            className="ui-btn-primary px-6 rounded-xl font-semibold whitespace-nowrap flex items-center gap-2"
          >
            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Add Category
          </button>
        </div>
      </div>

      <div className="ui-modal-shell overflow-hidden">
        <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Tag size={20} className="text-indigo-400" />
            Existing Categories
          </h2>
          <span className="text-xs text-white/30 font-mono">{categories.length} total</span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-white/40 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-brand-orange" size={24} />
            Loading categories...
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {categories.map((cat) => (
              <div key={cat.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-grow mr-4">
                    <input
                      autoFocus
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-grow bg-white/10 border border-brand-orange/50 rounded-lg px-3 py-1 text-sm focus:outline-none transition-all"
                      onKeyDown={(e) => e.key === "Enter" && updateCategory(cat.id)}
                    />
                    <button onClick={() => updateCategory(cat.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors">
                      <Check size={18} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{cat.name}</span>
                    <span className="text-[11px] text-white/30 font-mono">/{cat.slug}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                    disabled={actionLoading}
                    className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    disabled={actionLoading}
                    className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="p-12 text-center text-white/40 italic">
                No categories yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
