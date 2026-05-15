import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BlogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_blocks: any[]; // Changed from content_json to content_blocks
  cover_image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  category: BlogCategory | null;
};

export async function listPublishedPosts(limit = 20) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts_v3")
    .select(
      "id,slug,title,excerpt,cover_image_url,status,published_at,updated_at,seo_title,seo_description,seo_keywords,content_blocks, category:blog_categories_v3(id,slug,name,description)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BlogPost[];
}

export async function getPublishedPostBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts_v3")
    .select(
      "id,slug,title,excerpt,content_blocks,cover_image_url,status,published_at,updated_at,seo_title,seo_description,seo_keywords, category:blog_categories_v3(id,slug,name,description)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();



  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as BlogPost | null;
}

