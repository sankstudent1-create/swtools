"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Image as ImageIcon, FileText, Settings, ChevronRight, Menu, X, 
  Maximize, Sparkles, Layers, PenTool, Edit3, Fingerprint, RefreshCw, 
  FlipHorizontal, Crop, Type, Layers as LayersIcon, Mail, Building, Calculator, Smartphone,
  Video
} from 'lucide-react';

import { TOOLS_DATA, CATEGORIES } from '@/lib/tools-data';

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-fuchsia-500/30 relative overflow-x-hidden font-sans">
      
      {/* GLASSMORPHISM BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute top-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-fuchsia-600/20 blur-[130px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs font-medium tracking-widest uppercase text-white/70">Redesigned Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-6 leading-[1.1]">
            Elevate your workflow <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">
              in crystal clarity.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-14 font-light leading-relaxed">
            A premium suite of web utilities wrapped in a seamless, distraction-free glassmorphic interface.
          </p>

          {/* Master Search Bar (Glass Pill) */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700"></div>
            
            <div className="relative flex items-center bg-white/[0.03] backdrop-blur-2xl border border-white/[0.1] rounded-full p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] group-focus-within:border-white/[0.2] group-focus-within:bg-white/[0.05] transition-all duration-300">
              <Search className="w-6 h-6 text-white/40 ml-4 shrink-0" />
              <input
                type="text"
                className="w-full bg-transparent text-white placeholder-white/30 px-4 py-4 focus:outline-none text-lg"
                placeholder="Search tools, formats, or utilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                spellCheck="false"
              />
              <button className="hidden sm:flex items-center px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors mr-1 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 relative z-10">
        
        {/* Glass Category Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <h2 className="text-2xl font-medium text-white tracking-tight">
            {searchQuery ? 'Search Results' : 'Utility Grid'}
          </h2>
          
          <div className="flex overflow-x-auto pb-2 md:pb-0 w-full md:w-auto hide-scrollbar gap-3 snap-x">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setSearchQuery('');
                }}
                className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
                  activeCategory === category
                    ? 'bg-white/15 text-white border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                    : 'bg-white/[0.02] text-white/50 border border-white/[0.05] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid - Frosted Glass Cards */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link 
                  href={tool.href}
                  key={tool.id} 
                  prefetch={false}
                  className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.15] hover:-translate-y-1 rounded-3xl p-7 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full shadow-[0_8px_30px_rgb(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  {/* Subtle inner card glow on hover */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-0 group-hover:opacity-[0.03] blur-3xl transition-opacity duration-500 rounded-full"></div>
                  
                  <div className="relative z-10 flex items-start justify-between mb-6">
                    {/* Glowing Icon Container */}
                    <div className={`p-3 rounded-2xl ${tool.bg} ${tool.border} border backdrop-blur-md shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className={`w-6 h-6 ${tool.accent}`} strokeWidth={1.5} />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/40 bg-white/[0.05] border border-white/[0.05] px-3 py-1.5 rounded-full">
                      {tool.category}
                    </span>
                  </div>
                  
                  <h3 className="relative z-10 text-xl font-medium text-white mb-3">
                    {tool.name}
                  </h3>
                  
                  <p className="relative z-10 text-sm text-white/50 leading-relaxed flex-grow mb-8 line-clamp-2 font-light">
                    {tool.description}
                  </p>
                  
                  <div className="relative z-10 mt-auto flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors duration-300">
                    Open Tool
                    <ChevronRight className="w-4 h-4 ml-1.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Glass Empty State */
          <div className="text-center py-28 px-6 border border-white/[0.05] rounded-3xl bg-white/[0.02] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.1] mb-6 shadow-lg">
              <Search className="h-6 w-6 text-white/40" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">No utilities found</h3>
            <p className="text-white/50 max-w-sm mx-auto text-base font-light">
              We couldn't find anything matching "<span className="text-white font-medium">{searchQuery}</span>". 
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="mt-8 px-6 py-3 rounded-xl text-sm font-medium text-black bg-white hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* CSS Utilities */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Subtle selection color */
        ::selection {
          background-color: rgba(217, 70, 239, 0.3); /* fuchsia */
          color: white;
        }
      `}} />
    </div>
  );
}
