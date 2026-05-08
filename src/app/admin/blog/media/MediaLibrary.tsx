"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Image as ImageIcon, Trash2, Copy, Check, ExternalLink, Filter } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MediaLibrary() {
  const supabase = createSupabaseBrowserClient();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    // Note: This fetches from the 'blog' bucket. 
    // In a real app, you might want to store references in a database table for easier filtering.
    // For now, we list from storage directly.
    const { data, error } = await supabase.storage.from("blog").list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" }
    });
    
    if (data) {
      // Filter out system files if any
      setFiles(data.filter(f => f.name !== ".emptyKeep"));
    }
    setLoading(false);
  }

  async function deleteFile(name: string) {
    if (!confirm(`Are you sure you want to delete ${name}? This will break any blog posts using this image.`)) return;
    
    const { error } = await supabase.storage.from("blog").remove([name]);
    
    if (error) {
      alert(error.message);
    } else {
      fetchMedia();
    }
  }

  const copyToClipboard = (name: string) => {
    const { data } = supabase.storage.from("blog").getPublicUrl(name);
    const url = data.publicUrl;
    navigator.clipboard.writeText(url);
    setCopiedId(name);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Media Library</h1>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            Bucket: blog
          </span>
        </div>
      </div>

      <div className="ui-modal-shell p-6 mb-8 bg-brand-orange/5 border-brand-orange/20">
        <p className="text-sm text-brand-orange/80 flex items-center gap-2">
          <ImageIcon size={16} />
          Note: Images uploaded via the blog editor are stored here automatically.
        </p>
      </div>

      {loading ? (
        <div className="p-20 text-center text-white/40">Loading media assets...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {files.map((file) => {
            const { data } = supabase.storage.from("blog").getPublicUrl(file.name);
            const publicUrl = data.publicUrl;
            const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);

            return (
              <div key={file.id} className="group relative bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-brand-orange/50 transition-all">
                <div className="aspect-square bg-black/40 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/20">
                      <ImageIcon size={48} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">File</span>
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-[10px] text-white/40 truncate font-mono mb-3">{file.name}</p>
                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={() => copyToClipboard(file.name)}
                      className={`p-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold uppercase transition-all ${
                        copiedId === file.name 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {copiedId === file.name ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === file.name ? "Copied" : "Copy URL"}
                    </button>
                    
                    <div className="flex items-center gap-1">
                      <a 
                        href={publicUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 bg-white/5 text-white/40 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <ExternalLink size={12} />
                      </a>
                      <button
                        onClick={() => deleteFile(file.name)}
                        className="p-1.5 bg-white/5 text-white/40 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {files.length === 0 && (
            <div className="col-span-full p-20 text-center text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg">No media assets found in 'blog' bucket.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
