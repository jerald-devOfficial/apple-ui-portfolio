import { auth } from '@/auth'
import { Blog } from '@/models/Blog'
import { Comment, IComment } from '@/models/Comment'
import { User } from '@/models/User'
import dbConnect from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch comments for a blog
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect()
    const { id } = await params

    const commentResults = await Comment.find({ blogId: id })
      .sort({ createdAt: -1 })
      .lean()

    // Serialize the comment data to remove MongoDB ObjectIds
    const comments = JSON.parse(JSON.stringify(commentResults)) as IComment[]

    // Group comments by parent (for nested structure)
    const topLevelComments = comments.filter(
      (comment: IComment) => !comment.parentId
    )
    const replies = comments.filter((comment: IComment) => comment.parentId)

    // Build nested structure (max 2 levels)
    const commentsWithReplies = topLevelComments.map((comment: IComment) => ({
      ...comment,
      replies: replies.filter(
        (reply: IComment) => reply.parentId === comment._id
      )
    }))

    return NextResponse.json(commentsWithReplies)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST - Create new comment
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await dbConnect()
    const session = await auth()
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to comment' },
        { status: 401 }
      )
    }

    // Check if blog exists and is published
    const blog = await Blog.findById(id)
    if (!blog || blog.status !== 'published') {
      return NextResponse.json(
        { error: 'Blog not found or not accessible' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { content, parentId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    // Check if user exists (for regular users, not admin)
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check nesting level if this is a reply
    if (parentId) {
      const parentComment = await Comment.findById(parentId)
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }

      // Check if parent comment is already a reply (max 2 levels)
      if (parentComment.parentId) {
        return NextResponse.json(
          { error: 'Cannot reply to a reply. Maximum nesting level reached.' },
          { status: 400 }
        )
      }
    }

    const comment = new Comment({
      blogId: id,
      userId: user._id,
      content: content.trim(),
      parentId: parentId || null,
      author: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    })

    await comment.save()

    // Update blog comment count
    await Blog.findByIdAndUpdate(id, { $inc: { commentCount: 1 } })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
