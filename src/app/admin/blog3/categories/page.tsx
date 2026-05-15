import { getCategoriesV3 } from "../actions";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesV3();

  return (
    <main className="min-h-screen bg-[#07090f]">
      <CategoryManager initialCategories={categories} />
    </main>
  );
}
