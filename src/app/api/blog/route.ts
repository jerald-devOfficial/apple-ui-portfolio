import { auth } from '@/auth'
import Blog from '@/models/Blog'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

// Create a new blog post
export const POST = async (req: NextRequest) => {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      summary,
      content,
      coverImage,
      mediaFiles,
      tags,
      category,
      status,
      featured = false
    } = await req.json()

    // Validate required fields
    if (!title || !summary || !content) {
      return NextResponse.json(
        { msg: 'Title, summary, and content are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Get user info for author
    const userEmail = session.user.email || 'anonymous'
    const userId =
      typeof userEmail === 'string' ? userEmail.toLowerCase() : userEmail
    const authorName = session.user.name || userEmail

    console.log('Creating blog post:', {
      title,
      author: authorName,
      category,
      status
    })

    // Create new blog post
    const newBlog = await Blog.create({
      userId,
      author: authorName,
      title,
      summary,
      content,
      coverImage,
      mediaFiles,
      tags: tags
        ? tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag)
        : [],
      category: category || 'technology',
      status: status || 'draft',
      featured,
      slug: title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim()
    })

    console.log('Blog post created:', {
      id: newBlog._id,
      title: newBlog.title,
      slug: newBlog.slug
    })

    return NextResponse.json({
      blog: newBlog,
      message: 'Blog post created successfully',
      success: true
    })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errorList = []
      for (const e in error.errors) {
        errorList.push(error.errors[e].message)
      }
      return NextResponse.json({ msg: errorList }, { status: 400 })
    } else {
      console.error('Blog creation error:', error)
      return NextResponse.json(
        { msg: 'Unable to create blog post' },
        { status: 500 }
      )
    }
  }
}

// Get blog posts with filtering and pagination
export const GET = async (req: NextRequest) => {
  try {
    // Parse query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const category = url.searchParams.get('category')
    const tag = url.searchParams.get('tag')
    const search = url.searchParams.get('search')
    const featured = url.searchParams.get('featured')

    const skip = (page - 1) * limit

    await dbConnect()

    // Build query
    const query: {
      status: string
      category?: string
      tags?: { $in: string[] }
      featured?: boolean
      $text?: { $search: string }
    } = {
      // Only show published posts unless specific status is requested
      status: 'published'
    }

    // Add filters
    if (category) query.category = category
    if (tag) query.tags = { $in: [tag] }
    if (featured === 'true') query.featured = true

    // Add search
    if (search) {
      query.$text = { $search: search }
    }

    // Count total matching documents for pagination
    const total = await Blog.countDocuments(query)

    // Get posts with pagination
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)

    console.log(
      `Fetched ${blogs.length} blog posts (page ${page}, limit ${limit})`
    )

    // Get all available categories and tags for filters
    const categories = await Blog.distinct('category', { status: 'published' })
    const tags = await Blog.distinct('tags', { status: 'published' })

    return NextResponse.json({
      blogs,
      filters: {
        categories,
        tags
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    })
  } catch (err) {
    console.error('Error fetching blog posts:', err)
    return NextResponse.json({ msg: 'Database Error' }, { status: 500 })
  }
}
