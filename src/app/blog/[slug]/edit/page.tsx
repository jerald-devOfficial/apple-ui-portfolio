import { auth } from '@/auth'
import { Admin } from '@/models/Admin'
import { Blog, IBlog } from '@/models/Blog'
import dbConnect from '@/utils/db'
import { Montserrat } from 'next/font/google'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import BlogEditor from '../../create/_components/BlogEditor'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const EditBlogPage = async ({
  params
}: {
  params: Promise<{ slug: string }>
}) => {
  await dbConnect()
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/')
  }

  // Check if user is admin
  const admin = await Admin.findOne({ email: session.user.email })
  if (!admin) {
    redirect('/')
  }

  const blogResult = await Blog.findOne({
    slug: (await params).slug
  }).lean()

  if (!blogResult) {
    notFound()
  }

  // Serialize the blog data to remove MongoDB ObjectIds
  const blog = JSON.parse(JSON.stringify(blogResult)) as IBlog

  // Check if admin owns this blog
  if (blog.userId !== admin._id.toString()) {
    notFound()
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        <Suspense fallback={<div>Loading editor...</div>}>
          <BlogEditor blog={blog} />
        </Suspense>
      </div>
    </main>
  )
}

export default EditBlogPage
