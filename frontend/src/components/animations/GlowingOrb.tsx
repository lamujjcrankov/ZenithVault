import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingOrbProps {
  className?: string;
  color?: "primary" | "accent" | "mixed";
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
}

const sizeClasses = {
  sm: "w-32 h-32",
  md: "w-48 h-48",
  lg: "w-64 h-64",
  xl: "w-96 h-96",
};

const colorClasses = {
  primary: "from-primary-500/40 to-primary-700/20",
  accent: "from-accent-500/40 to-accent-600/20",
  mixed: "from-primary-500/40 via-accent-500/30 to-primary-600/20",
};

const blurClasses = {
  low: "blur-2xl",
  medium: "blur-3xl",
  high: "blur-[100px]",
};

export function GlowingOrb({
  className,
  color = "primary",
  size = "md",
  intensity = "medium",
  animated = true,
}: GlowingOrbProps) {
  const orbVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3],
    },
  };

  return (
    <motion.div
      className={cn(
        "rounded-full bg-gradient-radial",
        sizeClasses[size],
        colorClasses[color],
        blurClasses[intensity],
        "pointer-events-none",
        className
      )}
      variants={animated ? orbVariants : undefined}
      animate={animated ? "animate" : undefined}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
