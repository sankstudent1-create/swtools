
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('blog_posts_v3')
    .select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error accessing blog_posts_v3:', error);
  } else {
    console.log('Successfully accessed blog_posts_v3 table');
  }

  const { data: posts, error: postsError } = await supabase
    .from('blog_posts_v3')
    .select('*');
    
  if (postsError) {
    console.error('Error fetching posts:', postsError);
  } else {
    console.log('Posts found:', posts?.length);
    posts?.forEach(p => console.log(`Slug: ${p.slug}, Status: ${p.status}, ID: ${p.id}`));
  }
}

checkSchema();
