"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'
import { ReactNode } from 'react'

// WalletConnect project ID (you can get one free at https://cloud.walletconnect.com)
const projectId = 'e783874717ba10fac35ee6feaadf9178' // Replace with your WalletConnect project ID

// Create wagmi config for Ethereum with multiple wallet options
const config = createConfig({
    chains: [sepolia],
    connectors: [
        injected({
            shimDisconnect: true,
        }),
        walletConnect({
            projectId,
            showQrModal: true,
        }),
        coinbaseWallet({
            appName: 'Nick Services',
        }),
    ],
    transports: {
        [sepolia.id]: http(),
    },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
