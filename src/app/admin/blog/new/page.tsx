import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/blog/admin-queries";
import PostEditor from "../PostEditor";

export default async function NewPostPage() {
  const { isAdmin, user } = await requireAdmin();
  if (!isAdmin || !user) return null;

  const categories = await listCategories();

  return (
    <PostEditor 
      categories={categories} 
      authorId={user.id} 
    />
  );
}
