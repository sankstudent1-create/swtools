"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide site nav on full-screen tool pages that have their own appbar
  const FULLSCREEN_TOOLS = ['/tools/letterpad-generator', '/tools/gds-leave', '/tools/td-commission'];
  const isFullscreen = FULLSCREEN_TOOLS.some(p => pathname.startsWith(p));
  if (isFullscreen) return null;

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-[#07090f]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-3.5 cursor-pointer group">
              <div className="relative w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_20px_rgba(255,255,255,0.05)] group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_25px_rgba(255,255,255,0.1)]">
                {/* Glow effect matching brand colors */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-sky/20 to-brand-pink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <img 
                  src="/icon-192.png" 
                  alt="SW Tools Logo" 
                  className="w-6 h-6 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="font-heading font-semibold text-2xl tracking-tight text-white flex items-center">
                SW<span className="text-white/40 font-light ml-0.5">Tools</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1.5 p-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <Link href="/tools" className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pathname === "/tools" || pathname === "/" ? "bg-white/[0.08] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5" : "text-white/50 hover:text-white hover:bg-white/[0.04]"}`}>
                Tools
              </Link>
              <Link href="/about" className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pathname === "/about" ? "bg-white/[0.08] text-white shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5" : "text-white/50 hover:text-white hover:bg-white/[0.04]"}`}>
                About
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06] transition-all backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#07090f]/98 backdrop-blur-3xl pt-24 pb-6 px-6 md:hidden overflow-y-auto border-t border-white/[0.05]">
          <nav className="flex flex-col space-y-2 mt-4">
            <Link 
              href="/tools" 
              onClick={() => setIsOpen(false)} 
              className={`p-4 rounded-2xl text-xl font-medium transition-colors ${pathname === "/tools" || pathname === "/" ? "bg-white/[0.05] text-white border border-white/[0.05]" : "text-white/60 hover:text-white hover:bg-white/[0.02]"}`}
            >
              Tools
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)} 
              className={`p-4 rounded-2xl text-xl font-medium transition-colors ${pathname === "/about" ? "bg-white/[0.05] text-white border border-white/[0.05]" : "text-white/60 hover:text-white hover:bg-white/[0.02]"}`}
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
