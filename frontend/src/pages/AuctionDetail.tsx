import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Users,
  Gavel,
  Calendar,
  Tag,
  Shield,
  ExternalLink,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BidForm } from "@/components/auction/BidForm";
import { CountdownTimer, PulseCountdown } from "@/components/auction/CountdownTimer";
import { CategoryIcon } from "@/components/common/CategoryIcon";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuctionBidders } from "@/hooks/useZenithVault";
import { useFullAuction } from "@/hooks/useAuctionData";
import { AuctionStatus, AuctionType, getAuctionTypeLabel } from "@/lib/types";
import { formatEther } from "viem";
import { cn } from "@/lib/utils";

export function AuctionDetail() {
  const { id } = useParams<{ id: string }>();
  const auctionId = id ? BigInt(id) : undefined;

  const { data: auction, isLoading, error } = useFullAuction(auctionId);
  const { data: bidders } = useAuctionBidders(auctionId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-dark-800 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-dark-800 rounded-xl" />
            <div className="space-y-4">
              <div className="h-10 bg-dark-800 rounded w-3/4" />
              <div className="h-20 bg-dark-800 rounded" />
              <div className="h-40 bg-dark-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-heading font-bold text-white mb-2">
            Auction Not Found
          </h2>
          <p className="text-gray-400 mb-6">
            The auction you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/auctions">
            <Button>Back to Auctions</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isActive = Number(auction.status) === AuctionStatus.Active;
  const isSettled = Number(auction.status) === AuctionStatus.Settled;
  const isVickrey = Number(auction.auctionType) === AuctionType.SecondPrice;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Pulse countdown for urgent auctions */}
      {isActive && <PulseCountdown endTime={auction.endTime} />}

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link to="/auctions">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image and Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden border border-dark-600">
            <img
              src={auction.item.imageUrl}
              alt={auction.item.name}
              className="w-full aspect-square object-cover"
            />
            {/* Overlay badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <StatusBadge status={auction.status as AuctionStatus} />
              <Badge
                variant="outline"
                className="bg-dark-900/80 backdrop-blur-sm border-dark-600"
              >
                {isVickrey ? "Vickrey" : "First Price"}
              </Badge>
            </div>
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/20 backdrop-blur-sm border border-primary-500/30">
                <Lock className="w-3 h-3 text-primary-400" />
                <span className="text-xs text-primary-300">FHE Protected</span>
              </div>
            </div>
          </div>

          {/* Item Details Card */}
          <Card className="bg-dark-800/50 border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CategoryIcon
                  category={auction.item.category}
                  className="w-5 h-5 text-gray-400"
                />
                <span>{auction.item.category}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Description</h3>
                <p className="text-gray-300">{auction.item.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Token ID</h3>
                  <p className="font-mono text-gray-300">
                    #{auction.item.tokenId.toString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Contract</h3>
                  <p className="font-mono text-gray-300 truncate text-sm">
                    {auction.item.nftContract}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bidders List */}
          <Card className="bg-dark-800/50 border-dark-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-400" />
                Bidders ({bidders?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bidders && bidders.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {bidders.map((bidder, index) => (
                    <div
                      key={bidder}
                      className="flex items-center justify-between p-3 rounded-lg bg-dark-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                          <span className="text-xs font-mono text-primary-400">
                            #{index + 1}
                          </span>
                        </div>
                        <span className="font-mono text-sm text-gray-300">
                          {bidder.slice(0, 6)}...{bidder.slice(-4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Lock className="w-3 h-3" />
                        <span className="text-xs">Encrypted</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No bids yet. Be the first!
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Bidding Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Title and Countdown */}
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {auction.item.name}
            </h1>
            <CountdownTimer
              endTime={auction.endTime}
              variant="large"
              className="mb-6"
            />
          </div>

          {/* Auction Info Card */}
          <Card className="bg-dark-800/50 border-dark-600">
            <CardContent className="p-6 space-y-4">
              {/* Auction Type */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-700/50">
                <div className="flex items-center gap-3">
                  <Gavel className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm text-gray-500">Auction Type</p>
                    <p className="font-medium text-white">
                      {getAuctionTypeLabel(auction.auctionType as AuctionType)}
                    </p>
                  </div>
                </div>
                {isVickrey && (
                  <Badge className="bg-accent-500/20 text-accent-400 border-accent-500/30">
                    Winner pays 2nd price
                  </Badge>
                )}
              </div>

              {/* Price Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-700/50">
                  <p className="text-sm text-gray-500 mb-1">Reserve Price</p>
                  <p className="text-xl font-mono font-bold text-white">
                    {formatEther(auction.reservePrice)} ETH
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-dark-700/50">
                  <p className="text-sm text-gray-500 mb-1">Required Deposit</p>
                  <p className="text-xl font-mono font-bold text-white">
                    {formatEther(auction.depositAmount)} ETH
                  </p>
                </div>
              </div>

              {/* Seller */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-dark-700/50">
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-mono text-gray-300">
                    {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}
                  </p>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/address/${auction.seller}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {Number(auction.bidCount)}
                  </p>
                  <p className="text-xs text-gray-500">Total Bids</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {bidders?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Bidders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-400">
                    <Lock className="w-5 h-5 inline" />
                  </p>
                  <p className="text-xs text-gray-500">Encrypted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settled Auction Result */}
          {isSettled && auction.winner !== "0x0000000000000000000000000000000000000000" && (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-green-400">
                    Auction Settled
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Winner</span>
                    <span className="font-mono text-white">
                      {auction.winner.slice(0, 6)}...{auction.winner.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Winning Bid</span>
                    <span className="font-mono text-green-400">
                      {formatEther(auction.winningBid)} ETH
                    </span>
                  </div>
                  {isVickrey && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment (2nd Price)</span>
                      <span className="font-mono text-white">
                        {formatEther(auction.secondBid)} ETH
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bid Form */}
          {isActive && (
            <BidForm
              auctionId={auctionId!}
              reservePrice={auction.reservePrice}
              depositAmount={auction.depositAmount}
              isActive={isActive}
            />
          )}

          {/* FHE Info */}
          <Card className="bg-primary-500/5 border-primary-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-500/20">
                  <Shield className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">
                    Your Privacy is Protected
                  </h3>
                  <p className="text-sm text-gray-400">
                    All bids are encrypted using Zama's Fully Homomorphic Encryption.
                    Your bid amount remains completely private until the auction ends
                    and results are revealed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
