-- Blog V3 System - Robust & Direct Media Storage
-- This schema avoids complex rich-text JSON and stores content in a structured block array
-- to ensure links, images, and embeds are never stripped.

-- 1. Categories V3
CREATE TABLE IF NOT EXISTS public.blog_categories_v3 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Posts V3
CREATE TABLE IF NOT EXISTS public.blog_posts_v3 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    -- content_blocks stores an array of { type: 'text'|'image'|'youtube'|'link', data: { ... } }
    content_blocks JSONB NOT NULL DEFAULT '[]',
    cover_image_url TEXT,
    category_id UUID REFERENCES public.blog_categories_v3(id) ON DELETE SET NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[] DEFAULT '{}',
    
    -- Search Optimization
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
    ) STORED
);

-- 3. Comments V3
CREATE TABLE IF NOT EXISTS public.blog_comments_v3 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.blog_posts_v3(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'spam'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_v3_slug ON public.blog_posts_v3(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_v3_status ON public.blog_posts_v3(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_v3_category ON public.blog_posts_v3(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_v3_search ON public.blog_posts_v3 USING GIN(search_vector);

-- 5. RLS Policies
ALTER TABLE public.blog_categories_v3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts_v3 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments_v3 ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public Read Categories V3" ON public.blog_categories_v3 FOR SELECT USING (true);
CREATE POLICY "Public Read Published Posts V3" ON public.blog_posts_v3 FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Approved Comments V3" ON public.blog_comments_v3 FOR SELECT USING (status = 'approved');

-- Admin Write Access (assuming is_admin() function exists in your DB)
CREATE POLICY "Admin All Categories V3" ON public.blog_categories_v3 FOR ALL USING (is_admin());
CREATE POLICY "Admin All Posts V3" ON public.blog_posts_v3 FOR ALL USING (is_admin());
CREATE POLICY "Admin All Comments V3" ON public.blog_comments_v3 FOR ALL USING (is_admin());
CREATE POLICY "Auth Users Insert Comments V3" ON public.blog_comments_v3 FOR INSERT WITH CHECK (auth.role() = 'authenticated');
