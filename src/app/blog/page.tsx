'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'

const Blog = () => {
  const { status } = useSession()
  return (
    <div>
      <h1>Welcome to Blog page</h1>
      {status === 'authenticated' && (
        <Link href={'/blog/create'}>Create a new blog post</Link>
      )}
    </div>
  )
}

export default Blog
