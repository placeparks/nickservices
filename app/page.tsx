"use client"

import { useState } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { PaymentWizard, SERVICES, Service } from "@/components/payment-wizard"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Star, Zap, Users, Radio, MessageCircle, Twitter, LogOut } from "lucide-react"
import { WalletSelector } from "@/components/wallet-selector"
import { cn } from "@/lib/utils"


export default function Home() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Ethereum wallet connection state
  const { address: ethAddress, isConnected: ethConnected } = useAccount()
  const { disconnect: disconnectEth } = useDisconnect()

  // Solana wallet connection state
  const { address: solAddress, isConnected: solConnected, disconnect: disconnectSol } = useSolanaWallet()

  // Determine which wallet is connected
  const isConnected = ethConnected || solConnected
  const address = ethAddress || solAddress
  const walletType = ethConnected ? "ETH" : solConnected ? "SOL" : null

  const handleDisconnect = () => {
    if (ethConnected) {
      disconnectEth()
    }
    if (solConnected) {
      disconnectSol()
    }
  }


  // State for Amplified Post duration selection on the landing page
  const [postDurationIdx, setPostDurationIdx] = useState(1) // Default to 48h

  const handleBuyLivestream = () => {
    setSelectedService(SERVICES[0])
    setSelectedPrice(1000)
    setIsWizardOpen(true)
  }

  const handleBuyPost = () => {
    const s = SERVICES[1]
    const duration = s.durations![postDurationIdx]
    setSelectedService(s)
    setSelectedPrice(duration.price)
    setIsWizardOpen(true)
  }

  return (
    <main className="min-h-screen bg-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white text-slate-900 font-sans selection:bg-purple-300/30">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              N
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Nick Services
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </nav>

          {isConnected && address ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-mono font-medium text-green-700">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
                {walletType && (
                  <Badge className="ml-1 text-[10px] px-1.5 py-0 h-5 bg-green-600 text-white hover:bg-green-700">
                    {walletType}
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="rounded-full font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button onClick={() => setShowWalletSelector(true)} className="rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all bg-primary text-white hover:bg-primary/90">
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      <div className="container bg-white mx-auto px-4 py-8 space-y-12">

        {/* Banner Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-16 text-center shadow-xl shadow-purple-500/10 bg-white">
          {/* Custom Background Image */}
          <div className="absolute inset-0 z-0">
            <img src="/hero-bg.png" alt="Hero Background" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <Badge className="mb-6 bg-white/70 backdrop-blur text-primary border-white/40 px-4 py-1.5 text-sm shadow-sm">
              <Zap className="w-3 h-3 mr-1 fill-current" /> Livestreams + Amplified Posts
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 drop-shadow-sm">
              Livestream + <br />
              <span className="text-primary">3 Shared Clips.</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 text-balance max-w-2xl mx-auto font-medium">
            Pay with <span className="font-semibold text-slate-900">Solana</span> or <span className="font-semibold text-slate-900">Ethereum</span>.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full font-bold text-lg h-14 px-10 shadow-xl shadow-primary/25 bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-all"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Packages
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full font-bold text-lg h-14 px-10 border-slate-300 bg-white/50 hover:bg-primary hover:text-white text-slate-700"
                asChild
              >
                <a href="https://x.com/NickPlaysCrypto" target="_blank" rel="noreferrer">
                  <Twitter className="w-5 h-5 mr-2" /> Contact @NickPlaysCrypto
                </a>
              </Button>
            </div>

            <p className="mt-8 text-sm text-slate-600 max-w-2xl mx-auto">
              Not an endorsement. Payment upon scheduling. Minimum 1 hour livestream. Creator reserves the right to critically examine projects.
            </p>
          </div>
        </section>


        {/* Bento Grid Services */}
        <section id="services" className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Livestream Card (Large Left) */}
          <div className="md:col-span-1 row-span-2 group">
            <div className="h-full glass-card rounded-3xl p-8 flex flex-col relative overflow-hidden bg-white hover:shadow-2xl hover:shadow-purple-500/10 transition-all border-none ring-1 ring-slate-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-bl-full -mr-8 -mt-8"></div>

              <div className="aspect-square rounded-2xl bg-slate-50 mb-8 overflow-hidden relative shadow-inner">
                {/* Placeholder for livestream image */}
                <div className="absolute inset-0">
                  <img
                    src="/nick1.png"
                    alt="Nick livestream"
                    className="w-full h-full object-cover"
                  />

                  {/* Soft overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
                </div>

                {/* LIVE badge */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                  LIVE
                </div>

              </div>

              <h3 className="text-3xl font-bold mb-3 text-slate-900">Livestream Boost</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                1 hour high-energy livestream + 3 bullish clips shared across social channels.
              </p>

              <div className="space-y-4 mb-8 flex-1">
                {SERVICES[0].features.map((f, i) => (
                  <div key={i} className="flex items-center text-sm text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total</p>
                  <p className="text-2xl font-bold font-mono text-slate-900">1,000 USDC</p>
                </div>
                <Button onClick={handleBuyLivestream} className="rounded-xl font-bold shadow-lg shadow-primary/20 bg-primary px-8 hover:bg-primary/90">
                  Book Now
                </Button>
              </div>
            </div>
          </div>

          {/* Amplified Post (Top Right Wide) */}
          <div className="md:col-span-2">
            <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden bg-white border-none ring-1 ring-slate-100">

              <div className="flex-1 space-y-4 relative z-10 w-full">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-2">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900">Premium Post</h3>
                <p className="text-slate-500 leading-relaxed">
                  Maximize your reach. Nick shares your post + incentivized Discord sharing.
                  <span className="font-semibold text-primary block mt-1">50% of funds distributed to the community.</span>
                </p>
              </div>

              <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">Select Duration</p>
                <div className="space-y-3">
                  {SERVICES[1].durations?.map((d, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPostDurationIdx(idx)}
                      className={cn(
                        "p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center group",
                        postDurationIdx === idx
                          ? "border-primary bg-white shadow-md shadow-primary/5 ring-1 ring-primary"
                          : "border-transparent bg-white shadow-sm hover:shadow-md hover:scale-[1.02]"
                      )}
                    >
                      <div className="text-sm font-semibold text-slate-700">{d.label.split(" - ")[0]}</div>
                      <div className={cn("font-mono font-bold", postDurationIdx === idx ? "text-primary" : "text-slate-400")}>
                        ${d.price}
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleBuyPost} className="w-full mt-6 rounded-xl font-bold h-12 shadow-lg shadow-primary/10" variant={postDurationIdx === 1 ? "default" : "secondary"}>
                  Buy Boost
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="h-full glass-card rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-5 bg-white border-none ring-1 ring-slate-100">
              <Avatar className="w-24 h-24 border-4 border-white shadow-2xl">
                <AvatarImage
                  src="/nick.jpg"
                  alt="Nick"
                  className="object-cover"
                />
              </Avatar>

              <div>
                <h4 className="text-2xl font-bold flex items-center justify-center gap-2 text-slate-900">
                  Nick <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"><Check className="w-3.5 h-3.5" /></Badge>
                </h4>
                <p className="text-sm text-primary font-bold mt-1">@NickPlaysCrypto</p>
              </div>
              <div className="flex gap-6 w-full justify-center pt-2">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Satisfaction</p>
                  <p className="font-extrabold text-xl text-slate-900">98%</p>
                </div>
                <div className="w-px bg-slate-100"></div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reach</p>
                  <p className="font-extrabold text-xl text-slate-900">150k+</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats/Social Proof */}
          <div className="md:col-span-1 bg-gradient-to-br from-secondary to-primary rounded-3xl p-8 flex flex-col justify-center text-white relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex -space-x-3 mb-6 pl-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center text-sm font-bold shadow-lg">
                    🎅
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-white text-primary flex items-center justify-center text-sm font-bold shadow-lg">
                  +50
                </div>
              </div>
              <h4 className="font-bold text-2xl mb-2">Creator Collabs</h4>
              <p className="text-white/80 font-medium">
                Join 50+ active creators amplifying the ecosystem.
              </p>
            </div>
          </div>

        </section>

        {/* Disclaimer Section */}
        <section className="py-16 border-t border-slate-200/60 text-slate-500 text-sm space-y-6 max-w-4xl mx-auto">
          <h5 className="font-bold text-slate-900 text-lg">Terms & Conditions</h5>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            <ul className="list-disc pl-5 space-y-3 marker:text-primary">
              <li>I reserve the right to critically examine the project, its founders, and anything about it. This is <strong>not an endorsement</strong>.</li>
              <li>I will not dox, but you must dox to me.</li>
              <li>If livestream is not up to par by my own personal standards, I reserve the right to <strong>not share 3 clips</strong>.</li>
              <li>Money upon scheduling. Minimum 1 hour livestream.</li>
            </ul>
            <ul className="list-disc pl-5 space-y-3 marker:text-secondary">
              <li>Buying service does not guarantee Nick will not critically examine the project from his own perspective.</li>
              <li><strong>Livestream funds:</strong> $100 each time buys back $NPC Solana token.</li>
              <li><strong>Premium post funds:</strong> 50% distributed to those who shared it.</li>
            </ul>
          </div>
        </section>

        <footer className="py-8 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Nick Services. Built by NickPlaysCrypto.</p>
        </footer>

      </div>

      {/* Checkouts */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md w-full">
          {selectedService && (
            <PaymentWizard
              service={selectedService}
              price={selectedPrice}
              onBack={() => setIsWizardOpen(false)}
              onComplete={() => setIsWizardOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <WalletSelector open={showWalletSelector} onOpenChange={setShowWalletSelector} />
    </main>
  )
}
