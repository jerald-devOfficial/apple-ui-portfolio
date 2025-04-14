import { auth } from '@/auth'
import Blog from '@/models/Blog'
import { User } from '@/models/User'
import dbConnect from '@/utils/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await auth()

    // Require authentication for likes
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Authentication required to like posts' },
        { status: 401 }
      )
    }

    const { blogId, action } = await req.json()

    if (!blogId) {
      return NextResponse.json(
        { message: 'Blog ID is required' },
        { status: 400 }
      )
    }

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
    }

    await dbConnect()

    // Find the blog post
    const blog = await Blog.findById(blogId)

    if (!blog) {
      return NextResponse.json(
        { message: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Get user email (unique identifier)
    const userEmail = session.user.email?.toLowerCase() || ''
    const isAdmin =
      userEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL!.toLowerCase()

    // Find user in database
    const user = await User.findOne({ email: userEmail })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found. Please sign in again.' },
        { status: 404 }
      )
    }

    // For non-admin users, check verification (admins bypass this check)
    if (!isAdmin && !user.isVerified) {
      return NextResponse.json(
        {
          message:
            'Please complete your profile verification before interacting with posts',
          requiresVerification: true
        },
        { status: 403 }
      )
    }

    // Check if they've provided at least one social profile (admins bypass this check)
    if (!isAdmin && !hasSocialProfiles(user)) {
      return NextResponse.json(
        {
          message:
            'Please add at least one social profile to verify your identity',
          requiresSocialProfile: true
        },
        { status: 403 }
      )
    }

    // Dual storage: in blog.likedBy for counting and rendering UI
    // and in user.likedPosts for user-specific operations
    if (action === 'like') {
      // Add to blog.likedBy if not already there
      if (!blog.likedBy) {
        blog.likedBy = []
      }

      if (!blog.likedBy.includes(userEmail)) {
        blog.likedBy.push(userEmail)
        blog.likes = (blog.likes || 0) + 1
        await blog.save()

        // Store in user.likedPosts as well
        await User.updateOne(
          { _id: user._id },
          { $addToSet: { likedPosts: blogId } }
        )

        return NextResponse.json({
          message: 'Blog post liked successfully',
          likeCount: blog.likes,
          hasLiked: true
        })
      } else {
        return NextResponse.json({
          message: 'You have already liked this post',
          likeCount: blog.likes,
          hasLiked: true
        })
      }
    } else {
      // Unlike: remove from both places
      if (!blog.likedBy) {
        blog.likedBy = []
      }

      const userIndex = blog.likedBy.indexOf(userEmail)
      if (userIndex !== -1 && blog.likes && blog.likes > 0) {
        blog.likedBy.splice(userIndex, 1)
        blog.likes -= 1
        await blog.save()

        // Remove from user.likedPosts as well
        await User.updateOne(
          { _id: user._id },
          { $pull: { likedPosts: blogId } }
        )

        return NextResponse.json({
          message: 'Blog post unliked successfully',
          likeCount: blog.likes,
          hasLiked: false
        })
      } else {
        return NextResponse.json(
          { message: 'No likes to remove' },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    console.error('Error processing like/unlike:', error)
    return NextResponse.json(
      {
        message: 'Error processing like/unlike',
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
}

// Helper function to check if user has any social profiles
function hasSocialProfiles(user: {
  socialProfiles?: {
    github?: string
    linkedin?: string
    twitter?: string
    facebook?: string
    website?: string
  }
}): boolean {
  if (!user.socialProfiles) return false

  return Boolean(
    user.socialProfiles.github ||
      user.socialProfiles.linkedin ||
      user.socialProfiles.twitter ||
      user.socialProfiles.facebook ||
      user.socialProfiles.website
  )
}
