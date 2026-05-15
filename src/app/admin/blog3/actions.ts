'use server';

import { getPostV3, getPostsV3 } from "@/lib/blog-v3/queries";
import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";

export type BlockType = 'text' | 'image' | 'youtube' | 'heading' | 'divider';

export interface BlogBlock {
  id: string;
  type: BlockType;
  content: any;
}

export interface PostV3 {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_blocks: BlogBlock[];
  cover_image_url: string | null;
  category_id: string | null;
  author_id: string;
  status: 'draft' | 'published';
  published_at?: string | null;
  updated_at?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[];
  blog_categories_v3?: {
    name: string;
  } | null;
}

export { getPostV3, getPostsV3 };

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

export async function saveBlogCategoryV3(category: { name: string; slug: string; description?: string }, id?: string) {
  const supabase = await createClient();
  
  if (id) {
    const { data, error } = await supabase
      .from('blog_categories_v3')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('blog_categories_v3')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteBlogCategoryV3(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('blog_categories_v3')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function getCommentsV3() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_comments_v3')
    .select('*, post:blog_posts_v3(title)')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function updateCommentStatusV3(id: string, status: 'approved' | 'spam' | 'pending') {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_comments_v3')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCommentV3(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('blog_comments_v3')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

