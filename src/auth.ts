import { Admin } from '@/models/Admin'
import dbConnect from '@/utils/db'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Extend session types
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      id?: string
      isAdmin?: boolean
    }
  }
  interface JWT {
    id?: string
    isAdmin?: boolean
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const isAllowedToSignIn =
          profile?.email?.toLowerCase() ===
          process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()

        if (!isAllowedToSignIn) {
          console.log(
            `signIn denied for non-${process.env.NEXT_PUBLIC_ADMIN_EMAIL} email address`
          )
          return false
        }

        try {
          await dbConnect()

          const existingUser = await Admin.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          if (existingUser) {
            console.log('signIn successful for existing user')
            return true
          } else {
            const newUser = new Admin({
              name: user.name,
              email: user?.email?.toLowerCase(),
              authType: 'GOOGLE',
              googleId: account.id
            })

            await newUser.save()
            console.log('signIn successful, new user created')
            return true
          }
        } catch (error) {
          console.error(`signIn failed with error: ${error}`)
          throw error
        }
      }

      console.log(
        `signIn called for account: ${account?.provider}, email from profile: ${profile?.email}`
      )
      return false // Deny non-Google sign-ins
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/',
    error: '/'
  }
})
