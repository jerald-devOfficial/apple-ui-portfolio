import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export const requireAdminSession = async () => {
  const session = await auth()

  if (session?.user?.role !== 'admin') {
    return null
  }

  return session
}

export const unauthorizedResponse = () =>
  NextResponse.json({ msg: ['Unauthorized'], success: false }, { status: 401 })
