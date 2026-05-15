
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkPosts() {
  const { data, error } = await supabase
    .from('blog_posts_v3')
    .select('id, title, slug, status');
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log('Posts in V3:');
  console.table(data);
}

checkPosts();
