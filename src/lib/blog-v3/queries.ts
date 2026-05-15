import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";

export async function getPostV3(idOrSlug: string) {
  const supabase = await createClient();
  
  // Check if it's a UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  console.log('Fetching V3 post:', idOrSlug);

  let query = supabase
    .from('blog_posts_v3')
    .select('*');

  if (isUuid) {
    query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
  } else {
    query = query.eq('slug', idOrSlug);
  }

  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Database error in getPostV3:', error);
    throw error;
  }
  
  return data;
}

export async function getPostsV3(onlyPublished = true) {
  const supabase = await createClient();
  let query = supabase
    .from('blog_posts_v3')
    .select('*, blog_categories_v3(*)');
  
  if (onlyPublished) {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query.order('created_at', { ascending: false });
    
  if (error) {
    console.error('Database error in getPostsV3:', error);
    throw error;
  }
  return data;
}

export async function getCommentsForPostV3(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_comments_v3')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Database error in getCommentsForPostV3:', error);
    throw error;
  }
  return data;
}
