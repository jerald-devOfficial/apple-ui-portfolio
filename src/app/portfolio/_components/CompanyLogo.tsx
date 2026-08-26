import { BuildingOffice2Icon, BoltIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'

type CompanyLogoProps = {
  company: string
  logo?: string
  placeholder?: boolean
  darkInvert?: boolean
}

const CompanyLogo = ({
  company,
  logo,
  placeholder,
  darkInvert
}: CompanyLogoProps) => {
  if (placeholder || !logo) {
    const isConfidential = /confidential/i.test(company)
    const Icon = isConfidential ? BoltIcon : BuildingOffice2Icon

    return (
      <div
        className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-stone-200 text-stone-600 ring-1 ring-stone-300/80 dark:bg-zinc-700 dark:text-zinc-100 dark:ring-zinc-500/60"
        aria-label={`${company} logo placeholder`}
        title={company}
      >
        <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
      </div>
    )
  }

  return (
    <div className="relative h-auto w-16 sm:w-24 block">
      <Image
        src={logo}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`rounded-2xl ${darkInvert ? 'dark:invert' : ''}`}
        width={1}
        height={1}
        style={{
          height: 'auto',
          width: '100%'
        }}
        alt={`${company} logo`}
      />
    </div>
  )
}

export default CompanyLogo
