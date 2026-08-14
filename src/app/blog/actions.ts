'use server'

import type { BlogActionState } from '@/app/blog/state'
import { auth } from '@/auth'
import { parseBlogFormData, slugFromTitle } from '@/lib/blog-fields'
import { Admin } from '@/models/Admin'
import { Blog } from '@/models/Blog'
import dbConnect from '@/utils/db'
import { redirect } from 'next/navigation'

const requireAdmin = async () => {
  const session = await auth()

  if (!session?.user?.email) return null

  await dbConnect()
  const admin = await Admin.findOne({ email: session.user.email })
  return admin
}

export const saveBlogAction = async (
  _prevState: BlogActionState,
  formData: FormData
): Promise<BlogActionState> => {
  const admin = await requireAdmin()

  if (!admin) {
    return { success: false, error: 'Admin access required' }
  }

  const parsed = parseBlogFormData(formData)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid blog payload'
    }
  }

  const data = parsed.data
  const hasContent =
    Boolean(data.content?.trim()) || data.contentBlocks.length > 0

  if (!hasContent) {
    return {
      success: false,
      error: 'Add at least one content block'
    }
  }

  const blogId = String(formData.get('blogId') ?? '')

  if (blogId) {
    const blog = await Blog.findById(blogId)

    if (!blog) {
      return { success: false, error: 'Blog not found' }
    }

    if (blog.userId !== admin._id.toString()) {
      return { success: false, error: 'Access denied' }
    }

    await Blog.findByIdAndUpdate(
      blogId,
      { $set: data },
      { runValidators: true }
    )

    redirect(`/blog/${blog.slug}`)
  }

  const slug = slugFromTitle(data.title)
  const existingBlog = await Blog.findOne({ slug })

  if (existingBlog) {
    return { success: false, error: 'Blog with this title already exists' }
  }

  const blog = await Blog.create({
    userId: admin._id,
    title: data.title,
    slug,
    summary: data.summary,
    content: data.content || '',
    contentBlocks: data.contentBlocks,
    category: data.category || 'technology',
    tags: data.tags,
    status: data.status,
    coverImage: data.coverImage,
    author: {
      id: admin._id,
      name: admin.name,
      email: admin.email
    }
  })

  redirect(`/blog/${blog.slug}`)
}
