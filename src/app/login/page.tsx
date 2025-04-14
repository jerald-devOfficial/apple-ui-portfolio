'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/blog' })
  }

  return (
    <div className="h-screen w-full flex items-center justify-center">
      {/* macOS style login window */}
      <div className="w-96 rounded-xl overflow-hidden shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-700/50">
        {/* Window chrome */}
        <div className="px-3 h-9 flex items-center bg-gradient-to-b from-zinc-200/90 to-zinc-300/90 dark:from-zinc-800/90 dark:to-zinc-900/90 border-b border-zinc-300/50 dark:border-zinc-700/50">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
            Sign In
          </div>
        </div>

        {/* Login content */}
        <div className="p-8 flex flex-col items-center">
          {/* User avatar with highlight */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-2">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {/* Light reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
          </div>

          <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-1">
            Sign in to My Portfolio
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 text-center">
            Sign in to interact with blog posts and more
          </p>

          {/* Google sign-in button with macOS style */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-800 dark:text-white bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  )
}
