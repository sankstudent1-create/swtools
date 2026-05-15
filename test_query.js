const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const slug = 'testing-out-things';
  console.log(`Testing query for slug: ${slug}`);
  
  const { data, error } = await supabase
    .from('blog_posts_v3')
    .select('*, blog_categories_v3(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
    
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", JSON.stringify(data, null, 2));
  }
}

testQuery();
