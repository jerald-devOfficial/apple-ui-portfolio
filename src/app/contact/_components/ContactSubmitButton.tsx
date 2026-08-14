'use client'

import { ArrowUpCircleIcon } from '@heroicons/react/24/solid'
import { useFormStatus } from 'react-dom'

const ContactSubmitButton = () => {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      <ArrowUpCircleIcon
        className={`h-7 w-7 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 ${
          pending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      />
    </button>
  )
}

export default ContactSubmitButton
