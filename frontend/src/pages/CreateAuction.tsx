import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  Upload,
  Gavel,
  Clock,
  Coins,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAuction } from "@/hooks/useZenithVault";
import { useTransactionToast, showWalletToast } from "@/hooks/useTransactionToast";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther } from "viem";
import { CATEGORIES, DURATION_OPTIONS } from "@/lib/constants";
import { AuctionType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  auctionType: AuctionType;
  reservePrice: string;
  depositAmount: string;
  duration: number;
}

const initialFormData: FormData = {
  name: "",
  description: "",
  imageUrl: "",
  category: "Art",
  auctionType: AuctionType.FirstPrice,
  reservePrice: "0.01",
  depositAmount: "0.005",
  duration: 604800, // 7 days
};

export function CreateAuction() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [step, setStep] = useState(1);

  const { createAuction, hash, isPending, isConfirming, isSuccess, error } = useCreateAuction();

  // Transaction toast - monitors chain status
  const { isSuccess: txConfirmed, isError: txFailed } = useTransactionToast(hash, {
    pendingTitle: "Creating Auction",
    pendingDescription: "Your auction is being created on-chain...",
    successTitle: "Auction Created!",
    successDescription: "Your sealed-bid auction is now live",
    errorTitle: "Auction Creation Failed",
    errorDescription: "Transaction was reverted",
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!isConnected) return;

    try {
      createAuction({
        item: {
          nftContract: "0x0000000000000000000000000000000000000000" as `0x${string}`,
          tokenId: BigInt(Math.floor(Math.random() * 1000000)),
          metadataUri: `ipfs://Qm${Date.now()}`,
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl,
          category: formData.category,
        },
        auctionType: formData.auctionType,
        reservePrice: parseEther(formData.reservePrice),
        depositAmount: parseEther(formData.depositAmount),
        duration: BigInt(formData.duration),
      });
    } catch (err) {
      console.error("Failed to create auction:", err);
    }
  };

  // Handle wallet rejection
  useEffect(() => {
    if (error) {
      if (error.message?.includes("User rejected") || error.message?.includes("denied")) {
        showWalletToast("reject");
      }
    }
  }, [error]);

  // Redirect on success
  useEffect(() => {
    if (txConfirmed) {
      setTimeout(() => navigate("/auctions"), 2000);
    }
  }, [txConfirmed, navigate]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-400 mb-8">
              Connect your wallet to create a new sealed-bid auction.
            </p>
            <ConnectButton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          Create Auction
        </h1>
        <p className="text-gray-400">
          List your digital collectible for a privacy-preserving sealed-bid auction
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 mb-8"
      >
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                step >= s
                  ? "bg-primary-600 text-white"
                  : "bg-dark-700 text-gray-500"
              )}
            >
              {step > s ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "w-20 h-1 ml-4",
                  step > s ? "bg-primary-600" : "bg-dark-700"
                )}
              />
            )}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Item Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-dark-800/50 border-dark-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="w-5 h-5 text-primary-400" />
                    Item Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Item Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="e.g., Cosmic Dreams #42"
                      className="bg-dark-900 border-dark-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Description *
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Describe your item..."
                      className="bg-dark-900 border-dark-600 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Image URL *
                    </label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => updateField("imageUrl", e.target.value)}
                      placeholder="https://..."
                      className="bg-dark-900 border-dark-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) => updateField("category", v)}
                    >
                      <SelectTrigger className="bg-dark-900 border-dark-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.description || !formData.imageUrl}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-600"
                  >
                    Continue
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Auction Settings */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-dark-800/50 border-dark-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary-400" />
                    Auction Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Auction Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => updateField("auctionType", AuctionType.FirstPrice)}
                        className={cn(
                          "p-4 rounded-xl border transition-all text-left",
                          formData.auctionType === AuctionType.FirstPrice
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-dark-600 hover:border-dark-500"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="w-4 h-4 text-primary-400" />
                          <span className="font-medium text-white">First Price</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Winner pays their bid amount
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("auctionType", AuctionType.SecondPrice)}
                        className={cn(
                          "p-4 rounded-xl border transition-all text-left",
                          formData.auctionType === AuctionType.SecondPrice
                            ? "border-accent-500 bg-accent-500/10"
                            : "border-dark-600 hover:border-dark-500"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Lock className="w-4 h-4 text-accent-400" />
                          <span className="font-medium text-white">Vickrey</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Winner pays second-highest bid
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Duration
                    </label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(v) => updateField("duration", parseInt(v))}
                    >
                      <SelectTrigger className="bg-dark-900 border-dark-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Reserve Price (ETH)
                      </label>
                      <Input
                        type="text"
                        value={formData.reservePrice}
                        onChange={(e) => updateField("reservePrice", e.target.value)}
                        className="bg-dark-900 border-dark-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Required Deposit (ETH)
                      </label>
                      <Input
                        type="text"
                        value={formData.depositAmount}
                        onChange={(e) => updateField("depositAmount", e.target.value)}
                        className="bg-dark-900 border-dark-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 border-dark-600"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-dark-800/50 border-dark-600">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Confirm & Create
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-dark-900 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Item</span>
                      <span className="text-white font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category</span>
                      <Badge variant="outline">{formData.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type</span>
                      <Badge
                        className={
                          formData.auctionType === AuctionType.SecondPrice
                            ? "bg-accent-500/20 text-accent-400"
                            : "bg-primary-500/20 text-primary-400"
                        }
                      >
                        {formData.auctionType === AuctionType.SecondPrice
                          ? "Vickrey"
                          : "First Price"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="text-white">
                        {DURATION_OPTIONS.find((d) => d.value === formData.duration)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reserve Price</span>
                      <span className="font-mono text-white">{formData.reservePrice} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deposit Required</span>
                      <span className="font-mono text-white">{formData.depositAmount} ETH</span>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error.message}
                    </div>
                  )}

                  {/* Success message */}
                  {txConfirmed && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Auction created successfully! Redirecting...
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      disabled={isPending || isConfirming}
                      className="flex-1 border-dark-600"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isPending || isConfirming || txConfirmed}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : txConfirmed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Created!
                        </>
                      ) : (
                        "Create Auction"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="text-lg font-heading font-semibold text-white mb-4">
              Preview
            </h3>
            <Card className="bg-dark-800/50 border-dark-600 overflow-hidden">
              <div className="aspect-square bg-dark-700">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt={formData.name || "Preview"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://picsum.photos/400";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImagePlus className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-heading font-semibold text-white truncate">
                  {formData.name || "Item Name"}
                </h4>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {formData.description || "Item description..."}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
                  <Badge variant="outline" className="text-xs">
                    {formData.category}
                  </Badge>
                  <span className="font-mono text-sm text-primary-400">
                    {formData.reservePrice} ETH
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
