"use client";

import React from 'react';
import { Globe, Mail, Share2 } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  excerpt: string;
  url: string;
}

export default function ShareButtons({ title, excerpt, url }: ShareButtonsProps) {
  const shareData = {
    title,
    text: excerpt,
    url,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const handleMailShare = () => {
    const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(excerpt + '\n\nRead more at: ' + url)}`;
    window.location.href = mailto;
  };

  const handleGlobeShare = () => {
    // Open a generic share dialog or social links
    // For now, let's copy the link
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={handleGlobeShare}
        title="Copy Link"
        className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-orange text-white flex items-center justify-center transition-all"
      >
        <Globe size={18} />
      </button>
      <button 
        onClick={handleMailShare}
        title="Share via Email"
        className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-orange text-white flex items-center justify-center transition-all"
      >
        <Mail size={18} />
      </button>
      <button 
        onClick={handleNativeShare}
        title="Share Post"
        className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-orange text-white flex items-center justify-center transition-all"
      >
        <Share2 size={18} />
      </button>
    </div>
  );
}
