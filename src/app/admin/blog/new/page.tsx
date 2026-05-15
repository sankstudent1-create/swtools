import PostEditor from "../PostEditor";
import { getCategoriesV3 } from "../actions";
import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function NewPostV3Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const categories = await getCategoriesV3();

  return (
    <PostEditor 
      categories={categories}
      authorId={user.id}
    />
  );
}
