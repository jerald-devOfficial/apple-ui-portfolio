import Web3 from '@/app/web3/_components/Web3'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], display: 'swap' })

const Web3Page = () => (
  <main
    className={`flex overflow-hidden h-full w-full md:max-w-175 sm:pt-6 xl:pt-12 mx-auto sm:px-12 md:px-0 ${montserrat.className} my-2 sm:my-0`}
  >
    <Web3 />
  </main>
)

export default Web3Page
