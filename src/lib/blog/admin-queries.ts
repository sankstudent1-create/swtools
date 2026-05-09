import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function listAllPostsForAdmin() {
  const supabase = createSupabaseAdminClient();
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
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name");

  if (error) throw new Error(error.message);
  return data;
}

export async function getPostByIdForAdmin(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function listMediaFiles() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("blog").list("", {
    limit: 100,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" }
  });

  if (error) throw new Error(error.message);
  // Filter out system files
  return (data || []).filter(f => f.name !== ".emptyKeep");
}
