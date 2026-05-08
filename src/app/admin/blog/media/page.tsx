import { requireAdmin } from "@/lib/auth";
import MediaLibrary from "./MediaLibrary";

export default async function AdminMediaPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return null;

  return <MediaLibrary />;
}
