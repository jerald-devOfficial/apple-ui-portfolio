import ContactForm from '@/app/contact/_components/ContactForm'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const ContactPage = () => (
  <main
    className={`flex h-full w-full xl:max-w-5xl sm:pt-6 xl:pt-12 lg:max-w-231 mx-auto sm:px-12 lg:px-0 ${montserrat.className} py-2 sm:py-0`}
  >
    <ContactForm />
  </main>
)

export default ContactPage
