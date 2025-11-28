import { motion } from "framer-motion";
import { TrendingUp, Users, Gavel, DollarSign } from "lucide-react";
import { usePlatformStats } from "@/hooks/useZenithVault";
import { formatEther } from "viem";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color: "primary" | "accent" | "green" | "yellow";
  delay?: number;
}

const colorClasses = {
  primary: {
    bg: "bg-primary-500/10",
    border: "border-primary-500/30",
    text: "text-primary-400",
    icon: "text-primary-400",
  },
  accent: {
    bg: "bg-accent-500/10",
    border: "border-accent-500/30",
    text: "text-accent-400",
    icon: "text-accent-400",
  },
  green: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    icon: "text-green-400",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    icon: "text-yellow-400",
  },
};

function StatCard({ icon, label, value, subValue, color, delay = 0 }: StatCardProps) {
  const styles = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "p-4 rounded-xl border",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", styles.bg)}>
          <div className={styles.icon}>{icon}</div>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={cn("text-2xl font-bold font-mono mt-1", styles.text)}>
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-gray-500 mt-1">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}

export function AuctionStats() {
  const { data: stats, isLoading } = usePlatformStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-dark-800 border border-dark-700 animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  const [
    totalAuctions,
    activeAuctions,
    settledAuctions,
    _cancelledAuctions,
    totalBids,
    totalVolume,
  ] = stats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<Gavel className="w-5 h-5" />}
        label="Total Auctions"
        value={Number(totalAuctions)}
        subValue={`${Number(activeAuctions)} active`}
        color="primary"
        delay={0}
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Settled"
        value={Number(settledAuctions)}
        subValue="Completed auctions"
        color="green"
        delay={0.1}
      />
      <StatCard
        icon={<Users className="w-5 h-5" />}
        label="Total Bids"
        value={Number(totalBids)}
        subValue="Encrypted bids placed"
        color="accent"
        delay={0.2}
      />
      <StatCard
        icon={<DollarSign className="w-5 h-5" />}
        label="Total Volume"
        value={`${Number(formatEther(totalVolume)).toFixed(2)}`}
        subValue="ETH traded"
        color="yellow"
        delay={0.3}
      />
    </div>
  );
}

// Mini stats for inline use
export function MiniStats() {
  const { data: stats } = usePlatformStats();

  if (!stats) return null;

  const [totalAuctions, activeAuctions, , , totalBids] = stats;

  return (
    <div className="flex items-center gap-4 text-sm text-gray-400">
      <span>
        <strong className="text-white">{Number(totalAuctions)}</strong> auctions
      </span>
      <span className="text-dark-600">|</span>
      <span>
        <strong className="text-green-400">{Number(activeAuctions)}</strong> live
      </span>
      <span className="text-dark-600">|</span>
      <span>
        <strong className="text-primary-400">{Number(totalBids)}</strong> bids
      </span>
    </div>
  );
}
