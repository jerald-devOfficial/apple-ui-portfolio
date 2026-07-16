'use client'

import {
  FacebookOutlineIcon,
  LinkedInOutlineIcon,
  XOutlineIcon
} from '@/components/svg-icons'
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Montserrat } from 'next/font/google'
import { FormEvent, useRef, useState } from 'react'
import { toast } from 'react-toastify'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const Contact = () => {
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [subject, setSubject] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    if (turnstileSiteKey && !turnstileToken) {
      toast.error('Please complete the security check before sending.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          subject,
          email,
          message,
          website,
          turnstileToken: turnstileToken || undefined
        })
      })

      const data = await res.json()
      const { msg, success, emailSent } = data

      if (!res.ok || !success) {
        msg?.forEach((message: string) => toast.error(message))
        setTurnstileToken('')
        turnstileRef.current?.reset()
        return
      }

      if (emailSent === false) {
        msg?.forEach((message: string) => toast.warn(message))
      } else {
        msg?.forEach((message: string) => toast.success(message))
      }

      setSubject('')
      setEmail('')
      setMessage('')
      setFullName('')
      setWebsite('')
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } catch {
      toast.error('Unable to send message. Please try again.')
      setTurnstileToken('')
      turnstileRef.current?.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      className={`flex h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} py-2 sm:py-0`}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-stone-200/95 dark:bg-zinc-900 flex-1 h-[inherit] panel overflow-hidden rounded-xl shadow-xl"
      >
        <div
          className={`border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid px-4 pb-3 flex gap-x-4 h-[92px] items-end`}
        >
          <div className="flex items-end justify-between h-11 w-full ">
            <h2 className="font-bold tracking-tight text-2xl text-black dark:text-white">
              Write me a message
            </h2>
            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              <ArrowUpCircleIcon
                className={`h-7 w-7 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-col w-full h-full px-4 bg-white dark:bg-zinc-800 gap-y-1 overflow-hidden">
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <div className="pt-1 flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">To:</span>
            <input
              className="flex-1 bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder={process.env.NEXT_PUBLIC_ADMIN_EMAIL!}
              disabled
            />
          </div>
          <div className="flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">From:</span>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              maxLength={50}
              type="email"
              id="email"
              autoComplete="email"
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Your email address"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">Full name:</span>
            <input
              onChange={(e) => setFullName(e.target.value)}
              value={fullName}
              maxLength={50}
              type="text"
              id="fullName"
              autoComplete="name"
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Your full name"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-between items-center w-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid gap-x-2">
            <span className="text-black dark:text-white">Subject:</span>
            <input
              onChange={(e) => setSubject(e.target.value)}
              value={subject}
              maxLength={80}
              type="text"
              id="subject"
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Email Subject"
              disabled={isSubmitting}
            />
          </div>
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            maxLength={800}
            id="message"
            placeholder="Please type your message (at least 10 characters)"
            className="w-full h-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid p-4 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={isSubmitting}
          />
        </div>
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
    </main>
  )
}

export default Contact
