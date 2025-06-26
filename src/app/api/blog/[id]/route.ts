import { auth } from '@/auth'
import { Admin } from '@/models/Admin'
import { Blog, IBlog } from '@/models/Blog'
import dbConnect from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch single blog
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect()
    const session = await auth()
    const { id } = await params

    const blogResult = await Blog.findById(id).lean()

    if (!blogResult) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Serialize the blog data to remove MongoDB ObjectIds
    const blog = JSON.parse(JSON.stringify(blogResult)) as IBlog

    // Check access permissions
    if (blog.status === 'private') {
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const admin = await Admin.findOne({ email: session.user.email })
      if (!admin || blog.userId !== admin._id.toString()) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (blog.status === 'draft') {
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const admin = await Admin.findOne({ email: session.user.email })
      if (!admin || blog.userId !== admin._id.toString()) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Increment view count for published blogs
    if (blog.status === 'published') {
      await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } })
    }

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
  }
}

// PATCH - Update blog (admin only)
export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect()
    const session = await auth()
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await Admin.findOne({ email: session.user.email })
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const blog = await Blog.findById(id)
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    if (blog.userId !== admin._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const { update } = body

    // Only update provided fields
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )

    return NextResponse.json(updatedBlog)
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog (admin only)
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect()
    const session = await auth()
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await Admin.findOne({ email: session.user.email })
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const blog = await Blog.findById(id)
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    if (blog.userId !== admin._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await Blog.findByIdAndDelete(id)

    return NextResponse.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    )
  }
}
