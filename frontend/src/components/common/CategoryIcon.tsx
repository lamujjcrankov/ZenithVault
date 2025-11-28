import type { AuctionCategory } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface CategoryIconProps {
    category: string
    size?: "sm" | "md" | "lg"
    className?: string
}

const categoryIcons: Record<string, { icon: string; gradient: string }> = {
    Art: { icon: "🎨", gradient: "from-pink-500 to-rose-500" },
    Music: { icon: "🎵", gradient: "from-violet-500 to-purple-500" },
    Collectible: { icon: "💎", gradient: "from-cyan-500 to-blue-500" },
    GameAsset: { icon: "🎮", gradient: "from-green-500 to-emerald-500" },
    Domain: { icon: "🌐", gradient: "from-orange-500 to-amber-500" },
}

export function CategoryIcon({ category, size = "md", className }: CategoryIconProps) {
    const config = categoryIcons[category] || { icon: "📦", gradient: "from-gray-500 to-gray-600" }
    const sizeClasses = {
        sm: "w-8 h-8 text-lg",
        md: "w-10 h-10 text-xl",
        lg: "w-14 h-14 text-3xl",
    }

    return (
        <div
            className={cn(
                sizeClasses[size],
                "rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center",
                config.gradient,
                className
            )}
        >
            {config.icon}
        </div>
    )
}
