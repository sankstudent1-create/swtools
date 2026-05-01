"use client";

import React, { useState } from 'react';
import { Play, Search, BarChart2, Tag, Calendar, Clock, Eye, ThumbsUp, MessageCircle, User, ExternalLink, Copy, Check, Video, Download, Music } from 'lucide-react';
import Image from 'next/image';

interface VideoStats {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    maxres?: { url: string };
    high: { url: string };
  };
  tags: string[];
  viewCount: string;
  likeCount: string;
  commentCount: string;
  duration: string;
  channel: {
    title: string;
    subscriberCount: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

export default function YoutubeStatsPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStats = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setStats(null);

    try {
      const res = await fetch('/api/tools/youtube-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch statistics');

      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyTags = () => {
    if (!stats?.tags) return;
    navigator.clipboard.writeText(stats.tags.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat('en-IN').format(parseInt(num));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <Video className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-semibold mb-4 tracking-tight text-white">YouTube Stats Extractor</h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-light">
            Analyze any YouTube video's performance, extract tags, and get deep SEO insights instantly.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={fetchStats} className="max-w-3xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500/10 blur-xl group-hover:bg-red-500/20 transition-all duration-500 opacity-0 group-focus-within:opacity-100"></div>
            <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden focus-within:border-red-500/50 transition-all">
              <div className="pl-6 text-white/40">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube video link here..."
                className="w-full bg-transparent border-none py-5 px-4 focus:ring-0 text-white placeholder:text-white/20"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="bg-red-600 hover:bg-red-700 disabled:bg-white/5 disabled:text-white/20 text-white px-8 py-3 rounded-xl font-medium transition m-2"
              >
                {loading ? 'Analyzing...' : 'Extract Stats'}
              </button>
            </div>
          </div>
          {error && <p className="mt-4 text-red-400 text-sm text-center">{error}</p>}
        </form>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left: Thumbnail and Video Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={stats.thumbnails.maxres?.url || stats.thumbnails.high.url}
                    alt={stats.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-2xl font-semibold leading-tight mb-2">{stats.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(stats.publishedAt)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {stats.duration.replace('PT', '').toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Download className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-medium">Download Options</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={`https://www.ssyoutube.com/watch?v=${stats.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <Video className="w-5 h-5" />
                    Download Video (MP4)
                  </a>
                  <a
                    href={`https://www.youtubepp.com/watch?v=${stats.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <Music className="w-5 h-5" />
                    Download Audio (MP3)
                  </a>
                </div>
                <p className="mt-4 text-white/20 text-[10px] text-center uppercase tracking-widest">
                  Redirects to secure conversion partners
                </p>
              </div>

              {/* Tags Section */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-medium">Video Tags ({stats.tags.length})</h3>
                  </div>
                  <button
                    onClick={copyTags}
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy All'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stats.tags.length > 0 ? (
                    stats.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/[0.04] border border-white/5 rounded-xl text-sm text-white/60 hover:text-white transition-colors cursor-default">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/20 italic text-sm">No tags found for this video.</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                <h3 className="text-lg font-medium mb-4">Video Description</h3>
                <p className="text-white/50 text-sm whitespace-pre-wrap leading-relaxed line-clamp-6 hover:line-clamp-none transition-all cursor-pointer">
                  {stats.description}
                </p>
              </div>
            </div>

            {/* Right: Analytics & Channel */}
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Views</span>
                  </div>
                  <div className="text-3xl font-semibold">{formatNumber(stats.viewCount)}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <ThumbsUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Likes</span>
                  </div>
                  <div className="text-3xl font-semibold">{formatNumber(stats.likeCount)}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Comments</span>
                  </div>
                  <div className="text-3xl font-semibold">{formatNumber(stats.commentCount)}</div>
                </div>
              </div>

              {/* Channel Card */}
              <div className="bg-red-600/5 border border-red-600/20 rounded-3xl p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <User className="w-12 h-12" />
                </div>
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full border-4 border-red-600/20 overflow-hidden mx-auto mb-4 group-hover:scale-105 transition-transform">
                    <img src={stats.channel.thumbnails.default.url} alt={stats.channel.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{stats.channel.title}</h3>
                  <p className="text-white/40 text-sm mb-6">{formatNumber(stats.channel.subscriberCount)} Subscribers</p>
                  <a
                    href={`https://youtube.com/channel/${stats.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 transition"
                  >
                    Visit Channel <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Quick Links</h4>
                <div className="space-y-3">
                  <a href={`https://www.youtube.com/watch?v=${stats.id}`} target="_blank" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition group">
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">Watch Original</span>
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                  </a>
                  <button onClick={() => window.open(`https://i.ytimg.com/vi/${stats.id}/maxresdefault.jpg`, '_blank')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition group">
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">Download Thumbnail</span>
                    <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
