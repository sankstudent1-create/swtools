import { requireAdmin } from "@/lib/auth";
import CategoryManager from "./CategoryManager";
import { listCategories } from "@/lib/blog/admin-queries";

export default async function AdminCategoriesPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return null;

  const categories = await listCategories();

  return <CategoryManager initialCategories={categories || []} />;
}
