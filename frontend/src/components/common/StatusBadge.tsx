import { Badge } from "@/components/ui/badge"
import { Circle, Clock, Eye, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuctionStatus, getAuctionStatusLabel } from "@/lib/types"

interface StatusBadgeProps {
    status: AuctionStatus | number
    className?: string
}

const statusConfig: Record<number, { color: string; icon: React.ReactNode; label: string }> = {
    0: {
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: <Circle className="h-2 w-2 fill-green-400 animate-pulse" />,
        label: "Active",
    },
    1: {
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: <Clock className="h-3 w-3" />,
        label: "Ended",
    },
    2: {
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        icon: <Eye className="h-3 w-3 animate-pulse" />,
        label: "Revealing",
    },
    3: {
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: <CheckCircle className="h-3 w-3" />,
        label: "Settled",
    },
    4: {
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: <XCircle className="h-3 w-3" />,
        label: "Cancelled",
    },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const statusNum = typeof status === 'number' ? status : Number(status)
    const config = statusConfig[statusNum] || statusConfig[0]

    return (
        <Badge className={cn(config.color, "border flex items-center gap-1.5", className)}>
            {config.icon}
            {config.label}
        </Badge>
    )
}
