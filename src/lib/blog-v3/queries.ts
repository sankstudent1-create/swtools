import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";

export async function getPostV3(idOrSlug: string) {
  const supabase = await createClient();
  
  // Check if it's a UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  console.log('Fetching V3 post:', idOrSlug);

  let query = supabase
    .from('blog_posts_v3')
    .select('*, blog_categories_v3(*)');

  if (isUuid) {
    query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
  } else {
    query = query.eq('slug', idOrSlug);
  }

  // Ensure we only get published posts for public view
  query = query.eq('status', 'published');

  const { data, error } = await query.maybeSingle();
  
  if (error) {
    console.error('Database error in getPostV3:', error);
    throw error;
  }
  
  return data;
}

export async function getPostsV3() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts_v3')
    .select('*, blog_categories_v3(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Database error in getPostsV3:', error);
    throw error;
  }
  return data;
}
