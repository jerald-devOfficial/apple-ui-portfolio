import Image from 'next/image'
import type { IconType } from 'react-icons'
import {
  SiDocker,
  SiExpress,
  SiFirebase,
  SiGithubactions,
  SiJenkins,
  SiMongodb,
  SiMui,
  SiNestjs,
  SiNginx,
  SiNodedotjs,
  SiNx,
  SiPostgresql,
  SiPrisma,
  SiRedux,
  SiSass,
  SiVitest
} from 'react-icons/si'
import { TbBrowserCheck } from 'react-icons/tb'

export const skillIconMap: Record<string, IconType> = {
  nestjs: SiNestjs,
  nodedotjs: SiNodedotjs,
  postgresql: SiPostgresql,
  docker: SiDocker,
  prisma: SiPrisma,
  mui: SiMui,
  redux: SiRedux,
  express: SiExpress,
  firebase: SiFirebase,
  githubactions: SiGithubactions,
  jenkins: SiJenkins,
  vitest: SiVitest,
  nx: SiNx,
  sass: SiSass,
  playwright: TbBrowserCheck,
  nginx: SiNginx,
  mongodb: SiMongodb
}

type SkillLogoProps = {
  name: string
  img?: string
  iconKey?: string
  darkInvert?: boolean
  iconColor?: string
}

const SkillLogo = ({
  name,
  img,
  iconKey,
  darkInvert,
  iconColor
}: SkillLogoProps) => {
  const Icon = iconKey ? skillIconMap[iconKey] : undefined

  if (Icon) {
    return (
      <div
        className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-stone-100 ring-1 ring-stone-200 dark:bg-zinc-700 dark:ring-zinc-600"
        title={name}
      >
        <Icon
          className={`h-8 w-8 sm:h-10 sm:w-10 ${darkInvert ? 'text-stone-800 dark:text-zinc-100' : ''}`}
          style={!darkInvert && iconColor ? { color: iconColor } : undefined}
          aria-hidden
        />
        <span className="sr-only">{name}</span>
      </div>
    )
  }

  if (!img) {
    return (
      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-stone-100 text-xs font-semibold text-stone-600 ring-1 ring-stone-200 dark:bg-zinc-700 dark:text-zinc-200 dark:ring-zinc-600">
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div className="relative h-auto w-16 sm:w-20 block">
      <Image
        src={img}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`rounded-2xl ${darkInvert ? 'dark:invert dark:brightness-95' : ''}`}
        width={1}
        height={1}
        style={{
          height: 'auto',
          width: '100%'
        }}
        alt={name}
      />
    </div>
  )
}

export default SkillLogo
