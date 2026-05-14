import { requireAdmin } from "@/lib/auth";
import { listCategories } from "@/lib/blog/admin-queries";
import PostEditor2 from "../PostEditor2";

export default async function NewPostV2Page() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <div className="min-h-screen bg-[#07090f] pt-20">
      <PostEditor2 categories={categories || []} />
    </div>
  );
}
