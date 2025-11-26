import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Lock, Eye, Gavel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCountdown, useUrgencyLevel } from "@/hooks/useCountdown";
import { AuctionStatus, AuctionType, getAuctionTypeLabel } from "@/lib/types";
import { formatEther } from "viem";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/common/CategoryIcon";

interface AuctionCardProps {
  auction: {
    id: bigint;
    item: {
      name: string;
      description: string;
      imageUrl: string;
      category: string;
    };
    auctionType: AuctionType;
    status: AuctionStatus;
    reservePrice: bigint;
    depositAmount: bigint;
    endTime: bigint;
    bidCount: number;
  };
  index?: number;
}

export function AuctionCard({ auction, index = 0 }: AuctionCardProps) {
  const countdown = useCountdown(auction.endTime);
  const urgency = useUrgencyLevel(auction.endTime);

  const urgencyColors = {
    urgent: "text-red-400 bg-red-500/10 border-red-500/30",
    warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    normal: "text-gray-400 bg-dark-700 border-dark-600",
  };

  const isActive = auction.status === AuctionStatus.Active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/auction/${auction.id.toString()}`}>
        <Card className="group overflow-hidden bg-dark-800/50 border-dark-600 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            {/* Image */}
            <img
              src={auction.item.imageUrl}
              alt={auction.item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent" />

            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={cn(
                  isActive
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                )}
              >
                {isActive ? "Live" : "Ended"}
              </Badge>
            </div>

            {/* Auction type badge */}
            <div className="absolute top-3 right-3">
              <Badge
                variant="outline"
                className="bg-dark-900/80 backdrop-blur-sm border-dark-600"
              >
                {auction.auctionType === AuctionType.SecondPrice ? (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Vickrey
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Gavel className="w-3 h-3" />
                    First Price
                  </span>
                )}
              </Badge>
            </div>

            {/* Encrypted bids indicator */}
            <motion.div
              className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-500/20 backdrop-blur-sm border border-primary-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Eye className="w-3 h-3 text-primary-400" />
              <span className="text-xs text-primary-300">Sealed Bids</span>
            </motion.div>

            {/* Category icon */}
            <div className="absolute bottom-3 left-3">
              <div className="w-8 h-8 rounded-lg bg-dark-900/80 backdrop-blur-sm flex items-center justify-center">
                <CategoryIcon category={auction.item.category} className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            {/* Title */}
            <h3 className="font-heading font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
              {auction.item.name}
            </h3>

            {/* Stats row */}
            <div className="flex items-center justify-between text-sm">
              {/* Time remaining */}
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg border",
                  urgencyColors[urgency]
                )}
              >
                <Clock className="w-3 h-3" />
                <span className="font-mono text-xs">
                  {countdown.isExpired ? "Ended" : countdown.formatted}
                </span>
              </div>

              {/* Bid count */}
              <div className="flex items-center gap-1 text-gray-400">
                <Users className="w-3 h-3" />
                <span className="text-xs">{auction.bidCount} bids</span>
              </div>
            </div>

            {/* Price info */}
            <div className="pt-2 border-t border-dark-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Reserve Price</span>
                <span className="font-mono font-semibold text-white">
                  {formatEther(auction.reservePrice)} ETH
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">Deposit</span>
                <span className="font-mono text-sm text-gray-400">
                  {formatEther(auction.depositAmount)} ETH
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
