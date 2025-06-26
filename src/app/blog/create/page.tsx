import { auth } from '@/auth'
import { Admin } from '@/models/Admin'
import dbConnect from '@/utils/db'
import { Montserrat } from 'next/font/google'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import BlogEditor from './_components/BlogEditor'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const CreateBlogPage = async () => {
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

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className="flex grow h-full rounded-xl bg-stone-200/95 dark:bg-zinc-900 flex-col shadow-xl overflow-hidden">
        <Suspense fallback={<div>Loading editor...</div>}>
          <BlogEditor />
        </Suspense>
      </div>
    </main>
  )
}

export default CreateBlogPage
