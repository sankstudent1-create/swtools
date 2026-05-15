"use server";

import { createSupabaseServerClient as createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitComment(postId: string, content: string, slug: string) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to comment." };
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
    return { error: "Failed to submit comment. Please ensure you are logged in." };
  }

  // Revalidate the specific blog post page
  revalidatePath(`/blog/${slug}`); 
  return { success: true };
}
