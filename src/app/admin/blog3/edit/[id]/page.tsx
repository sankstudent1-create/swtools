import PostEditor3 from "../../PostEditor3";
import { getPostV3, getCategoriesV3 } from "../../actions";
import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";

interface EditPostV3PageProps {
  params: {
    id: string;
  };
}

export default async function EditPostV3Page({ params }: EditPostV3PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const [post, categories] = await Promise.all([
    getPostV3(id),
    getCategoriesV3()
  ]);

  if (!post) {
    notFound();
  }

  return (
    <PostEditor3 
      initialData={post}
      categories={categories}
      authorId={user.id}
    />
  );
}
