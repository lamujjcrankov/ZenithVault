import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEncryptedBid } from "@/hooks/useFhevm";
import { usePlaceBid, useCanUserBid } from "@/hooks/useZenithVault";
import { useTransactionToast, showWalletToast } from "@/hooks/useTransactionToast";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { cn } from "@/lib/utils";

interface BidFormProps {
  auctionId: bigint;
  reservePrice: bigint;
  depositAmount: bigint;
  minBid?: bigint;
  isActive: boolean;
}

export function BidForm({
  auctionId,
  reservePrice,
  depositAmount,
  minBid,
  isActive,
}: BidFormProps) {
  const { address, isConnected } = useAccount();
  const [bidAmount, setBidAmount] = useState("");
  const [step, setStep] = useState<"input" | "encrypting" | "confirming" | "success">("input");

  const { encrypt, isEncrypting, encryptedBid, isReady, reset } = useEncryptedBid();
  const { placeBid, hash, isPending, isConfirming, isSuccess, error } = usePlaceBid();
  const { data: canBidResult } = useCanUserBid(auctionId, address);

  // Transaction toast - monitors chain status
  const { isSuccess: txConfirmed, isError: txFailed } = useTransactionToast(hash, {
    pendingTitle: "Bid Submitted",
    pendingDescription: "Your encrypted bid is being processed...",
    successTitle: "Bid Confirmed!",
    successDescription: "Your sealed bid has been recorded on-chain",
    errorTitle: "Bid Failed",
    errorDescription: "Transaction was reverted",
  });

  const canBid = canBidResult?.[0] ?? true;
  const canBidReason = canBidResult?.[1] ?? "";

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setBidAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!bidAmount || !isConnected || !isReady) return;

    try {
      // Step 1: Encrypt the bid
      setStep("encrypting");
      const bidWei = parseEther(bidAmount);
      const encrypted = await encrypt(bidWei);

      if (!encrypted) {
        throw new Error("Encryption failed");
      }

      // Step 2: Submit the transaction
      setStep("confirming");
      placeBid(auctionId, encrypted.encryptedHandle, encrypted.proof, depositAmount);
    } catch (err) {
      console.error("Bid submission failed:", err);
      showWalletToast("reject");
      setStep("input");
    }
  };

  // Handle wallet rejection
  useEffect(() => {
    if (error) {
      if (error.message?.includes("User rejected") || error.message?.includes("denied")) {
        showWalletToast("reject");
      }
      setStep("input");
    }
  }, [error]);

  // Update step based on transaction confirmation
  useEffect(() => {
    if (txConfirmed && step !== "success") {
      setStep("success");
      setTimeout(() => {
        setStep("input");
        setBidAmount("");
        reset();
      }, 3000);
    }
  }, [txConfirmed, step, reset]);

  // Reset on tx failure
  useEffect(() => {
    if (txFailed) {
      setStep("input");
    }
  }, [txFailed]);

  const bidValue = bidAmount ? parseEther(bidAmount) : BigInt(0);
  const isValidBid = bidValue >= reservePrice;

  if (!isActive) {
    return (
      <Card className="bg-dark-800/50 border-dark-600">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">This auction has ended</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-800/50 border-dark-600 overflow-hidden">
      {/* Header with encryption indicator */}
      <CardHeader className="border-b border-dark-700 bg-dark-900/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Lock className="w-4 h-4 text-primary-400" />
          </div>
          <span>Place Sealed Bid</span>
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Your bid will be encrypted with FHE - invisible to others
        </p>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Can't bid message */}
        {!canBid && (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {canBidReason || "You cannot bid on this auction"}
          </div>
        )}

        {/* Step indicator */}
        <AnimatePresence mode="wait">
          {step === "encrypting" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/30"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                <div>
                  <p className="text-primary-300 font-medium">Encrypting your bid...</p>
                  <p className="text-xs text-primary-400/70">Using Fully Homomorphic Encryption</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "confirming" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg bg-accent-500/10 border border-accent-500/30"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
                <div>
                  <p className="text-accent-300 font-medium">Confirm in wallet</p>
                  <p className="text-xs text-accent-400/70">Please approve the transaction</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">Bid placed successfully!</p>
                  <p className="text-xs text-green-400/70">Your encrypted bid is now active</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bid input */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Your Bid Amount (ETH)</label>
          <div className="relative">
            <Input
              type="text"
              value={bidAmount}
              onChange={handleBidChange}
              placeholder="0.00"
              disabled={step !== "input" || !canBid}
              className="pr-16 font-mono text-lg h-14 bg-dark-900 border-dark-600 focus:border-primary-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">
              ETH
            </span>
          </div>
        </div>

        {/* Info row */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Reserve Price</span>
            <span className="font-mono text-gray-300">
              {formatEther(reservePrice)} ETH
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Required Deposit</span>
            <span className="font-mono text-gray-300">
              {formatEther(depositAmount)} ETH
            </span>
          </div>
          {bidAmount && (
            <div className="flex justify-between pt-2 border-t border-dark-700">
              <span className="text-gray-400">Total to Pay Now</span>
              <span className="font-mono font-semibold text-white">
                {formatEther(depositAmount)} ETH
              </span>
            </div>
          )}
        </div>

        {/* Validation message */}
        {bidAmount && !isValidBid && (
          <p className="text-sm text-red-400">
            Bid must be at least {formatEther(reservePrice)} ETH
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-400">
            Error: {error.message}
          </p>
        )}

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !isConnected ||
            !bidAmount ||
            !isValidBid ||
            step !== "input" ||
            !canBid
          }
          className={cn(
            "w-full h-12 text-lg font-semibold",
            "bg-gradient-to-r from-primary-600 to-accent-600",
            "hover:from-primary-500 hover:to-accent-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Shield className="w-5 h-5 mr-2" />
          {!isConnected
            ? "Connect Wallet"
            : step === "input"
            ? "Place Encrypted Bid"
            : step === "encrypting"
            ? "Encrypting..."
            : step === "confirming"
            ? "Confirming..."
            : "Bid Placed!"}
        </Button>

        {/* FHE notice */}
        <p className="text-xs text-center text-gray-500">
          Protected by Zama Fully Homomorphic Encryption
        </p>
      </CardContent>
    </Card>
  );
}
