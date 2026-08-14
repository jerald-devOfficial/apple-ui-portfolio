import Portfolio from '@/app/portfolio/_components/Portfolio'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const PortfolioPage = () => (
  <main
    className={`flex overflow-hidden h-full w-full xl:max-w-[1024px] sm:pt-6 xl:pt-12 lg:max-w-[924px] mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
  >
    <Portfolio />
  </main>
)

export default PortfolioPage
