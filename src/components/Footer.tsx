"use client";

import { Layers } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  const FULLSCREEN_TOOLS = ['/tools/letterpad-generator', '/tools/gds-leave', '/tools/td-commission'];
  const isFullscreen = FULLSCREEN_TOOLS.some(p => pathname.startsWith(p));
  if (isFullscreen) return null;

  return (
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
  );
}
