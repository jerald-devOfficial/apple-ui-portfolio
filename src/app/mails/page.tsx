'use client'

import { IContact } from '@/models/Contact'
import { formatDate, getInitials, hoursAgo } from '@/utils'
import { TrashIcon } from '@heroicons/react/24/outline'
import { ChevronLeftIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { Montserrat } from 'next/font/google'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import useSWR, { Fetcher } from 'swr'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const Mails = () => {
  const { status } = useSession()
  const router = useRouter()

  const [selectedMail, setSelectedMail] = useState<IContact | null>(null)

  const fetcher: Fetcher<IContact[], string> = (url) =>
    fetch(url).then((res) => res.json())

  const { data, error, isLoading, mutate } = useSWR('/api/contact', fetcher)

  if (status === 'unauthenticated') {
    router.push('/')
  }

  const handleMailClick = async (mailId: string) => {
    // Mark the mail as selected
    const mailFind = data?.find((mail) => mail._id === mailId)
    if (mailFind) {
      setSelectedMail(mailFind)

      if (!mailFind.read) {
        // PATCH request to mark the mail as read
        try {
          const res = await fetch(`/api/contact/${mailId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ read: true })
          })

          if (!res.ok) {
            throw new Error(
              `Failed to mark mail as read. Status: ${res.status}`
            )
          }

          // Get the updated mail data from the res
          const updatedMailData = await res.json()

          // Update selected mail with the updated data
          setSelectedMail(updatedMailData)

          mutate()
        } catch (error) {
          console.error('Error marking mail as read:', error)
          // Handle error, e.g., show error message to user
        }
      }
    }
  }

  const handleMarkAsUnread = async (mailId: string) => {
    try {
      const mailFind = data?.find((mail) => mail._id === mailId)
      if (mailFind) {
        setSelectedMail(mailFind)
        if (mailFind.read) {
          const res = await fetch(`/api/contact/${mailId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ unread: true })
          })

          if (!res.ok) {
            throw new Error(
              `Failed to mark mail as read. Status: ${res.status}`
            )
          }

          // Get the updated mail data from the res
          const updatedMailData = await res.json()

          // Update selected mail with the updated data
          setSelectedMail(updatedMailData)

          // Call mutate to update the data after making changes
          mutate()
        }
      }
    } catch (error) {
      console.error('Error marking mail as unread:', error)
      // Handle error, e.g., show error message to user
    }
  }

  const handleDeleteMail = async (mailId: string) => {
    try {
      // Send a DELETE request to remove the mail
      await fetch(`/api/contact/${mailId}`, {
        method: 'DELETE'
      })
      // After successfully deleting the mail, you can reset the selected mail state
      setSelectedMail(null)
      // You may also want to refresh the mail list after deleting a mail, you can use mutate() here if necessary
      mutate()
    } catch (error) {
      console.error('Error deleting mail:', error)
      // Handle error, e.g., show error message to user
    }
  }

  return (
    <main
      className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
    >
      <div className='flex flex-grow h-full rounded-xl shadow-xl overflow-hidden'>
        <div className='sm:w-[200px] bg-[#F5F5F5] opacity-[97%] lg:w-[300px] w-full relative sidebar overflow-hidden shadow-inner flex flex-col rounded-l-[inherit] sm:rounded-r-none rounded-r-[inherit]'>
          <div className='border-b border-[#3C3C43]/36 border-solid px-4 pt-5 pb-3 hidden sm:flex gap-x-4 items-center hover:bg-[#F5F5F5]'>
            <Image
              src='/images/icons/gmail.png'
              height={60}
              width={60}
              alt='GMail icon'
            />
            <div className='flex flex-col'>
              <h1 className='font-normal text-base text-black'>Inbox</h1>
              <h3 className='font-normal text-xs text-[#3C3C43]/60 tracking-tight'>
                Read emails from visitors
              </h3>
            </div>
          </div>

          {selectedMail ? (
            <div className='flex flex-col sm:hidden justify-between items-start border-b border-[#3C3C43]/37 border-solid px-4 py-4 gap-y-4 gap-x-4 hover:bg-[#F5F5F5]'>
              <div className='flex justify-between items-center w-full'>
                <button
                  className='text-blue-600 flex items-center gap-x-1'
                  onClick={() => setSelectedMail(null)}
                >
                  <ChevronLeftIcon className='h-4 w-4' />{' '}
                  <span className='xs:text-base text-sm'>Back</span>
                </button>
                <div className='flex gap-x-4 items-center'>
                  {selectedMail.read && (
                    <button
                      onClick={() => handleMarkAsUnread(selectedMail?._id)}
                      className='block font-medium xs:text-base text-sm text-blue-600'
                    >
                      Mark as Unread
                    </button>
                  )}
                  <button onClick={() => handleDeleteMail(selectedMail?._id)}>
                    <TrashIcon className='xs:h-5 xs:w-5 h-4 w-4 text-rose-600 stroke-2' />
                  </button>
                </div>
              </div>
              <h2 className='xs:text-lg text-base font-bold text-left'>
                {selectedMail.subject}
              </h2>
            </div>
          ) : (
            <div className='border-b border-[#3C3C43]/36 border-solid px-4 pt-5 pb-3 flex sm:hidden gap-x-4 items-center hover:bg-[#F5F5F5]'>
              <Image
                src='/images/icons/gmail.png'
                height={60}
                width={60}
                alt='GMail icon'
              />
              <div className='flex flex-col'>
                <h1 className='font-normal text-base text-black'>Inbox</h1>
                <h3 className='font-normal text-xs text-[#3C3C43]/60 tracking-tight'>
                  Read emails from visitors
                </h3>
              </div>
            </div>
          )}

          {isLoading && (
            <div className='bg-white px-4 py-2'>
              <h3 className='text-sm font-medium'>Fetching data...</h3>
            </div>
          )}
          {error && (
            <div className='bg-white px-4 py-2'>
              <h3 className='text-sm font-medium text-red-600'>
                Error: {error}
              </h3>
            </div>
          )}
          {data && data?.length > 0 && (
            <>
              {/* hidden sm */}
              <div className='bg-white py-2 gap-y-2 relative w-full hidden sm:flex flex-col'>
                {data.map((mail, index) => (
                  <Fragment key={mail._id}>
                    <button
                      className='flex px-4 gap-x-2 cursor-pointer py-2 w-full relative overflow-hidden'
                      onClick={() => handleMailClick(mail._id)}
                    >
                      <div className='block'>
                        <div className='h-[50px] w-[50px] rounded-full relative'>
                          <Image
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            className='rounded-full object-cover object-center'
                            src={`https://placehold.co/50x50/${
                              mail.avatarColor
                            }/png?text=${getInitials(mail.fullName)}`}
                            alt={mail.fullName}
                            fill
                          />
                        </div>
                      </div>

                      <div className='flex flex-col items-start overflow-hidden relative w-full'>
                        <div className='flex justify-between items-center w-full gap-x-2'>
                          <h3
                            className={`text-sm truncate ${
                              mail.read ? 'font-normal' : 'font-bold'
                            }`}
                          >
                            {mail.fullName}
                          </h3>
                          <span
                            className={`text-xs ${
                              mail.read ? 'font-normal' : 'font-bold'
                            } text-nowrap`}
                          >
                            {formatDate(mail.createdAt)}
                          </span>
                        </div>
                        <h3
                          className={`text-sm text-left ${
                            mail.read ? 'font-normal' : 'font-medium'
                          } text-left truncate w-full`}
                        >
                          {mail.subject}
                        </h3>
                        <h5 className='text-xs text-left font-normal truncate w-full'>
                          {mail.message}
                        </h5>
                      </div>
                    </button>
                    {data.length > 1 && index < data.length - 1 && <hr />}
                  </Fragment>
                ))}
              </div>

              {/* when iOS */}
              {selectedMail ? (
                <div className='sm:hidden flex flex-col gap-x-10 w-full h-auto p-4'>
                  <div className='flex justify-between'>
                    <div className='flex gap-x-4'>
                      <div className='block'>
                        <div className='h-[50px] w-[50px] rounded-full relative'>
                          <Image
                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            className='rounded-full object-cover object-center'
                            src={`https://placehold.co/50x50/${
                              selectedMail.avatarColor
                            }/png?text=${getInitials(selectedMail.fullName)}`}
                            alt={selectedMail.fullName}
                            fill
                          />
                        </div>
                      </div>
                      <div className='flex flex-col'>
                        <h3 className='font-bold text-base text-black'>
                          {selectedMail.fullName}
                        </h3>
                        <span className='font-normal text-sm text-gray-600'>
                          {`<${selectedMail.email}>`}
                        </span>
                      </div>
                    </div>
                    <div className='flex gap-x-1'>
                      <span className='text-sm font-normal text-gray-600 tracking-tighter'>
                        {hoursAgo(selectedMail.createdAt) > 24 ? (
                          formatDate(selectedMail.createdAt)
                        ) : (
                          <>
                            {formatDate(selectedMail.createdAt)}{' '}
                            {`(${hoursAgo(selectedMail.createdAt)} hour${
                              hoursAgo(selectedMail.createdAt) !== 1 ? 's' : ''
                            } ago)`}{' '}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className='pt-10 px-2'>
                    <p className='text-gray-800 text-xl font-medium'>
                      {selectedMail.message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='bg-white py-2 gap-y-2 relative w-full flex flex-col sm:hidden h-full overflow-y-auto'>
                  {data.map((mail, index) => (
                    <Fragment key={mail._id}>
                      <button
                        className='flex px-4 gap-x-2 cursor-pointer py-2 w-full relative'
                        onClick={() => handleMailClick(mail._id)}
                      >
                        <div className='block'>
                          <div className='h-[50px] w-[50px] rounded-full relative'>
                            <Image
                              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                              className='rounded-full object-cover object-center'
                              src={`https://placehold.co/50x50/${
                                mail.avatarColor
                              }/png?text=${getInitials(mail.fullName)}`}
                              alt={mail.fullName}
                              fill
                            />
                          </div>
                        </div>

                        <div className='flex flex-col items-start relative w-full'>
                          <div className='flex justify-between items-center w-full gap-x-2'>
                            <h3
                              className={`text-sm truncate ${
                                mail.read ? 'font-normal' : 'font-bold'
                              }`}
                            >
                              {mail.fullName}
                            </h3>
                            <span
                              className={`text-xs ${
                                mail.read ? 'font-normal' : 'font-bold'
                              } text-nowrap`}
                            >
                              {formatDate(mail.createdAt)}
                            </span>
                          </div>
                          <h3
                            className={`text-sm text-left ${
                              mail.read ? 'font-normal' : 'font-medium'
                            } text-left truncate w-full`}
                          >
                            {mail.subject}
                          </h3>
                        </div>
                      </button>
                      {data.length > 1 && index < data.length - 1 && <hr />}
                    </Fragment>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className='flex flex-col bg-white/95 flex-1 h-[inherit] panel overflow-hidden relative rounded-r-[inherit]'>
          <div
            className={`border-b border-[#3C3C43]/36 border-solid px-4 pt-2.5 pb-3 flex gap-x-4 h-[92px] flex-col justify-end`}
          >
            {selectedMail && (
              <div className='flex justify-between items-center'>
                <h2 className='md:text-xl sm:text-base xl:text-2xl font-bold flex-1'>
                  {selectedMail.subject}
                </h2>

                <div className='flex gap-x-4 items-center'>
                  {selectedMail.read && (
                    <button
                      onClick={() => handleMarkAsUnread(selectedMail?._id)}
                      className='block font-medium sm:text-sm md:text-base text-blue-600'
                    >
                      Mark as Unread
                    </button>
                  )}
                  <button onClick={() => handleDeleteMail(selectedMail?._id)}>
                    <TrashIcon className='md:h-5 md:w-5 sm:h-4 sm:w-4 text-rose-600 stroke-2' />
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedMail ? (
            <div className='flex flex-col gap-x-10 w-full h-auto p-4'>
              <div className='flex justify-between'>
                <div className='flex gap-x-4'>
                  <div className='block'>
                    <div className='h-[50px] w-[50px] rounded-full relative'>
                      <Image
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                        className='rounded-full object-cover object-center'
                        src={`https://placehold.co/50x50/${
                          selectedMail.avatarColor
                        }/png?text=${getInitials(selectedMail.fullName)}`}
                        alt={selectedMail.fullName}
                        fill
                      />
                    </div>
                  </div>
                  <div className='flex flex-col'>
                    <div className='flex gap-x-4'>
                      <h3 className='font-bold sm:text-sm md:text-base  text-black'>
                        {selectedMail.fullName}
                      </h3>
                      <span className='font-normal sm:text-xs md:text-sm text-gray-600 sm:hidden md:block'>
                        {`<${selectedMail.email}>`}
                      </span>
                    </div>
                    <span className='text-gray-600 text-sm font-normal hidden md:block'>
                      to Jerald
                    </span>
                    <span className='font-normal sm:block md:hidden sm:text-xs md:text-sm text-gray-600'>
                      {`<${selectedMail.email}>`}
                    </span>
                  </div>
                </div>
                <div className='flex gap-x-1'>
                  <span className='md:text-sm sm:text-xs font-normal text-gray-600 tracking-tighter'>
                    {hoursAgo(selectedMail.createdAt) > 24 ? (
                      formatDate(selectedMail.createdAt)
                    ) : (
                      <>
                        {formatDate(selectedMail.createdAt)}{' '}
                        {`(${hoursAgo(selectedMail.createdAt)} hour${
                          hoursAgo(selectedMail.createdAt) !== 1 ? 's' : ''
                        } ago)`}{' '}
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className='pt-10 lg:px-16 sm:px-2'>
                <p className='text-gray-800 text-xl font-medium'>
                  {selectedMail.message}
                </p>
              </div>
            </div>
          ) : (
            <div className='flex items-center flex-col justify-center gap-y-2 flex-grow'>
              <h4 className='text-base font-medium text-slate-600'>
                Nothing to see here.
              </h4>
              <p className='text-xs font-normal text-slate-500'>
                Please select one of the emails.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Mails
