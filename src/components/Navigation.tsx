"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Layers, Menu, X } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide site nav on full-screen tool pages that have their own appbar
  const FULLSCREEN_TOOLS = ['/tools/letterpad-generator', '/tools/gds-leave', '/tools/td-commission'];
  const isFullscreen = FULLSCREEN_TOOLS.some(p => pathname.startsWith(p));
  if (isFullscreen) return null;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-md flex items-center justify-center group-hover:bg-white/[0.1] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <Layers className="text-white w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-wide text-white">
                SW<span className="text-white/40 font-light">Tools</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-1">
              <Link href="/tools" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === "/tools" || pathname === "/" ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                Tools
              </Link>
              <Link href="/about" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === "/about" ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                About
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors backdrop-blur-md"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-2xl pt-20 md:hidden">
            <nav className="flex flex-col p-6 space-y-4">
              <Link href="/tools" onClick={() => setIsOpen(false)} className="text-xl font-medium text-white p-2 border-b border-white/5">Tools</Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="text-xl font-medium text-white/50 p-2">About</Link>
            </nav>
        </div>
      )}
    </>
  );
}
