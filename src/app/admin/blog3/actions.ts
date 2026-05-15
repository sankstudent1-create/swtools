'use server';

import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";

export type BlockType = 'text' | 'image' | 'youtube' | 'heading' | 'divider';

export interface BlogBlock {
  id: string;
  type: BlockType;
  content: any; // data specific to the block type
}

export interface PostV3 {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_blocks: BlogBlock[];
  cover_image_url: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  author_id: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[] | null;
  published_at?: string | null;
}

export async function getPostsV3() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts_v3')
    .select('*, blog_categories_v3(name)')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function getPostV3(idOrSlug: string) {
  const supabase = await createClient();
  
  // Check if it's a UUID to avoid Supabase errors when querying the id column
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  let query = supabase
    .from('blog_posts_v3')
    .select('*, blog_categories_v3(*)');

  if (isUuid) {
    query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
  } else {
    query = query.eq('slug', idOrSlug);
  }

  const { data, error } = await query.single();
    
  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  return data;
}

export async function savePostV3(post: PostV3) {
  const supabase = await createClient();
  
  if (post.id) {
    const { data, error } = await supabase
      .from('blog_posts_v3')
      .update({
        ...post,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('blog_posts_v3')
      .insert([post])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

export async function getCategoriesV3() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_categories_v3')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data;
}
