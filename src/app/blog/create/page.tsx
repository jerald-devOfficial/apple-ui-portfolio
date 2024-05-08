'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React from 'react'

const CreateBlog = () => {
  const { status } = useSession()
  const router = useRouter()

  if (status === 'unauthenticated') {
    router.push('/')
  }
  return <div>CreateBlog</div>
}

export default CreateBlog
