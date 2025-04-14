import { auth } from '@/auth'
import { User } from '@/models/User'
import dbConnect from '@/utils/db'
import { NextRequest, NextResponse } from 'next/server'

// Get user profile
export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'You must be logged in' },
        { status: 401 }
      )
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if user has at least one social link to verify
    const hasSocialLink = Boolean(
      user.socialProfiles?.github ||
        user.socialProfiles?.linkedin ||
        user.socialProfiles?.twitter ||
        user.socialProfiles?.website
    )

    if (hasSocialLink && !user.isVerified) {
      // Update user verification status
      user.isVerified = true
      await user.save()
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      bio: user.bio,
      profession: user.profession,
      location: user.location,
      isVerified: user.isVerified,
      socialProfiles: user.socialProfiles
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { message: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'You must be logged in' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Fields that can be updated
    const { bio, profession, location, socialProfiles } = body

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Update user fields
    if (bio !== undefined) user.bio = bio
    if (profession !== undefined) user.profession = profession
    if (location !== undefined) user.location = location

    // Update social profiles if provided
    if (socialProfiles) {
      user.socialProfiles = {
        ...user.socialProfiles,
        ...socialProfiles
      }
    }

    // Check if user has at least one social link to verify
    const hasSocialLink = Boolean(
      user.socialProfiles?.github ||
        user.socialProfiles?.linkedin ||
        user.socialProfiles?.twitter ||
        user.socialProfiles?.website
    )

    user.isVerified = hasSocialLink

    await user.save()

    return NextResponse.json({
      message: 'Profile updated successfully',
      isVerified: user.isVerified
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { message: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
