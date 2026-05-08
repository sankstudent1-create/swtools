import { requireAdmin } from "@/lib/auth";
import CategoryManager from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return null;

  return <CategoryManager />;
}
