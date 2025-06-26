import { auth } from '@/auth'
import { Admin } from '@/models/Admin'
import { Blog } from '@/models/Blog'
import dbConnect from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch blogs (public only for unauthenticated users)
export const GET = async (req: NextRequest) => {
  try {
    await dbConnect()
    const session = await auth()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}

    // If not admin, only show published blogs
    if (!session?.user?.email) {
      query.status = 'published'
    } else {
      // Check if user is admin
      const admin = await Admin.findOne({ email: session.user.email })
      if (!admin) {
        query.status = 'published'
      }
    }

    if (category) {
      query.category = category
    }

    if (featured === 'true') {
      query.featured = true
    }

    if (search) {
      query.$text = { $search: search }
    }

    const blogResults = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Serialize the blog data to remove MongoDB ObjectIds
    const blogs = JSON.parse(JSON.stringify(blogResults))

    const total = await Blog.countDocuments(query)

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

// POST - Create new blog (admin only)
export const POST = async (req: NextRequest) => {
  try {
    await dbConnect()
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await Admin.findOne({ email: session.user.email })
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    // Accept data inside 'update' property if present (from frontend)
    const data = body.update || body
    const {
      title,
      summary,
      content,
      contentBlocks,
      category,
      tags,
      status,
      coverImage
    } = data

    // Validation for required fields (allow contentBlocks-only blogs)
    if (
      !title ||
      !summary ||
      ((!content || content.trim() === '') &&
        (!contentBlocks || contentBlocks.length === 0))
    ) {
      return NextResponse.json(
        {
          error:
            'Title, summary, and content (or at least one content block) are required.'
        },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug })
    if (existingBlog) {
      return NextResponse.json(
        { error: 'Blog with this title already exists' },
        { status: 400 }
      )
    }

    const blog = new Blog({
      userId: admin._id,
      title,
      slug,
      summary,
      content: content || '',
      contentBlocks: contentBlocks || [],
      category: category || 'technology',
      tags: tags || [],
      status: status || 'draft',
      coverImage,
      author: {
        id: admin._id,
        name: admin.name,
        email: admin.email
      }
    })

    await blog.save()

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}
