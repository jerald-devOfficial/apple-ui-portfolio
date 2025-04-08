import { Admin } from '@/models/Admin'
import dbConnect from '@/utils/db'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Add debug logging
      console.log('Sign-in attempt:', {
        email: profile?.email,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      })

      if (account?.provider === 'google') {
        const isAllowedToSignIn =
          profile?.email?.toLowerCase() === 'spaueofficial@gmail.com'

        if (!isAllowedToSignIn) {
          console.log('Sign-in denied: not admin email', profile?.email)
          return false
        }

        try {
          await dbConnect()
          const existingUser = await Admin.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          if (existingUser) {
            console.log('Sign-in successful: existing admin')
            return true
          } else {
            const newUser = new Admin({
              name: user.name,
              email: user?.email?.toLowerCase(),
              authType: 'GOOGLE',
              googleId: account.id
            })
            await newUser.save()
            console.log('Sign-in successful: new admin created')
            return true
          }
        } catch (error) {
          console.error('Sign-in error:', error)
          throw error
        }
      }

      return true
    }
  },
  debug: true, // Enable debug mode
  pages: {
    error: '/'
  }
})
