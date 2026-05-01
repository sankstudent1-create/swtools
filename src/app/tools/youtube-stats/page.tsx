"use client";

import React, { useState } from 'react';
import { Play, Search, BarChart2, Tag, Calendar, Clock, Eye, ThumbsUp, MessageCircle, User, ExternalLink, Copy, Check, Video, Download, Music, FileText } from 'lucide-react';
import { generateYouTubePDF } from './youtubePdfReport';

interface VideoStats {
  type: 'video' | 'playlist' | 'channel';
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: {
    maxres?: { url: string };
    high: { url: string };
    medium: { url: string };
  };
  tags: string[];
  // Video specific
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  duration?: string;
  channel?: {
    title: string;
    subscriberCount: string;
    thumbnails: {
      default: { url: string };
    };
  };
  // Playlist specific
  itemCount?: number;
  channelTitle?: string;
  // Channel specific
  subscriberCount?: string;
  videoCount?: string;
  customUrl?: string;
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

  const formatNumber = (num?: string | number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-IN').format(parseInt(num.toString()));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const isVideo = stats?.type === 'video';
  const isPlaylist = stats?.type === 'playlist';
  const isChannel = stats?.type === 'channel';

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6">
            <Video className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-4xl font-semibold mb-4 tracking-tight text-white italic uppercase">YouTube Stats Hub</h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium uppercase tracking-tight">
            Analyze Videos, Playlists, and Channels with AI-driven insights.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={fetchStats} className="max-w-3xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600/5 blur-[100px] pointer-events-none" />
            <div className="relative flex items-center bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden focus-within:border-red-500/30 transition-all p-2">
              <div className="pl-6 text-white/20">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter Video, Playlist, or Channel URL..."
                className="w-full bg-transparent border-none py-5 px-6 focus:ring-0 text-white placeholder:text-white/10 text-lg font-medium"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="bg-red-600 hover:bg-red-500 disabled:bg-white/5 disabled:text-white/10 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-red-900/20 active:scale-95"
              >
                {loading ? 'Analyzing...' : 'Extract Data'}
              </button>
            </div>
          </div>
          {error && <p className="mt-6 text-red-400 text-sm text-center font-bold uppercase tracking-wider bg-red-500/5 py-3 rounded-xl border border-red-500/10">{error}</p>}
        </form>

        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left: Content Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden group">
                <div className="relative aspect-video">
                  <img
                    src={stats.thumbnails.maxres?.url || stats.thumbnails.high.url || stats.thumbnails.medium.url}
                    alt={stats.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="px-3 py-1 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-widest">
                         {stats.type}
                       </span>
                       <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                         ID: {stats.id}
                       </span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight mb-4 italic uppercase tracking-tighter">{stats.title}</h2>
                    <div className="flex flex-wrap gap-6 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate(stats.publishedAt)}</span>
                      {stats.duration && <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {stats.duration.replace('PT', '').toLowerCase()}</span>}
                      {stats.itemCount !== undefined && <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4" /> {stats.itemCount} Videos</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & PDF Export */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button
                    onClick={() => generateYouTubePDF(stats)}
                    className="flex items-center justify-center gap-3 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/5"
                  >
                    <FileText className="w-5 h-5" />
                    Export Analysis PDF
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={copyTags}
                      className="flex-1 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied' : 'Copy All Data'}
                    </button>
                  </div>
              </div>

              {isVideo && (
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Download className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Download Resources</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href={`https://www.ssyoutube.com/watch?v=${stats.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      <Video className="w-4 h-4" />
                      Download Video
                    </a>
                    <a
                      href={`https://www.youtubepp.com/watch?v=${stats.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                      <Music className="w-4 h-4" />
                      Download Audio
                    </a>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10">
                <h3 className="text-xl font-black uppercase tracking-tighter italic mb-6">Description Registry</h3>
                <p className="text-white/40 text-sm whitespace-pre-wrap leading-relaxed font-medium line-clamp-6 hover:line-clamp-none transition-all cursor-pointer">
                  {stats.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Right: Metrics & Entity Info */}
            <div className="space-y-8">
              {/* Dynamic Stats Grid */}
              <div className="grid grid-cols-1 gap-4">
                {(stats.viewCount !== undefined) && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <Eye className="w-6 h-6 text-blue-400" />
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Total Visibility</span>
                    </div>
                    <div className="text-4xl font-black italic tracking-tighter">{formatNumber(stats.viewCount)}</div>
                  </div>
                )}
                {(stats.likeCount !== undefined) && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <ThumbsUp className="w-6 h-6 text-emerald-400" />
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Approval Rate</span>
                    </div>
                    <div className="text-4xl font-black italic tracking-tighter">{formatNumber(stats.likeCount)}</div>
                  </div>
                )}
                {(stats.subscriberCount !== undefined) && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <User className="w-6 h-6 text-purple-400" />
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Global Base</span>
                    </div>
                    <div className="text-4xl font-black italic tracking-tighter">{formatNumber(stats.subscriberCount)}</div>
                  </div>
                )}
                {(stats.videoCount !== undefined) && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <BarChart2 className="w-6 h-6 text-amber-400" />
                      <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Asset Count</span>
                    </div>
                    <div className="text-4xl font-black italic tracking-tighter">{formatNumber(stats.videoCount)}</div>
                  </div>
                )}
              </div>

              {/* Entity Context Card */}
              <div className="bg-red-600/10 border border-red-500/20 rounded-[2.5rem] p-10 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 group-hover:rotate-12">
                  <Activity className="w-32 h-32 text-red-500" />
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full border-4 border-red-500/20 overflow-hidden mx-auto mb-6 group-hover:scale-105 transition-transform shadow-2xl shadow-red-500/20">
                    <img 
                      src={isVideo ? stats.channel?.thumbnails.default.url : stats.thumbnails.high.url} 
                      alt={isVideo ? stats.channel?.title : stats.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
                    {isVideo ? stats.channel?.title : stats.title}
                  </h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10">
                    {isVideo ? `${formatNumber(stats.channel?.subscriberCount)} Subscribers` : isPlaylist ? 'Public Playlist Entity' : stats.customUrl || 'Verified Creator'}
                  </p>
                  <a
                    href={isChannel ? `https://youtube.com/${stats.customUrl || `channel/${stats.id}`}` : isPlaylist ? `https://youtube.com/playlist?list=${stats.id}` : `https://youtube.com/channel/${stats.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/90 transition shadow-xl"
                  >
                    Launch on YouTube <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Tags Index */}
              {isVideo && stats.tags && stats.tags.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-black uppercase tracking-tighter italic">Tag Index</h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stats.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
