'use server'

import { requireAdmin } from '@/lib/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function saveBlogPost(postData: any, id?: string) {
  const { isAdmin, user } = await requireAdmin()
  if (!isAdmin || !user) {
    throw new Error('Unauthorized')
  }

  const admin = createSupabaseAdminClient()
  
  // Ensure the author_id is set to the current user if not provided
  const dataToSave = {
    ...postData,
    author_id: postData.author_id || user.id,
      seo_keywords: postData.seo_keywords || [],
      seo_description: postData.seo_description || postData.excerpt,
      updated_at: new Date().toISOString()
    }

  let result
  if (id) {
    result = await admin
      .from('blog_posts')
      .update(dataToSave)
      .eq('id', id)
      .select('id')
      .single()
  } else {
    result = await admin
      .from('blog_posts')
      .insert([dataToSave])
      .select('id')
      .single()
  }

  if (result.error) {
    console.error('[blog-action] save failed:', result.error)
    throw new Error(result.error.message)
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  if (postData.slug) {
    revalidatePath(`/blog/${postData.slug}`)
  }

  return result.data
}

export async function deleteBlogPost(id: string) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  return { success: true }
}

export async function saveBlogCategory(categoryData: any, id?: string) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const admin = createSupabaseAdminClient()
  
  let result
  if (id) {
    result = await admin
      .from('blog_categories')
      .update(categoryData)
      .eq('id', id)
      .select('id')
      .single()
  } else {
    result = await admin
      .from('blog_categories')
      .insert([categoryData])
      .select('id')
      .single()
  }

  if (result.error) throw new Error(result.error.message)
  
  revalidatePath('/admin/blog/categories')
  return result.data
}

export async function deleteBlogCategory(id: string) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const admin = createSupabaseAdminClient()
  const { error } = await admin
    .from('blog_categories')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/blog/categories')
  return { success: true }
}

export async function uploadBlogMedia(formData: FormData) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const admin = createSupabaseAdminClient()
  const safeExt = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `uploads/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;

  const { error } = await admin.storage
    .from('blog')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })

  if (error) throw new Error(error.message)

  const { data: urlData } = admin.storage.from('blog').getPublicUrl(path)
  return { publicUrl: urlData.publicUrl }
}
