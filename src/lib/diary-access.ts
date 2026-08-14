type AuthSession = {
  user?: {
    email?: string | null
    role?: string | null
  }
} | null

export const getSessionEmail = (session: AuthSession) =>
  session?.user?.email?.toLowerCase()

export const isDiaryAdmin = (session: AuthSession) => {
  if (session?.user?.role === 'admin') return true

  const email = getSessionEmail(session)
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()

  return Boolean(email && adminEmail && email === adminEmail)
}

export const canAccessPrivateDiary = (
  diaryUserId: string,
  session: AuthSession
) => {
  const email = getSessionEmail(session)
  if (!email) return false

  return diaryUserId === email || isDiaryAdmin(session)
}
