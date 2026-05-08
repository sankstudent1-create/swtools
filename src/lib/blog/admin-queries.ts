import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function listAllPostsForAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,slug,title,status,published_at,updated_at, category:blog_categories(name)"
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function listCategories() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getPostByIdForAdmin(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
