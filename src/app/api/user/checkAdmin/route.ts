import { auth } from '@/auth'
import { Admin } from '@/models/Admin'
import dbConnect from '@/utils/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    // Check if email is admin email
    // For simplicity, we're just checking a specific email
    // In a real app, you'd look up the user in an admin collection
    if (
      session.user.email.toLowerCase() ===
      process.env.NEXT_PUBLIC_ADMIN_EMAIL!.toLowerCase()
    ) {
      await dbConnect()

      // Ensure admin exists in the database
      const admin = await Admin.findOne({
        email: session.user.email.toLowerCase()
      })

      if (!admin) {
        return NextResponse.json({ isAdmin: false }, { status: 200 })
      }

      return NextResponse.json({ isAdmin: true }, { status: 200 })
    }

    return NextResponse.json({ isAdmin: false }, { status: 200 })
  } catch (error) {
    console.error('Error checking admin status:', error)
    return NextResponse.json(
      { message: 'Failed to check admin status', isAdmin: false },
      { status: 500 }
    )
  }
}
