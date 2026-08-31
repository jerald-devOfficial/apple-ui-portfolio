'use client'

import ResumeActionModal from '@/components/ResumeActionModal'
import Image from 'next/image'
import { useState } from 'react'

type ResumeHomeIconProps = {
  name: string
  img: string
  size: 'mobile' | 'tablet'
}

const ResumeHomeIcon = ({ name, img, size }: ResumeHomeIconProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = size === 'mobile'

  return (
    <>
      <button
        type="button"
        aria-label={name}
        onClick={() => setIsOpen(true)}
        className={`grid place-items-center w-full ${isMobile ? 'gap-y-1.5' : 'gap-y-2'}`}
      >
        <div className={isMobile ? undefined : 'block'}>
          <div
            className={`relative cursor-pointer ${
              isMobile ? 'size-11.25 xs:size-12.5' : 'h-15 w-15'
            }`}
          >
            <Image
              alt={name}
              src={img}
              fill
              priority
              sizes={isMobile ? '45px xs:50px' : '60px'}
            />
          </div>
        </div>
        <span
          className={`font-normal text-white text-center ${
            isMobile ? 'text-[9px] leading-tight' : 'text-sm'
          }`}
        >
          {name}
        </span>
      </button>
      <ResumeActionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default ResumeHomeIcon
