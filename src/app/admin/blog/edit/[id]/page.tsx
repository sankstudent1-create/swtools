import { requireAdmin } from "@/lib/auth";
import { listCategories, getPostByIdForAdmin } from "@/lib/blog/admin-queries";
import { notFound } from "next/navigation";
import PostEditor from "../../PostEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isAdmin, user } = await requireAdmin();
  if (!isAdmin || !user) return null;

  const [categories, post] = await Promise.all([
    listCategories(),
    getPostByIdForAdmin(id),
  ]);

  if (!post) return notFound();

  return (
    <PostEditor 
      initialData={post}
      categories={categories} 
      authorId={user.id} 
    />
  );
}
