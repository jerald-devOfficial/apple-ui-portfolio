import { auth } from '@/auth'
import Blog from '@/models/Blog'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

// Get a specific blog post
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    // Validate and sanitize id
    if (!mongoose.Types.ObjectId.isValid(id) && !id.match(/^[a-zA-Z0-9-]+$/)) {
      return NextResponse.json(
        { msg: 'Invalid blog ID or slug' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find blog by id or slug
    const blog = await Blog.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
        { slug: id.match(/^[a-zA-Z0-9-]+$/) ? id : null }
      ]
    })

    if (!blog) {
      return NextResponse.json({ msg: 'Blog post not found' }, { status: 404 })
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } })

    return NextResponse.json({ blog })
  } catch (err) {
    console.error(`Error fetching blog post:`, err)
    return NextResponse.json({ msg: 'Database Error' }, { status: 500 })
  }
}

// Update a blog post
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Find blog post
    const blog = await Blog.findById(id)

    if (!blog) {
      return NextResponse.json({ msg: 'Blog post not found' }, { status: 404 })
    }

    // Check ownership
    const userEmail = session.user.email?.toLowerCase()
    if (blog.userId !== userEmail) {
      return NextResponse.json({ msg: 'Forbidden' }, { status: 403 })
    }

    // Get update data
    const {
      title,
      summary,
      content,
      coverImage,
      mediaFiles,
      tags,
      category,
      status,
      featured
    } = await req.json()

    // Prepare update object
    const updateData: Partial<typeof blog> = {}

    if (title !== undefined) updateData.title = title
    if (summary !== undefined) updateData.summary = summary
    if (content !== undefined) updateData.content = content
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (mediaFiles !== undefined) updateData.mediaFiles = mediaFiles
    if (tags !== undefined) {
      updateData.tags =
        typeof tags === 'string'
          ? tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag)
          : tags
    }
    if (category !== undefined) updateData.category = category
    if (status !== undefined) updateData.status = status
    if (featured !== undefined) updateData.featured = featured

    // If title is changing, update slug
    if (title && title !== blog.title) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
    }

    // Update blog post
    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })

    return NextResponse.json({
      blog: updatedBlog,
      message: 'Blog post updated successfully',
      success: true
    })
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errorList = []
      for (const e in err.errors) {
        errorList.push(err.errors[e].message)
      }
      return NextResponse.json({ msg: errorList }, { status: 400 })
    } else {
      console.error('Blog update error:', err)
      return NextResponse.json(
        { msg: 'Unable to update blog post' },
        { status: 500 }
      )
    }
  }
}

// Delete a blog post
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Find blog post
    const blog = await Blog.findById(id)

    if (!blog) {
      return NextResponse.json({ msg: 'Blog post not found' }, { status: 404 })
    }

    // Check ownership
    const userEmail = session.user.email?.toLowerCase()
    if (blog.userId !== userEmail) {
      return NextResponse.json({ msg: 'Forbidden' }, { status: 403 })
    }

    // Delete blog post
    await Blog.findByIdAndDelete(id)

    return NextResponse.json({
      message: 'Blog post deleted successfully',
      success: true
    })
  } catch (err) {
    console.error('Blog deletion error:', err)
    return NextResponse.json(
      { msg: 'Unable to delete blog post' },
      { status: 500 }
    )
  }
}
