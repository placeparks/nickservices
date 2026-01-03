"use client"

import { useState, useEffect } from "react"
import { useConnect, useAccount } from "wagmi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, Sparkles, CheckCircle2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export function WalletSelector({
  open,
  onOpenChange,
  defaultNetwork,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultNetwork?: "eth" | "sol"
}) {
  const { connectors, connectAsync, isPending } = useConnect()
  const { isConnected, connector: activeConnector } = useAccount()
  const [selectedNetwork, setSelectedNetwork] = useState<"eth" | "sol" | null>(defaultNetwork || null)
  const [solError, setSolError] = useState("")
  const [solLoading, setSolLoading] = useState(false)

  // Update selected network when defaultNetwork changes
  useEffect(() => {
    if (defaultNetwork) {
      setSelectedNetwork(defaultNetwork)
    }
  }, [defaultNetwork])

  // Reset network selection when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedNetwork(defaultNetwork || null)
      setSolError("")
      setSolLoading(false)
    }
    onOpenChange(newOpen)
  }

  // remove duplicate injected wallets and filter out Phantom for Ethereum
  const uniqueConnectors = connectors.filter(
    (connector, index, self) =>
      index === self.findIndex((c) => c.name === connector.name) &&
      connector.name.toLowerCase() !== "phantom" // Phantom only for Solana
  )

  const getMeta = (id: string) => {
    if (id === "injected") return { hint: "Browser extension", pill: "Wallet" }
    if (id === "walletConnect") return { hint: "Scan with mobile", pill: "Mobile" }
    if (id === "coinbaseWalletSDK") return { hint: "Coinbase app", pill: "Popular" }
    return { hint: "Connect securely", pill: "Wallet" }
  }

  const handleSolanaConnect = async () => {
    setSolError("")
    setSolLoading(true)

    try {
      if (typeof window === "undefined" || !("solana" in window)) {
        setSolError("Please install Phantom wallet")
        return
      }

      const provider = (window as any).solana

      if (!provider?.isPhantom) {
        setSolError("Please install Phantom wallet")
        return
      }

      // Check if already connected
      if (provider.isConnected) {
        console.log("Phantom already connected:", provider.publicKey?.toString())
        handleOpenChange(false)
        return
      }

      // Retry logic for service worker issues
      let retries = 3
      let lastError: any = null

      while (retries > 0) {
        try {
          console.log(`Attempting Phantom connection (${4 - retries}/3)...`)

          // Add a small delay before retry
          if (retries < 3) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }

          const resp = await provider.connect({ onlyIfTrusted: false })
          console.log("Phantom connected successfully:", resp.publicKey.toString())
          handleOpenChange(false)
          return
        } catch (err: any) {
          lastError = err
          console.error(`Phantom connection attempt failed:`, err)

          // If user rejected, don't retry
          if (err.code === 4001 || err.message?.includes("User rejected")) {
            setSolError("Connection rejected by user")
            return
          }

          retries--
        }
      }

      // All retries failed
      throw lastError
    } catch (err: any) {
      console.error("Phantom connection error:", err)
      const errorMsg = err.message || "Failed to connect Phantom"

      if (errorMsg.includes("disconnected port")) {
        setSolError("Phantom wallet error. Please try: 1) Refresh the page, 2) Restart Phantom extension, or 3) Restart your browser")
      } else if (errorMsg.includes("User rejected")) {
        setSolError("Connection rejected by user")
      } else {
        setSolError(errorMsg)
      }
    } finally {
      setSolLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100vw-24px)] sm:max-w-md",
          "max-h-[85vh] overflow-hidden",
          "border-white/20 bg-white/70 backdrop-blur-2xl",
          "shadow-2xl shadow-purple-500/20"
        )}
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-purple-400/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-pink-300/25 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/20" />
        </div>

        {/* Header */}
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            {selectedNetwork && (
              <button
                onClick={() => setSelectedNetwork(null)}
                className="h-10 w-10 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5 text-slate-700" />
              </button>
            )}
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-400 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-900">
                {selectedNetwork ? "Choose Wallet" : "Connect Wallet"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {selectedNetwork
                  ? selectedNetwork === "eth"
                    ? "Select your Ethereum wallet"
                    : "Connect Phantom for Solana"
                  : "Choose your network first"}
              </DialogDescription>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
            Secure • No custody
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="mt-4 max-h-[55vh] overflow-y-auto pr-2">
          {!selectedNetwork ? (
            // Network Selection
            <div className="grid gap-3">
              <button
                onClick={() => setSelectedNetwork("eth")}
                className={cn(
                  "group w-full text-left",
                  "rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-xl",
                  "px-6 py-4 transition-all",
                  "hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10",
                  "focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 via-indigo-400/10 to-purple-400/10 ring-1 ring-blue-200/50">
                    <span className="text-2xl">⟠</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-slate-900 text-lg">Ethereum</div>
                    <div className="mt-0.5 text-xs font-medium text-slate-600">
                      MetaMask, WalletConnect, Coinbase
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedNetwork("sol")}
                className={cn(
                  "group w-full text-left",
                  "rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-xl",
                  "px-6 py-4 transition-all",
                  "hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10",
                  "focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/15 via-pink-400/10 to-indigo-400/10 ring-1 ring-purple-200/50">
                    <span className="text-2xl">◎</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-slate-900 text-lg">Solana</div>
                    <div className="mt-0.5 text-xs font-medium text-slate-600">
                      Phantom wallet
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ) : selectedNetwork === "eth" ? (
            // Ethereum Wallets
            <div className="grid gap-3">
              {uniqueConnectors.map((connector) => {
                const meta = getMeta(connector.id)

                return (
                  <button
                    key={connector.id}
                    disabled={isPending}
                    onClick={async () => {
                      // If already connected with this connector, just close
                      if (isConnected && activeConnector?.id === connector.id) {
                        handleOpenChange(false)
                        return
                      }

                      try {
                        await connectAsync({ connector })
                        handleOpenChange(false)
                      } catch (error: any) {
                        // If already connected, just close the dialog
                        if (error?.name === "ConnectorAlreadyConnectedError") {
                          handleOpenChange(false)
                          return
                        }
                        // User rejected or connection failed - keep dialog open
                        console.error("Wallet connection failed:", error)
                      }
                    }}
                    className={cn(
                      "group w-full text-left",
                      "rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-xl",
                      "px-4 py-3 transition-all",
                      "hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10",
                      "focus:outline-none focus:ring-2 focus:ring-purple-400/40",
                      isPending && "opacity-50 cursor-not-allowed",
                      isConnected && activeConnector?.id === connector.id && "ring-2 ring-green-500"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/15 via-pink-400/10 to-indigo-400/10 ring-1 ring-purple-200/50">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-extrabold text-slate-900">
                            {connector.name}
                          </div>

                          <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white shadow-sm shadow-purple-500/20">
                            {meta.pill}
                          </span>
                        </div>

                        <div className="mt-0.5 text-xs font-medium text-slate-600">
                          {meta.hint}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
          ) : (
            // Solana Wallet (Phantom)
            <div className="space-y-4">
              <button
                onClick={handleSolanaConnect}
                disabled={solLoading}
                className={cn(
                  "group w-full text-left",
                  "rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-xl",
                  "px-4 py-3 transition-all",
                  "hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10",
                  "focus:outline-none focus:ring-2 focus:ring-purple-400/40",
                  solLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500/15 via-pink-400/10 to-indigo-400/10 ring-1 ring-purple-200/50">
                    {solLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                    ) : (
                      <span className="text-xl">👻</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-extrabold text-slate-900">
                        Phantom
                      </div>

                      <span className="rounded-full px-2.5 py-1 text-[11px] font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 text-white shadow-sm shadow-purple-500/20">
                        Solana
                      </span>
                    </div>

                    <div className="mt-0.5 text-xs font-medium text-slate-600">
                      {solLoading ? "Connecting..." : "Connect Phantom for Solana"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              {solError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {solError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200/70 pt-4">
          <Button
            variant="outline"
            className="rounded-full bg-white/60 hover:bg-white/80 border-slate-200"
            onClick={() => handleOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
