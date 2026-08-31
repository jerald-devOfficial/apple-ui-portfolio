'use client'

import ContactFields from '@/app/contact/_components/ContactFields'
import ContactSubmitButton from '@/app/contact/_components/ContactSubmitButton'
import { submitContactAction } from '@/app/contact/actions'
import {
  initialContactState,
  type ContactActionState
} from '@/app/contact/state'
import {
  FacebookOutlineIcon,
  LinkedInOutlineIcon,
  XOutlineIcon
} from '@/components/svg-icons'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const notifyContactResult = (state: ContactActionState) => {
  if (!state.msg?.length) return

  if (!state.success) {
    state.msg.forEach((message) => toast.error(message))
    return
  }

  if (state.emailSent === false) {
    state.msg.forEach((message) => toast.warn(message))
    return
  }

  state.msg.forEach((message) => toast.success(message))
}

const ContactForm = () => {
  const [state, formAction] = useActionState(
    submitContactAction,
    initialContactState
  )
  const turnstileRef = useRef<TurnstileInstance>(null)
  const notifiedActionRef = useRef('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const { msg, resetKey, success, emailSent } = state ?? initialContactState
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!msg?.length) return

    const actionKey = `${resetKey}:${success}:${emailSent}:${msg.join('|')}`
    if (actionKey === notifiedActionRef.current) return

    notifiedActionRef.current = actionKey
    notifyContactResult({ msg, success, emailSent, resetKey })

    if (!success) {
      turnstileRef.current?.reset()
    }
  }, [msg, resetKey, success, emailSent])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (turnstileSiteKey && !turnstileToken) {
      e.preventDefault()
      toast.error('Please complete the security check before sending.')
    }
  }

  return (
    <form
      key={resetKey}
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col bg-stone-200/95 dark:bg-zinc-900 flex-1 h-[inherit] panel overflow-hidden rounded-xl shadow-xl"
    >
      <div
        className={`border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid px-4 pb-3 flex gap-x-4 h-23 items-end`}
      >
        <div className="flex items-end justify-between h-11 w-full ">
          <h2 className="font-bold tracking-tight text-2xl text-black dark:text-white">
            Write me a message
          </h2>
          <ContactSubmitButton />
        </div>
      </div>

      <ContactFields>
        <div className="flex flex-col w-full h-full px-4 bg-white dark:bg-zinc-800 gap-y-1 overflow-hidden">
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <input type="hidden" name="turnstileToken" value={turnstileToken} />
          <div className="pt-1 flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">To:</span>
            <input
              className="flex-1 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder={process.env.NEXT_PUBLIC_ADMIN_EMAIL}
              disabled
            />
          </div>
          <div className="flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">From:</span>
            <input
              maxLength={50}
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              required
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Your email address"
            />
          </div>
          <div className="flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">Full name:</span>
            <input
              maxLength={50}
              type="text"
              name="fullName"
              id="fullName"
              autoComplete="name"
              required
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Your full name"
            />
          </div>
          <div className="flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">Subject:</span>
            <input
              maxLength={80}
              type="text"
              name="subject"
              id="subject"
              required
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Email Subject"
            />
          </div>
          <textarea
            maxLength={800}
            name="message"
            id="message"
            required
            minLength={10}
            placeholder="Please type your message (at least 10 characters)"
            className="w-full h-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid p-4 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </ContactFields>
      {turnstileSiteKey ? (
        <div className="flex justify-center py-3 bg-white dark:bg-zinc-900">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken('')}
            onError={() => setTurnstileToken('')}
            options={{ theme: 'auto', size: 'normal' }}
          />
        </div>
      ) : null}
      <div className="flex justify-between w-full py-4 px-8 bg-white dark:bg-zinc-900 gap-y-1 items-center">
        <h4 className="font-medium text-base text-blue-600 dark:text-blue-400">
          Follow me on
        </h4>
        <div className="flex items-center gap-x-2">
          <a href="https://www.x.com/spaueOfficial">
            <XOutlineIcon className="text-blue-600 dark:text-blue-400 h-5 w-5 hover:text-blue-800 dark:hover:text-blue-500" />
          </a>
          <a href="https://www.facebook.com/spaueOfficial">
            <FacebookOutlineIcon className="text-blue-600 dark:text-blue-400 h-5 w-5 hover:text-blue-800 dark:hover:text-blue-500 mr-0.5" />
          </a>
          <a href="https://www.linkedin.com/in/jerald-baroro-562aab20a">
            <LinkedInOutlineIcon className="text-blue-600 dark:text-blue-400 h-5 w-5 hover:text-blue-800 dark:hover:text-blue-500" />
          </a>
        </div>
      </div>
    </form>
  )
}

export default ContactForm
