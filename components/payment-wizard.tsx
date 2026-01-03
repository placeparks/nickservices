"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount, useConnect, useSendTransaction, useWriteContract, useSwitchChain, useChainId, useWaitForTransactionReceipt } from "wagmi"
import { sepolia } from "wagmi/chains"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"
import { WalletSelector } from "@/components/wallet-selector"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronRight, CreditCard, Shield, Zap, Info, Clock, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

export type Step = "service" | "details" | "payment" | "success"

export interface Service {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  durations?: { label: string; price: number }[]
}

export const SERVICES: Service[] = [
  {
    id: "livestream",
    name: "1 Hour Livestream + 3 Clips",
    price: 1000,
    description: "1 hour livestream plus 3 bullish clips shared by Nick on social channels.",
    features: ["1 Hour minimum livestream", "3 Bullish clips shared", "$100 buy back $NPC Solana token"],
  },
  {
    id: "premium-post",
    name: "Premium Amplified Post",
    price: 500, // Updated base price to 500 as per note
    description: "Nick shares your post + incentivized Discord sharing for maximum reach.",
    features: ["Discord amplification", "Direct Nick share", "50% shared with community"],
    durations: [
      { label: "24 Hours - $2", price: 2 },
      { label: "48 Hours - $800", price: 800 },
      { label: "72 Hours - $1000", price: 1000 },
    ],
  },
]

interface PaymentWizardProps {
  service?: Service
  price?: number
  onBack?: () => void
  onComplete?: () => void
}

export function PaymentWizard({ service, price, onBack, onComplete }: PaymentWizardProps) {
  const [step, setStep] = useState<Step>(service ? "details" : "service")
  const [selectedService, setSelectedService] = useState<Service | null>(service || null)
  const [selectedDuration, setSelectedDuration] = useState<{ label: string; price: number } | null>(null)
  const [email, setEmail] = useState("")
  const [telegram, setTelegram] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Sync props if they change
  useEffect(() => {
    if (service) {
      setSelectedService(service)
      setStep("details")
    }
  }, [service])

  const nextStep = () => {
    if (step === "service") setStep("details")
    else if (step === "details") {
      if (!agreedToTerms) return // Should validate terms
      setStep("payment")
    }
    else if (step === "payment") setStep("success")
  }

  const prevStep = () => {
    if (step === "details") {
      if (onBack) onBack()
      else setStep("service")
    }
    else if (step === "payment") setStep("details")
  }

  const finalPrice = price ?? (selectedDuration ? selectedDuration.price : selectedService?.price || 0)

  return (
    <Card className="border-border/40 bg-card/90 backdrop-blur-xl overflow-hidden shadow-2xl">
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          initial={{ width: "25%" }}
          animate={{
            width: step === "service" ? "25%" : step === "details" ? "50%" : step === "payment" ? "75%" : "100%",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === "service" && (
            <ServiceSelection
              selectedId={selectedService?.id}
              onSelect={(s) => {
                setSelectedService(s)
                if (!s.durations) {
                  setSelectedDuration(null)
                  nextStep()
                }
              }}
              selectedDuration={selectedDuration}
              onDurationSelect={(d) => {
                setSelectedDuration(d)
                nextStep()
              }}
            />
          )}

          {step === "details" && (
            <DetailsForm
              email={email}
              setEmail={setEmail}
              telegram={telegram}
              setTelegram={setTelegram}
              agreedToTerms={agreedToTerms}
              setAgreedToTerms={setAgreedToTerms}
              onNext={nextStep}
              onBack={prevStep}
              serviceName={selectedService?.name}
            />
          )}

          {step === "payment" && (
            <PaymentPortal
              onBack={prevStep}
              onComplete={nextStep}
              service={selectedService}
              price={finalPrice}
              email={email}
              telegram={telegram}
            />
          )}

          {step === "success" && <SuccessView onClose={onComplete} />}
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}

function ServiceSelection({
  selectedId,
  onSelect,
  selectedDuration,
  onDurationSelect,
}: {
  selectedId?: string
  onSelect: (s: Service) => void
  selectedDuration: { label: string; price: number } | null
  onDurationSelect: (d: { label: string; price: number }) => void
}) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Select Service
        </CardTitle>
        <CardDescription>Choose the service that fits your project needs.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {SERVICES.map((service) => (
          <div key={service.id} className="space-y-3">
            <button
              onClick={() => onSelect(service)}
              className={cn(
                "w-full group relative flex flex-col text-left p-4 rounded-xl border transition-all hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50",
                selectedId === service.id ? "border-primary bg-primary/5 shadow-inner" : "border-border bg-transparent",
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                  ${service.price}+
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
              <div className="flex flex-wrap gap-2">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded"
                  >
                    <Check className="w-3 h-3 mr-1 text-primary" />
                    {feature}
                  </span>
                ))}
              </div>
            </button>

            {selectedId === service.id && service.durations && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-2 px-1"
              >
                {service.durations.map((d) => (
                  <Button
                    key={d.label}
                    variant={selectedDuration?.label === d.label ? "default" : "outline"}
                    size="sm"
                    onClick={() => onDurationSelect(d)}
                    className="text-xs h-9"
                  >
                    {d.label} - ${d.price}
                  </Button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </CardContent>
    </>
  )
}

function DetailsForm({
  email,
  setEmail,
  telegram,
  setTelegram,
  agreedToTerms,
  setAgreedToTerms,
  onNext,
  onBack,
  serviceName,
}: {
  email: string
  setEmail: (v: string) => void
  telegram: string
  setTelegram: (v: string) => void
  agreedToTerms: boolean
  setAgreedToTerms: (v: boolean) => void
  onNext: () => void
  onBack: () => void
  serviceName?: string
}) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Project Details
        </CardTitle>
        <CardDescription>We'll use these to coordinate the delivery of your {serviceName}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="dev@project.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-background/80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telegram">Telegram Username (Optional)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">@</span>
            <Input
              id="telegram"
              placeholder="username"
              className="pl-8 bg-background/80"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-primary">Terms & Disclaimers</Label>
          <ul className="text-[11px] text-muted-foreground space-y-2 list-disc pl-4 leading-tight">
            <li>Nick reserves the right to critically examine the project and founders.</li>
            <li>This service is not an endorsement of the project.</li>
            <li>Nick will not dox but you must dox to him for security.</li>
            <li>Sharing of clips is subject to livestream quality standards.</li>
            <li>Full payment is required upon scheduling.</li>
            <li>Buying service does not guarantee a positive review.</li>
          </ul>
          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label
              htmlFor="terms"
              className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I understand these are not endorsements and funds are non-refundable once scheduled.
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/50 pt-6">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!email || !agreedToTerms} className="min-w-[120px]">
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </CardFooter>
    </>
  )
}

function PaymentPortal({
  onBack,
  onComplete,
  service,
  price,
  email,
  telegram,
}: {
  onBack: () => void
  onComplete: () => void
  service: Service | null
  price: number
  email: string
  telegram: string
}) {
  const [network, setNetwork] = useState<"eth" | "sol">("eth")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [showWalletSelector, setShowWalletSelector] = useState(false)

  // Ethereum wallet connection
  const { address: ethAddress, isConnected: isEthConnected, chainId: accountChainId } = useAccount()
  const { connect: connectEth, connectors } = useConnect()
  const { sendTransaction } = useSendTransaction()
  const { writeContract } = useWriteContract()
  const { switchChainAsync } = useSwitchChain()
  const globalChainId = useChainId()

  const currentChainId = accountChainId || globalChainId

  // Transaction confirmation state (Ethereum only)
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: (network === "eth" && txHash?.startsWith("0x")) ? txHash as `0x${string}` : undefined
  })

  useEffect(() => {
    if (isConfirmed && network === "eth") {
      // Transaction settled (Ethereum)
      setIsProcessing(false)
      setTimeout(() => onComplete(), 2000)
    }
  }, [isConfirmed, onComplete, network])

  // Solana wallet state - use global hook
  const { address: solAddress, isConnected: isSolConnected } = useSolanaWallet()

  const receiverAddress = network === "eth"
    ? process.env.NEXT_PUBLIC_ETH_WALLET_ADDRESS
    : process.env.NEXT_PUBLIC_SOL_WALLET_ADDRESS

  const usdcAddress = network === "eth"
    ? process.env.NEXT_PUBLIC_ETH_USDC_ADDRESS
    : process.env.NEXT_PUBLIC_SOL_USDC_ADDRESS

  const handleConnectWallet = async () => {
    setError("")
    // Always show wallet selector - it handles both Ethereum and Solana
    setShowWalletSelector(true)
  }

  const sendEmailNotification = async (txHash: string, network: "eth" | "sol", walletAddress: string) => {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: service?.name,
          price,
          network,
          txHash,
          customerEmail: email,
          telegram,
          walletAddress,
        }),
      })
      console.log('Email notification sent successfully')
    } catch (error) {
      console.error('Failed to send email notification:', error)
      // Don't throw - email failure shouldn't break the payment flow
    }
  }

  const handlePayment = async () => {
    setError("")
    setIsProcessing(true)

    try {
      if (network === "eth") {
        // Enforce Sepolia network
        if (currentChainId !== sepolia.id) {
          try {
            await switchChainAsync({ chainId: sepolia.id })
            setIsProcessing(false) // Stop processing to allow state update
            return // User needs to click pay again
          } catch (e) {
            throw new Error("Please switch to Ethereum Sepolia network to continue")
          }
        }

        // Ethereum USDC payment
        if (!receiverAddress || !usdcAddress) {
          throw new Error("Missing wallet or USDC address configuration")
        }

        // ERC20 transfer function
        const amountInWei = BigInt(price) * BigInt(10 ** 6) // USDC has 6 decimals

        writeContract({
          chainId: sepolia.id, // Explicitly enforce chain
          address: usdcAddress as `0x${string}`,
          abi: [
            {
              name: "transfer",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              outputs: [{ name: "", type: "bool" }],
            },
          ],
          functionName: "transfer",
          args: [receiverAddress as `0x${string}`, amountInWei],
        }, {
          onSuccess: async (hash) => {
            setTxHash(hash)
            // Send email notification
            await sendEmailNotification(hash, "eth", ethAddress || "")
            setTimeout(() => onComplete(), 2000)
          },
          onError: (err) => {
            setError(err.message)
            setIsProcessing(false)
          }
        })
      } else {
        // Solana USDC payment
        if (!receiverAddress || !usdcAddress) {
          throw new Error("Missing wallet or USDC address configuration")
        }

        const { Connection, PublicKey, Transaction } = await import("@solana/web3.js")
        const { getAssociatedTokenAddress, createTransferInstruction } = await import("@solana/spl-token")

        // Use devnet for now
        const connection = new Connection("https://api.devnet.solana.com", "confirmed")

        const provider = (window as any).solana

        if (!solAddress) {
          throw new Error("Solana wallet not connected")
        }

        const fromPubkey = new PublicKey(solAddress)
        const toPubkey = new PublicKey(receiverAddress)
        const mintPubkey = new PublicKey(usdcAddress)

        // Get associated token accounts
        const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, fromPubkey)
        const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, toPubkey)

        // Create transfer instruction
        const amountInLamports = price * 10 ** 6 // USDC has 6 decimals
        const transferInstruction = createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromPubkey,
          amountInLamports
        )

        // Create and send transaction
        const transaction = new Transaction().add(transferInstruction)
        transaction.feePayer = fromPubkey
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

        const signed = await provider.signTransaction(transaction)
        const signature = await connection.sendRawTransaction(signed.serialize())
        await connection.confirmTransaction(signature)

        setTxHash(signature)
        // Send email notification
        await sendEmailNotification(signature, "sol", solAddress || "")
        setIsProcessing(false) // Stop processing spinner
        setTimeout(() => onComplete(), 2000)
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setIsProcessing(false)
      setError(err.message || "Payment failed")
    }
  }

  const isConnected = network === "eth" ? isEthConnected : isSolConnected
  const walletAddress = network === "eth" ? ethAddress : solAddress
  const isWrongNetwork = network === "eth" && currentChainId !== sepolia.id

  return (
    <>
      <WalletSelector open={showWalletSelector} onOpenChange={setShowWalletSelector} defaultNetwork={network} />
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Secure Payment
          </CardTitle>
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setNetwork("eth")}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all font-medium",
                network === "eth" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Ethereum
            </button>
            <button
              onClick={() => setNetwork("sol")}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all font-medium",
                network === "sol" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              Solana
            </button>
          </div>
        </div>
        <CardDescription>
          {isConnected
            ? isWrongNetwork
              ? <span className="text-red-500 font-medium">Wrong Network. Please switch to Sepolia.</span>
              : "Click Pay to send USDC from your wallet"
            : "Connect your wallet to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Amount Due</p>
          <div className="text-3xl font-mono font-bold text-primary">{price} USDC</div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Equivalent to ${price} USD</p>
          {isConnected && (
            <div className="text-xs text-muted-foreground pt-2 flex flex-col items-center gap-1">
              <span>Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
              {network === "eth" && (
                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", isWrongNetwork ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500")}>
                  Network: {currentChainId === sepolia.id ? "Sepolia" : "Wrong Network"}
                </span>
              )}
            </div>
          )}
        </div>

        {txHash && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">Transaction Submitted!</p>
            <p className="text-xs text-muted-foreground mt-1 break-all">Hash: {txHash}</p>
            {isConfirming && <p className="text-xs text-yellow-500 mt-1 animate-pulse">Confirming transaction...</p>}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Error</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xs">
              <p className="font-bold">Fast Setup</p>
              <p className="text-muted-foreground">Automated detection</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="text-xs">
              <p className="font-bold">Secure</p>
              <p className="text-muted-foreground">On-chain verified</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border/50 pt-6">
        <Button variant="ghost" onClick={onBack} disabled={isProcessing || isConfirming}>
          Back
        </Button>
        {!isConnected ? (
          <Button onClick={handleConnectWallet} className="group min-w-[140px]">
            Connect Wallet <Wallet className="w-4 h-4 ml-2" />
          </Button>
        ) : isWrongNetwork ? (
          <Button onClick={() => switchChainAsync({ chainId: sepolia.id })} className="group min-w-[140px]" variant="destructive">
            Switch to Sepolia
          </Button>
        ) : (
          <Button onClick={handlePayment} disabled={isProcessing || isConfirming} className="group min-w-[140px]">
            {isConfirming ? "Confirming..." : isProcessing ? "Processing..." : `Pay ${price} USDC`}{" "}
            <CreditCard className="w-4 h-4 ml-2 group-hover:animate-bounce" />
          </Button>
        )}
      </CardFooter>
    </>
  )
}



function SuccessView({ onClose }: { onClose?: () => void }) {
  return (
    <div className="py-12 px-6 text-center space-y-6">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4 animate-in zoom-in duration-500">
        <Check className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Order Received!</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Your payment is being verified on the blockchain. You will receive a confirmation email shortly.
        </p>
      </div>
      <div className="pt-8">
        <Button variant="outline" onClick={onClose || (() => window.location.reload())}>
          Return to Services
        </Button>
      </div>
    </div>
  )
}
