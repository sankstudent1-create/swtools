import { getCommentsV3 } from "../actions";
import CommentModerator from "./CommentModerator";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const comments = await getCommentsV3();

  return (
    <main className="min-h-screen bg-[#07090f]">
      <CommentModerator initialComments={comments} />
    </main>
  );
}
