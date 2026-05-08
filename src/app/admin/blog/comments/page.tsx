import { requireAdmin } from "@/lib/auth";
import CommentModerator from "./CommentModerator";

export default async function AdminCommentsPage() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) return null;

  return <CommentModerator />;
}
