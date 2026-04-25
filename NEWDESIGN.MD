import React, { useState, useMemo } from 'react';
import { 
  Search, Code, Image as ImageIcon, FileText, TrendingUp, Calculator, 
  Settings, ChevronRight, Menu, X, Hash, Link as LinkIcon, Type, Maximize,
  Terminal, Sparkles, Layers
} from 'lucide-react';

// Mock Data: Updated with vibrant glass accents
const TOOLS_DATA = [
  { id: 1, name: 'JSON Formatter', description: 'Beautify, validate, and format your JSON data instantly.', category: 'Developer', icon: Code, accent: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  { id: 2, name: 'Base64 Encoder', description: 'Encode or decode text and files to Base64 format.', category: 'Developer', icon: Hash, accent: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20' },
  { id: 3, name: 'Keyword Density', description: 'Analyze the keyword density of your content for better SEO.', category: 'SEO', icon: TrendingUp, accent: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { id: 4, name: 'Meta Tag Gen', description: 'Generate custom meta tags for your HTML pages.', category: 'SEO', icon: Search, accent: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 5, name: 'Word Counter', description: 'Count words, characters, and paragraphs in real-time.', category: 'Text', icon: FileText, accent: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { id: 6, name: 'Case Converter', description: 'Convert text to UPPERCASE, lowercase, Title Case, etc.', category: 'Text', icon: Type, accent: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { id: 7, name: 'Image Resizer', description: 'Resize images to exact pixel dimensions quickly.', category: 'Image', icon: Maximize, accent: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  { id: 8, name: 'Color Picker', description: 'Extract colors from images or generate palettes.', category: 'Image', icon: ImageIcon, accent: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  { id: 9, name: 'URL Encoder', description: 'Safely encode or decode URL strings.', category: 'Developer', icon: LinkIcon, accent: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
  { id: 10, name: 'Percentage Calc', description: 'Calculate complex percentages and fractions easily.', category: 'Math', icon: Calculator, accent: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20' },
  { id: 11, name: 'Password Gen', description: 'Create strong, secure, and random passwords.', category: 'Security', icon: Settings, accent: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
  { id: 12, name: 'Lorem Ipsum', description: 'Generate dummy text for your layouts and mockups.', category: 'Text', icon: FileText, accent: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
];

const CATEGORIES = ['All', 'Developer', 'SEO', 'Text', 'Image', 'Math', 'Security'];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-fuchsia-500/30 relative overflow-x-hidden font-outfit">
      
      {/* GLASSMORPHISM BACKGROUND
        These blurred orbs create the colorful distortion effect through the frosted glass panels.
      */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute top-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-fuchsia-600/20 blur-[130px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-cyan-600/10 blur-[150px] mix-blend-screen"></div>
      </div>

      {/* Frosted Glass Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-md flex items-center justify-center group-hover:bg-white/[0.1] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <Layers className="text-white w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-wide text-white">
                SW<span className="text-white/40 font-light">Tools</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-1">
              {['Tools', 'Documentation', 'API'].map((item, i) => (
                <a key={item} href="#" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${i === 0 ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                  {item}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors backdrop-blur-md"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 z-10">
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
                <div 
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
                </div>
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

      {/* Glass Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] bg-white/[0.01] backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Layers className="text-white/30 w-5 h-5" />
            <span className="text-sm font-medium text-white/50">SW Tools Directory</span>
          </div>
          <div className="text-sm font-light text-white/30">
            &copy; {new Date().getFullYear()} SW Info Systems. Crafted with glass.
          </div>
        </div>
      </footer>

      {/* CSS Utilities & Font Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        .font-outfit {
          font-family: 'Outfit', sans-serif;
        }

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