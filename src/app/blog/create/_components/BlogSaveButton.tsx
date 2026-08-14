'use client'

import { useFormStatus } from 'react-dom'

type BlogSaveButtonProps = {
  isEditing: boolean
}

const BlogSaveButton = ({ isEditing }: BlogSaveButtonProps) => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending
        ? isEditing
          ? 'Updating...'
          : 'Creating...'
        : isEditing
          ? 'Update Blog'
          : 'Create Blog'}
    </button>
  )
}

export default BlogSaveButton
