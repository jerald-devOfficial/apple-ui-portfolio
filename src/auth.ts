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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect()

          const admin = await Admin.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          if (admin) {
            return true
          }

          const regularUser = await User.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          if (regularUser) {
            return true
          }

          const newUser = new User({
            name: user.name,
            email: user?.email?.toLowerCase(),
            authType: 'GOOGLE',
            googleId: account.id,
            avatar: user.image
          })
          await newUser.save()
          return true
        } catch (error) {
          console.error(
            'Sign-in error:',
            error instanceof Error ? error.message : 'unknown'
          )
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
  pages: {
    error: '/'
  }
})
