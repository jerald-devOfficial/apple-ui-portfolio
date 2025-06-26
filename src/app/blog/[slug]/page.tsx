import { auth } from '@/auth'
import { Admin } from '@/models/Admin'
import { Blog, IBlog } from '@/models/Blog'
import dbConnect from '@/utils/db'
import { Montserrat } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import BlogComments from './_components/BlogComments'
import BlogContent from './_components/BlogContent'
import BlogHeader from './_components/BlogHeader'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const BlogPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  await dbConnect()
  const session = await auth()

  // Check if user is admin
  let isAdmin = false
  if (session?.user?.email) {
    const admin = await Admin.findOne({ email: session.user.email })
    isAdmin = !!admin
  }

  const blogResult = await Blog.findOne({
    slug: (await params).slug
  }).lean()

  if (!blogResult) {
    notFound()
  }

  // Serialize the blog data to remove MongoDB ObjectIds
  const normalizedBlog = JSON.parse(JSON.stringify(blogResult)) as IBlog

  // Check access permissions
  if (normalizedBlog.status === 'private') {
    if (!session?.user?.email) {
      notFound()
    }

    const admin = await Admin.findOne({ email: session.user.email })
    if (!admin || normalizedBlog.userId !== admin._id.toString()) {
      notFound()
    }
  } else if (normalizedBlog.status === 'draft') {
    if (!session?.user?.email) {
      notFound()
    }

    const admin = await Admin.findOne({ email: session.user.email })
    if (!admin || normalizedBlog.userId !== admin._id.toString()) {
      notFound()
    }
  }

  // Increment view count for published blogs
  if (normalizedBlog.status === 'published') {
    await Blog.findByIdAndUpdate(normalizedBlog._id, { $inc: { views: 1 } })
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <BlogHeader blog={normalizedBlog} isAdmin={isAdmin} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <Suspense fallback={<div>Loading blog content...</div>}>
              <BlogContent blog={normalizedBlog} />
            </Suspense>

            {/* Comments Section */}
            {normalizedBlog.status === 'published' && (
              <div className="mt-8 sm:mt-12">
                <Suspense fallback={<div>Loading comments...</div>}>
                  <BlogComments blogId={normalizedBlog._id} />
                </Suspense>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default BlogPage
