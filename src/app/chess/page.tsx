import ChessLayout from '@/app/chess/_components/ChessLayout'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const ChessPage = () => (
  <main
    className={`flex overflow-hidden h-full w-full xl:max-w-300 sm:pt-6 xl:pt-12 lg:max-w-275 mx-auto sm:px-12 lg:px-0 ${montserrat.className} my-2 sm:my-0`}
  >
    <ChessLayout />
  </main>
)

export default ChessPage
