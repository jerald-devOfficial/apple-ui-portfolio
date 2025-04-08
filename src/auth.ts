import { Admin } from '@/models/Admin'
import dbConnect from '@/utils/db'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Hardcode the email check as it was working before
        const isAllowedToSignIn =
          profile?.email?.toLowerCase() === 'spaueofficial@gmail.com'

        if (!isAllowedToSignIn) {
          console.log('signIn denied for non-admin email')
          return false
        }

        try {
          await dbConnect()
          const existingUser = await Admin.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          if (existingUser) {
            console.log('signIn successful for existing admin')
            return true
          } else {
            const newUser = new Admin({
              name: user.name,
              email: user?.email?.toLowerCase(),
              authType: 'GOOGLE',
              googleId: account.id
            })
            await newUser.save()
            console.log('signIn successful, new admin created')
            return true
          }
        } catch (error) {
          console.error('signIn failed with error:', error)
          throw error
        }
      }
      return false
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  }
})
