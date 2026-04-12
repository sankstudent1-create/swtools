"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, Image as ImageIcon, FileText, Settings, ChevronRight, Menu, X, 
  Maximize, Sparkles, Layers, PenTool, Edit3, Fingerprint, RefreshCw, 
  FlipHorizontal, Crop, Type, Layers as LayersIcon, Mail, Building, Calculator
} from 'lucide-react';

// Unified Tools Data mapped to the new Crystalline design system
const TOOLS_DATA = [
  {
    id: "ssc",
    name: "SSC Exam Signature",
    description: "Format signature for all SSC examination platforms with official compliance",
    category: "Format",
    icon: PenTool,
    accent: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    href: "/tools/ssc",
  },
  {
    id: "rrb",
    name: "RRB Railway Signature",
    description: "Format signature for RRB Railway recruitment examinations with handwriting emphasis",
    category: "Format",
    icon: Edit3,
    accent: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    href: "/tools/rrb",
  },
  {
    id: "india-post-photo",
    name: "India Post GDS Photo",
    description: "Format photo for India Post GDS Online Engagement with portrait orientation",
    category: "India Post",
    icon: ImageIcon,
    accent: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    href: "/tools/india-post-photo",
  },
  {
    id: "india-post-signature",
    name: "India Post GDS Signature",
    description: "Format signature for India Post GDS Online Engagement with landscape orientation",
    category: "India Post",
    icon: PenTool,
    accent: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    href: "/tools/india-post-signature",
  },
  {
    id: "bank-thumb",
    name: "Banking Thumb Impression",
    description: "Format left-thumb impression for banking recruitments with square ratio and clarity optimization",
    category: "Format",
    icon: Fingerprint,
    accent: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    href: "/tools/bank-thumb",
  },
  {
    id: "ibps-declaration",
    name: "IBPS Declaration",
    description: "Prepare handwritten declaration image for IBPS portals with exact landscape output profile",
    category: "Format",
    icon: FileText,
    accent: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    href: "/tools/ibps-declaration",
  },
  {
    id: "neet-signature",
    name: "NEET Signature",
    description: "Format NEET signature image with balanced compression and official upload-friendly dimensions",
    category: "Format",
    icon: PenTool,
    accent: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    href: "/tools/neet-signature",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    description: "Resize with presets, fit modes, background fill, quality control, and export format switching",
    category: "Image Utility",
    icon: Maximize,
    accent: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    href: "/tools/image-resizer",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    description: "Reduce file size with output format conversion, size targeting, scaling, and width constraints",
    category: "Image Utility",
    icon: Settings,
    accent: "text-fuchsia-400",
    bg: "bg-fuchsia-400/10",
    border: "border-fuchsia-400/20",
    href: "/tools/image-compressor",
  },
  {
    id: "aspect-ratio-changer",
    name: "Aspect Ratio Changer",
    description: "Convert ratios with cover or contain framing, custom backgrounds, presets, and export format control",
    category: "Image Utility",
    icon: Maximize,
    accent: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    href: "/tools/aspect-ratio-changer",
  },
  {
    id: "pdf-maker",
    name: "PDF Maker",
    description: "Build PDFs with page size, orientation, margins, fit mode, compression level, and file naming controls",
    category: "PDF Utility",
    icon: FileText,
    accent: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    href: "/tools/pdf-maker",
  },
  {
    id: "image-scanner",
    name: "Image Scanner",
    description: "Create scan outputs with black-and-white, grayscale, cleanup, invert, and export format modes",
    category: "Image Utility",
    icon: Search,
    accent: "text-indigo-400",
    bg: "bg-indigo-400/10",
    border: "border-indigo-400/20",
    href: "/tools/image-scanner",
  },
  {
    id: "image-format-converter",
    name: "Image Format Converter",
    description: "Convert JPG, PNG, and WEBP files with quality control, background fill, and export sizing",
    category: "Image Utility",
    icon: RefreshCw,
    accent: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    href: "/tools/image-format-converter",
  },
  {
    id: "image-rotate-flip",
    name: "Image Rotate & Flip",
    description: "Rotate, mirror, and export images with background control and angle presets",
    category: "Image Utility",
    icon: FlipHorizontal,
    accent: "text-teal-400",
    bg: "bg-teal-400/10",
    border: "border-teal-400/20",
    href: "/tools/image-rotate-flip",
  },
  {
    id: "image-cropper",
    name: "Image Cropper",
    description: "Center-crop images to common or custom aspect ratios with export size and format controls",
    category: "Image Utility",
    icon: Crop,
    accent: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    href: "/tools/image-cropper",
  },
  {
    id: "watermark-stamper",
    name: "Watermark Stamper",
    description: "Apply text watermarks with position, opacity, color, and output format settings",
    category: "Image Utility",
    icon: Type,
    accent: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    href: "/tools/watermark-stamper",
  },
  {
    id: "bulk-image-converter",
    name: "Bulk Image Converter",
    description: "Convert multiple images in one run with target format and quality controls",
    category: "Image Utility",
    icon: LayersIcon,
    accent: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    href: "/tools/bulk-image-converter",
  },
  {
    id: "letterpad-generator",
    name: "Letterpad Generator",
    description: "Create professionally formatted government & office letterpads with AI assistance, customizable templates, and PDF output",
    category: "Generators",
    icon: Mail,
    accent: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    href: "/tools/letterpad-generator",
  },
  {
    id: "gds-leave",
    name: "GDS Leave Application",
    description: "Generate official GDS Leave Applications in quadruplicate format — Paid Leave or LWA — with cover letter, auto-filled fields, and print-ready PDF output",
    category: "India Post",
    icon: Building,
    accent: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    href: "/tools/gds-leave",
  },
  {
    id: "td-commission",
    name: "TD Commission / BPM",
    description: "Generate official BPM Incentive Bills for Time Deposit (TD) commissions with auto-calculating rates, amounts, and PDF exports",
    category: "India Post",
    icon: Calculator,
    accent: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    href: "/tools/td-commission",
  },
];

const CATEGORIES = ['All', 'Format', 'Image Utility', 'PDF Utility', 'India Post', 'Generators'];

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
