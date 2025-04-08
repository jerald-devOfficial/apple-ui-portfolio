import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    connectors: [
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
        metadata: {
          name: 'Jerald Baroro Portfolio',
          description: 'Jerald Baroro Web3 Integration',
          url: process.env.NEXT_PUBLIC_APP_URL || 'https://jeraldbaroro.xyz',
          icons: ['https://jeraldbaroro.xyz/apple-touch-icon.png']
        }
      })
    ],
    storage: createStorage({
      storage: cookieStorage
    }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http()
    }
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
