"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/tools", label: "Tools" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080b12]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center justify-between py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/brand/sw-logo-mark.svg" alt="SW Tools logo" width={36} height={36} className="h-9 w-9 rounded-lg shadow-[0_10px_22px_rgba(240,106,155,0.35)]" />
            <div className="hidden sm:flex sm:flex-col sm:leading-none">
              <span className="font-heading text-sm font-bold tracking-wide text-white/95">SW Tools</span>
              <span className="text-[10px] uppercase tracking-[0.14em] text-white/55">Format and Utility Hub</span>
            </div>
            <span className="font-heading text-lg font-bold sm:hidden bg-gradient-to-r from-brand-orange via-brand-pink to-brand-sky bg-clip-text text-transparent">
              SW Tools
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-brand-orange/25 via-brand-pink/20 to-brand-sky/25 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/tools" className="rounded-lg bg-gradient-to-r from-brand-orange to-brand-pink px-5 py-2 text-sm font-semibold text-black shadow-[0_10px_22px_rgba(242,154,74,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(242,154,74,0.4)]">
              Open Tools
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg border border-white/10 p-2 text-white/85 transition-colors hover:bg-white/10 md:hidden"
          >
            {isOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="space-y-1 border-t border-white/10 pb-4 pt-4 md:hidden">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-gradient-to-r from-brand-orange/25 via-brand-pink/20 to-brand-sky/25 text-white"
                      : "text-white/75 hover:bg-white/8"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link href="/tools" onClick={() => setIsOpen(false)} className="mt-2 block rounded-lg bg-gradient-to-r from-brand-orange to-brand-pink px-4 py-2 text-sm font-semibold text-black">
              Open Tools
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
