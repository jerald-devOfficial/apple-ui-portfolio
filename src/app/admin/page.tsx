'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // Check if user is admin
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/user/checkAdmin')
        const data = await response.json()

        if (data.isAdmin) {
          setIsAdmin(true)
        } else {
          // Not an admin, redirect after showing message
          setTimeout(() => {
            router.push('/')
          }, 3000)
        }
      } catch (error) {
        console.error('Failed to check admin status', error)
        // Redirect on error
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [status, router])

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="w-[500px] rounded-xl overflow-hidden shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-700/50">
          {/* Window chrome */}
          <div className="px-3 h-9 flex items-center bg-gradient-to-b from-zinc-200/90 to-zinc-300/90 dark:from-zinc-800/90 dark:to-zinc-900/90 border-b border-zinc-300/50 dark:border-zinc-700/50">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
              Admin Access
            </div>
          </div>

          <div className="p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">
              Verifying admin credentials...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="w-[500px] rounded-xl overflow-hidden shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-700/50">
          {/* Window chrome */}
          <div className="px-3 h-9 flex items-center bg-gradient-to-b from-zinc-200/90 to-zinc-300/90 dark:from-zinc-800/90 dark:to-zinc-900/90 border-b border-zinc-300/50 dark:border-zinc-700/50">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
              Access Denied
            </div>
          </div>

          <div className="p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              You don&apos;t have administrator privileges for this section.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecting you back in a moment...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col pt-10 px-4">
      <div className="max-w-5xl w-full mx-auto rounded-xl overflow-hidden shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-700/50">
        {/* Window chrome */}
        <div className="px-3 h-9 flex items-center bg-gradient-to-b from-zinc-200/90 to-zinc-300/90 dark:from-zinc-800/90 dark:to-zinc-900/90 border-b border-zinc-300/50 dark:border-zinc-700/50">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
            Admin Dashboard
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Administration
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Logged in as {session?.user?.email}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dashboard Card */}
            <Link
              href="/admin/dashboard"
              className="block p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800/50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-800 dark:text-white">
                  Dashboard
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View site analytics and performance metrics
              </p>
            </Link>

            {/* Blog Management */}
            <Link
              href="/admin/blog"
              className="block p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800/50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-800 dark:text-white">
                  Blog Posts
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage, create and edit blog content
              </p>
            </Link>

            {/* User Management */}
            <Link
              href="/admin/users"
              className="block p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800/50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-800 dark:text-white">
                  Users
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Manage user accounts and permissions
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
