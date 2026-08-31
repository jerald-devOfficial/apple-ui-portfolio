import ResumeHomeIcon from '@/app/_components/ResumeHomeIcon'
import Image from 'next/image'
import Link from 'next/link'

type HomeAppIconProps = {
  name: string
  img: string
  href: string
  size: 'mobile' | 'tablet'
  download?: boolean
}

const HomeAppIcon = ({ name, img, href, size, download }: HomeAppIconProps) => {
  const isMobile = size === 'mobile'

  if (download) {
    return <ResumeHomeIcon name={name} img={img} size={size} />
  }

  return (
    <Link
      href={href}
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
    </Link>
  )
}

export default HomeAppIcon
