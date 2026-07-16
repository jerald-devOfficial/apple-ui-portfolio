import { Admin } from '@/models/Admin'
import { User } from '@/models/User'
import dbConnect from '@/utils/db'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
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
    async jwt({ token, trigger }) {
      if (!token.email) {
        return token
      }

      if (trigger === 'signIn' || trigger === 'signUp' || !token.role) {
        await dbConnect()

        const admin = await Admin.findOne({
          email: (token.email as string).toLowerCase()
        }).lean()

        if (admin) {
          token.role = 'admin'
          token.sub = admin._id.toString()
          return token
        }

        const user = await User.findOne({
          email: (token.email as string).toLowerCase()
        }).lean()

        if (user) {
          token.role = 'user'
          token.sub = user._id.toString()
        }
      }

      return token
    },
    async signIn({ user, account, profile }) {
      // Add debug logging
      console.log('Sign-in attempt:', {
        email: profile?.email,
        provider: account?.provider,
        timestamp: new Date().toISOString()
      })

      if (account?.provider === 'google') {
        try {
          await dbConnect()

          // Check if user is admin first
          const admin = await Admin.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          if (admin) {
            console.log('Sign-in successful: admin user')
            return true
          }

          // If not admin, check if regular user exists
          const regularUser = await User.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          if (regularUser) {
            console.log('Sign-in successful: existing regular user')
            return true
          }

          // Create new regular user
          const newUser = new User({
            name: user.name,
            email: user?.email?.toLowerCase(),
            authType: 'GOOGLE',
            googleId: account.id,
            avatar: user.image
          })
          await newUser.save()
          console.log('Sign-in successful: new regular user created')
          return true
        } catch (error) {
          console.error('Sign-in error:', error)
          throw error
        }
      }

      return true
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.role === 'admin' || token.role === 'user') {
          session.user.role = token.role
        }

        if (token.sub) {
          session.user.id = token.sub
        }
      }

      return session
    }
  },
  debug: true, // Enable debug mode
  pages: {
    error: '/'
  }
})
