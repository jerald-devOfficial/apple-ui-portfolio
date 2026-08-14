'use client'

import { useFormStatus } from 'react-dom'
import { type ReactNode } from 'react'

const ContactFields = ({ children }: { children: ReactNode }) => {
  const { pending } = useFormStatus()

  return (
    <fieldset
      disabled={pending}
      className="flex min-h-0 min-w-0 w-full flex-1 flex-col border-0 p-0"
    >
      {children}
    </fieldset>
  )
}

export default ContactFields
