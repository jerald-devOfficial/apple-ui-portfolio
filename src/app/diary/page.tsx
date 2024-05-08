import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const Diary = () => {
  const router = useRouter()
  const { status } = useSession()

  if (status === 'unauthenticated') {
    router.push('/')
  }

  if (status === 'loading') {
    return <p>Loading...</p>
  }

  return (
    <div>
      <h1>Diary</h1>
      <p>Welcome to your personal diary page.</p>
    </div>
  )
}

export default Diary
