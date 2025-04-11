import { auth } from '@/auth'
import Diary from '@/models/Diary'
import dbConnect from '@/utils/db'
import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'

// Get a single diary entry
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    console.log(`Attempting to fetch diary with ID: ${id}`)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Invalid diary ID: ${id}`)
      return NextResponse.json({ msg: 'Invalid diary ID' }, { status: 400 })
    }

    await dbConnect()
    console.log(`Database connected, retrieving diary: ${id}`)

    // Get authentication status using new auth() method
    const session = await auth()
    const isAuthenticated = !!session

    // Extract user email from session with consistent approach
    let userEmail: string | undefined = undefined

    if (session?.user?.email) {
      userEmail = session.user.email.toLowerCase()
      console.log('User authenticated:', userEmail)
    }

    // Find the diary with comprehensive error handling
    let diary
    try {
      console.log(`Executing Mongoose query: Diary.findById("${id}")`)
      diary = await Diary.findById(id)
      console.log('Query result:', diary ? 'Found diary' : 'No diary found')
    } catch (err) {
      console.error('Database error when finding diary:', err)
      return NextResponse.json(
        {
          msg: 'Database error',
          error: err instanceof Error ? err.message : String(err)
        },
        { status: 500 }
      )
    }

    // Handle not found
    if (!diary) {
      console.log(`Diary not found with ID: ${id}`)
      return NextResponse.json(
        {
          msg: 'Diary not found',
          details: { id }
        },
        { status: 404 }
      )
    }

    try {
      // Extract diary data for comparison
      const diaryData = diary.toObject()

      console.log('Diary details:', {
        id: diaryData._id,
        title: diaryData.title,
        publicity: diaryData.publicity,
        hasUserId: !!diaryData.userId,
        userId: diaryData.userId || '<missing>'
      })

      const diaryUserId = diaryData.userId ? diaryData.userId.toLowerCase() : ''

      // Check permissions:
      // 1. Public diaries can be viewed by anyone
      // 2. Private diaries can only be viewed by their owner
      if (diaryData.publicity === true) {
        console.log('Access granted - diary is public')
        return NextResponse.json(diary)
      }

      // For private diaries, authentication is required
      if (!isAuthenticated) {
        console.log(
          'Permission denied: private diary and user is not authenticated'
        )
        return NextResponse.json(
          {
            msg: 'Unauthorized - authentication required for private diaries',
            debug: {
              isAuthenticated,
              isPublic: diaryData.publicity
            }
          },
          { status: 401 }
        )
      }

      // Private diary - check ownership
      console.log('Checking ownership:', {
        diaryUserId: diaryUserId,
        userEmail,
        lowerCaseMatch: diaryUserId === userEmail
      })

      // Use the environment variable consistently
      const ownerEmail =
        process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase() ||
        'spaueofficial@gmail.com'
      const isSiteOwner = userEmail === ownerEmail

      // Check if user is either the diary owner or the site owner
      const isOwner = diaryUserId === userEmail
      const hasAccess = isOwner || isSiteOwner

      if (!hasAccess) {
        console.log(
          'Permission denied: private diary and user is not owner or site admin'
        )
        return NextResponse.json(
          {
            msg: 'Unauthorized - this private diary belongs to someone else',
            debug: {
              diaryUserId,
              userEmail,
              isAuthenticated,
              isSiteOwner
            }
          },
          { status: 401 }
        )
      }

      console.log(
        `Access granted to private diary - ${
          isOwner ? 'user is owner' : 'user is site admin'
        }`
      )
      return NextResponse.json(diary)
    } catch (error) {
      console.error('Error processing diary data:', error)
      return NextResponse.json(
        {
          msg: 'Error processing diary data',
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unhandled error fetching diary:', error)
    return NextResponse.json(
      {
        msg: 'Error fetching diary',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// Update a diary entry
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ msg: 'Invalid diary ID' }, { status: 400 })
    }

    const {
      title,
      content,
      publicity,
      tags,
      category,
      resources,
      status,
      isFavorite,
      lastEditedSection
    } = await req.json()

    await dbConnect()

    // Simplified way to extract email from any session format
    let userEmail: string | undefined = undefined

    if (session) {
      if ('email' in session) {
        userEmail = session.email as string
      } else if (
        session.user &&
        typeof session.user === 'object' &&
        'email' in session.user
      ) {
        userEmail = session.user.email as string
      } else if (session.user?.id) {
        userEmail = session.user.id as string
      }

      // Make sure we have email in lowercase
      if (userEmail) {
        userEmail = userEmail.toLowerCase()
      }
    }

    if (!userEmail) {
      console.log('Could not determine user email from session:', session)
      return NextResponse.json(
        { msg: 'Unable to authenticate user' },
        { status: 401 }
      )
    }

    console.log(`Attempting to update diary ${id} for user ${userEmail}`)

    // Site owner should have access to all diaries - using environment variable
    const ownerEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL!
    const isSiteOwner = userEmail === ownerEmail

    // Find diary with case-insensitive userId comparison
    const diary = await Diary.findOne({
      _id: id
    })

    if (!diary) {
      return NextResponse.json({ msg: 'Diary not found' }, { status: 404 })
    }

    // Verify ownership with case-insensitive comparison
    const diaryUserId = diary.userId?.toLowerCase() || ''
    const isOwner = diaryUserId === userEmail
    const hasAccess = isOwner || isSiteOwner

    if (!hasAccess) {
      console.log(
        `User ${userEmail} is not the owner of diary ${id} (owned by ${diary.userId}) and is not the site owner`
      )
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    // Update fields
    diary.title = title || diary.title
    diary.content = content || diary.content
    diary.publicity = publicity !== undefined ? publicity : diary.publicity
    diary.tags = tags || diary.tags
    diary.category = category || diary.category
    diary.resources = resources || diary.resources
    diary.status = status || diary.status
    diary.isFavorite = isFavorite !== undefined ? isFavorite : diary.isFavorite
    diary.lastEditedSection = lastEditedSection || diary.lastEditedSection

    await diary.save()
    console.log(
      `Diary ${id} updated successfully by ${userEmail} (${
        isOwner ? 'owner' : 'site admin'
      })`
    )

    return NextResponse.json({
      diary,
      message: 'Diary updated successfully',
      success: true
    })
  } catch (error) {
    console.error('Error updating diary:', error)
    return NextResponse.json({ msg: 'Error updating diary' }, { status: 500 })
  }
}

// Delete a diary entry
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ msg: 'Invalid diary ID' }, { status: 400 })
    }

    await dbConnect()

    // Simplified way to extract email from any session format
    let userEmail: string | undefined = undefined

    if (session) {
      if ('email' in session) {
        userEmail = session.email as string
      } else if (
        session.user &&
        typeof session.user === 'object' &&
        'email' in session.user
      ) {
        userEmail = session.user.email as string
      } else if (session.user?.id) {
        userEmail = session.user.id as string
      }

      // Make sure we have email in lowercase
      if (userEmail) {
        userEmail = userEmail.toLowerCase()
      }
    }

    if (!userEmail) {
      console.log('Could not determine user email from session:', session)
      return NextResponse.json(
        { msg: 'Unable to authenticate user' },
        { status: 401 }
      )
    }

    console.log(`Attempting to delete diary ${id} for user ${userEmail}`)

    // Site owner should have access to all diaries - using environment variable
    const ownerEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL!
    const isSiteOwner = userEmail === ownerEmail

    // First find the diary to verify ownership
    const diary = await Diary.findById(id)
    if (!diary) {
      return NextResponse.json({ msg: 'Diary not found' }, { status: 404 })
    }

    // Verify ownership with case-insensitive comparison
    const diaryUserId = diary.userId?.toLowerCase() || ''
    const isOwner = diaryUserId === userEmail
    const hasAccess = isOwner || isSiteOwner

    if (!hasAccess) {
      console.log(
        `User ${userEmail} is not the owner of diary ${id} (owned by ${diary.userId}) and is not the site owner`
      )
      return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 })
    }

    // Now delete the diary
    await Diary.deleteOne({ _id: id })
    console.log(
      `Diary ${id} deleted successfully by ${userEmail} (${
        isOwner ? 'owner' : 'site admin'
      })`
    )

    return NextResponse.json({ message: 'Diary deleted successfully' })
  } catch (error) {
    console.error('Error deleting diary:', error)
    return NextResponse.json({ msg: 'Error deleting diary' }, { status: 500 })
  }
}
