'use client'

import ResumeActionModal from '@/components/ResumeActionModal'
import Image from 'next/image'
import { useState } from 'react'

type ResumeDockItemProps = {
  img: string
}

const ResumeDockItem = ({ img }: ResumeDockItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="Resume"
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center h-15 group cursor-pointer relative"
      >
        <span className="hidden -top-9 absolute left-1/2 transform -translate-x-1/2 px-2 py-1 bg-white/80 dark:bg-zinc-800/90 text-gray-800 dark:text-white text-xs font-medium rounded-md shadow-lg backdrop-blur-sm border border-white/20 dark:border-zinc-700/50 whitespace-nowrap group-hover:block opacity-0 group-hover:opacity-100 z-10">
          Resume
        </span>
        <Image
          alt="Resume"
          src={img}
          height={50}
          width={50}
          className="transition-all transform-gpu group-hover:scale-150 drop-shadow-none group-hover:drop-shadow-md"
          style={{
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'bottom'
          }}
        />
      </button>
      <ResumeActionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default ResumeDockItem
