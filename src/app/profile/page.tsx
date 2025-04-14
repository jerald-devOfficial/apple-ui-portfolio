'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export default function ProfilePage() {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profession: '',
    location: '',
    isVerified: false,
    twitterUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    websiteUrl: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || '',
          profession: data.profession || '',
          location: data.location || '',
          isVerified: data.isVerified || false,
          twitterUrl: data.twitterUrl || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          websiteUrl: data.websiteUrl || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        toast.success('Profile updated successfully')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {!profile.isVerified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700 dark:text-yellow-200">
            To like and comment on posts, please verify your profile by adding
            at least one social link.
          </p>
        </div>
      )}

      {profile.isVerified && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 mb-6">
          <p className="text-green-700 dark:text-green-200">
            Your profile is verified! You can like and comment on posts.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              disabled
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              disabled
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={profile.bio}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label
              htmlFor="profession"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Profession
            </label>
            <input
              type="text"
              id="profession"
              name="profession"
              value={profile.profession}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={profile.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label
              htmlFor="twitterUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Twitter URL
            </label>
            <input
              type="url"
              id="twitterUrl"
              name="twitterUrl"
              value={profile.twitterUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label
              htmlFor="githubUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              GitHub URL
            </label>
            <input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={profile.githubUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label
              htmlFor="linkedinUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              LinkedIn URL
            </label>
            <input
              type="url"
              id="linkedinUrl"
              name="linkedinUrl"
              value={profile.linkedinUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>

          <div>
            <label
              htmlFor="websiteUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Personal Website
            </label>
            <input
              type="url"
              id="websiteUrl"
              name="websiteUrl"
              value={profile.websiteUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>
        </div>

        <div className="pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
