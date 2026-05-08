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
  content_json: unknown;
  cover_image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  canonical_path: string | null;
  category: BlogCategory | null;
  author: { id: string; full_name: string | null } | null;
};

export async function listPublishedPosts(limit = 20) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,cover_image_url,status,published_at,updated_at,seo_title,seo_description,seo_keywords,canonical_path, category:blog_categories(id,slug,name,description), author:profiles(id,full_name)"
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
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,content_json,cover_image_url,status,published_at,updated_at,seo_title,seo_description,seo_keywords,canonical_path, category:blog_categories(id,slug,name,description), author:profiles(id,full_name)"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as BlogPost | null;
}
