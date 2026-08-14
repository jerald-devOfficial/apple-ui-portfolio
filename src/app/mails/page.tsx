import Mails from '@/app/mails/_components/Mails'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const MailsPage = () => (
  <main
    className={`flex overflow-hidden h-full min-h-0 w-full xl:max-w-5xl sm:pt-6 xl:pt-12 lg:max-w-231 mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
  >
    <Mails />
  </main>
)

export default MailsPage
