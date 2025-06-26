import { auth } from '@/auth'
import { Admin } from '@/models/Admin'
import { Blog, IBlog } from '@/models/Blog'
import dbConnect from '@/utils/db'
import { Montserrat } from 'next/font/google'
import Link from 'next/link'
import { Suspense } from 'react'
import BlogFilters from './_components/BlogFilters'
import BlogList from './_components/BlogList'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const BlogPage = async ({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  await dbConnect()
  const session = await auth()
  const params = await searchParams

  // Check if user is admin
  let isAdmin = false
  if (session?.user?.email) {
    const admin = await Admin.findOne({ email: session.user.email })
    isAdmin = !!admin
  }

  // Build query
  const query: Record<string, unknown> = {}

  // If not admin, only show published blogs
  if (!isAdmin) {
    query.status = 'published'
  }

  if (params.category) {
    query.category = params.category
  }

  if (params.featured === 'true') {
    query.featured = true
  }

  if (params.search) {
    query.$text = { $search: params.search as string }
  }

  const page = parseInt(params.page as string) || 1
  const limit = 10
  const skip = (page - 1) * limit

  const blogResults = await Blog.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  // Serialize the blog data to remove MongoDB ObjectIds
  const blogs = JSON.parse(JSON.stringify(blogResults)) as IBlog[]

  const total = await Blog.countDocuments(query)
  const totalPages = Math.ceil(total / limit)

  // Get unique categories for filter
  const categories = await Blog.distinct('category')

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Blog
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Thoughts, tutorials, and insights
            </p>
          </div>
          {isAdmin && (
            <Link href="/blog/create">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Create Blog
              </button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/50 dark:bg-zinc-800/50 px-6 py-3 border-b border-gray-200 dark:border-zinc-700">
          <BlogFilters categories={categories} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<div>Loading blogs...</div>}>
            <BlogList
              blogs={blogs}
              currentPage={page}
              totalPages={totalPages}
              isAdmin={isAdmin}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

export default BlogPage
