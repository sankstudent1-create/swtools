"use server";

import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitComment(postId: string, content: string) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to comment.");
  }

  // Get user profile for name/email if possible, or use auth data
  // Assuming 'profiles' table exists with 'full_name' or similar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const authorName = profile?.full_name || user.email?.split('@')[0] || "Anonymous";
  const authorEmail = user.email;

  const { error } = await supabase
    .from('blog_comments_v3')
    .insert({
      post_id: postId,
      content,
      author_name: authorName,
      author_email: authorEmail,
      status: 'pending' // Comments go to pending for moderation
    });

  if (error) {
    console.error('Error submitting comment:', error);
    throw new Error("Failed to submit comment.");
  }

  revalidatePath(`/blog/[slug]`, 'page');
  return { success: true };
}
