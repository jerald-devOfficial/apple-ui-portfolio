'use client'

import { useFormStatus } from 'react-dom'
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid'

const DiarySaveButton = () => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-x-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
    >
      <ArrowUpCircleIcon className="h-5 w-5" />
      <span>{pending ? 'Saving...' : 'Save'}</span>
    </button>
  )
}

export default DiarySaveButton
