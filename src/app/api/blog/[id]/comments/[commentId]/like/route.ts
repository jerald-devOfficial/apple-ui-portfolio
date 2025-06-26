import { auth } from '@/auth'
import { Comment } from '@/models/Comment'
import { User } from '@/models/User'
import dbConnect from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

// POST - Like/unlike a comment
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) => {
  try {
    await dbConnect()
    const session = await auth()
    const { commentId } = await params

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to like comments' },
        { status: 401 }
      )
    }

    // Check if user exists
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user already liked the comment
    const hasLiked = comment.likedBy.includes(user._id.toString())

    if (hasLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(
        (id) => id !== user._id.toString()
      )
      comment.likes = Math.max(0, comment.likes - 1)
    } else {
      // Like
      comment.likedBy.push(user._id.toString())
      comment.likes += 1
    }

    await comment.save()

    return NextResponse.json({
      likes: comment.likes,
      liked: !hasLiked
    })
  } catch (error) {
    console.error('Error liking comment:', error)
    return NextResponse.json(
      { error: 'Failed to like comment' },
      { status: 500 }
    )
  }
}
