"use client";
export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { Instagram, Search, Download, Image as ImageIcon, Video, ExternalLink, Info, AlertCircle, CheckCircle2, Share2, Globe, Heart, MessageCircle } from 'lucide-react';
import { fetchInstagramMedia } from './actions';

export default function InstagramDownloaderPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetchInstagramMedia(url);
      if (response.error) {
        setError(response.error);
      } else if (response.success && response.data) {
        setResult(response.data);
      } else {
        // Fallback for unexpected response structure
        setResult(response);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-white pt-32 pb-24 px-4 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center justify-center p-4 rounded-[2rem] bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 mb-4 shadow-2xl">
            <Instagram className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic leading-none">
            Insta<span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">Vault</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium uppercase tracking-widest text-[11px]">
            The ultimate high-fidelity media extraction engine for Instagram.
          </p>
        </div>

        {/* Search Engine */}
        <form onSubmit={handleFetch} className="max-w-3xl mx-auto mb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center bg-[#0d1117] border border-white/5 rounded-[2.2rem] overflow-hidden p-2 backdrop-blur-xl">
              <div className="pl-6 text-white/20">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste Instagram post, reel, or video link..."
                className="w-full bg-transparent border-none py-6 px-6 focus:ring-0 text-white placeholder:text-white/10 text-lg font-medium"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:text-white/10 text-white px-10 py-5 rounded-[1.8rem] font-black uppercase tracking-widest text-xs transition-all shadow-2xl active:scale-95"
              >
                {loading ? 'Extracting...' : 'Fetch Media'}
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-8 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </form>

        {/* Results Engine */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Media Preview Card */}
            <div className="lg:col-span-3 space-y-6">
              <div className="group relative bg-[#0d1117] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                <div className="aspect-square relative overflow-hidden bg-white/5">
                  <img
                    src={result.thumbnail_url}
                    alt={result.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07090f] via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Action Badge */}
                  <div className="absolute top-8 left-8">
                    <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white">
                      Verified Public Media
                    </span>
                  </div>
                </div>

                <div className="p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-black italic shadow-lg">
                        {result.author_name?.charAt(0) || 'I'}
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic tracking-tighter text-white">{result.author_name}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Verified Creator</p>
                      </div>
                    </div>
                    <a 
                      href={result.author_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>

                  <div className="h-px bg-white/5" />

                  <p className="text-white/50 text-sm leading-relaxed font-medium italic">
                    {result.title || "No caption provided for this media dispatch."}
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <button className="flex items-center justify-center gap-3 bg-white text-black py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl">
                      <Download size={16} /> Download Full Res
                    </button>
                    <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all active:scale-95">
                      <Share2 size={16} /> Share Link
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics & Metadata Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0d1117] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                <div className="flex items-center gap-3">
                  <Info size={18} className="text-pink-500" />
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">System Context</h4>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Media Type', value: 'Image/Video Cluster', icon: Globe, color: 'text-blue-400' },
                    { label: 'Security', value: 'End-to-End Verified', icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: 'Engagement', value: 'High Fidelity', icon: Heart, color: 'text-pink-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-3">
                        <item.icon size={14} className={item.color} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions / Notice */}
              <div className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-500/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 opacity-5 transition-transform group-hover:scale-110 group-hover:-rotate-12">
                  <Instagram size={120} className="text-pink-500" />
                </div>
                <div className="relative z-10 space-y-4">
                  <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">Vault Notice</h4>
                  <p className="text-white/40 text-[11px] leading-relaxed font-medium">
                    This tool fetches media through official public channels. Private accounts are protected by Instagram security and cannot be accessed.
                  </p>
                  <div className="pt-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-white/30 uppercase tracking-widest">Post Download</span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-white/30 uppercase tracking-widest">Reels Support</span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold text-white/30 uppercase tracking-widest">HD Quality</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Intro */}
        {!result && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            {[
              { title: 'Any Post', desc: 'Photos, carousels, and videos from public dispatches.', icon: ImageIcon },
              { title: 'Reels Engine', desc: 'Full support for Instagram Reels media extraction.', icon: Video },
              { title: 'HD Clusters', desc: 'Direct access to the highest resolution available.', icon: Download },
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <feature.icon size={20} className="text-white/40" />
                </div>
                <h5 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-2 italic">{feature.title}</h5>
                <p className="text-[11px] font-medium text-white/20 leading-relaxed uppercase tracking-tight">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
