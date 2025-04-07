import { Admin } from '@/models/Admin'
import dbConnect from '@/utils/db'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

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

          // Note the addition of toLowerCase()
          const existingUser = await Admin.findOne({
            email: user?.email?.toLowerCase()
          }).lean()

          // If user already exists in the database, sign in is successful
          if (existingUser) {
            console.log('signIn successful for existing user')

            return true
          }
          // Otherwise, create a new user and then sign in is successful
          else {
            const newUser = new Admin({
              name: user.name,
              email: user?.email?.toLowerCase(), // convert to lower case
              authType: 'GOOGLE', // set authType to 'GOOGLE'
              googleId: account.id // set googleId
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
      return true
    }
  },
  debug: process.env.NODE_ENV === 'development',
  pages: {
    error: '/'
  }
})
