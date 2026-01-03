"use client"

import { useState, useEffect } from "react"

export interface SolanaWallet {
    publicKey: string
    connected: boolean
}

export function useSolanaWallet() {
    const [wallet, setWallet] = useState<SolanaWallet | null>(null)

    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window === "undefined" || !("solana" in window)) {
                return
            }

            const provider = (window as any).solana
            if (!provider?.isPhantom) {
                return
            }

            // Check if already connected
            if (provider.isConnected && provider.publicKey) {
                setWallet({
                    publicKey: provider.publicKey.toString(),
                    connected: true,
                })
            }

            // Listen for account changes
            provider.on("connect", (publicKey: any) => {
                console.log("Phantom connected:", publicKey.toString())
                setWallet({
                    publicKey: publicKey.toString(),
                    connected: true,
                })
            })

            provider.on("disconnect", () => {
                console.log("Phantom disconnected")
                setWallet(null)
            })

            provider.on("accountChanged", (publicKey: any) => {
                if (publicKey) {
                    console.log("Phantom account changed:", publicKey.toString())
                    setWallet({
                        publicKey: publicKey.toString(),
                        connected: true,
                    })
                } else {
                    setWallet(null)
                }
            })
        }

        checkConnection()
    }, [])

    const disconnect = async () => {
        if (typeof window !== "undefined" && "solana" in window) {
            const provider = (window as any).solana
            if (provider?.isPhantom) {
                await provider.disconnect()
                setWallet(null)
            }
        }
    }

    return {
        address: wallet?.publicKey,
        isConnected: wallet?.connected || false,
        disconnect,
    }
}
