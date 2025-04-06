import { Admin } from '@/models/Admin'
import { User } from '@/models/User'
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
      role?: 'admin' | 'user'
    }
  }
  interface JWT {
    id?: string
    role?: string
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
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'user'
      }
      return session
    },

    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account?.provider === 'google' && profile) {
        const isAdmin =
          profile.email?.toLowerCase() ===
          process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()

        token.role = isAdmin ? 'admin' : 'user'

        // Add user ID to token if we have it from DB
        if (isAdmin) {
          await dbConnect()
          const admin = await Admin.findOne({
            email: profile.email?.toLowerCase()
          }).lean()

          if (admin) {
            token.id = admin._id.toString()
          }
        } else {
          await dbConnect()
          const dbUser = await User.findOne({
            email: profile.email?.toLowerCase()
          }).lean()

          if (dbUser) {
            token.id = dbUser._id.toString()
          }
        }
      }

      return token
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const isAdmin =
          profile?.email?.toLowerCase() ===
          process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase()

        try {
          await dbConnect()

          // If user is admin, handle admin authentication
          if (isAdmin) {
            const existingAdmin = await Admin.findOne({
              email: user?.email?.toLowerCase()
            }).lean()

            // If admin user already exists, sign in is successful
            if (existingAdmin) {
              console.log('signIn successful for existing admin')
              return true
            }
            // Otherwise, create a new admin user and then sign in is successful
            else {
              const newAdmin = new Admin({
                name: user.name,
                email: user?.email?.toLowerCase(),
                authType: 'GOOGLE',
                googleId: account.id
              })

              await newAdmin.save()
              console.log('signIn successful, new admin created')
              return true
            }
          }
          // Handle regular user authentication
          else {
            // Look for existing user
            const existingUser = await User.findOne({
              email: user?.email?.toLowerCase()
            }).lean()

            // If user already exists, sign in is successful
            if (existingUser) {
              console.log('signIn successful for existing user')
              return true
            }
            // Otherwise, create a new user
            else {
              const newUser = new User({
                name: user.name,
                email: user?.email?.toLowerCase(),
                avatar: user.image,
                authType: 'GOOGLE',
                googleId: account.id,
                likedPosts: []
              })

              await newUser.save()
              console.log('signIn successful, new regular user created')
              return true
            }
          }
        } catch (error) {
          console.error(`signIn failed with error: ${error}`)
          throw error
        }
      }

      console.log(
        `signIn called for account: ${account?.provider}, email from profile: ${profile?.email}`
      )
      return true
    }
  },
  session: {
    strategy: 'jwt'
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: '/',
    error: '/'
  }
})
