import HomeAppIcon from '@/app/_components/HomeAppIcon'
import { auth } from '@/auth'
import AboutMeWidget from '@/components/AboutMeWidget'
import PhotosWidget from '@/components/PhotosWidget'
import { contact } from '@/constants'

const appIcons = [
  {
    name: 'Call Me',
    img: '/images/icons/calls.png',
    href: `tel:${contact.phoneNumber}`
  },
  {
    name: 'Diaries',
    img: '/images/icons/diary.png',
    href: '/diaries'
  },
  {
    name: 'News',
    img: '/images/icons/news.png',
    href: '/news'
  },
  {
    name: 'Blog',
    img: '/images/icons/safari.png',
    href: '/blog'
  },
  {
    name: 'Resume',
    img: '/images/icons/resume.png',
    href: '/pdfs/updated-resume.pdf',
    download: true
  },
  {
    name: 'Mails',
    img: '/images/icons/gmail.png',
    href: '/mails',
    authOnly: true
  },
  {
    name: 'Web3',
    img: '/images/icons/metamask.png',
    href: '/web3'
  },
  {
    name: 'Chess',
    img: '/images/icons/chess.png',
    href: '/chess',
    authOnly: true
  }
]

const HomePage = async () => {
  const session = await auth()
  const isAuthenticated = Boolean(session?.user)
  const icons = appIcons.filter((icon) => !icon.authOnly || isAuthenticated)

  return (
    <main className="grow w-full flex flex-col items-center overflow-hidden">
      <section className="sm:hidden px-4 w-full py-3 space-y-2 pb-6 min-h-0">
        <div className="h-35 max-w-75 xs:max-w-87.5 mx-auto">
          <AboutMeWidget />
        </div>

        <div className="h-35 max-w-75 xs:max-w-87.5 mx-auto">
          <PhotosWidget />
        </div>

        <div className="pt-3 pb-4">
          <div className="grid grid-cols-4 gap-3 place-content-center w-full max-w-75 xs:max-w-87.5 mx-auto">
            {icons.map((item) => (
              <HomeAppIcon
                key={item.name}
                name={item.name}
                img={item.img}
                href={item.href}
                size="mobile"
                download={item.download}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="hidden sm:block xl:hidden px-5 sm:px-12 w-full max-w-4xl space-y-8 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          <AboutMeWidget />
          <PhotosWidget />
        </div>

        <div className="grid grid-cols-5 md:grid-cols-6 gap-y-8 place-content-center w-full">
          {icons.map((item) => (
            <HomeAppIcon
              key={item.name}
              name={item.name}
              img={item.img}
              href={item.href}
              size="tablet"
              download={item.download}
            />
          ))}
        </div>
      </section>

      <section className="hidden xl:block w-full h-full relative">
        <div className="h-full flex items-center justify-center px-8">
          <div className="grid grid-cols-2 gap-12 max-w-5xl w-full">
            <div className="min-h-100">
              <AboutMeWidget />
            </div>
            <div className="min-h-100">
              <PhotosWidget />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
