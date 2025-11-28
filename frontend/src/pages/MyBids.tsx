import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  Trophy,
  Clock,
  Coins,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuctionCard } from "@/components/auction/AuctionCard";
import {
  useUserStats,
  useClaimRefund,
} from "@/hooks/useZenithVault";
import {
  useUserBidAuctionsData,
  useUserCreatedAuctionsData,
  useUserWonAuctionsData,
  useUserPendingRefundsData,
  useFullAuction,
} from "@/hooks/useAuctionData";
import { useTransactionToast, showWalletToast } from "@/hooks/useTransactionToast";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import type { Auction } from "@/lib/types";
import { AuctionStatus, AuctionType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MyBids() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState("bids");

  const { data: stats, isLoading: loadingStats } = useUserStats(address);
  const { data: bidAuctions } = useUserBidAuctionsData(address);
  const { data: createdAuctions } = useUserCreatedAuctionsData(address);
  const { data: wonAuctions } = useUserWonAuctionsData(address);
  const { data: pendingRefunds } = useUserPendingRefundsData(address);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-400 mb-8">
              Connect your wallet to view your bids, created auctions, and claim refunds.
            </p>
            <ConnectButton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          My Dashboard
        </h1>
        <p className="text-gray-400">
          Manage your auctions, bids, and refunds
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
      >
        <StatCard
          icon={<Lock className="w-5 h-5" />}
          label="Total Bids"
          value={stats ? Number(stats[0]) : 0}
          color="primary"
          loading={loadingStats}
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Wins"
          value={stats ? Number(stats[1]) : 0}
          color="yellow"
          loading={loadingStats}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Created"
          value={stats ? Number(stats[2]) : 0}
          color="accent"
          loading={loadingStats}
        />
        <StatCard
          icon={<Coins className="w-5 h-5" />}
          label="Deposited"
          value={stats ? `${Number(formatEther(stats[3])).toFixed(3)}` : "0"}
          suffix="ETH"
          color="green"
          loading={loadingStats}
        />
        <StatCard
          icon={<RefreshCw className="w-5 h-5" />}
          label="Refunds"
          value={stats ? `${Number(formatEther(stats[4])).toFixed(3)}` : "0"}
          suffix="ETH"
          color="red"
          loading={loadingStats}
        />
      </motion.div>

      {/* Pending Refunds Banner */}
      {pendingRefunds && pendingRefunds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-300">
                    You have {pendingRefunds.length} pending refund(s)
                  </p>
                  <p className="text-sm text-yellow-400/70">
                    Claim your deposits from auctions you didn't win
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                onClick={() => setActiveTab("refunds")}
              >
                View Refunds
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-dark-800 border border-dark-600 mb-6">
            <TabsTrigger value="bids">
              My Bids
              {bidAuctions && bidAuctions.length > 0 && (
                <Badge className="ml-2 bg-primary-500/20 text-primary-400">
                  {bidAuctions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="created">
              Created
              {createdAuctions && createdAuctions.length > 0 && (
                <Badge className="ml-2 bg-accent-500/20 text-accent-400">
                  {createdAuctions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="won">
              Won
              {wonAuctions && wonAuctions.length > 0 && (
                <Badge className="ml-2 bg-yellow-500/20 text-yellow-400">
                  {wonAuctions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="refunds">
              Refunds
              {pendingRefunds && pendingRefunds.length > 0 && (
                <Badge className="ml-2 bg-red-500/20 text-red-400">
                  {pendingRefunds.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bids">
            <AuctionList
              auctions={bidAuctions || []}
              emptyMessage="You haven't placed any bids yet"
              emptyAction={{ label: "Browse Auctions", href: "/auctions" }}
            />
          </TabsContent>

          <TabsContent value="created">
            <AuctionList
              auctions={createdAuctions || []}
              emptyMessage="You haven't created any auctions"
              emptyAction={{ label: "Create Auction", href: "/create" }}
            />
          </TabsContent>

          <TabsContent value="won">
            <AuctionList
              auctions={wonAuctions || []}
              emptyMessage="You haven't won any auctions yet"
              emptyAction={{ label: "Browse Auctions", href: "/auctions" }}
            />
          </TabsContent>

          <TabsContent value="refunds">
            <RefundList auctions={pendingRefunds || []} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  color: "primary" | "accent" | "yellow" | "green" | "red";
  loading?: boolean;
}

const colorClasses = {
  primary: "bg-primary-500/10 border-primary-500/30 text-primary-400",
  accent: "bg-accent-500/10 border-accent-500/30 text-accent-400",
  yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  green: "bg-green-500/10 border-green-500/30 text-green-400",
  red: "bg-red-500/10 border-red-500/30 text-red-400",
};

function StatCard({ icon, label, value, suffix, color, loading }: StatCardProps) {
  return (
    <Card className={cn("border", colorClasses[color].split(" ").slice(0, 2).join(" "))}>
      <CardContent className="p-4">
        <div className={cn("mb-2", colorClasses[color].split(" ")[2])}>
          {icon}
        </div>
        <p className="text-xs text-gray-500">{label}</p>
        {loading ? (
          <div className="h-6 w-16 bg-dark-700 rounded animate-pulse mt-1" />
        ) : (
          <p className={cn("text-xl font-bold font-mono", colorClasses[color].split(" ")[2])}>
            {value}
            {suffix && <span className="text-sm ml-1">{suffix}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Auction list component
interface AuctionListProps {
  auctions: Auction[];
  emptyMessage: string;
  emptyAction?: { label: string; href: string };
}

function AuctionList({ auctions, emptyMessage, emptyAction }: AuctionListProps) {
  if (!auctions || auctions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 mb-4">{emptyMessage}</p>
        {emptyAction && (
          <Link to={emptyAction.href}>
            <Button>{emptyAction.label}</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map((auction, index) => (
        <AuctionCard
          key={auction.id.toString()}
          auction={{
            id: auction.id,
            item: {
              name: auction.item.name,
              description: auction.item.description,
              imageUrl: auction.item.imageUrl,
              category: auction.item.category,
            },
            auctionType: auction.auctionType as AuctionType,
            status: auction.status as AuctionStatus,
            reservePrice: auction.reservePrice,
            depositAmount: auction.depositAmount,
            endTime: auction.endTime,
            bidCount: auction.bidCount,
          }}
          index={index}
        />
      ))}
    </div>
  );
}

// Refund list component
function RefundList({ auctions }: { auctions: Auction[] }) {
  if (!auctions || auctions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-gray-400">No pending refunds</p>
        <p className="text-sm text-gray-500 mt-2">
          All your deposits have been refunded or are still active
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {auctions.map((auction) => (
        <RefundCard key={auction.id.toString()} auction={auction} />
      ))}
    </div>
  );
}

// Refund card component with transaction toast
function RefundCard({ auction }: { auction: Auction }) {
  const { claimRefund, hash, isPending, isSuccess, error } = useClaimRefund();

  // Transaction toast - monitors chain status
  const { isSuccess: txConfirmed, isError: txFailed } = useTransactionToast(hash, {
    pendingTitle: "Claiming Refund",
    pendingDescription: "Processing your deposit refund...",
    successTitle: "Refund Claimed!",
    successDescription: "Your deposit has been returned to your wallet",
    errorTitle: "Refund Failed",
    errorDescription: "Could not process refund",
  });

  // Handle wallet rejection
  useEffect(() => {
    if (error) {
      if (error.message?.includes("User rejected") || error.message?.includes("denied")) {
        showWalletToast("reject");
      }
    }
  }, [error]);

  const handleClaim = () => {
    claimRefund(auction.id);
  };

  return (
    <Card className="bg-dark-800/50 border-dark-600">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={auction.item.imageUrl}
            alt={auction.item.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-medium text-white">{auction.item.name}</h3>
            <p className="text-sm text-gray-400">
              Deposit: {formatEther(auction.depositAmount)} ETH
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to={`/auction/${auction.id}`}>
            <Button variant="ghost" size="sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            onClick={handleClaim}
            disabled={isPending || txConfirmed}
            className={cn(
              txConfirmed
                ? "bg-green-500/20 text-green-400"
                : "bg-gradient-to-r from-primary-600 to-accent-600"
            )}
          >
            {isPending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : txConfirmed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Claimed!
              </>
            ) : (
              "Claim Refund"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
