'use client'

import {
  FacebookOutlineIcon,
  LinkedInOutlineIcon,
  XOutlineIcon
} from '@/components/svg-icons'
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid'
import { Montserrat } from 'next/font/google'
import { FormEvent, useState } from 'react'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const Contact = () => {
  const [subject, setSubject] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState([])
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        fullName,
        subject,
        email,
        message
      })
    })

    const { msg, success } = await res.json()
    setError(msg)
    setSuccess(success)

    if (success) {
      setSubject('')
      setEmail('')
      setMessage('')
      setFullName('')
    }
  }
  return (
    <main
      className={`flex h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} py-2 sm:py-0`}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col bg-stone-200/95 dark:bg-zinc-900 flex-1 h-[inherit] panel overflow-hidden relative rounded-xl shadow-xl"
      >
        <div
          className={`border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid px-4 pb-3 flex gap-x-4 h-[92px] items-end`}
        >
          <div className="flex items-end justify-between h-11 w-full ">
            <h2 className="font-bold tracking-tight text-2xl text-black dark:text-white">
              Write me a message
            </h2>
            <button type="submit">
              <ArrowUpCircleIcon className="h-7 w-7 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 cursor-pointer" />
            </button>
          </div>
        </div>

        <div className="flex flex-col w-full h-full px-4 bg-white dark:bg-zinc-800 gap-y-1 overflow-hidden">
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
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Your email address"
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
              className="flex-1 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="Your full name"
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
            />
          </div>
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            maxLength={800}
            id="message"
            placeholder="Please type your message"
            className="w-full h-full border-b border-[#3C3C43]/36 dark:border-zinc-700 border-solid p-4 focus:outline-hidden bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="w-full h-10 flex items-center justify-center bg-white dark:bg-zinc-900">
          {error
            ? error.map((e) => (
                <h4
                  key={e}
                  className={`$${
                    success
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  } px-5 text-sm font-medium`}
                >
                  {e}
                </h4>
              ))
            : null}
        </div>
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
