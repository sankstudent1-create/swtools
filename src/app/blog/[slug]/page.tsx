import { getPostV3, getCommentsForPostV3 } from "@/lib/blog-v3/queries";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Share2, Tag, User, Calendar, Play, Globe, Mail } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import CommentSection from "./CommentSection";

export async function generateMetadata({ params }: BlogPostV3PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPostV3(slug);
    
    if (!post) return { title: 'Post Not Found | SW Tools' };

    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt,
      keywords: post.seo_keywords || [],
      openGraph: {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        images: post.cover_image_url ? [post.cover_image_url] : [],
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'SW Tools Blog' };
  }
}

interface BlogPostV3PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function BlockRenderer({ block }: { block: any }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white italic mt-12 mb-6">{block.content.text}</h2>;
    case 'text':
      return <p className="text-lg text-white/70 leading-relaxed mb-6 whitespace-pre-wrap">{block.content.text}</p>;
    case 'image':
      return (
        <figure className="my-12 space-y-3">
          <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/5">
            <img src={block.content.src} alt={block.content.alt} className="w-full h-auto" />
          </div>
          {block.content.alt && (
            <figcaption className="text-center text-[10px] font-black uppercase tracking-widest text-white/20">
              {block.content.alt}
            </figcaption>
          )}
        </figure>
      );
    case 'youtube':
      let videoId = '';
      if (block.content.src.includes('v=')) {
        videoId = block.content.src.split('v=')[1].split('&')[0];
      } else if (block.content.src.includes('youtu.be/')) {
        videoId = block.content.src.split('youtu.be/')[1].split('?')[0];
      } else if (block.content.src.includes('youtube.com/live/')) {
        videoId = block.content.src.split('/live/')[1].split('?')[0];
      } else {
        // Fallback for raw IDs or other formats
        videoId = block.content.src.split('/').pop()?.split('?')[0] || block.content.src;
      }
        
      return (
        <div className="my-12 aspect-video rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    default:
      return null;
  }
}

export const dynamic = "force-dynamic";

export default async function BlogPostV3Page({ params }: BlogPostV3PageProps) {
  const { slug } = await params;
  const post = await getPostV3(slug);

  if (!post || post.status !== 'published') {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const comments = await getCommentsForPostV3(post.id);

  return (
    <div className="min-h-screen bg-[#07090f]">
      {/* Article Header */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative">
          <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-brand-orange transition-colors mb-12">
            <ArrowLeft size={14} /> Back to Stories
          </Link>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase tracking-widest border border-brand-orange/20">
                {post.blog_categories_v3?.name || 'V3 Story'}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20 flex items-center gap-1.5">
                <Calendar size={12} /> {new Date(post.published_at || post.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white italic leading-[0.95]">
              {post.title}
            </h1>
            
            <p className="text-xl text-white/40 font-medium leading-relaxed italic">
              {post.excerpt}
            </p>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.cover_image_url && (
        <div className="max-w-7xl mx-auto px-4 mb-20">
          <div className="aspect-[21/9] rounded-[40px] overflow-hidden border border-white/5 shadow-2xl bg-white/5">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-4 pb-40">
        <div className="prose prose-invert prose-brand max-w-none">
          {post.content_blocks.map((block: any) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>

        {/* Share Section */}
        <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">Share this Story</h4>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-orange text-white flex items-center justify-center transition-all">
                <Globe size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-orange text-white flex items-center justify-center transition-all">
                <Mail size={18} />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-orange text-white flex items-center justify-center transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection 
          postId={post.id}
          postSlug={post.slug}
          initialComments={comments}
          isLoggedIn={!!user}
          user={user}
        />
      </article>
    </div>
  );
}

